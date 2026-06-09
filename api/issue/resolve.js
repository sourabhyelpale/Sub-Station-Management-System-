const readBody = (req) => {
  if (req.body && typeof req.body === "object") return req.body;

  try {
    return req.body ? JSON.parse(req.body) : {};
  } catch {
    return {};
  }
};

module.exports = (req, res) => {
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { issueId } = readBody(req);

  if (!issueId) {
    return res.status(400).send("Invalid payload: issueId is required.");
  }

  return res.status(200).json({
    success: true,
    issueId,
    status: "resolved",
  });
};
