from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load model
model = joblib.load("learning_style_model.pkl")

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

@app.route("/")
def home():
    return "Learning Style Prediction API Running"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        input_data = []
        for feature in FEATURES:
            input_data.append(data.get(feature, 0))

        input_array = np.array(input_data).reshape(1, -1)

        prediction = model.predict(input_array)[0]

        return jsonify({
            "prediction": str(prediction),
            "features_used": dict(zip(FEATURES, input_data))
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
