const mongoose = require("mongoose");

const jobCategorySchema = new mongoose.Schema({
  category: String,
  skills: [String]
});


const JobCategory = mongoose.model('JobCategory', jobCategorySchema);
module.exports = JobCategory;