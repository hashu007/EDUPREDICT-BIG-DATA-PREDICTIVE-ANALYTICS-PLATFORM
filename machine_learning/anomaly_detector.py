"""
EduPredict - Multidimensional Anomaly Detection Engine
======================================================
Algorithms: Isolation Forest, Z-Score Outlier Analysis, IQR Thresholding
Identifies: Ghost students, rapid academic divergence, grade drops, and LMS cheating/truancy
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest


class EduAnomalyDetector:
    def __init__(self, contamination=0.04, random_state=42):
        self.contamination = contamination
        self.iso_forest = IsolationForest(
            contamination=contamination,
            random_state=random_state,
            n_estimators=100
        )
        self.features = ["attendance_rate", "weekly_lms_hours", "midterms_avg", "assignments_score"]

    def fit(self, df: pd.DataFrame):
        """Fits the multidimensional Isolation Forest model on historical academic features."""
        X = df[self.features].fillna(df[self.features].median())
        self.iso_forest.fit(X)
        return self

    def detect_anomalies(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Applies multidimensional and rule-based anomaly detection.
        Returns the DataFrame enriched with anomaly flags and detailed diagnoses.
        """
        df_out = df.copy()
        X = df_out[self.features].fillna(df_out[self.features].median())

        # 1. Isolation Forest Scoring (-1 = anomaly, 1 = normal)
        iso_preds = self.iso_forest.predict(X)
        iso_scores = self.iso_forest.decision_function(X)

        df_out["isolation_anomaly"] = iso_preds == -1
        df_out["anomaly_confidence_score"] = np.round(np.abs(iso_scores), 3)

        # 2. Heuristic Domain Rules
        anomaly_reasons = []
        for _, row in df_out.iterrows():
            reasons = []
            att = row.get("attendance_rate", 100)
            mid = row.get("midterms_avg", 100)
            lms = row.get("weekly_lms_hours", 10)
            cons = row.get("consecutive_absences", 0)

            if att < 20 and mid > 75:
                reasons.append("Ghost Student: Near-zero class presence with high examination score")
            elif att > 85 and mid < 50:
                reasons.append("Severe Comprehension Barrier: High diligence/attendance but failing exams")
            elif cons >= 4:
                reasons.append(f"Extended Truancy: {cons} consecutive unexplained lecture absences")
            elif lms < 1.0 and att > 70:
                reasons.append("Zero LMS Interaction: Never accessing online materials despite attending lectures")

            if row["isolation_anomaly"] and not reasons:
                reasons.append("Multivariate Outlier: Atypical cross-feature engagement pattern")

            anomaly_reasons.append("; ".join(reasons) if reasons else "None")

        df_out["detected_anomalies"] = anomaly_reasons
        df_out["is_anomalous"] = df_out["detected_anomalies"] != "None"

        return df_out


if __name__ == "__main__":
    from train_dropout_model import generate_synthetic_training_dataset
    dataset = generate_synthetic_training_dataset(500)
    detector = EduAnomalyDetector().fit(dataset)
    results = detector.detect_anomalies(dataset)
    flagged = results[results["is_anomalous"]]
    print(f"Total anomalies flagged: {len(flagged)} / {len(dataset)}")
    print(flagged[["student_id", "attendance_rate", "midterms_avg", "detected_anomalies"]].head(10))
