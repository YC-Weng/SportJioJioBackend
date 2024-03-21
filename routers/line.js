const express = require("express");
const https = require("https");

const { pool } = require("../db");

const TOKEN = process.env.LINE_TOKEN;

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    res.send("HTTP POST request sent to the webhook URL!");
    if (req.body.events[0].type === "message") {
      const replyToken = req.body.events[0].replyToken;
      console.log(`type: ${req.body.events[0].type} 
      uid: ${req.body.events[0].source.userId}
      gid: ${req.body.events[0].source.groupId}`);

      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN,
      };

      const dataString = JSON.stringify({
        replyToken: replyToken,
        messages: [
          {
            type: "template",
            altText: "This is a buttons template",
            template: {
              type: "buttons",
              thumbnailImageUrl: "https://example.com/bot/images/image.jpg",
              imageAspectRatio: "rectangle",
              imageSize: "cover",
              imageBackgroundColor: "#FFFFFF",
              title: "Menu",
              text: "Please select",
              defaultAction: {
                type: "uri",
                label: "View detail",
                uri: "http://example.com/page/123",
              },
              actions: [
                {
                  type: "postback",
                  label: "Buy",
                  data: "action=buy&itemid=123",
                },
                {
                  type: "postback",
                  label: "Add to cart",
                  data: "action=add&itemid=123",
                },
                {
                  type: "uri",
                  label: "View detail",
                  uri: "http://example.com/page/123",
                },
              ],
            },
          },
        ],
      });

      const webhookOptions = {
        hostname: "api.line.me",
        path: "/v2/bot/message/reply",
        method: "POST",
        headers: headers,
        body: dataString,
      };

      const request = https.request(webhookOptions, (res) => {
        res.on("data", (d) => {
          process.stdout.write(d);
        });
      });

      request.on("error", (err) => {
        console.error(err);
      });

      request.write(dataString);
      request.end();
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
