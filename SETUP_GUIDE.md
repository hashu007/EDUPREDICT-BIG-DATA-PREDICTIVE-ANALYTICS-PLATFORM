# EduPredict - Localhost Setup & MongoDB Connection Guide

This guide walks you through setting up and running **EduPredict** on your local machine with **MongoDB**.

---

## 1. Required Software to Install on Your PC

Before running the project, install the following tools:

| Software | Purpose | Download Link | Notes |
| :--- | :--- | :--- | :--- |
| **Node.js (v18 or v20 LTS)** | Runs the React / Vite frontend | [nodejs.org](https://nodejs.org/) | Recommended LTS release. Comes with `npm`. |
| **Python (v3.9 to v3.12)** | Runs the Flask REST API & ML models | [python.org](https://www.python.org/downloads/) | **CRITICAL:** Check **"Add Python to PATH"** during setup! |
| **MongoDB Community Server** | Local document database | [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) | Install as a **"Service"** so it starts automatically. |
| **MongoDB Compass** | Visual GUI to view databases & collections | [mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass) | Included in MongoDB installer or downloaded separately. |
| **VS Code** | Code editor & terminal | [code.visualstudio.com](https://code.visualstudio.com/) | Recommended IDE for development. |

### Optional Tools (For Academic Project Submission / Aptech Deliverables):
- **Anaconda / Jupyter Notebook:** To view and run `/notebooks/student_performance_prediction.ipynb`.
- **RStudio:** To run `/r_scripts/student_retention_analysis.R`.
- **Tableau Public:** To open `/database/edupredict_tableau_dataset.csv`.

---

## 2. Setting Up & Connecting MongoDB

1. **Start MongoDB:**
   - On Windows, MongoDB runs as a background Windows service (`MongoDB Database Server`).
   - If not running, open Windows **Services** (`services.msc`), find **MongoDB**, and click **Start**.
   - Or start manually via terminal:
     ```cmd
     mongod --dbpath "C:\data\db"
     ```

2. **Verify with MongoDB Compass:**
   - Launch **MongoDB Compass**.
   - In the connection URI bar, leave the default:
     ```
     mongodb://localhost:27017
     ```
   - Click **Connect**.
   - You should see connection succeed.

---

## 3. How to Run the Entire Project (One-Click)

### On Windows:
Simply double-click the **`run_local.bat`** file located in the project root directory.

This script automatically:
1. Verifies Python and Node.js are in your PATH.
2. Creates the Python virtual environment (`backend/venv`).
3. Installs backend dependencies from `backend/requirements.txt`.
4. Connects to your local MongoDB on port `27017` and seeds:
   - `user_accounts` (All roles and students with hashed passwords)
   - `student_master_records` (Cohort data, GPAs, and metrics)
   - `alerts_notifications`
   - `feedback_tickets`
5. Launches the Flask Backend API at **`http://127.0.0.1:5000`**.
6. Installs npm packages and launches the Frontend at **`http://localhost:3000`**.

### On macOS / Linux:
Open Terminal in the project root and run:
```bash
chmod +x run_local.sh
./run_local.sh
```

---

## 4. Manual Step-by-Step Setup (Alternative)

If you prefer to start the backend and frontend in separate terminal tabs:

### Terminal 1: Backend & Database
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
> You will see:
> `[✓] Connected to local MongoDB at mongodb://127.0.0.1:27017/edupredict_db`
> `* Running on http://127.0.0.1:5000`

### Terminal 2: Frontend
```bash
npm install
npm run dev
```
> Opens at **`http://localhost:3000`**.

---

## 5. Verifying Your Data in MongoDB Compass

Open **MongoDB Compass** and navigate to database **`edupredict_db`**:
- **`user_accounts`**: View all users, hashed bcrypt passwords, roles (`admin`, `faculty`, `student`, `analyst`).
- **`student_master_records`**: View all student profiles, GPA histories, attendance rates, and predictive risk scores.
- **`alerts_notifications`**: View active early warning alerts and counseling interventions.
- **`feedback_tickets`**: View student and faculty advising requests.

---

## 6. Default Login Credentials

| Role | Username / Student ID | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin@university.edu` | `admin123Password!` |
| **Faculty / Teacher** | `faculty` | `faculty@university.edu` | `faculty123Password!` |
| **Analyst** | `analyst` | `analyst@university.edu` | `analyst123Password!` |
| **Student (Hassam Khan)** | `STU-2024-0891` | `hassamkhan33344@gmail.com` | `student123Password!` |
| **Student (Jordan Rivera)** | `STU-2024-1001` | `jordan.rivera@university.edu` | `student123Password!` |
| **Student (Samantha Lee)** | `STU-2024-1002` | `samantha.lee@university.edu` | `student123Password!` |
