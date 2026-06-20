type ResetResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: Array<{ msg?: string }>;
};

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  return apiUrl;
};

async function resetRequest(path: string, body: Record<string, string>) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as ResetResponse;

  if (!response.ok) {
    throw new Error(
      data.error ?? data.errors?.[0]?.msg ?? "Password reset failed",
    );
  }

  return data.message ?? "Request completed successfully.";
}

export const requestPasswordReset = (email: string) =>
  resetRequest("/api/auth/forgot-password", { email });

export const submitPasswordReset = (token: string, password: string) =>
  resetRequest("/api/auth/reset-password", { token, password });
