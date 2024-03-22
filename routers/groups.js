const express = require("express");

const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    var result = await pool.query("SELECT * from groups limit 100");
    for (let i = 0; i < result.rowCount; i++) {
      const mb_rst = await pool.query(
        `SELECT u.id, u.name, u.pic_url from users as u, user_group_record as ugr WHERE ugr.gid = '${result.rows[i].id}' AND ugr.uid = u.id`
      );
      const pnum_rst = await pool.query(`SELECT COUNT(*) as num from posts WHERE group_id = '${result.rows[i].id}'`);
      result.rows[i].member = mb_rst.rows;
      result.rows[i].post_num = pnum_rst.rows[0].num;
    }
    res.send({ result: result.rows, status: "success" });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.get("/groupId/:groupId", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    var result = await pool.query(`SELECT * from groups WHERE id = '${groupId}'`);
    if (result.rowCount == 0) res.send({ result: "no group found", status: "fail" });
    else {
      const mb_rst = await pool.query(
        `SELECT u.id, u.name, u.pic_url from users as u, user_group_record as ugr WHERE ugr.gid = '${groupId}' AND ugr.uid = u.id`
      );
      const pnum_rst = await pool.query(`SELECT COUNT(*) as num from posts WHERE group_id = '${groupId}'`);
      result.rows[0].member = mb_rst.rows;
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
    const { groupId, groupName, groupPicUrl } = req.body;
    const result = await pool.query(
      `INSERT into groups (id, name${groupPicUrl != null ? `, pic_url` : ``}) values ('${groupId}', '${groupName}'${
        groupPicUrl != null ? `, '${groupPicUrl}'` : ``
      })`
    );
    res.send({ status: "success" });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.post("/delete", async (req, res, next) => {
  try {
    const groupId = req.body.groupId;
    const result = await pool.query(`SELECT * from groups WHERE id = '${groupId}'`);
    if (result.rowCount == 0) res.send({ result: "no group found", status: "fail" });
    else {
      await pool.query(`DELETE from groups WHERE id = '${groupId}'`);
      res.send({ status: "success" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

router.put("/update/groupid/:groupId", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const { groupName, groupPicUrl } = req.body;
    const result = await pool.query(`SELECT * from groups WHERE id = '${groupId}'`);
    if (result.rowCount == 0) res.send({ result: "no group found", status: "fail" });
    else {
      const result = await pool.query(
        `UPDATE groups SET name = '${groupName}'${
          groupPicUrl != null ? `, pic_url = '${groupPicUrl}'` : ``
        } WHERE id = '${groupId}'`
      );
      res.send({ status: "success" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "fail" });
  }
});

module.exports = router;
