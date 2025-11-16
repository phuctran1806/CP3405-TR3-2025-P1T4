import { apiFetch } from "@/api/fetcher";
import type { ApiResult } from "@/api/types";
import type { DailyForecastRequest, 
    DailyForecastResponse, 
    WeeklyForecastRequest, 
    WeeklyForecastResponse 
} from "@/api/types/forecast_types";

//TODO: Add location_id for future implementation on specific location forecasts
/**
 * Fetch daily forecast for a specific location.
 * GET /forecast/daily/?location_id={location_id}
 */
export async function getDailyForecast(requestParams: DailyForecastRequest): Promise<ApiResult<DailyForecastResponse>> {
    const queryParams = new URLSearchParams();
    if (requestParams.location_id) {
        queryParams.append("location_id", requestParams.location_id);
    }
    const res = await apiFetch<DailyForecastResponse>(`/forecast/daily`);
    if (res.ok) {
        console.log("Daily Forecast Data:", res.data);
    } else {
        console.error("Error fetching daily forecast:", res.error);
    }
    return res;
}

/**
 * Fetch weekly forecast for a specific location.
 * GET /forecast/weekly/?location_id={location_id}
 */
export async function getWeeklyForecast(requestParams: WeeklyForecastRequest): Promise<ApiResult<WeeklyForecastResponse>> {
    const queryParams = new URLSearchParams();
    if (requestParams.location_id) {
        queryParams.append("location_id", requestParams.location_id);
    }
    const res = await apiFetch<WeeklyForecastResponse>(`/forecast/weekly`);
    if (res.ok) {
        console.log("Weekly Forecast Data:", res.data);
    } else {
        console.error("Error fetching weekly forecast:", res.error);
    }
    return res;
}