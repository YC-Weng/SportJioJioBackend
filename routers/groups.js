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
    for (const item in result.rows) {
      console.log(item);
      userList.push(item.userName);
    }
    if (result.rowCount == 0)
      res.send({ result: "no user in this group", status: "success" });
    else
      res.send({
        result: result.rows,
        status: "success",
      });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.post("/create/groupname/:groupName", async (req, res, next) => {
  try {
    const groupName = req.params.groupName;
    const result = await pool.query(
      `INSERT into groups (name) values ('${groupName}')`
    );
    res.send({ status: "success" });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.post("/delete/groupid/:groupId", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const result = await pool.query(
      `SELECT * from groups WHERE id = ${groupId}`
    );
    if (result.rowCount == 0)
      res.send({ result: "no group found", status: "fail" });
    else {
      await pool.query(`DELETE from groups WHERE id = ${groupId}`);
      res.send({ status: "success" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.put(
  "/update/groupid/:groupId/groupName/:groupName",
  async (req, res, next) => {
    try {
      const groupId = req.params.groupId;
      const groupName = req.params.groupName;
      const result = await pool.query(
        `SELECT * from groups WHERE id = ${groupId}`
      );
      if (result.rowCount == 0)
        res.send({ result: "no group found", status: "fail" });
      else {
        const result = await pool.query(
          `UPDATE groups SET name = '${groupName}' WHERE id = ${groupId}`
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
