# EduPredict: Big Data & Predictive Analytics Platform for Education

EduPredict is an advanced educational analytics platform designed to help academic institutions monitor student performance, track engagement, and proactively identify learners who may require academic support. By consolidating student information, attendance logs, and learning-management system (LMS) activity into role-based dashboards, the platform provides predictive risk indicators, automated alerts, and comprehensive intervention tracking.

---

## 🚀 Project Overview & Institutional Context

Traditional academic monitoring systems often rely heavily on lagging indicators such as end-of-term examination failures or cumulative GPA drops. By the time these warning signs surface, at-risk students have frequently disengaged from coursework and campus life.

EduPredict addresses this challenge by combining Apache Hadoop (HDFS), parallel data processing via PySpark and MapReduce, real-time MPP SQL analytics through Apache Impala, operational NoSQL storage in MongoDB, and machine learning predictive models.

---

## 🛠️ System Architecture & Technology Stack

EduPredict implements a robust 5-tier enterprise Big Data and Machine Learning architecture:

* **Tier 1 - Data Ingestion Layer:** Batch CSV/Parquet/JSON uploader featuring real-time schema validation and automatic Student ID generation (`STU-2026-XXXX`), alongside real-time telemetry simulating LMS clickstreams and RFID lecture check-ins.


* **Tier 2 - Distributed Storage Layer:**
* **Hadoop HDFS Warehouse (`/user/edupredict/warehouse/`):** Stores immutable historical datasets partitioned by semester using Snappy-compressed Parquet and ORC formats with 128 MB blocks and a 3x replication factor across 4 DataNodes.


* **MongoDB Operational Database (`edupredict_db`):** Houses real-time operational collections, including `user_accounts`, `student_master_records`, `students`, `uploaded_datasets`, `alerts_notifications`, and `feedback_tickets`.




* **Tier 3 - Parallel Processing & Interactive Query Layer:** Distributed ETL jobs executed via PySpark/MapReduce alongside sub-second SQL analytics powered by the Apache Impala MPP engine.


* **Tier 4 - Machine Learning & Statistical Modeling:** Ensemble dropout risk classifiers, K-Means behavioral clustering ($k=4$), and statistical anomaly detectors flagging attendance-to-grade divergences.


* **Tier 5 - Presentation & RBAC Visualization Layer:** Responsive React 19+ TypeScript and Tailwind CSS workstation supporting both Daylight Academic and Midnight themes.



---

## 👥 Role-Based Access Control (RBAC) Workflows

The platform provides dedicated, secure portals customized for four core institutional roles:

* **Administrators (Deans / Provosts):** Monitor campus-wide retention KPIs, departmental GPA comparisons, high-priority intervention queues, and manage cohort directories and CSV imports.


* **Faculty & Course Instructors:** Track course rosters, attendance rates, midterm exam averages, and log one-on-one counseling interventions.


* **Students:** Review personal GPA trajectories, course grades, and remaining safe absences under the 75% attendance policy threshold, as well as request academic advising.


* **Big Data & ML Analysts:** Manage HDFS storage blocks, execute MapReduce/Spark batch jobs, run Impala SQL queries, and tune machine learning hyperparameter weights.



---

## 📂 Repository Structure

```text
backend/            Flask API, MongoDB models, seed data, and requirements
big_data_pipeline/  HDFS, PySpark ETL, and Impala examples
database/           MongoDB seed scripts and sample CSV datasets
docs/screenshots/   Application screenshots for light and dark themes
machine_learning/   Predictive analytics, anomaly detection, and R analysis
src/                React and TypeScript web application source code
README.md           Project overview
SETUP_GUIDE.md      Detailed local installation and usage guide
PROJECT_REPORT.md   Complete project report and technical documentation

```

---

## ⚙️ System Requirements

### Hardware Requirements

* **Processor:** Intel Core i5 (4 Cores) minimum; Intel Core i7 (8 Cores) recommended.


* **RAM:** 16 GB DDR4/DDR5 RAM.


* **Storage:** 500 GB NVMe SSD.


* **OS:** 64-Bit Windows 10/11, macOS, or Linux.



### Software Stack

* **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS, Lucide Icons.


* **Backend:** Python 3.10+, Flask, Flask-CORS, PyMongo, PyJWT, bcrypt.


* **Database:** MongoDB Community Server + MongoDB Compass + mongosh.


* **Big Data & Analytics:** Apache Hadoop 3.3 (HDFS), Apache Spark (PySpark), Apache Impala, Jupyter Anaconda Notebook 3, RStudio (R 4.x), Tableau Desktop.



---

## 🚀 Getting Started & Local Installation

### Quick Start (Windows)

Double-click `run_local.bat` in the project root directory to automatically launch the Python Flask and MongoDB backend on port 5000 alongside the React frontend on port 3000.

### Quick Start (macOS or Linux)

```bash
chmod +x run_local.sh
./run_local.sh
```[cite: 10]

### Manual Setup via Terminal
1. **Terminal 1 (Backend):**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows use: .\venv\Scripts\activate
   pip install -r requirements.txt
   python db_seed.py
   python app.py
   ```[cite: 10]
2. **Terminal 2 (Frontend):**
   ```bash
   npm install
   npm run dev
   ```[cite: 10, 11]

Open **`http://localhost:3000`** in your browser[cite: 11].

---

## 🔑 Default Institutional Login Credentials

| Role | Name / Title | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **Administrator** | Dr. Evelyn Vance (Dean of Academic Affairs) | `admin@university.edu`[cite: 11] | `admin123Password!`[cite: 11] |
| **Faculty** | Prof. Marcus Sterling (Instructor & Advisor) | `faculty@university.edu`[cite: 11] | `faculty123Password!`[cite: 11] |
| **Analyst** | Dr. Elena Rostova (Data Science Workstation) | `analyst@university.edu`[cite: 11] | `analyst123Password!`[cite: 11] |
| **Student** | Hassam Khan (Primary Demo Student) | `hassamkhan33344@gmail.com`[cite: 11] | `student123Password!`[cite: 11] |

*(Note: All bulk-imported cohort students and demo users utilize `student123Password!` as their default password[cite: 11].)*

---

## 🛡️ Configuration & Security

* Use `.env.example` configuration files as templates for local environment setups.
* Ensure real `.env` files, database connection strings, API keys, and credentials are kept out of Git version control.
* Demo accounts and default credentials are intended strictly for local development and institutional demonstration purposes. Configure proper access controls and unique keys before production deployment.

---

## 📄 License & Team Information

* **Batch Name:** PMTZ-202310F[cite: 1]
* **Faculty Supervisor:** Sir Riaz Ahmed[cite: 1]
* **Development Team:** Developed collaboratively by the EduPredict project cohort (including Lead Architect Muhammad Rafay, ML Engineer Shayan Ahmed Chohan, Backend Developer Abdul Kabeer, Full Stack Integrator Hassam Ud Din Khan, and team members Shehryar Affandi, Abdulhai Siddiqui, Owais Solangi, and Muhammad Sajid)[cite: 1].
* **License:** No license is currently specified. Please contact the project maintainers prior to reusing or redistributing this code[cite: 9].

```
