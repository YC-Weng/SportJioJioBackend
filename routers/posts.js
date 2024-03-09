const express = require("express");
const pg = require("pg");

const dbData = {
  host: "jiojio-do-user-15809025-0.c.db.ondigitalocean.com",
  port: 25060,
  database: "jjdb",
  user: "doadmin",
  password: "AVNS_-GWAu0hX_V8M32qsPQj",
};

const router = express.Router();

router.get("/", async (req, res, next) => {
  const client = new pg.Client(dbData);
  await client.connect();

  const result = await client.query("SELECT * from posts");

  res.send({ post: result.rows, status: "ok" });
});

module.exports = router;
