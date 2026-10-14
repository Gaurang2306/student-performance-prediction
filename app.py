
from flask import Flask, render_template, request, jsonify
import pickle
import pandas as pd

app = Flask(__name__)

# Load the trained preprocessing + Lasso pipeline
with open("Student_Performance_model.pkl", "rb") as file:
    model = pickle.load(file)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No input data received."}), 400

        reading_score = float(data["reading_score"])
        writing_score = float(data["writing_score"])

        if not (0 <= reading_score <= 100):
            return jsonify({
                "error": "Reading score must be between 0 and 100."
            }), 400

        if not (0 <= writing_score <= 100):
            return jsonify({
                "error": "Writing score must be between 0 and 100."
            }), 400

        # Column names and order must match model training
        input_data = pd.DataFrame([{
            "reading score": reading_score,
            "writing score": writing_score,
            "gender": data["gender"],
            "race/ethnicity": data["race_ethnicity"],
            "parental level of education": data["parental_education"],
            "lunch": data["lunch"],
            "test preparation course": data["test_preparation"]
        }])

        # The saved pipeline handles preprocessing and prediction
        prediction = float(model.predict(input_data)[0])

        # Clamp display to the valid exam-score range
        displayed_score = max(0.0, min(100.0, prediction))

        return jsonify({
            "prediction": round(displayed_score, 2)
        })

    except (ValueError, TypeError, KeyError):
        return jsonify({
            "error": "Please enter valid values for all fields."
        }), 400

    except Exception:
        app.logger.exception("Prediction failed")
        return jsonify({
            "error": "Prediction failed. Check the model and input columns."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)
