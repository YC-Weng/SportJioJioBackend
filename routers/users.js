const express = require("express");

const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * from users limit 100");
    res.send({ result: result.rows, status: "success" });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.get("/userId/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const result = await pool.query(
      `SELECT u.name as "userName", g.name as "groupName" from users as u, groups as g, user_group_record as ugr WHERE u.id = ${userId} and u.id = ugr.uid and g.id = ugr.gid`
    );
    const groupList = [];
    for (const item in result.rows) {
      groupList.push(item.groupName);
    }
    if (result.rowCount == 0)
      res.send({ result: "user not in any group", status: "success" });
    else
      res.send({
        result: { userName: result.rows[0].userName, groupList: groupList },
        status: "success",
      });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

module.exports = router;
