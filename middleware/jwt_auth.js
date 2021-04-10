const jwt = require("jsonwebtoken");
const secret = process.env.SECRET || "secretkey";

module.exports = function authToken(req, res, next) {
  if (req.body === undefined) {
    return res.status(400).end();
  }
  if (req.method === "POST" && !req.body.private) {
    return next();
  }
  const token =
    req.body.Authorization !== undefined
      ? req.body.Authorization.split(" ")[1]
      : undefined;

  if (!token && req.method === "GET") {
    return next();
  }
  if (!token) {
    return res.status(403).send();
  }
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).send();
    }
    req.body.owner_id = decoded.id;
    req.body.username = decoded.username;
    req.body.email = decoded.email;
    next();
  });
};
