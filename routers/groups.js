const express = require("express");

const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * from groups limit 100");
    res.send({ result: result.rows, status: "success" });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.get("/groupId/:groupId", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const result = await pool.query(
      `SELECT g.name as "groupName", u.name as "userName" from users as u, groups as g, user_group_record as ugr WHERE g.id = ${groupId} and g.id = ugr.gid and u.id = ugr.uid`
    );
    const userList = [];
    for (item in result.rows) {
      userList.append(item.userName);
    }
    if (result.rowCount == 0)
      res.send({ result: "no user in this group", status: "success" });
    res.send({ result: result.rows, status: "success" });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

module.exports = router;
