const express = require("express");
const { Pool } = require("pg");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * from posts limit 100");
    res.send({ result: result.rows, status: "success" });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.get("/postid/:postId", async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const result_post = await pool.query(
      `SELECT * from posts WHERE id = ${postId}`
    );
    if (result.rowCount == 0)
      res.send({ result: "no post found", status: "fail" });
    else {
      const result_participant = await pool.query(
        `SELECT u.id, u.name from join_record as j, users as u WHERE j.pid = ${postId} AND j.uid = u.id`
      );
      res.send({
        result: { ...result.rows, participant: result_participant.rows },
        status: "success",
      });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.post(
  "/create/userid/:userId/groupid/:groupId",
  async (req, res, next) => {
    try {
      const { userId, groupId } = req.params;
      const result = await pool.query(
        `SELECT * from user_group_record WHERE uid = ${userId} AND gid = ${groupId}`
      );
      if (result.rowCount == 0)
        res.send({ result: "no user in this group found", status: "fail" });
      else {
        const { name, startTime, endTime, maxNum, place } = req.body.name;
        const sql = `INSERT into posts (name, "startTime", "endTime", "maxNum", place, "launcherId", "groupId") values ('${name}', '${startTime}', '${endTime}', ${maxNum}, '${place}', ${userId}, ${groupId}) RETURNING id`;
        console.log(sql);
        const result = await pool.query(sql);
        await pool.query(
          `INSERT into join_record (uid, pid) values (${userId}, ${result.rows[0].id})`
        );
        res.send({ status: "success" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "fail" });
    }
  }
);

router.post("/delete/postid/:postId", async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const result = await pool.query(`SELECT * from posts WHERE id = ${postId}`);
    if (result.rowCount == 0)
      res.send({ result: "no post found", status: "fail" });
    else {
      await pool.query(`DELETE from posts WHERE id = ${postId}`);
      res.send({ status: "success" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

module.exports = router;
