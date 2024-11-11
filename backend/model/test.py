import joblib
import pandas as pd
import numpy as np

def test_model():
    print("Loading model and scaler...")
    scaler = joblib.load('scaler.pkl')
    model = joblib.load('model.pkl')
    print("Model and scaler loaded successfully!")

if __name__ == "__main__":
    test_model()