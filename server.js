const express = require("express");
const createError = require("http-errors");
const path = require("path");
const http = require("http");
const https = require("https");
const fs = require("fs");
const linebot = require("linebot");

const postsRouter = require("./routers/posts");
const usersRouter = require("./routers/users");
const groupsRouter = require("./routers/groups");

var privateKey = fs.readFileSync("sslcert/sportjiojio.key", "utf8");
var certificate = fs.readFileSync("sslcert/sportjiojio_site.crt", "utf8");

const credentials = { key: privateKey, cert: certificate };

const app = express();
const bot = linebot({
  channelId: "2004077067",
  channelAccessToken:
    "7zt2lErH/nyFGDOH7nINASCLFu1bvtdWKhSpl/eqCwRmRER0BxU5+S5acla5TVSfenjhPfShrECO1aFp/OL77OXDeXQk+qDCMA/T7x/tnfeqZyoewjj75CfKTWow8MzBsfMzUW5xSMeDiR7DRc896QdB04t89/1O/w1cDnyilFU=",
  channelSecret: "1b18be1ef9e541dfe7157e71ab3ba78b",
});

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

bot.on("message", function (event) {
  // event.message.text是使用者傳給bot的訊息
  // 準備要回傳的內容
  var replyMsg = `Hello你剛才說的是:${event.message.text}`;
  // 透過event.reply(要回傳的訊息)方法將訊息回傳給使用者
  event
    .reply(replyMsg)
    .then(function (data) {
      // 當訊息成功回傳後的處理
    })
    .catch(function (error) {
      // 當訊息回傳失敗後的處理
    });
});

// var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

// httpServer.listen(3001, () =>
//   console.log("HTTP Backend server is listening on port 3001")
// );
httpsServer.listen(3000, () =>
  console.log("HTTPS Backend server is listening on port 3000")
);

bot.listen("/linecallback", 3001, () => {
  console.log("line bot is listening on port 3001");
});
