import { updateSeats } from "@/api/seats";
import { ApiError } from "@/api/errors";
import { apiFetch } from "../fetcher";

jest.mock("@/api/fetcher", () => ({
  apiFetch: jest.fn(),
}));
beforeEach(() => {
  global.fetch = jest.fn();
  jest.clearAllMocks();
});

describe("updateSeats", () => {
  const mockPayload = {
    added: [
      {
        seat_number: "A1",
        floor_id: "1",
        seat_type: "standard",
        has_power_outlet: true,
      },
    ],
    //removed: ["uuid-to-remove"],
    //updated: [
    //{ id: "uuid-to-update", seat_type: "vip", has_ac: true },
    //],
  };


  it("should send correct request and return success response", async () => {
    const mockResponse = {
      status: "success",
      message: "Seats updated successfully.",
    };

    (apiFetch as any).mockResolvedValueOnce(mockResponse);

    const result = await updateSeats(mockPayload);

    // --- Verify fetch call
    expect(apiFetch).toHaveBeenCalledTimes(1);
    const [path, options] = (apiFetch as any).mock.calls[0];

    expect(path).toBe("/seats/update");
    expect(options.method).toBe("PATCH");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe(JSON.stringify(mockPayload));

    // --- Verify result shape
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual(mockResponse);
  });

  it("should handle server error with valid JSON error response", async () => {
    const mockError = { detail: "Database error: constraint failed" };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => mockError,
    });

    const result = await updateSeats(mockPayload);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(ApiError);
    if (!result.ok) expect(result.error.message).toContain("Database error");
  });

  it("should handle unexpected error shape gracefully", async () => {
    const mockError = { unexpected: "Oops" };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => mockError,
    });

    const result = await updateSeats(mockPayload);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(ApiError);
    if (!result.ok) expect(result.error.message).toContain("Unexpected error shape");
  });

  it("should handle invalid (non-JSON) error response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("Invalid JSON");
      },
      text: async () => "Internal Server Error",
    });

    const result = await updateSeats(mockPayload);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(ApiError);
    if (!result.ok) expect(result.error.message).toContain("Internal Server Error");
  });
});

