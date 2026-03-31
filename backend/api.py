from datetime import datetime

from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
from flask_cors import CORS
from pathlib import Path

from db import get_collection, is_mongo_available

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR.parent / "ml" / "learning_style_model.pkl"
DATASET_PATH = BASE_DIR.parent / "dataset" / "combined_final_dataset.csv"
ASSESSMENTS_COLLECTION = "student_assessments"
DATASET_COLLECTION = "combined_final_dataset"
LOGINS_COLLECTION = "student_logins"
BEHAVIOR_COLLECTION = "behavior_tracking"
REPORTS_COLLECTION = "generated_reports"
TEACHER_DASHBOARD_COLLECTION = "teacher_parent_dashboard"

# Load model
model = joblib.load(MODEL_PATH)

# EXACT features from check_features.py
FEATURES = [
    "hand_raise",
    "resource_visits",
    "announcement_views",
    "discussion_posts",
    "free_time",
    "study_time",
    "absences",
    "final_grade",
    "total_actions",
    "video_actions",
    "audio_actions",
    "text_actions",
    "platform_Unknown"
]


def utc_now():
    return datetime.utcnow().isoformat() + "Z"


def serialize_document(document):
    if not document:
        return document
    serialized = dict(document)
    if "_id" in serialized:
        serialized["_id"] = str(serialized["_id"])
    return serialized

@app.route("/")
def home():
    return "Learning Style Prediction API Running"


@app.route("/student-login", methods=["POST"])
def student_login():
    try:
        data = request.get_json() or {}
        payload = {
            "student_name": data.get("student_name", "").strip(),
            "student_id": data.get("student_id", "").strip(),
            "created_at": utc_now(),
        }

        if not payload["student_name"] or not payload["student_id"]:
            return jsonify({"error": "student_name and student_id are required"}), 400

        if is_mongo_available():
            collection = get_collection(LOGINS_COLLECTION)
            existing = collection.find_one({"student_id": payload["student_id"]})
            if existing:
                collection.update_one(
                    {"student_id": payload["student_id"]},
                    {"$set": {"student_name": payload["student_name"], "last_login_at": utc_now()}},
                )
            else:
                payload["last_login_at"] = payload["created_at"]
                collection.insert_one(payload)

        return jsonify({"message": "Student login stored", "student": payload})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json() or {}

        input_data = []
        for feature in FEATURES:
            input_data.append(data.get(feature, 0))

        input_array = np.array(input_data).reshape(1, -1)

        prediction = model.predict(input_array)[0]

        if is_mongo_available():
            get_collection(ASSESSMENTS_COLLECTION).insert_one({
                "student_id": data.get("student_id"),
                "student_name": data.get("student_name"),
                "input": dict(zip(FEATURES, input_data)),
                "prediction": str(prediction),
                "confidence": data.get("confidence"),
                "created_at": utc_now(),
            })

        return jsonify({
            "prediction": str(prediction),
            "features_used": dict(zip(FEATURES, input_data))
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/behavior-track", methods=["POST"])
def behavior_track():
    try:
        data = request.get_json() or {}
        payload = {
            "student_id": data.get("student_id"),
            "student_name": data.get("student_name"),
            "page": data.get("page"),
            "behavior_data": data.get("behavior_data", {}),
            "verification_data": data.get("verification_data", {}),
            "created_at": utc_now(),
        }

        if not payload["student_id"]:
            return jsonify({"error": "student_id is required"}), 400

        if is_mongo_available():
            get_collection(BEHAVIOR_COLLECTION).insert_one(payload)

        return jsonify({"message": "Behavior tracking stored"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/save-report", methods=["POST"])
def save_report():
    try:
        data = request.get_json() or {}
        payload = {
            "student_id": data.get("student_id"),
            "student_name": data.get("student_name"),
            "report_summary": data.get("report_summary", {}),
            "behavior_insights": data.get("behavior_insights", {}),
            "student_snapshot": data.get("student_snapshot", {}),
            "created_at": utc_now(),
        }

        if not payload["student_id"]:
            return jsonify({"error": "student_id is required"}), 400

        if is_mongo_available():
            get_collection(REPORTS_COLLECTION).insert_one(payload)

        return jsonify({"message": "Report stored"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/dashboard-records/<student_id>", methods=["GET"])
def dashboard_records(student_id):
    try:
        if not is_mongo_available():
            return jsonify({"error": "MongoDB is not available"}), 503

        logins = [
            serialize_document(item)
            for item in get_collection(LOGINS_COLLECTION).find({"student_id": student_id}).sort("created_at", -1)
        ]
        assessments = [
            serialize_document(item)
            for item in get_collection(ASSESSMENTS_COLLECTION).find({"student_id": student_id}).sort("created_at", -1)
        ]
        behavior = [
            serialize_document(item)
            for item in get_collection(BEHAVIOR_COLLECTION).find({"student_id": student_id}).sort("created_at", -1)
        ]
        reports = [
            serialize_document(item)
            for item in get_collection(REPORTS_COLLECTION).find({"student_id": student_id}).sort("created_at", -1)
        ]

        dashboard_payload = {
            "student_id": student_id,
            "logins": logins,
            "assessments": assessments,
            "behavior_tracking": behavior,
            "reports": reports,
            "generated_at": utc_now(),
        }

        get_collection(TEACHER_DASHBOARD_COLLECTION).insert_one(dashboard_payload)
        return jsonify(dashboard_payload)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/dataset-summary", methods=["GET"])
def dataset_summary():
    try:
        if is_mongo_available():
            records = list(get_collection(DATASET_COLLECTION).find({}, {"_id": 0}))
            df = pd.DataFrame(records)
        else:
            df = pd.read_csv(DATASET_PATH)

        numeric_columns = [
            "hand_raise",
            "resource_visits",
            "announcement_views",
            "discussion_posts",
            "study_time",
            "absences",
            "final_grade",
        ]

        summary = {
            "total_students": int(len(df)),
            "learning_style_distribution": df["learning_style"].fillna("Unknown").value_counts().to_dict(),
            "average_metrics": {
                col: round(float(df[col].fillna(0).mean()), 2)
                for col in numeric_columns
                if col in df.columns
            },
            "performance_bands": {
                "high_grade": int((df["final_grade"].fillna(0) >= 70).sum()) if "final_grade" in df.columns else 0,
                "medium_grade": int(((df["final_grade"].fillna(0) >= 40) & (df["final_grade"].fillna(0) < 70)).sum()) if "final_grade" in df.columns else 0,
                "low_grade": int((df["final_grade"].fillna(0) < 40).sum()) if "final_grade" in df.columns else 0,
            },
        }

        return jsonify(summary)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
