"""
ARIMA Forecast Service for occupancy predictions.
"""

import pickle
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
import pandas as pd
import numpy as np
from pathlib import Path
import json
import warnings
warnings.filterwarnings("ignore")


class ForecastService:
    """Service for handling ARIMA model forecasting."""
    
    def __init__(self):
        """Initialize the forecast service and load the ARIMA model."""
        self.model = None
        self.config = None
        self.model_path = Path(__file__).parent.parent.parent / "ml" / "hube_arima_model.pkl"
        self.config_path = Path(__file__).parent.parent.parent / "ml" / "hube_model_config.json"
        self.load_model()
        self.load_config()
    
    def load_model(self):
        """Load the ARIMA model from pickle file."""
        try:
            if os.path.exists(self.model_path):
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                print(f"✅ ARIMA model loaded successfully from {self.model_path}")
            else:
                print(f"⚠️ ARIMA model not found at {self.model_path}")
        except Exception as e:
            print(f"❌ Error loading ARIMA model: {str(e)}")
            self.model = None
            
    def load_config(self):
        """Load configuration settings from JSON file."""
        try:
            with open(self.config_path, 'r') as f:
                self.config = json.load(f)
        except Exception as e:
            print(f"❌ Error loading configuration: {str(e)}")
            self.config = None
            
    def predict_occupancy(self, target_datetime_str: str):
        """Predict occupancy for one specific datetime."""
        opening_hours = self.config['opening_hours']
        
        target_datetime = pd.to_datetime(target_datetime_str)
        last_known = pd.to_datetime(self.config['last_training_date'])

        # Skip Sundays completely
        if target_datetime.dayofweek == 6:
            return None

        # Skip outside opening hours
        hour = target_datetime.hour
        if not (opening_hours["start_hour"] <= hour < opening_hours["end_hour"]):
            return None

        hours_ahead = int((target_datetime - last_known).total_seconds() / 3600)
        if hours_ahead <= 0:
            raise ValueError("Target datetime must be after last known date")

        forecast = self.model.predict(h=hours_ahead)
        prediction = float(forecast.iloc[-1]['AutoARIMA'])

        # Weekend adjustment (Saturday only)
        if target_datetime.dayofweek == 5:
            prediction *= self.config['weekend_ratio']

        return {
            'datetime': target_datetime.strftime('%Y-%m-%d %H:%M:%S'),
            'predicted_occupancy': round(prediction, 0),
            'day_of_week': target_datetime.strftime('%A'),
            'hour': hour,
        }


    def get_daily_forecast(self):
        """Only include today's remaining open hours + tomorrow open hours.
        No closed hours. No Sundays."""
        forecasts = []
        now = pd.to_datetime(datetime.now())
        opening = self.config["opening_hours"]

        for hour_offset in range(1, 30):
            target = now + timedelta(hours=hour_offset)

            # Skip Sunday entirely
            if target.dayofweek == 6:
                continue
            
            # Skip closed hours
            if not (opening["start_hour"] <= target.hour < opening["end_hour"]):
                continue

            prediction = self.predict_occupancy(target.strftime("%Y-%m-%d %H:%M:%S"))
            if prediction:
                forecasts.append(prediction)

        return forecasts


    def get_weekly_forecast(self):
        """Average occupancy for next 7 OPEN days (Mon–Sat only)."""
        forecasts = []
        opening = self.config["opening_hours"]
        today = pd.to_datetime(datetime.now()).normalize()

        for day_offset in range(1, 8):
            day = today + timedelta(days=day_offset)

            # Skip Sundays
            if day.dayofweek == 6:
                continue

            day_values = []

            for hour in range(opening["start_hour"], opening["end_hour"]):
                target = day + timedelta(hours=hour)
                prediction = self.predict_occupancy(target.strftime("%Y-%m-%d %H:%M:%S"))
                
                if prediction:
                    day_values.append(prediction["predicted_occupancy"])

            if day_values:
                avg_occ = round(float(np.mean(day_values)), 0)

                forecasts.append({
                    "date": day.strftime("%Y-%m-%d"),
                    "average_predicted_occupancy": avg_occ,
                    "day_of_week": day.strftime("%A"),
                })

        return forecasts


# Singleton instance
forecast_service = ForecastService()


# Tests
if __name__ == "__main__":
    # Test predict occupancy with a sample datetime
    test_datetime = (datetime.now() + timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S")
    prediction = forecast_service.predict_occupancy(test_datetime)
    print(f"Predicted occupancy for {test_datetime}: {prediction}")
    
    # Test daily forecast
    daily = forecast_service.get_daily_forecast()
    print("Daily Forecast:")
    for entry in daily:
        print(entry)
        
    # Test weekly forecast
    weekly = forecast_service.get_weekly_forecast()
    print("Weekly Forecast:")
    for entry in weekly:
        print(entry)