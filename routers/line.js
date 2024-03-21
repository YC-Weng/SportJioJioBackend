const express = require("express");
const https = require("https");

const { pool } = require("../db");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    res.send("HTTP POST request sent to the webhook URL!");
    if (req.body.events[0].type === "message") {
      const replyToken = req.body.events[0].replyToken;
      console.log(`type: ${req.body.events[0].type} 
        uid: ${req.body.events[0].userId}
        gid: ${req.body.events[0].groupId}`);

      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN,
      };

      const dataString = JSON.stringify({
        replyToken: replyToken,
        messages: [
          {
            type: "text",
            text: "Hello, user",
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

      // Define our request
      const request = https.request(webhookOptions, (res) => {
        res.on("data", (d) => {
          console.log(d);
        });
      });

      // Handle error
      // request.on() is a function that is called back if an error occurs
      // while sending a request to the API server.
      request.on("error", (err) => {
        console.error(err);
      });

      // Finally send the request and the data we defined
      request.write(dataString);
      request.end();
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
