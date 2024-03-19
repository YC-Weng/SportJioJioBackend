const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    var result =
      await pool.query(`SELECT p.id, p.name, p.launcher_id, u.name as launcher_name, u.pic_url as launcher_pic_url, 
                        p.group_id, g.name as group_name, p.start_time, p.end_time, p.max_num, p.place, p.create_ts from posts as p, 
                        users as u, groups as g WHERE p.group_id = g.id AND p.launcher_id = u.id ORDER BY p.create_ts DESC limit 100`);
    for (let i = 0; i < result.rowCount; i++) {
      const post_rst = await pool.query(
        `SELECT u.id, u.name, u.pic_url from join_record as j, users as u WHERE j.pid = ${result.rows[i].id} AND j.uid = u.id`
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
      `SELECT p.id, p.name, p.launcher_id, u.name as launcher_name, u.pic_url as launcher_pic_url, p.group_id, g.name as group_name,
      p.start_time, p.end_time, p.max_num, p.place, p.create_ts from posts as p, users as u,
      groups as g WHERE p.group_id = g.id AND p.launcher_id = u.id AND p.group_id = '${groupId}' ORDER BY p.create_ts DESC `
    );
    for (let i = 0; i < result.rowCount; i++) {
      const post_rst = await pool.query(
        `SELECT u.id, u.name, u.pic_url from join_record as j, users as u WHERE j.pid = ${result.rows[i].id} AND j.uid = u.id`
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
      `SELECT p.id, p.name, p.launcher_id, u.name as launcher_name, u.pic_url as launcher_pic_url, p.group_id, g.name as group_name,
      p.start_time, p.end_time, p.max_num, p.place, p.create_ts from posts as p, users as u,
      groups as g WHERE p.group_id = g.id AND p.launcher_id = u.id AND p.id = ${postId}`
    );
    if (result_post.rowCount == 0)
      res.send({ result: "no post found", status: "fail" });
    else {
      const result_participant = await pool.query(
        `SELECT u.id, u.name, u.pic_url from join_record as j, users as u WHERE j.pid = ${postId} AND j.uid = u.id`
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

router.post("/create", async (req, res, next) => {
  try {
    const { userId, groupId } = req.body;
    const result = await pool.query(
      `SELECT * from user_group_record WHERE uid = '${userId}' AND gid = '${groupId}'`
    );
    if (result.rowCount == 0)
      res.send({ result: "no user in this group found", status: "fail" });
    else {
      const { name, startTime, endTime, maxNum, place } = req.body;
      const sql = `INSERT into posts (name, start_time, end_time, max_num, place, launcher_id, group_id) values ('${name}', '${startTime}', '${endTime}', ${maxNum}, '${place}', '${userId}', '${groupId}') RETURNING id`;
      const result = await pool.query(sql);
      await pool.query(
        `INSERT into join_record (uid, pid) values ('${userId}', ${result.rows[0].id})`
      );
      res.send({ result: { id: result.rows[0].id }, status: "success" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.post("/delete", async (req, res, next) => {
  try {
    const { postId } = req.body;
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

router.post("/join", async (req, res, next) => {
  try {
    const { postId, userId } = req.body;
    const result_post = await pool.query(
      `SELECT * from posts WHERE id = ${postId}`
    );
    const result_group = await pool.query(
      `SELECT ugr.gid from user_group_record as ugr WHERE ugr.uid = '${userId}'`
    );

    // check post exists
    if (result_post.rowCount == 0)
      res.send({ result: "no post found", status: "fail" });
    else {
      var flag = false;
      for (let i = 0; i < result_group.rowCount; i++) {
        if (result_group.rows[i].gid == result_post.rows[0].group_id)
          flag = true;
      }

      // ckeck user is in the group
      if (flag) {
        const result_join = await pool.query(
          `SELECT * from join_record WHERE pid = ${postId} AND uid = '${userId}'`
        );
        // check user is not in the post
        if (result_join.rowCount > 0)
          res.send({ result: "user already in the post", status: "fail" });
        else {
          await pool.query(
            `INSERT into join_record (pid, uid) values (${postId}, '${userId}')`
          );
          res.send({ status: "success" });
        }
      } else res.send({ result: "no user found in the group", status: "fail" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.post("/leave", async (req, res, next) => {
  try {
    const { postId, userId } = req.body;
    const result_post = await pool.query(
      `SELECT * from posts WHERE id = ${postId}`
    );
    if (result_post.rowCount == 0)
      res.send({ result: "no post found", status: "fail" });
    else {
      const result_join = await pool.query(
        `SELECT * from join_record WHERE pid = ${postId} AND uid = '${userId}'`
      );
      if (result_join.rowCount == 0)
        res.send({ result: "user already not in the post", status: "fail" });
      else {
        await pool.query(
          `DELETE from join_record WHERE pid = ${postId} AND uid = '${userId}'`
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
