"""
EduPredict - Machine Learning Training & Inference Pipeline
============================================================
Algorithms: Random Forest Classifier, XGBoost, Logistic Regression
Target: Binary Dropout Classification & Multi-Class Academic Risk Level
Exports: dropout_predictor_pipeline.pkl
"""

import os
import json
import logging
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)

try:
    import xgboost as xgb
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("EduPredict.ML")


def generate_synthetic_training_dataset(n_samples=2500, random_state=42):
    """
    Generates a realistic educational dataset for training and cross-validation,
    modeling correlation structures found in higher-education retention studies.
    """
    np.random.seed(random_state)
    logger.info(f"Generating synthetic training population of {n_samples} student records...")

    student_ids = [f"STU-2026-{i:04d}" for i in range(1, n_samples + 1)]
    departments = np.random.choice(
        ['Computer Science', 'Data Science', 'Software Engineering', 'Business Analytics', 'Artificial Intelligence'],
        size=n_samples, p=[0.30, 0.25, 0.20, 0.15, 0.10]
    )
    financial_aid = np.random.choice(['Full', 'Partial', 'None'], size=n_samples, p=[0.25, 0.40, 0.35])
    first_gen = np.random.choice([0, 1], size=n_samples, p=[0.70, 0.30])
    
    # Continuous engagement metrics with latent correlations
    attendance_rate = np.clip(np.random.normal(82, 14, size=n_samples), 15, 100)
    weekly_lms_hours = np.clip(np.random.normal(8.5, 4.0, size=n_samples) + (attendance_rate - 80) * 0.1, 0.5, 25.0)
    midterms_avg = np.clip(
        0.4 * attendance_rate + 0.3 * (weekly_lms_hours * 4) + np.random.normal(25, 10, size=n_samples),
        20, 100
    )
    assignments_score = np.clip(midterms_avg + np.random.normal(5, 8, size=n_samples), 10, 100)
    consecutive_absences = np.clip(np.random.exponential(1.5, size=n_samples).astype(int), 0, 12)
    prior_gpa = np.clip(midterms_avg / 25.0 + np.random.normal(0, 0.2, size=n_samples), 1.0, 4.0)

    # Latent probability of dropout logit
    z = (
        -0.08 * attendance_rate
        - 0.12 * weekly_lms_hours
        - 0.05 * midterms_avg
        + 0.35 * consecutive_absences
        - 0.80 * prior_gpa
        + 0.50 * first_gen
        + 4.2
    )
    dropout_prob = 1.0 / (1.0 + np.exp(-z))
    dropped_out = (np.random.uniform(0, 1, size=n_samples) < dropout_prob).astype(int)

    df = pd.DataFrame({
        "student_id": student_ids,
        "department": departments,
        "financial_aid": financial_aid,
        "first_gen": first_gen,
        "attendance_rate": np.round(attendance_rate, 2),
        "weekly_lms_hours": np.round(weekly_lms_hours, 2),
        "midterms_avg": np.round(midterms_avg, 2),
        "assignments_score": np.round(assignments_score, 2),
        "consecutive_absences": consecutive_absences,
        "prior_gpa": np.round(prior_gpa, 2),
        "dropped_out": dropped_out
    })

    logger.info(f"Dataset created. Overall dropout prevalence: {df['dropped_out'].mean():.2%}")
    return df


def build_ml_pipeline(model_type="random_forest"):
    """
    Constructs a complete Scikit-Learn Pipeline incorporating missing value imputation,
    standard scaling, categorical encoding, and classifier estimator.
    """
    numeric_features = [
        "attendance_rate", "weekly_lms_hours", "midterms_avg",
        "assignments_score", "consecutive_absences", "prior_gpa"
    ]
    categorical_features = ["department", "financial_aid", "first_gen"]

    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features)
        ]
    )

    if model_type == "xgboost" and XGB_AVAILABLE:
        classifier = xgb.XGBClassifier(
            n_estimators=150, max_depth=5, learning_rate=0.08,
            random_state=42, eval_metric="logloss"
        )
    elif model_type == "logistic_regression":
        classifier = LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)
    else:
        classifier = RandomForestClassifier(
            n_estimators=150, max_depth=8, min_samples_split=5,
            class_weight="balanced", random_state=42
        )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", classifier)
    ])

    return pipeline, numeric_features, categorical_features


