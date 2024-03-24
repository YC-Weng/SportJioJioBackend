const express = require("express");
const https = require("https");
const axios = require("axios");

const { pool } = require("../db");
const { menu_group } = require("../uti");
const { userInfo } = require("os");

const TOKEN = process.env.LINE_TOKEN;
const headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer " + TOKEN,
};
const open_groupid = "11111111111111111111111111111111";

const router = express.Router();

const send_reply = (dataString) => {
  const webhookOptions = {
    hostname: "api.line.me",
    path: "/v2/bot/message/reply",
    method: "POST",
    headers: headers,
    body: dataString,
  };

  const request = https.request(webhookOptions);

  request.on("error", (err) => {
    console.error(err);
  });

  request.write(dataString);
  request.end();
};

const send_push_msg = (dataString) => {
  const webhookOptions = {
    hostname: "api.line.me",
    path: "/v2/bot/message/push",
    method: "POST",
    headers: headers,
    body: dataString,
  };

  const request = https.request(webhookOptions);

  request.on("error", (err) => {
    console.error(err);
  });

  request.write(dataString);
  request.end();
};

const gen_reply_datastring = (replyToken, texts) => {
  const msg = [];
  for (let i = 0; i < texts.length; i++) msg.push({ type: "text", text: texts[i] });
  return JSON.stringify({
    replyToken: replyToken,
    messages: msg,
  });
};

const gen_push_datastring = (to, texts) => {
  const msg = [];
  for (let i = 0; i < texts.length; i++) msg.push({ type: "text", text: texts[i] });
  return JSON.stringify({
    to: to,
    messages: msg,
  });
};

const get_group_info = (groupId) => {
  return new Promise((resolve) => {
    axios
      .get(`https://api.line.me/v2/bot/group/${groupId}/summary`, { headers: headers })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

const get_group_member = (groupId, userId) => {
  return new Promise((resolve) => {
    axios
      .get(`https://api.line.me/v2/bot/group/${groupId}/member/${userId}`, { headers: headers })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

const get_user_profile = (userId) => {
  return new Promise((resolve) => {
    axios
      .get(`https://api.line.me/v2/bot/profile/${userId}`, { headers: headers })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

const create_user = async (data, userId, groupId) => {
  const reply_texts = [];
  try {
    try {
      const rst = await pool.query(`SELECT * from users WHERE id = '${userId}'`);
      if (rst.rowCount == 0 && data.pictureUrl != null)
        await pool.query(
          `INSERT INTO users (id, name, pic_url) values ('${userId}', '${data.displayName}', '${data.pictureUrl}')`
        );
      else if (rst.rowCount == 0)
        await pool.query(`INSERT INTO users (id, name) values ('${userId}', '${data.displayName}')`);
    } catch (err) {
      console.log(err);
    }
    try {
      const rst = await pool.query(`SELECT * from user_group_record WHERE uid = '${userId}' AND gid = '${groupId}'`);
      if (rst.rowCount == 0)
        await pool.query(`INSERT INTO user_group_record (gid, uid) values ('${groupId}', '${userId}')`);
    } catch (err) {
      console.log(err);
    }
    if (groupId === open_groupid) reply_texts.push(`${data.displayName} 已建立帳號`);
    else reply_texts.push(`${data.displayName} 已加入群組`);
  } catch (err) {
    console.log(err);
    if (groupId === open_groupid) reply_texts.push(`${data.displayName} 已建立帳號`);
    else reply_texts.push(`${data.displayName} 已加入群組`);
  } finally {
    send_push_msg(gen_push_datastring(groupId === open_groupid ? "U" + userId : "C" + groupId, reply_texts));
  }
};

router.post("/", async (req, res, next) => {
  try {
    res.send("HTTP POST request sent to the webhook URL!");
    console.log(`type: ${req.body.events[0].type}`);
    const replyToken = req.body.events[0].replyToken;
    const reply_texts = [];

    if (req.body.events[0].type === "message" && req.body.events[0].message.type === "text") {
      console.log(`text: ${req.body.events[0].message.text}`);
      const groupId =
        req.body.events[0].source.groupId != null ? req.body.events[0].source.groupId.slice(1) : open_groupid;

      if (req.body.events[0].message.text === "揪揪") {
        send_reply(
          JSON.stringify({
            replyToken: replyToken,
            messages: [menu_group(groupId)],
          })
        );
      } else if (req.body.events[0].message.text.startsWith("sjj setgroupname")) {
        const name = req.body.events[0].message.text.split(" ")[2].slice(1, -1);
        try {
          await pool.query(
            `UPDATE groups SET name = '${name}' WHERE id = '${req.body.events[0].source.groupId.slice(1)}'`
          );
          reply_texts.push(`已將群組名稱設置為 ${name}`);
        } catch (err) {
          console.log(err);
          reply_texts.push(`無法更新群組名`);
        } finally {
          send_reply(gen_reply_datastring(replyToken, reply_texts));
        }
      }
    } else if (req.body.events[0].type === "join" && req.body.events[0].source.type === "group") {
      get_group_info(req.body.events[0].source.groupId).then(async (data) => {
        try {
          await pool.query(
            `INSERT INTO groups (id, name, pic_url) values ('${data.groupId.slice(1)}', '${data.groupName}', '${
              data.pictureUrl
            }')`
          );
          reply_texts.push(`已建立群組`);
        } catch (err) {
          console.log(err);
          reply_texts.push(`已建立群組`);
        } finally {
          send_reply(gen_reply_datastring(replyToken, reply_texts));
        }
      });
    } else if (req.body.events[0].type === "postback") {
      if (req.body.events[0].postback.data.split("&")[0].split("=")[1] === "createuser") {
        const groupId = req.body.events[0].postback.data.split("&")[1].split("=")[1];
        const userId = req.body.events[0].source.userId.slice(1);
        if (groupId === open_groupid) {
          get_user_profile("U" + userId).then((data) => create_user(data, userId, groupId));
        } else {
          get_group_member("C" + groupId, "U" + userId).then((data) => create_user(data, userId, groupId));
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
