import flask
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
import traceback

app = Flask(__name__)
CORS(app)

# Define paths to model and scaler
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'model', 'scaler.pkl')

def load_model():
    try:
        # Verify file existence
        if not os.path.exists(MODEL_PATH):
            print(f"Model file not found at {MODEL_PATH}")
            return None, None
        if not os.path.exists(SCALER_PATH):
            print(f"Scaler file not found at {SCALER_PATH}")
            return None, None
        
        print(f"Attempting to load model from: {MODEL_PATH}")
        try:
            model = joblib.load(MODEL_PATH)
            print("Model loaded successfully")
        except Exception as model_error:
            print(f"Error loading model: {str(model_error)}")
            print(traceback.format_exc())
            return None, None

        print(f"Attempting to load scaler from: {SCALER_PATH}")
        try:
            scaler = joblib.load(SCALER_PATH)
            print("Scaler loaded successfully")
        except Exception as scaler_error:
            print(f"Error loading scaler: {str(scaler_error)}")
            print(traceback.format_exc())
            return None, None

        return model, scaler
    except Exception as e:
        print(f"Unexpected error in load_model: {str(e)}")
        print(traceback.format_exc())
        return None, None

# Try to load model and scaler when starting the app
model, scaler = load_model()

@app.route('/predict', methods=['POST'])
def predict():
    if model is None or scaler is None:
        return jsonify({
            'error': 'Model or scaler not loaded properly. Check server logs for details.',
            'model_path': MODEL_PATH,
            'scaler_path': SCALER_PATH,
            'model_exists': os.path.exists(MODEL_PATH),
            'scaler_exists': os.path.exists(SCALER_PATH),
            'status': 'error'
        }), 500
        
    try:
        data = request.get_json()
        df = pd.DataFrame([data])
        
        required_features = ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10',
                           'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18', 'V19', 'V20',
                           'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27', 'V28', 'Amount', 'Time']
        
        missing_features = [feature for feature in required_features if feature not in df.columns]
        if missing_features:
            return jsonify({
                'error': f'Missing features: {", ".join(missing_features)}',
                'status': 'error'
            }), 400
        
        df = df[required_features]
        scaled_features = scaler.transform(df)
        
        # Only make prediction without probability
        prediction = model.predict(scaled_features)
        
        # Return prediction without probability
        return jsonify({
            'prediction': int(prediction[0]),
            'prediction_label': 'Fraud' if prediction[0] == 1 else 'Normal',
            'status': 'success',
            'message': 'Prediction made without probability estimation'
        })
    
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None,
        'model_path': MODEL_PATH,
        'scaler_path': SCALER_PATH,
        'model_exists': os.path.exists(MODEL_PATH),
        'scaler_exists': os.path.exists(SCALER_PATH),
        'file_sizes': {
            'model': os.path.getsize(MODEL_PATH) if os.path.exists(MODEL_PATH) else None,
            'scaler': os.path.getsize(SCALER_PATH) if os.path.exists(SCALER_PATH) else None
        }
    })

if __name__ == '__main__':
    print("\nStartup Information:")
    print("===================")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Base directory: {BASE_DIR}")
    print(f"Model path: {MODEL_PATH}")
    print(f"Scaler path: {SCALER_PATH}")
    print(f"Model file exists: {os.path.exists(MODEL_PATH)}")
    print(f"Model file size: {os.path.getsize(MODEL_PATH) if os.path.exists(MODEL_PATH) else 'N/A'} bytes")
    print(f"Scaler file exists: {os.path.exists(SCALER_PATH)}")
    print(f"Scaler file size: {os.path.getsize(SCALER_PATH) if os.path.exists(SCALER_PATH) else 'N/A'} bytes")
    print("===================\n")
    
    app.run(debug=True, port=5000)