# EduPredict

EduPredict is an educational analytics platform for monitoring student performance and identifying learners who may need additional support. It brings role-based dashboards, attendance and academic insights, retention risk indicators, alerts, and intervention tracking into one application.

## Features

- Dashboards for administrators, faculty, students, and analysts
- Student roster, academic performance, attendance, and retention risk views
- Alerts and intervention tracking
- Interactive analytics and data visualizations
- Light and dark themes
- Python Flask API with optional MongoDB integration
- Machine-learning and big-data pipeline components

## Screenshots

| Login | Admin dashboard |
| --- | --- |
| ![Login, light theme](docs/screenshots/Login-Light.png) | ![Admin dashboard, light theme](docs/screenshots/AdminDashboard-Light.png) |
| ![Login, dark theme](docs/screenshots/Login-Dark.png) | ![Admin dashboard, dark theme](docs/screenshots/AdminDashboard-Dark.png) |

Additional views:

![Student portal](docs/screenshots/Student%20Portal.png)

![Analyst dashboard](docs/screenshots/Analyst%20Dashboard.png)

## Technology

- Frontend: React, TypeScript, and Vite
- Backend: Python and Flask
- Database: MongoDB (optional for local demo mode)
- Additional components: Python machine-learning and data-pipeline scripts, SQL, and R

## Getting started

### Requirements

- Node.js and npm
- Python (see the version range in [SETUP_GUIDE.md](SETUP_GUIDE.md))
- MongoDB Community Server for database-backed mode

### Run locally

For the complete installation guide, MongoDB setup, manual commands, and demo account details, see [SETUP_GUIDE.md](SETUP_GUIDE.md).

On Windows, run `run_local.bat` from the project root. On macOS or Linux, run:

```bash
chmod +x run_local.sh
./run_local.sh
```

To start only the frontend after installing dependencies:

```bash
npm ci
npm run dev
```

## Repository layout

```text
backend/             Flask API, database models, and seed scripts
big_data_pipeline/   Hadoop, PySpark, and Impala examples
database/            MongoDB seeds and sample datasets
docs/screenshots/    Application screenshots
machine_learning/    Predictive analytics and ML scripts
src/                 React and TypeScript application
SETUP_GUIDE.md       Detailed local setup instructions
```

## Configuration

Use the `.env.example` files as templates for local environment settings. Keep real `.env` files, credentials, and API keys out of version control.
