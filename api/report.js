const { reportIssue } = require("../backend/telegramService");

const readBody = (req) => {
  if (req.body && typeof req.body === "object") return req.body;

  try {
    return req.body ? JSON.parse(req.body) : {};
  } catch {
    return {};
  }
};

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { issueId, division, subStation, feederType, trippingTime, reason } = readBody(req);

  if (!division || !subStation || !feederType || !trippingTime) {
    return res.status(400).send(
      "Invalid payload: division, subStation, feederType, and trippingTime are required."
    );
  }

  const issue = {
    issueId,
    division,
    subStation,
    feederType,
    trippingTime,
    reason,
    status: "open",
    createdAt: new Date().toISOString(),
  };

  try {
    const { telegramResult, issue: savedIssue } = await reportIssue(issue);

    return res.status(200).json({
      success: true,
      issueId: savedIssue.issueId,
      assignedMaintainerChatId: savedIssue.assignedChatId,
      escalationChatId: process.env.TELEGRAM_CHAT_ID_SUPERVISOR || null,
      delayMinutes: Number(process.env.TELEGRAM_DELAY_MINUTES || 0),
      telegramResult,
    });
  } catch (error) {
    console.error("Telegram API error:", error.response ? error.response.data : error.message);
    const errorMessage =
      error.response && error.response.data
        ? JSON.stringify(error.response.data)
        : error.message;
    return res.status(502).send(`Telegram API request failed: ${errorMessage}`);
  }
};
