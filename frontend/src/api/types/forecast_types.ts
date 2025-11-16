type DailyForecast = {
    datetime: string;
    predicted_occupancy: number;
    day_of_week: string;
    is_weekend: boolean;
    hour : number;
};

type WeeklyForecast = {
    datetime: string;
    average_predicted_occupancy: number;
    day_of_week: string;
    is_weekend: boolean;
};


// Daily forecasting
export interface DailyForecastRequest {
    location_id: string | undefined;
}


export interface DailyForecastResponse {
    location_id: string | undefined;
    forecasts: DailyForecast[];
}

// Weekly forecasting
export interface WeeklyForecastRequest {
    location_id: string | undefined;
}

export interface WeeklyForecastResponse {
    location_id: string | undefined;
    forecasts: WeeklyForecast[];
}