"use strict";

const fs        = require("fs");
const path      = require("path");
const Mongoose  = require('mongoose');
const env       = process.env.NODE_ENV || "development";
const config    = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
let mongoose;
let db = {};

if (process.env.DATABASE_URL) {
    Mongoose.connect(process.env.DATABASE_URL);
    mongoose = Mongoose.connection;
} else {
    Mongoose.connect(config.dbUrl);
    mongoose = Mongoose.connection;
}

mongoose.on('error', err => {
    console.log('Database connection error: ', err);
})

fs.readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js" && file != "SessionObjects");
  })
  .forEach(function(file) {
    let model = require(path.join(__dirname, file));

    db[model.modelName] = model;
  });

db.mongoose = mongoose;
db.Mongoose = Mongoose;

module.exports = db;
