-- ==============================================================================
-- EduPredict - Apache Impala MPP SQL DDL & Analytical Query Suite
-- ==============================================================================
-- Purpose: Low-latency distributed SQL queries executed directly over HDFS
--          Snappy Parquet files with horizontal partition pruning.
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS edupredict_analytics;
USE edupredict_analytics;

-- 1. EXTERNAL TABLE: Student Master Feature Store (Mapped to HDFS Parquet)
CREATE EXTERNAL TABLE IF NOT EXISTS student_feature_store (
    student_id STRING,
    first_name STRING,
    last_name STRING,
    gender STRING,
    first_gen BOOLEAN,
    financial_aid STRING,
    program STRING,
    current_semester INT,
    weekly_video_hours DOUBLE,
    total_quizzes_attempted INT,
    forum_contributions INT,
    avg_quiz_score DOUBLE,
    total_scheduled_classes INT,
    total_absent_classes INT,
    total_late_classes INT,
    attendance_rate DOUBLE,
    at_risk_heuristic INT
)
PARTITIONED BY (
    department STRING,
    cohort_year INT
)
STORED AS PARQUET
LOCATION '/user/edupredict/processed/student_feature_store';

-- Refresh metadata after Spark ETL writes
COMPUTE STATS student_feature_store;

-- 2. EXTERNAL TABLE: Real-Time LMS Clickstream Telemetry
CREATE EXTERNAL TABLE IF NOT EXISTS lms_telemetry_events (
    event_id STRING,
    student_id STRING,
    course_code STRING,
    event_type STRING,
    event_time TIMESTAMP,
    duration_seconds INT,
    interaction_score DOUBLE
)
PARTITIONED BY (
    year INT,
    month INT
)
STORED AS PARQUET
LOCATION '/user/edupredict/raw/lms_telemetry';

COMPUTE STATS lms_telemetry_events;

-- ==============================================================================
-- HIGH-PERFORMANCE ANALYTICAL QUERIES (OPTIMIZED FOR MPP PARALLEL EXECUTION)
-- ==============================================================================

-- QUERY 1: Institutional At-Risk Identification (Latency < 50ms)
-- Description: Identifies students with severe attendance deficits and low LMS engagement.
SELECT 
    student_id,
    CONCAT(first_name, ' ', last_name) AS full_name,
    department,
    program,
    attendance_rate,
    weekly_video_hours,
    avg_quiz_score,
    CASE 
        WHEN attendance_rate < 60.0 AND weekly_video_hours < 2.0 THEN 'Critical'
        WHEN attendance_rate < 75.0 OR avg_quiz_score < 60.0 THEN 'High'
        WHEN attendance_rate < 85.0 THEN 'Medium'
        ELSE 'Low'
    END AS computed_risk_level
FROM student_feature_store
WHERE cohort_year = 2026
  AND (attendance_rate < 75.0 OR weekly_video_hours < 3.0)
ORDER BY attendance_rate ASC, avg_quiz_score ASC
LIMIT 50;

-- QUERY 2: Departmental Retention & Engagement Summary
-- Description: Aggregates student volume, average attendance, and average quiz scores across departments.
SELECT 
    department,
    COUNT(student_id) AS total_enrolled,
    ROUND(AVG(attendance_rate), 2) AS mean_attendance_pct,
    ROUND(AVG(weekly_video_hours), 2) AS mean_lms_hours,
    ROUND(AVG(avg_quiz_score), 2) AS mean_quiz_performance,
    SUM(CASE WHEN at_risk_heuristic = 1 THEN 1 ELSE 0 END) AS students_flagged_risk,
    ROUND((SUM(CASE WHEN at_risk_heuristic = 1 THEN 1 ELSE 0 END) / COUNT(student_id)) * 100.0, 2) AS dept_risk_percentage
FROM student_feature_store
GROUP BY department
ORDER BY dept_risk_percentage DESC;

-- QUERY 3: Anomaly Detection - Attendance-to-Exam Performance Divergence
-- Description: Identifies anomalous students who attend classes regularly (>85%) but fail quizzes (<55%),
--              or "ghost students" who never attend (<20%) but submit exams.
SELECT 
    student_id,
    department,
    attendance_rate,
    avg_quiz_score,
    weekly_video_hours,
    CASE
        WHEN attendance_rate >= 85.0 AND avg_quiz_score < 55.0 THEN 'High Attendance with Severe Learning Deficit'
        WHEN attendance_rate <= 25.0 AND avg_quiz_score >= 80.0 THEN 'Ghost Student / Integrity Audit Needed'
        ELSE 'Normal Correlation'
    END AS anomaly_type
FROM student_feature_store
WHERE (attendance_rate >= 85.0 AND avg_quiz_score < 55.0)
   OR (attendance_rate <= 25.0 AND avg_quiz_score >= 80.0);
