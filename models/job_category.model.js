const mongoose = require("mongoose");

const jobCategorySchema = new mongoose.Schema({
  job_category: String,
});


const JobCategory = mongoose.model('JobCategory', jobCategorySchema);
module.exports = JobCategory;