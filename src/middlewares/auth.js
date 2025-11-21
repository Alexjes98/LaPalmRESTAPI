const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  const accessToken = authorizationHeader
    ? authorizationHeader.split(" ")[1]
    : null;

  if (!accessToken) {
    return res.status(401).send("Access denied, token missing!");
  }
  try {
    const validToken = jwt.verify(accessToken, process.env.SECRET_KEY);
    if (validToken) {
      req.user = validToken;
      req.authenticated = true;
      return next();
    }
  } catch (err) {
    return res.status(400).send("Invalid token!");
  }
};

module.exports = validateToken;
