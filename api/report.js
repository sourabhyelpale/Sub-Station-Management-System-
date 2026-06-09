const axios = require("axios");

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

  const maintainerChatIds = String(process.env.TELEGRAM_CHAT_ID || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const supervisorChatId = String(process.env.TELEGRAM_CHAT_ID_SUPERVISOR || "").trim();
  const delayMinutes = Number(process.env.TELEGRAM_DELAY_MINUTES || 0);

  if (!process.env.TELEGRAM_BOT_TOKEN || maintainerChatIds.length === 0) {
    return res.status(500).json({
      success: false,
      message:
        "Telegram configuration missing. Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Vercel, then redeploy.",
      config: {
        hasBotToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
        maintainerChatCount: maintainerChatIds.length,
        hasSupervisorChatId: Boolean(supervisorChatId),
      },
    });
  }

  const assignedChatId = maintainerChatIds[Math.floor(Math.random() * maintainerChatIds.length)];
  const safe = (value) => {
    if (value === undefined || value === null || String(value).trim() === "") return "N/A";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  const messageText = [
    "⚠️ <b>Warning! Action needed on</b>",
    `Division : ${safe(division)}`,
    `Substation : ${safe(subStation)}`,
    `Type of feeder : ${safe(feederType)}`,
    `Tripping time : ${safe(trippingTime)}`,
    `Reason : ${safe(reason)}`,
  ].join("\n");

  try {
    const telegramResult = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: assignedChatId,
        text: messageText,
        parse_mode: "HTML",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({
      success: true,
      issueId: issueId || `issue-${Date.now()}`,
      assignedMaintainerChatId: assignedChatId,
      escalationChatId: supervisorChatId || null,
      delayMinutes,
      telegramResult: telegramResult.data,
    });
  } catch (error) {
    console.error("Telegram API error:", error.response ? error.response.data : error.message);
    return res.status(502).json({
      success: false,
      message: "Telegram API request failed.",
      telegramError: error.response ? error.response.data : error.message,
    });
  }
};
