const express = require("express");
const { Pool } = require("pg");

const router = express.Router();

router.get("/", async (req, res, next) => {
  const pool = new Pool({
    user: "yc",
    database: "jjdb",
    port: 5432,
    host: "localhost",
    password: "sportjiojio",
  });

  const result = await pool.query("SELECT NOW()");

  res.send({ post: result.rows });
});

module.exports = router;
