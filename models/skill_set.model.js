const mongoose = require("mongoose");

const skillSetSchema = new mongoose.Schema({
  skill_name: String,
});

const SkillSet = mongoose.model('SkillSet', skillSetSchema);
module.exports = SkillSet;