const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");
const mongojs = require("mongojs");
const PORT = 3000;

const db = require("./models/transaction");
const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

//const databaseUrl = process.env.MONGODB_URI || "budget";
//const collections = ["transactions"];



mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/budget", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

// const db = mongojs(databaseUrl, collections);

var routes = require("./routes/api.js");

app.use(routes);

// app.use(require("./routes/api.js"));

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname + "./public/index.html"));
// });

// app.get("/api/transaction", (req, res) => {
//   db.Transation.find({}, (error, found) => {
//     if (error) {
//       console.log(error);
//     } else {
//       res.json(found);
//     }
//   });
// });

// app.post("/api/transaction", function(req, res) {

//   console.log(body);

//   db.Transation.insert(req.body, (error, saved) => {
//     if (error) {
//       console.log(error);
//     } else {
//       res.send(saved);
//     }
//   });

  // db.Transaction.create(req.body)
  //     .then(dbWorkout => {
  //         res.json(dbWorkout);
  //     }).catch(err => {
  //         res.json(err);
  //     });

  // db.Transaction.updateOne(
  //   { _id: req.params.id },
  //   { rating: req.body.rating }
  // ).then(function(dbImage) {
  //   res.json(dbImage);
  // });
//});

// routes

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});