const axios = require("axios");

const {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  TELEGRAM_CHAT_ID_SUPERVISOR,
  TELEGRAM_DELAY_MINUTES = "0",
} = process.env;

const MAINTAINER_CHAT_IDS = String(TELEGRAM_CHAT_ID || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

const SUPERVISOR_CHAT_ID = String(TELEGRAM_CHAT_ID_SUPERVISOR || "").trim();
const TELEGRAM_DELAY_MS =
  Math.max(0, Number(TELEGRAM_DELAY_MINUTES)) * 60 * 1000;

const issueStore = new Map();

const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

const safe = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return "N/A";
  }
  return escapeHtml(value);
};

const pickRandomMaintainer = () => {
  if (MAINTAINER_CHAT_IDS.length === 0) {
    return null;
  }
  const index = Math.floor(Math.random() * MAINTAINER_CHAT_IDS.length);
  return MAINTAINER_CHAT_IDS[index];
};

const buildTelegramMessage = (issue, escalation = false) => {
  const header = escalation
    ? "⚠️ <b>Warning! Escalation needed</b>"
    : "⚠️ <b>Warning! Action needed on</b>";

  const lines = [
    header,
    `Division : ${safe(issue.division)}`,
    `Substation : ${safe(issue.subStation)}`,
    `Type of feeder : ${safe(issue.feederType)}`,
    `Tripping time : ${safe(issue.trippingTime)}`,
    `Reason : ${safe(issue.reason)}`,
  ];

  if (escalation) {
    lines.push(
      `\nThis issue is still open after ${safe(
        TELEGRAM_DELAY_MINUTES
      )} minutes.`
    );
  }

  return lines.join("\n");
};

const sendTelegramMessage = async (chatId, text) => {
  const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await axios.post(
    apiUrl,
    {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

const scheduleEscalation = (issueId) => {
  if (!SUPERVISOR_CHAT_ID || TELEGRAM_DELAY_MS <= 0) {
    return;
  }

  setTimeout(async () => {
    const issue = issueStore.get(issueId);
    if (!issue || issue.status !== "open") {
      return;
    }

    try {
      const escalationText = buildTelegramMessage(issue, true);
      await sendTelegramMessage(SUPERVISOR_CHAT_ID, escalationText);
      issue.status = "escalated";
      issue.escalatedAt = new Date().toISOString();
      issueStore.set(issueId, issue);
    } catch (error) {
      console.error(
        "Telegram escalation error:",
        error.response ? error.response.data : error.message
      );
    }
  }, TELEGRAM_DELAY_MS);
};

const reportIssue = async (issue) => {
  if (!TELEGRAM_BOT_TOKEN || MAINTAINER_CHAT_IDS.length === 0) {
    throw new Error(
      "Telegram configuration is incomplete. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID with at least one maintainer chat id."
    );
  }

  const assignedChatId = pickRandomMaintainer();
  if (!assignedChatId) {
    throw new Error("No maintainer chat id is available for issue assignment.");
  }

  const issueCopy = {
    ...issue,
    issueId: issue.issueId || `issue-${Date.now()}`,
    assignedChatId,
    status: issue.status || "open",
    createdAt: issue.createdAt || new Date().toISOString(),
  };

  issueStore.set(issueCopy.issueId, issueCopy);
  const messageText = buildTelegramMessage(issueCopy, false);
  const result = await sendTelegramMessage(assignedChatId, messageText);

  if (SUPERVISOR_CHAT_ID && TELEGRAM_DELAY_MS > 0) {
    scheduleEscalation(issueCopy.issueId);
  }

  return { telegramResult: result, issue: issueCopy };
};

const resolveIssue = (issueId) => {
  const issue = issueStore.get(issueId);
  if (!issue) {
    return null;
  }

  issue.status = "resolved";
  issue.resolvedAt = new Date().toISOString();
  issueStore.set(issueId, issue);
  return issue;
};

const getIssues = () => Array.from(issueStore.values());

module.exports = {
  reportIssue,
  resolveIssue,
  getIssues,
};
