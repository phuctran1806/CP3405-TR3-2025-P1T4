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
        """Helper function to predict occupancy for a specific datetime"""
        
        # Parse datetime
        target_datetime = pd.to_datetime(target_datetime_str)
        last_known = pd.to_datetime(self.config['last_training_date'])
        
        # Calculate hours ahead
        hours_ahead = int((target_datetime - last_known).total_seconds() / 3600)
        
        if hours_ahead <= 0:
            raise ValueError("Target datetime must be after the last known date (2025-08-31 23:00:00)")
        
        # Generate forecast
        forecast = self.model.predict(h=hours_ahead)
        
        # Get prediction for target datetime
        prediction = forecast.iloc[-1]['AutoARIMA']
        
        # Apply weekend adjustment
        day_of_week = target_datetime.dayofweek
        is_weekend = day_of_week in [5, 6]
        
        if day_of_week == 6: # School is not opening on Sundays
            prediction *= 0
        
        if is_weekend:
            prediction = prediction * self.config['weekend_ratio']
        
        # Clip to valid range
        prediction = np.clip(prediction, self.config['min_occupancy'], self.config['max_occupancy'])
        
        return {
            'datetime': target_datetime.strftime('%Y-%m-%d %H:%M:%S'),
            'predicted_occupancy': round(float(prediction), 0),
            'day_of_week': target_datetime.strftime('%A'),
            'is_weekend': is_weekend,
            'hour': target_datetime.hour,
        }
        
    def get_daily_forecast(self) -> List[Dict[str, Any]]:
        """Get hourly forecast for the next 24 hours."""
        forecasts = []
        now = pd.to_datetime(datetime.now())
        for hour_offset in range(1, 25):
            target_datetime = now + timedelta(hours=hour_offset)
            prediction = self.predict_occupancy(target_datetime.strftime("%Y-%m-%d %H:%M:%S"))
            forecasts.append(prediction)
        return forecasts
    
    def get_weekly_forecast(self) -> List[Dict[str, Any]]:
        """Get average daily forecast for the next 7 days."""
        forecasts = []
        now = pd.to_datetime(datetime.now())
        for day_offset in range(1, 8):
            daily_predictions = []
            for hour in range(24):
                target_datetime = now + timedelta(days=day_offset, hours=hour)
                prediction = self.predict_occupancy(target_datetime.strftime("%Y-%m-%d %H:%M:%S"))
                daily_predictions.append(prediction['predicted_occupancy'])
            average_occupancy = round(float(np.mean(daily_predictions)), 0)
            forecasts.append({
                'date': (now + timedelta(days=day_offset)).strftime('%Y-%m-%d'),
                'average_predicted_occupancy': average_occupancy,
                'day_of_week': (now + timedelta(days=day_offset)).strftime('%A'),
                'is_weekend': (now + timedelta(days=day_offset)).day in [5, 6],
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