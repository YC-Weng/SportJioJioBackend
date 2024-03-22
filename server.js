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
const lineRouter = require("./routers/line");

var privateKey = fs.readFileSync("sslcert/sjj_cat.key", "utf8");
var certificate = fs.readFileSync("sslcert/sjj_cat.crt", "utf8");
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
app.use("/linewebhook", lineRouter);

app.get("/default_profile", (req, res, next) => {
  res.sendFile(__dirname + "/default_profile.png");
});

app.get("/default_group_profile", (req, res, next) => {
  res.sendFile(__dirname + "/default_group_profile.png");
});

app.get("/sportjiojiologo", (req, res, next) => {
  res.sendFile(__dirname + "/sportjiojiologo.png");
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
httpsServer.listen(3000, () => console.log("HTTPS Backend server is listening on port 3000"));
