const express = require("express");

const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    var result = await pool.query("SELECT * from users limit 500");
    for (let i = 0; i < result.rowCount; i++) {
      const group_rst = await pool.query(
        `SELECT g.id, g.name, g.pic_url from user_group_record as ugr, groups as g WHERE ugr.uid = '${result.rows[i].id}' AND ugr.gid = g.id`
      );
      const pnum_rst = await pool.query(`SELECT COUNT(*) as num from posts WHERE launcher_id='${result.rows[i].id}'`);
      result.rows[i].groups = group_rst.rows;
      result.rows[i].post_num = pnum_rst.rows[0].num;
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
    var result = await pool.query(`SELECT * from users as u WHERE u.id = '${userId}'`);
    if (result.rowCount == 0) res.send({ result: "no user found", status: "fail" });
    else {
      const group_rst = await pool.query(
        `SELECT g.id, g.name, g.pic_url from user_group_record as ugr, groups as g WHERE ugr.uid = '${userId}' AND ugr.gid = g.id`
      );
      const pnum_rst = await pool.query(`SELECT COUNT(*) as num from posts WHERE launcher_id='${userId}'`);
      result.rows[0].groups = group_rst.rows;
      result.rows[0].post_num = pnum_rst.rows[0].num;
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

router.post("/create", async (req, res, next) => {
  try {
    const { userName, userId, userPicUrl } = req.body;
    if (userName == null) res.send({ status: "fail" });
    else {
      const result = await pool.query(
        `INSERT into users (id, name${userPicUrl != null ? ", pic_url" : ""}) values ('${userId}', '${userName}'${
          userPicUrl != null ? `, '${userPicUrl}'` : ""
        })`
      );
      res.send({ status: "success" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.post("/delete", async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const result = await pool.query(`SELECT * from users WHERE id = '${userId}'`);
    if (result.rowCount == 0) res.send({ result: "no user found", status: "fail" });
    else {
      await pool.query(`DELETE from users WHERE id = '${userId}'`);
      res.send({ status: "success" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.put("/update/userid/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const { userName, userPicUrl } = req.body;
    const result = await pool.query(`SELECT * from users WHERE id = '${userId}'`);
    if (result.rowCount == 0) res.send({ result: "no user found", status: "fail" });
    else {
      if (userName != null) await pool.query(`UPDATE users SET name = '${userName}' WHERE id = '${userId}'`);
      if (userPicUrl != null) await pool.query(`UPDATE users SET pic_url = '${userPicUrl}' WHERE id = '${userId}'`);
      res.send({ status: "success" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.post("/join", async (req, res, next) => {
  try {
    const { userId, groupId } = req.body;
    const result = await pool.query(
      `SELECT * from user_group_record as ugr WHERE uid = '${userId}' and gid = '${groupId}'`
    );
    if (result.rowCount > 0) res.send({ result: "user already in the group", status: "fail" });
    else {
      await pool.query(`INSERT into user_group_record (uid, gid) values ('${userId}', '${groupId}')`);
      res.send({ status: "success" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.post("/leave", async (req, res, next) => {
  try {
    const { userId, groupId } = req.body;
    const result = await pool.query(
      `SELECT * from user_group_record as ugr WHERE uid = '${userId}' and gid = '${groupId}'`
    );
    if (result.rowCount == 0) res.send({ result: "user already not in the group", status: "fail" });
    else {
      await pool.query(`DELETE from user_group_record WHERE uid = '${userId}' AND gid = '${groupId}'`);
      res.send({ status: "success" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

module.exports = router;
