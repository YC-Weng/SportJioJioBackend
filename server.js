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

const credentials = { key: privateKey, cert: certificate };

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("Time: ", Date.now());
  console.log(`${req.method} ${req.url} ${req.ip} 
    body: ${req.body}`);
  next();
});

app.use("/posts", postsRouter);
app.use("/users", usersRouter);
app.use("/groups", groupsRouter);

app.get("/default_profile", (req, res, next) => {
  res.sendFile("./default_profile.png");
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
