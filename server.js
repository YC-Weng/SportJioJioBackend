const express = require("express");
const createError = require("http-errors");
const path = require("path");

const postsRouter = require("./routers/posts");
const usersRouter = require("./routers/users");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use((req, res, next) => {
  console.log("Time: ", Date.now());
  console.log(`${req.method} ${req.url} ${req.ip}`);
  next();
});

app.use("/posts", postsRouter);
app.use("/users", usersRouter);

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

app.listen(3000, () => console.log("Example app is listening on port 3000."));
