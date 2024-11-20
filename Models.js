const mongoose = require('mongoose');
const { exerciseSchema, userSchema } = require('./Schemas.js');

const Exercise = mongoose.model("exercises", exerciseSchema);
const User = mongoose.model("users", userSchema);

module.exports = { User, Exercise };