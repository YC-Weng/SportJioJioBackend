const express = require("express");
const https = require("https");

const { pool } = require("../db");
const { menu } = require("../uti");

const TOKEN = process.env.LINE_TOKEN;

const router = express.Router();

const send_reply = (dataString) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  };
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

router.post("/", async (req, res, next) => {
  try {
    res.send("HTTP POST request sent to the webhook URL!");
    const replyToken = req.body.events[0].replyToken;

    if (req.body.events[0].type === "message") {
      if (req.body.events[0].message.text == "揪揪") {
        const groupId =
          req.body.events[0].source.groupId != null
            ? req.body.events[0].source.groupId.slice(1)
            : req.body.events[0].source.utouId.slice(1);
        const dataString = JSON.stringify({
          replyToken: replyToken,
          messages: [menu(groupId)],
        });
        send_reply(dataString);
      } else if (
        req.body.events[0].message.text.startsWith("sjj setgroupname")
      ) {
        const name = req.body.events[0].message.text.split(" ")[2].slice(1, -1);
        try {
          await pool.query(
            `UPDATE groups SET name = '${name}' WHERE id = '${req.body.events[0].source.groupId.slice(
              1
            )}'`
          );
          dataString = JSON.stringify({
            replyToken: replyToken,
            messages: [{ type: "text", text: `已將群組名稱設置為 ${name} ` }],
          });
        } catch (err) {
          console.log(err);
          dataString = JSON.stringify({
            replyToken: replyToken,
            messages: [{ type: "text", text: `無法更新群組名` }],
          });
        } finally {
          send_reply(dataString);
        }
      }
    } else if (
      req.body.events[0].type === "join" &&
      req.body.events[0].source.type === "group"
    ) {
      const groupId = req.body.events[0].source.groupId.slice(1);
      await pool.query(
        `INSERT INTO groups (id, name) values ('${groupId}', 'default')`
      );
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
