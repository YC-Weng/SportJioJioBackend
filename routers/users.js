const express = require("express");

const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * from users limit 100");
    res.send({ post: result.rows, status: "success" });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.get("/userId/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const result = await pool.query(
      `SELECT U.id, U.name, G.name from users as U, groups as G, user_group_record as UGR WHERE U.id = ${userId} and U.id = UGR.uid and G.id = UGR.gid`
    );
    res.send({ post: result.rows, status: "success" });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

module.exports = router;
