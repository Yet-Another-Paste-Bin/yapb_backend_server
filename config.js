const secret = process.env.SECRET || "secretkey";
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/yapb";
const env = process.env.NODE_ENV || "production";

module.exports = { secret, PORT, DB_URL, env };
