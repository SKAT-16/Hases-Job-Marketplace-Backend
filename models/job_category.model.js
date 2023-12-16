const mongoose = require("mongoose");

const jobCategorySchema = new mongoose.Schema({
  category: String,
  jobs: [String],
  tags: [mongoose.Schema.Types.ObjectId]
});


const JobCategory = mongoose.model('JobCategory', jobCategorySchema);
module.exports = JobCategory;