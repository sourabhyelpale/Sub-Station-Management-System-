const BACKEND_API_BASE =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const request = async (path, body) => {
  try {
    const response = await fetch(`${BACKEND_API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Backend request failed (${response.status}): ${text}`);
    }

    return response.json();
  } catch (error) {
    throw new Error(
      error.message ||
        "Unable to connect to the Telegram backend. Please ensure the backend is running."
    );
  }
};

export const reportIssueToTelegram = async (issue) => {
  return request("/api/report", issue);
};

export const resolveTelegramIssue = async (issueId) => {
  return request("/api/issue/resolve", { issueId });
};
