const mongoose = require("mongoose");

const jobCategorySchema = new mongoose.Schema({
  category_name: String,
  required_skills: [String]
});


const JobCategory = mongoose.model('JobCategory', jobCategorySchema);
module.exports = JobCategory;