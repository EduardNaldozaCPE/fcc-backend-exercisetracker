const mongoose = require('mongoose');
const { exerciseSchema, userSchema, logSchema } = require('./Schemas.js');

const Exercise = mongoose.model("exercises", exerciseSchema);
const User = mongoose.model("users", userSchema);
const Log = mongoose.model("logs", logSchema);

module.exports = { User, Exercise, Log };