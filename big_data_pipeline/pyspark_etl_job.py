"""
EduPredict - Big Data Pipeline: PySpark Distributed ETL & Ingestion
====================================================================
Architecture: Apache Hadoop HDFS + Apache Spark 3.5 (PySpark)
Purpose: Ingest heterogeneous raw logs (LMS telemetry, SIS demographic records,
         biometric RFID attendance), perform parallel cleaning, imputation,
         feature extraction, and horizontal partition-saving into Snappy Parquet.
"""

import sys
import logging
from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, when, avg, count, sum as spark_sum, lit,
    to_timestamp, datediff, current_date, round as spark_round,
    coalesce, udf
)
from pyspark.sql.types import (
    StructType, StructField, StringType, DoubleType,
    IntegerType, BooleanType, TimestampType
)

# Configure structured logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("EduPredict.PySparkETL")


def create_spark_session(app_name="EduPredict-Distributed-ETL"):
    """
    Initializes a production-tuned SparkSession with Snappy Parquet compression,
    dynamic partition overwrite, and optimized shuffle partitions.
    """
    logger.info("Initializing Apache Spark Session for EduPredict...")
    spark = (
        SparkSession.builder
        .appName(app_name)
        .config("spark.sql.parquet.compression.codec", "snappy")
        .config("spark.sql.sources.partitionOverwriteMode", "dynamic")
        .config("spark.sql.shuffle.partitions", "200")
        .config("spark.hadoop.fs.defaultFS", "hdfs://namenode:9000")
        .config("spark.executor.memory", "4g")
        .config("spark.executor.cores", "2")
        .enableHiveSupport()
        .getOrCreate()
    )
    spark.sparkContext.setLogLevel("WARN")
    return spark


def define_schemas():
    """Defines strict schemas for distributed dataset ingestion."""
    demographics_schema = StructType([
        StructField("student_id", StringType(), False),
        StructField("first_name", StringType(), True),
        StructField("last_name", StringType(), True),
        StructField("gender", StringType(), True),
        StructField("first_gen", BooleanType(), True),
        StructField("financial_aid", StringType(), True),
        StructField("department", StringType(), False),
        StructField("program", StringType(), False),
        StructField("cohort_year", IntegerType(), False),
        StructField("current_semester", IntegerType(), False)
    ])

    lms_telemetry_schema = StructType([
        StructField("event_id", StringType(), False),
        StructField("student_id", StringType(), False),
        StructField("course_code", StringType(), False),
        StructField("event_type", StringType(), False),
        StructField("timestamp", TimestampType(), False),
        StructField("duration_seconds", IntegerType(), True),
        StructField("interaction_score", DoubleType(), True)
    ])

    attendance_schema = StructType([
        StructField("session_id", StringType(), False),
        StructField("student_id", StringType(), False),
        StructField("course_code", StringType(), False),
        StructField("session_date", StringType(), False),
        StructField("status", StringType(), False),  # 'present', 'absent', 'late'
        StructField("terminal_ip", StringType(), True)
    ])

    return demographics_schema, lms_telemetry_schema, attendance_schema


def run_etl_pipeline(raw_base_path="hdfs:///user/edupredict/raw",
                     processed_base_path="hdfs:///user/edupredict/processed"):
    """
    Executes the distributed extraction, transformation, feature enrichment,
    and partitioned writing into HDFS Parquet storage.
    """
    spark = create_spark_session()
    dem_schema, lms_schema, att_schema = define_schemas()

    try:
        logger.info(f"Extracting raw data from {raw_base_path}...")
        
        # 1. Ingest Demographics
        df_students = spark.read.schema(dem_schema).parquet(f"{raw_base_path}/demographics")
        
        # 2. Ingest LMS Telemetry Logs
        df_lms = spark.read.schema(lms_schema).parquet(f"{raw_base_path}/lms_telemetry")
        
        # 3. Ingest Biometric Attendance Logs
        df_att = spark.read.schema(att_schema).parquet(f"{raw_base_path}/attendance")

        logger.info("Transforming & aggregating LMS engagement features...")
        # Calculate weekly LMS watch hours, quiz attempts, and forum posts per student
        df_lms_agg = df_lms.groupBy("student_id").agg(
            spark_round(spark_sum(when(col("event_type") == "video_watch", col("duration_seconds")).otherwise(0)) / 3600.0, 2).alias("weekly_video_hours"),
            count(when(col("event_type") == "quiz_submission", 1)).alias("total_quizzes_attempted"),
            count(when(col("event_type") == "forum_post", 1)).alias("forum_contributions"),
            spark_round(avg(when(col("event_type") == "quiz_submission", col("interaction_score"))), 2).alias("avg_quiz_score")
        )

        logger.info("Transforming & calculating attendance percentage...")
        # Calculate attendance rate, absent count, and consecutive absences
        df_att_agg = df_att.groupBy("student_id").agg(
            count("*").alias("total_scheduled_classes"),
            count(when(col("status") == "absent", 1)).alias("total_absent_classes"),
            count(when(col("status") == "late", 1)).alias("total_late_classes"),
            spark_round(
                (count(when(col("status") == "present", 1)) + count(when(col("status") == "late", 1)) * 0.5) 
                / count("*") * 100.0, 2
            ).alias("attendance_rate")
        )

        logger.info("Joining datasets into unified Analytical Feature Store...")
        # Outer join demographics with telemetry and attendance, gracefully imputing missing records
        df_features = (
            df_students
            .join(df_lms_agg, on="student_id", how="left")
            .join(df_att_agg, on="student_id", how="left")
            .fillna({
                "weekly_video_hours": 0.0,
                "total_quizzes_attempted": 0,
                "forum_contributions": 0,
                "avg_quiz_score": 50.0,
                "attendance_rate": 75.0,
                "total_scheduled_classes": 0,
                "total_absent_classes": 0
            })
        )

        # 4. Feature Engineering: Derive synthetic risk heuristic for baseline partitioning
        df_enriched = df_features.withColumn(
            "at_risk_heuristic",
            when((col("attendance_rate") < 70.0) | (col("weekly_video_hours") < 2.0), lit(1)).otherwise(lit(0))
        )

        output_path = f"{processed_base_path}/student_feature_store"
        logger.info(f"Writing Snappy Parquet dataset horizontally partitioned by department & cohort_year to: {output_path}")

        (
            df_enriched
            .write
            .mode("overwrite")
            .partitionBy("department", "cohort_year")
            .parquet(output_path)
        )

        logger.info("PySpark Distributed ETL pipeline completed successfully!")

    except Exception as e:
        logger.error(f"ETL Execution failed: {str(e)}", exc_info=True)
        sys.exit(1)
    finally:
        spark.stop()


if __name__ == "__main__":
    run_etl_pipeline()
