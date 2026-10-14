# EduPredict — Complete eProject Report & Documentation

---

## 1. Problem Definition

### 1.1 Background
Higher education institutions face critical challenges in **student retention**, **timely academic intervention**, and **resource allocation**. Traditional academic monitoring relies on lagging indicators—such as end-of-semester examination failures—by which point at-risk students have already disengaged.

**EduPredict** solves this problem by combining **Hadoop Distributed File System (HDFS)** storage, **PySpark / MapReduce** parallel processing, **Apache Impala** real-time SQL analytics, **MongoDB** operational storage, and **Machine Learning predictive models** to identify at-risk students early and trigger automated advising interventions.

---

## 2. Design Specifications & System Architecture

### 2.1 Multi-Tier Architecture
1. **Data Ingestion Layer**:
   - Supports batch CSV/Parquet/JSON uploads and real-time LMS clickstream/RFID attendance telemetry.
   - Automatic schema validation and missing-field handling (including automatic `StudentID` assignment).
2. **Big Data Storage Layer (Hadoop HDFS + MongoDB)**:
   - **HDFS (`/big_data_pipeline/hdfs_ingest.sh`)**: Stores raw and partitioned Parquet/ORC datasets (`/user/edupredict/warehouse/semester=...`) with 3x block replication across 4 DataNodes.
   - **MongoDB (`edupredict_db`)**: Stores operational collections (`user_accounts`, `student_master_records`, `students`, `uploaded_datasets`, `alerts_notifications`, `feedback_tickets`).
3. **Parallel Processing & Query Layer**:
   - **PySpark & MapReduce (`/big_data_pipeline/pyspark_etl_job.py`)**: Executes distributed feature engineering and correlation aggregations.
   - **Apache Impala (`/big_data_pipeline/impala_ddl_and_queries.sql`)**: Low-latency MPP SQL query console for ad-hoc institutional reporting.
4. **Machine Learning & Statistical Layer (`/machine_learning/`)**:
   - **Dropout Risk Classifier (`train_dropout_model.py`)**: Logistic Regression / Random Forest / XGBoost ensemble predicting dropout probability ($0\% - 100\%$).
   - **Anomaly Detector (`anomaly_detector.py`)**: Isolation Forest & rule-based divergence detection (e.g., *Attendance-to-Grade Divergence* and *Ghost Student* anomalies).
   - **K-Means Student Clustering**: Segments students into 4 actionable behavioral clusters:
     - *Cluster 0*: Struggling & Disengaged
     - *Cluster 1*: Diligent & Striving
     - *Cluster 2*: Passive High-Potential
     - *Cluster 3*: Consistent High Achiever
   - **RStudio Statistical Suite (`r_statistical_analysis.R`)** & **Jupyter Notebook (`EduPredict_ML_and_EDA.ipynb`)**.
5. **Interactive Web Application & RBAC Visualization Layer (`/src/`)**:
   - Role-specific dashboards for **Admin**, **Faculty**, **Student**, and **Analyst**.

---

## 3. Data Flow Diagrams (DFD) & Activity Flowcharts

### 3.1 Level-0 Context DFD
```text
[Students / LMS / Attendance] ---> ( EduPredict Big Data & ML Platform ) ---> [Early Warning Alerts & Dashboards]
                                            |                     ^
                                            v                     |
                                  [MongoDB & HDFS Warehouse] -----+
```

### 3.2 End-to-End Activity Workflow
```text
1. Data Ingestion (CSV Upload / Live LMS Telemetry)
       │
       ▼
2. Storage & Partitioning (MongoDB `edupredict_db` + HDFS 3x Replicated Blocks)
       │
       ▼
3. Parallel ETL Processing (PySpark / MapReduce Feature Extraction)
       │
       ▼
4. ML Inference Engine (Dropout Risk % + K-Means Cluster + Anomaly Detection)
       │
       ▼
5. Automated Threshold Check (Risk >= 60% or Attendance < 75%)
       │
       ├──► [YES] ──► Trigger Real-Time Alert in `alerts_notifications` ──► Faculty Logs Intervention
       │
       └──► [NO]  ──► Update Student Portal Trajectory & Dean's List Eligibility
```

---

## 4. Hardware & Software Requirements

### Hardware Requirements
- **Processor**: Minimum Intel Core i5 (4 Cores); Intel Core i7 (8 Cores) recommended
- **Memory**: 16 GB RAM
- **Storage**: 500 GB SSD
- **Graphics**: Dedicated/Integrated GPU for WebGL & visualization acceleration
- **OS**: 64-Bit Windows 10 / Windows 11

### Software Stack Implemented
- **Jupyter Anaconda Notebook 3**: `/machine_learning/EduPredict_ML_and_EDA.ipynb`
- **RStudio**: `/machine_learning/r_statistical_analysis.R` & `edupredict_rstudio.Rproj`
- **VS Code / PyCharm**: Configured with `.vscode` workspace settings & `run_local.bat`
- **MongoDB Compass & Shell**: `/database/mongodb_seed.js` & `/backend/db_seed.py` (`edupredict_db`)
- **Hadoop, HDFS & Apache Server**: `/big_data_pipeline/hdfs_ingest.sh` & `/backend/apache_vhost.conf`
- **Tableau**: `/database/edupredict_tableau_dataset.csv`
- **Apache Impala Server**: `/big_data_pipeline/impala_ddl_and_queries.sql`

---

## 5. Test Data Used in the Project
1. **`/database/edupredict_tableau_dataset.csv`**: Baseline institutional dataset for Tableau and cohort benchmarking.
2. **`/database/new_students_batch_2026.csv`**: 25-student test batch covering Artificial Intelligence, Computer Science, Data Science, Software Engineering, Cybersecurity, and Information Systems across all risk tiers.
3. **`/database/mongodb_seed.js` & `/backend/db_seed.py`**: Automated database seeders for MongoDB Compass verification.

---

## 6. Installation & Execution Instructions
See `SETUP_GUIDE.md` and `ReadMe.doc` for one-click (`run_local.bat`) and manual VS Code terminal instructions.
