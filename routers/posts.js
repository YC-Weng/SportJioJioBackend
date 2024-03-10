const express = require("express");
const { Pool } = require("pg");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    var result = await pool.query("SELECT * from posts limit 100");
    for (let i = 0; i < result.rowCount; i++) {
      const post_rst = await pool.query(
        `SELECT u.id, u.name from join_record as j, users as u WHERE j.pid = ${result.rows[i].id} AND j.uid = u.id`
      );
      result.rows[i].participant = post_rst.rows;
    }
    res.send({ result: result.rows, status: "success" });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.get("/groupid/:groupId", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    var result = await pool.query(
      `SELECT * from posts WHERE "groupId" = ${groupId}`
    );
    for (let i = 0; i < result.rowCount; i++) {
      const post_rst = await pool.query(
        `SELECT u.id, u.name from join_record as j, users as u WHERE j.pid = ${result.rows[i].id} AND j.uid = u.id`
      );
      result.rows[i].participant = post_rst.rows;
    }
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
    if (result_post.rowCount == 0)
      res.send({ result: "no post found", status: "fail" });
    else {
      const result_participant = await pool.query(
        `SELECT u.id, u.name from join_record as j, users as u WHERE j.pid = ${postId} AND j.uid = u.id`
      );
      res.send({
        result: {
          ...result_post.rows[0],
          participant: result_participant.rows,
        },
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
        const { name, startTime, endTime, maxNum, place } = req.body;
        const sql = `INSERT into posts (name, "startTime", "endTime", "maxNum", place, "launcherId", "groupId") values ('${name}', '${startTime}', '${endTime}', ${maxNum}, '${place}', ${userId}, ${groupId}) RETURNING id`;
        const result = await pool.query(sql);
        await pool.query(
          `INSERT into join_record (uid, pid) values (${userId}, ${result.rows[0].id})`
        );
        res.send({ result: { id: result.rows[0].id }, status: "success" });
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

router.post("/join/postid/:postId/userid/:userId", async (req, res, next) => {
  try {
    const { postId, userId } = req.params;
    const result_post = await pool.query(
      `SELECT * from posts WHERE id = ${postId}`
    );
    const result_group = await pool.query(
      `SELECT ugr.gid from user_group_record as ugr WHERE ugr.uid = ${userId}`
    );
    console.log(result_group.rows);
    console.log(result_post.rows);
    if (result_post.rowCount == 0)
      res.send({ result: "no post found", status: "fail" });
    else {
      var flag = false;
      for (let i = 0; i < result_group.rowCount; i++) {
        if (result_group.rows[i].id == result_post.rows[0].groupId) flag = true;
      }
      if (flag) {
        const result_join = await pool.query(
          `SELECT * from join_record WHERE pid = ${postId} AND uid = ${userId}`
        );
        if (result_join.rowCount > 0)
          res.send({ result: "user already in the post", status: "fail" });
        else {
          await pool.query(
            `INSERT into join_record (pid, uid) values (${postId}, ${userId})`
          );
          res.send({ status: "success" });
        }
      } else res.send({ status: "fail" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.post("/leave/postid/:postId/userid/:userId", async (req, res, next) => {
  try {
    const { postId, userId } = req.params;
    const result_post = await pool.query(
      `SELECT * from posts WHERE id = ${postId}`
    );
    if (result_post.rowCount == 0)
      res.send({ result: "no post found", status: "fail" });
    else {
      const result_join = await pool.query(
        `SELECT * from join_record WHERE pid = ${postId} AND uid = ${userId}`
      );
      if (result_join.rowCount == 0)
        res.send({ result: "user already not in the post", status: "fail" });
      else {
        await pool.query(
          `DELETE from join_record WHERE pid = ${postId} AND uid = ${userId}`
        );
        res.send({ status: "success" });
      }
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

module.exports = router;
