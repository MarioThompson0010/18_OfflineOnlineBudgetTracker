const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");
const mongojs = require("mongojs");
const PORT = process.env.MONGODB_URI || 3000;

const db = require("./models/transaction");
const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/budget", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

var routes = require("./routes/api.js");
// rebuild for deployg
app.use(routes);

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});