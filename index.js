const path = require("path");
const cors = require("cors");
const express = require("express");
const app = express(); // create express app
app.use(cors());

const bodyParser = require("body-parser");
app.use(bodyParser.json());

// add middlewares
const root = require("path").join(__dirname, "assets/plode_build");
app.use(express.static(root));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "assets/micropython_build")));
app.use(express.static(path.join(__dirname, "assets/scratch_build")));
app.use(express.static(path.join(__dirname, "assets/plode_build")));
//app.use(express.static(path.join(__dirname, "build")))

app.get("/micropython", (req, res) => {
  res.sendFile(path.join(__dirname, "assets/micropython_build", "index.html"));
});
app.get("/scratch", (req, res) => {
  res.sendFile(path.join(__dirname, "assets/scratch_build", "index.html"));
});
app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, "assets/plode_build", "index.html"));
});
// start express server on port 5000
app.listen(process.env.PORT || 3123, () => {
  console.log("server started at 3123");
});
