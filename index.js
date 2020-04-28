const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const AdminRoute = require("./routes/admin-route");
const FileRoute = require("./routes/file-route");

const index = express();

const MONGODB_URI =
  "mongodb+srv://Chyngyz:Chyngyz@cluster0-fcshv.mongodb.net/test?retryWrites=true&w=majority";
const LOCAL_URL = "mongodb://localhost:27017/turnover";

index.use(bodyParser.urlencoded({ extended: true }));
index.use(bodyParser.json());

function setupCORS(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.get("Origin") || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Expose-Headers", "Content-Length");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Authorization, Content-Type, X-Requested-With, Range"
  );
  if (req.method === "OPTIONS") {
    return res.send(200);
  } else {
    return next();
  }
}
index.use(setupCORS);

index.use(fileUpload());
index.use("/uploads", express.static(__dirname + "/uploads"));

index.use("/user", AdminRoute);
index.use("/file", FileRoute);

const start = async () => {
  const PORT = process.env.PORT || 5000;
  try {
    await mongoose.connect(MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      dbName: "turnover",
    });
    index.listen(PORT, () => console.log(`We started on ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
