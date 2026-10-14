#!/usr/bin/env bash
# ==============================================================================
# EduPredict - HDFS Cluster Setup & Data Ingestion Shell Script
# ==============================================================================
# Purpose: Initialize HDFS distributed namespaces, set storage policies,
#          configure ACLs, and bulk ingest educational data feeds into Hadoop.
# ==============================================================================

set -euo pipefail

HADOOP_BIN="${HADOOP_HOME:-/usr/local/hadoop}/bin/hdfs"
RAW_DIR="/user/edupredict/raw"
PROCESSED_DIR="/user/edupredict/processed"
CHECKPOINTS_DIR="/user/edupredict/checkpoints"

echo "=========================================================="
echo " Starting EduPredict HDFS Storage Initialization & Ingestion"
echo "=========================================================="

# 1. Verify NameNode reachability
echo "[+] Checking HDFS NameNode status..."
$HADOOP_BIN dfsadmin -report | head -n 12

# 2. Create foundational HDFS directory trees
echo "[+] Creating HDFS directory topology..."
$HADOOP_BIN dfs -mkdir -p "${RAW_DIR}/demographics"
$HADOOP_BIN dfs -mkdir -p "${RAW_DIR}/lms_telemetry"
$HADOOP_BIN dfs -mkdir -p "${RAW_DIR}/attendance"
$HADOOP_BIN dfs -mkdir -p "${PROCESSED_DIR}/student_feature_store"
$HADOOP_BIN dfs -mkdir -p "${CHECKPOINTS_DIR}/spark_streaming"

# 3. Configure replication factor (3x fault-tolerance across DataNodes)
echo "[+] Setting replication factor to 3..."
$HADOOP_BIN dfs -setrep -R 3 /user/edupredict

# 4. Set directory access controls
echo "[+] Applying POSIX permissions (755)..."
$HADOOP_BIN dfs -chmod -R 755 /user/edupredict

# 5. Ingest raw educational data from local staging
LOCAL_STAGING="./data/raw"
if [ -d "$LOCAL_STAGING" ]; then
    echo "[+] Uploading local staged datasets to HDFS..."
    $HADOOP_BIN dfs -put -f "${LOCAL_STAGING}"/*.parquet "${RAW_DIR}/"
    echo "[✓] Local datasets synchronized with HDFS."
else
    echo "[i] Local staging directory ($LOCAL_STAGING) empty or not present; skipping bulk copy."
fi

# 6. Display current HDFS disk usage
echo "[+] HDFS EduPredict storage report:"
$HADOOP_BIN dfs -du -h /user/edupredict

echo "=========================================================="
echo " EduPredict HDFS Initialization Complete."
echo "=========================================================="
