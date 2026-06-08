const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { reportIssue, resolveIssue, getIssues } = require("./telegramService");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/report", async (req, res) => {
  const { issueId, division, subStation, feederType, trippingTime, reason } =
    req.body;

  if (!division || !subStation || !feederType || !trippingTime) {
    return res
      .status(400)
      .send(
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
    return res.json({
      success: true,
      issueId: savedIssue.issueId,
      assignedMaintainerChatId: savedIssue.assignedChatId,
      escalationChatId: process.env.TELEGRAM_CHAT_ID_SUPERVISOR || null,
      delayMinutes: Number(process.env.TELEGRAM_DELAY_MINUTES || 0),
      telegramResult,
    });
  } catch (error) {
    console.error(
      "Telegram API error:",
      error.response ? error.response.data : error.message
    );
    const errorMessage =
      error.response && error.response.data
        ? JSON.stringify(error.response.data)
        : error.message;
    return res.status(502).send(`Telegram API request failed: ${errorMessage}`);
  }
});

app.post("/api/issue/resolve", (req, res) => {
  const { issueId } = req.body;

  if (!issueId) {
    return res.status(400).send("Invalid payload: issueId is required.");
  }

  const issue = resolveIssue(issueId);
  if (!issue) {
    return res.status(404).send("Issue not found.");
  }

  return res.json({
    success: true,
    issueId,
    status: issue.status,
  });
});

app.get("/api/issues", (req, res) => {
  return res.json({ issues: getIssues() });
});

const port = Number(process.env.BACKEND_PORT) || 5000;
app.listen(port, () => {
  console.log(`Telegram backend listening on port ${port}`);
});
