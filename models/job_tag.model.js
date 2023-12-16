const mongoose = require("mongoose");

const jobTagSchema = new mongoose.Schema({
  tag: String,
  skills: [String]
});


const JobTag = mongoose.model('JobTag', jobTagSchema);
module.exports = JobTag;