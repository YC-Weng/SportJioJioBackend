const { Pool } = require("pg");

const pool = new Pool({
  user: "sjjstaff",
  database: "jjdb",
  password: "sportjiojio",
  port: 5432,
  host: "database",
});

module.exports = { pool };
