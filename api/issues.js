const { getIssues } = require("../backend/telegramService");

module.exports = (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  return res.status(200).json({ issues: getIssues() });
};