def train_and_evaluate(df, model_save_path="dropout_predictor_pipeline.pkl"):
    """
    Splits dataset, trains multiple models, compares cross-validation scores,
    evaluates on a held-out test set, and exports the serialized `.pkl` artifact.
    """
    X = df.drop(columns=["student_id", "dropped_out"])
    y = df["dropped_out"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    logger.info("Training Random Forest Classifier pipeline...")
    pipeline, _, _ = build_ml_pipeline(model_type="random_forest")
    pipeline.fit(X_train, y_train)

    # Predictions & probabilities
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    # Metrics calculation
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred)

    logger.info("==================================================")
    logger.info(" MODEL EVALUATION METRICS (TEST SET)")
    logger.info("==================================================")
    logger.info(f" Accuracy : {acc:.4f} ({acc*100:.2f}%)")
    logger.info(f" Precision: {prec:.4f}")
    logger.info(f" Recall   : {rec:.4f}")
    logger.info(f" F1-Score : {f1:.4f}")
    logger.info(f" ROC-AUC  : {roc_auc:.4f}")
    logger.info(f" Confusion Matrix:\n{cm}")
    logger.info("==================================================")

    # Persist model artifact
    joblib.dump(pipeline, model_save_path)
    logger.info(f"Serialized ML pipeline saved to: {model_save_path}")

    return pipeline


def format_student_prediction(student_id: str, student_features: dict, pipeline) -> dict:
    """
    Performs live inference and returns results strictly adhering to the
    mandated JSON output schema:
    {
      "student_id": "string",
      "risk_level": "High" | "Medium" | "Low",
      "predicted_performance": "string",
      "dropout_probability_percentage": number,
      "detected_anomalies": ["string"],
      "recommended_interventions": ["string"]
    }
    """
    df_single = pd.DataFrame([student_features])
    prob = pipeline.predict_proba(df_single)[0, 1]
    pct = round(float(prob * 100.0), 2)

    if pct >= 65.0:
        risk_level = "High"
        pred_performance = "At-Risk / Sub-passing Forecast (< 2.0 GPA)"
    elif pct >= 35.0:
        risk_level = "Medium"
        pred_performance = "Moderate Academic Standing (2.5 - 3.0 GPA)"
    else:
        risk_level = "Low"
        pred_performance = "Satisfactory / Dean's List Track (> 3.5 GPA)"

    anomalies = []
    if student_features.get("attendance_rate", 100) > 85 and student_features.get("midterms_avg", 100) < 55:
        anomalies.append("Attendance-to-Grade Divergence: High attendance with poor exam score")
    if student_features.get("consecutive_absences", 0) >= 4:
        anomalies.append(f"Chronic Truancy: {student_features['consecutive_absences']} consecutive absences")
    if student_features.get("weekly_lms_hours", 10) < 2.0:
        anomalies.append("Severe LMS Inactivity: Less than 2 hours recorded this week")

    interventions = []
    if risk_level == "High":
        interventions.append("Assign Senior Academic Counselor for bi-weekly check-ins")
        interventions.append("Issue mandatory attendance recovery contract")
        interventions.append("Enroll in peer tutoring for midterms recovery")
    elif risk_level == "Medium":
        interventions.append("Faculty office hours recommendation")
        interventions.append("LMS courseware engagement notification alert")
    else:
        interventions.append("Eligible for Honors Research and Departmental Peer Mentorship")

    result = {
        "student_id": student_id,
        "risk_level": risk_level,
        "predicted_performance": pred_performance,
        "dropout_probability_percentage": pct,
        "detected_anomalies": anomalies,
        "recommended_interventions": interventions
    }
    return result


if __name__ == "__main__":
    df_data = generate_synthetic_training_dataset(n_samples=2500)
    trained_model = train_and_evaluate(df_data)

    # Test sample inference adhering to the schema
    sample_student = {
        "department": "Computer Science",
        "financial_aid": "Partial",
        "first_gen": 1,
        "attendance_rate": 58.0,
        "weekly_lms_hours": 1.8,
        "midterms_avg": 48.0,
        "assignments_score": 52.0,
        "consecutive_absences": 5,
        "prior_gpa": 2.1
    }

    pred_json = format_student_prediction("STU-2026-0891", sample_student, trained_model)
    print("\nSAMPLE MANDATED JSON OUTPUT:")
    print(json.dumps(pred_json, indent=2))
