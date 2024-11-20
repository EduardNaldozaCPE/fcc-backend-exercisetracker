const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    username: String,
    description: String,
    duration: Number,
    date: Date,
});
  
const userSchema = new mongoose.Schema({
    username: String
});

module.exports = { exerciseSchema, userSchema };