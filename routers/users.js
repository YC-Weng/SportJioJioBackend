const express = require("express");

const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    var result = await pool.query("SELECT * from users limit 100");
    for (let i = 0; i < result.rowCount; i++) {
      const group_rst = await pool.query(
        `SELECT g.name from user_group_record as ugr, groups as g WHERE ugr.uid = ${result.rows[i].id} AND ugr.gid = g.id`
      );
      result.rows[i].groups = group_rst.rows;
    }
    res.send({ result: result.rows, status: "success" });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.get("/userid/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    var result = await pool.query(
      `SELECT * from users as u WHERE u.id = ${userId}`
    );
    if (result.rowCount == 0)
      res.send({ result: "user not found", status: "success" });
    else {
      const group_rst = await pool.query(
        `SELECT g.name from user_group_record as ugr, groups as g WHERE ugr.uid = ${userId} AND ugr.gid = g.id`
      );
      result.rows[0].groups = group_rst.rows;
      res.send({
        result: result.rows[0],
        status: "success",
      });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.post("/create/username/:userName", async (req, res, next) => {
  try {
    const userName = req.params.userName;
    const result = await pool.query(
      `INSERT into users (name) values ('${userName}')`
    );
    res.send({ status: "success" });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.post("/delete/userid/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const result = await pool.query(`SELECT * from users WHERE id = ${userId}`);
    if (result.rowCount == 0)
      res.send({ result: "no user found", status: "fail" });
    else {
      await pool.query(`DELETE from users WHERE id = ${userId}`);
      res.send({ status: "success" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.put(
  "/update/userid/:userId/username/:userName",
  async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const userName = req.params.userName;
      const result = await pool.query(
        `SELECT * from users WHERE id = ${userId}`
      );
      if (result.rowCount == 0)
        res.send({ result: "no user found", status: "fail" });
      else {
        await pool.query(
          `UPDATE users SET name = '${userName}' WHERE id = ${userId}`
        );
        res.send({ status: "success" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "fail" });
    }
  }
);

router.post("/join/userid/:userId/groupid/:groupId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    const result = await pool.query(
      `SELECT * from user_group_record as ugr WHERE uid = ${userId} and gid = ${groupId}`
    );
    if (result.rowCount > 0)
      res.send({ result: "user already in the group", status: "fail" });
    else {
      await pool.query(
        `INSERT into user_group_record (uid, gid) values (${userId}, ${groupId})`
      );
      res.send({ status: "success" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.post(
  "/leave/userid/:userId/groupid/:groupId",
  async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const groupId = req.params.groupId;
      const result = await pool.query(
        `SELECT * from user_group_record as ugr WHERE uid = ${userId} and gid = ${groupId}`
      );
      if (result.rowCount == 0)
        res.send({ result: "user already not in the group", status: "fail" });
      else {
        await pool.query(
          `DELETE from user_group_record WHERE uid = ${userId} AND gid = ${groupId}`
        );
        res.send({ status: "success" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "fail" });
    }
  }
);

module.exports = router;
