
const mongoose = require('mongoose');
const exerciseSchema = new mongoose.Schema({
    username: String,
    description: String,
    duration: Number,
    date: String,
});
  
const userSchema = new mongoose.Schema({
    username: String
});
  
const logSchema = new mongoose.Schema({
    username: String,
    count: Number,
    log: []
});

module.exports = { exerciseSchema, userSchema, logSchema };