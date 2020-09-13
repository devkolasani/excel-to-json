// Dependencies
// -> OS File Handling Dependencies
const path = require("path");
const os = require("os");
const fs = require("fs");
// -> App Dependencies
const cors = require("cors");
const XLSX = require("xlsx");
const Busboy = require("busboy");
const express = require("express");

//  Express Setup
//  -> Express App Initialization
var app = express();
//  -> Express CORS Middleware
app.use(cors());

//  Express Routes
//  -> GET Route
app.get("/E2J", function (req, res) {
  res.json({ message: "get call succeed!" });
});
//  -> POST Route
app.post("/E2J", function (req, res) {
  // --> BusBoy Object
  const busboy = new Busboy({ headers: req.headers });
  // --> OS Temp Dir path
  const tmpdir = os.tmpdir();
  // --> Object to store uploads
  const uploads = {};
  // --> Store File Upload Promises
  const fileWrites = [];
  // --> This code will process each file uploaded.
  busboy.on("file", (fieldname, file, filename) => {
    const filepath = path.join(tmpdir, filename);
    uploads[fieldname] = filepath;
    // ----> Pipes File to Write Stream
    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);
    //  ----> Generates a promise for each file uploaded
    const promise = new Promise((resolve, reject) => {
      file.on("end", () => {
        writeStream.end();
      });
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });
    fileWrites.push(promise);
  });

  // --> Triggered once all uploaded files are processed by Busboy
  busboy.on("finish", async () => {
    await Promise.all(fileWrites);

    // ----> XLSX Parsing Logic
    var filepath = uploads["source"];
    let workbook = XLSX.readFile(filepath);
    let output = {};
    workbook.SheetNames.forEach((name) => {
      output[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name], {
        blankRows: false,
        defval: "",
      });
    });
    // ----> send response
    res.send({
      status: true,
      message: "File is uploaded",
      data: output,
    });
  });

  busboy.end(req.rawBody);
});

// Module Export
module.exports = { app };
