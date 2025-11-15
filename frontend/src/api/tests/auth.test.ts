import { login, signup } from "@/api/auth";
import { apiFetch } from "@/api/fetcher";
import type { SignupParams } from "@/api/auth";

jest.mock("@/api/fetcher", () => ({
  apiFetch: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("auth API", () => {
  it("calls apiFetch correctly for login", async () => {
    const mockResponse = { token: "123" };
    (apiFetch as any).mockResolvedValueOnce(mockResponse);

    const body = { username: "user@example.com", password: "secret" };
    const result = await login(body);

    expect(apiFetch).toHaveBeenCalledTimes(1);
    const [path, options] = (apiFetch as any).mock.calls[0];

    expect(path).toBe("/auth/login");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(options.body).toBeInstanceOf(URLSearchParams);
    expect((options.body as URLSearchParams).get("username")).toBe("user@example.com");
    expect((options.body as URLSearchParams).get("password")).toBe("secret");
    expect(result).toEqual(mockResponse);
  });


  it("calls apiFetch correctly for signup", async () => {
    const mockResponse = { success: true };
    (apiFetch as any).mockResolvedValueOnce(mockResponse);

    const body: SignupParams = {
      email: "user@example.com",
      name: "John Doe",
      phone_number: "1234567890",
      role: "student",
      password: "secret",
      student_id: "S123",
    };

    const result = await signup(body);

    expect(apiFetch).toHaveBeenCalledTimes(1);
    const [path, options] = (apiFetch as any).mock.calls[0];

    expect(path).toBe("/auth/register");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual(body);
    expect(result).toEqual(mockResponse);
  });
});

