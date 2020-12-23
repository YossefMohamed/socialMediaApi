const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
var cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const User = require("./model/userModel");
const app = express();

// app.use("view engine", "ejs");
// app.set(stat)
console.log(path.join(__dirname, "views"));
app.use(express.static("public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

const dataBase = mongoose
  .connect("mongodb://localhost/social", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((e) => console.log("Connected !!"));

app.get("/", async (req, res) => {
  const user = await User.find();
  // console.log(user);
  res.render("home", {
    name: "yossef",
    data: 1,
    user,
  });
});
app.use(require("./routes/userRoutes"));
app.use(require("./routes/postRoutes"));

app.all("*", (req, res, next, err) => {
  console.log(req, res, next, err);
  res.json(req);
});
app.listen(3000);
