const express = require("express");
const https = require("https");

const { pool } = require("../db");
const { menu } = require("../uti");

const TOKEN = process.env.LINE_TOKEN;
const headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer " + TOKEN,
};

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

const gen_datastring = (replyToken, texts) => {
  const msg = [];
  for (t in texts) msg.push({ type: "text", text: t });
  return JSON.stringify({
    replyToken: replyToken,
    messages: msg,
  });
};

const get_group_member = (groupId) => {
  const options = {
    hostname: "api.line.me",
    path: `/v2/bot/group/${groupId}/summary`,
    method: "GET",
    headers: headers,
  };
  const req = https.request(options, (res) => {
    res.on("data", (d) => {
      console.log(d);
      return d;
    });
    res.on("error", (err) => {
      console.log(err);
      return;
    });
  });
};

router.post("/", async (req, res, next) => {
  try {
    res.send("HTTP POST request sent to the webhook URL!");
    console.log(`type: ${req.body.events[0].type}`);
    const replyToken = req.body.events[0].replyToken;
    const reply_texts = [];

    if (req.body.events[0].type === "message" && req.body.events[0].message.type === "text") {
      console.log(`text: ${req.body.events[0].message.text}`);
      if (req.body.events[0].message.text == "揪揪") {
        const groupId = req.body.events[0].source.groupId != null ? req.body.events[0].source.groupId.slice(1) : "";
        send_reply(
          JSON.stringify({
            replyToken: replyToken,
            messages: [menu(groupId)],
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
          send_reply(gen_datastring(replyToken, reply_texts));
        }
      }
    } else if (req.body.events[0].type === "join" && req.body.events[0].source.type === "group") {
      const group_info = get_group_member(req.body.events[0].source.groupId);
      try {
        await pool.query(
          `INSERT INTO groups (id, name, pic_url) values ('${group_info.groupId.split(1)}', '${
            group_info.groupName
          }', '${group_info.pictureUrl}')`
        );
        reply_texts.push(`已建立群組`);
      } catch (err) {
        console.log(err);
        reply_texts.push(`已建立群組`);
      } finally {
        send_reply(gen_datastring(replyToken, reply_texts));
      }
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
