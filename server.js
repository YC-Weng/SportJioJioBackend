const express = require("express");
const createError = require("http-errors");
const path = require("path");
const http = require("http");
const https = require("https");
const fs = require("fs");
const line = require("@line/bot-sdk");

const postsRouter = require("./routers/posts");
const usersRouter = require("./routers/users");
const groupsRouter = require("./routers/groups");

var privateKey = fs.readFileSync("sslcert/sportjiojio.key", "utf8");
var certificate = fs.readFileSync("sslcert/sportjiojio_site.crt", "utf8");

const credentials = { key: privateKey, cert: certificate };
const line_config = {
  channelAccessToken:
    "7zt2lErH/nyFGDOH7nINASCLFu1bvtdWKhSpl/eqCwRmRER0BxU5+S5acla5TVSfenjhPfShrECO1aFp/OL77OXDeXQk+qDCMA/T7x/tnfeqZyoewjj75CfKTWow8MzBsfMzUW5xSMeDiR7DRc896QdB04t89/1O/w1cDnyilFU=",
  channelSecret: "1b18be1ef9e541dfe7157e71ab3ba78b",
};

const app = express();
const line_client = new line.messagingApi.MessagingApiClient(line_config);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(express.json());

app.use((req, res, next) => {
  console.log("Time: ", Date.now());
  console.log(`${req.method} ${req.url} ${req.ip}`);
  next();
});

app.use("/posts", postsRouter);
app.use("/users", usersRouter);
app.use("/groups", groupsRouter);

app.post("linecallback", line.middleware(line_config), (req, res, next) => {
  console.log(req.body);
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => {
      console.log(result);
      res.json(result);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  const echo = {
    replyToken: event.replyToken,
    messages: [{ type: "text", text: event.message.text }],
  };

  // use reply API
  return client.replyMessage(echo);
}

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

// app.listen(3000, () => console.log("Example app is listening on port 3000."));
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(3001, () =>
  console.log("HTTP Backend server is listening on port 3001")
);
httpsServer.listen(3000, () =>
  console.log("HTTPS Backend server is listening on port 3000")
);
