const express = require("express");
const createError = require("http-errors");
const path = require("path");
const http = require("http");
const https = require("https");
const fs = require("fs");
const cors = require("cors");

const postsRouter = require("./routers/posts");
const usersRouter = require("./routers/users");
const groupsRouter = require("./routers/groups");

var privateKey = fs.readFileSync("sslcert/sportjiojio.key", "utf8");
var certificate = fs.readFileSync("sslcert/sportjiojio_site.crt", "utf8");
const TOKEN =
  "7zt2lErH/nyFGDOH7nINASCLFu1bvtdWKhSpl/eqCwRmRER0BxU5+S5acla5TVSfenjhPfShrECO1aFp/OL77OXDeXQk+qDCMA/T7x/tnfeqZyoewjj75CfKTWow8MzBsfMzUW5xSMeDiR7DRc896QdB04t89/1O/w1cDnyilFU=";

const credentials = { key: privateKey, cert: certificate };

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use((req, res, next) => {
  console.log("Time: ", Date.now());
  console.log(`${req.method} ${req.url} ${req.ip}`);
  console.log(`Body: `);
  for (let key in req.body) {
    console.log(`\t${key}: ${req.body[key]}`);
  }
  console.log(`\n`);
  next();
});

app.use("/posts", postsRouter);
app.use("/users", usersRouter);
app.use("/groups", groupsRouter);

app.get("/default_profile", (req, res, next) => {
  res.sendFile(__dirname + "/default_profile.png");
});

app.post("/webhook", function (req, res) {
  res.send("HTTP POST request sent to the webhook URL!");
  // If the user sends a message to your bot, send a reply message
  if (req.body.events[0].type === "message") {
    // You must stringify reply token and message data to send to the API server
    const dataString = JSON.stringify({
      // Define reply token
      replyToken: req.body.events[0].replyToken,
      // Define reply messages
      messages: [
        {
          type: "text",
          text: "Hello, user",
        },
        {
          type: "text",
          text: "May I help you?",
        },
      ],
    });

    // Request header. See Messaging API reference for specification
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

    // Define our request
    const request = https.request(webhookOptions, (res) => {
      res.on("data", (d) => {
        process.stdout.write(d);
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
});

app.get("/", (req, res) => {
  res.send("Welcome to SportJioJio Backend!!");
});

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

// httpServer.listen(3001, () =>
//   console.log("HTTP Backend server is listening on port 3001")
// );
httpsServer.listen(3000, () =>
  console.log("HTTPS Backend server is listening on port 3000")
);
