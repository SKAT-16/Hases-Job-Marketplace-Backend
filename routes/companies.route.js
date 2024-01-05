const axios = require("axios");
const mongoose = require("mongoose");
const authorization = require("../middleware/authorization");
const express = require("express");
const multer = require("multer");

const { User } = require("../models/user.model");
const {
  Company,
  checkCompanyProfileCompletion,
  validateCompanyProfile,
} = require("../models/company.model");
const JobCategory = require("../models/job_category.model");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router
  .post(
    "/new-profile",
    [authorization, upload.single("file")],
    async (req, res) => {
      const { error } = validateCompanyProfile(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      try {
        if (req.file) {
          let uploadUrl =
            process.env.STATUS === "PRODUCTION"
              ? "https://hases-backend.onrender.com/api"
              : "http://localhost:3000/api";
          let response = await axios.post(
            uploadUrl + "/upload?fileType=image&accountType=company",
            { file: req.file, user_id: req.user_id }
          );

          req.body.company_logo = response.data.fileLink + "&raw=1";
        }
      } catch (ex) {
        return res
          .status(400)
          .send("Error uploading profile image: " + ex.response);
      }

      req.user_id = new mongoose.Types.ObjectId(req.user_id);
      let user = await User.findById(req.user_id);
      if (!user) return res.status(400).send("User hasn't registered yet!");

      user = new Company(req.body);
      user.user_id = req.user_id;
      user.profile_completed = checkCompanyProfileCompletion(req.body);
      user = await user.save();

      res.send(`Company-${user._id} profile saved!`);
    }
  )
  .put(
    "/edit-profile",
    [authorization, upload.single("file")],
    async (req, res) => {
      const { error } = validateCompanyProfile(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      try {
        if (req.file) {
          let uploadUrl =
            process.env.STATUS === "PRODUCTION"
              ? "https://hases-backend.onrender.com/api"
              : "http://localhost:3000/api";
          let response = await axios.post(
            uploadUrl + "/upload?fileType=image&accountType=company",
            { file: req.file, user_id: req.user_id }
          );

          req.body.company_logo = response.data.fileLink + "&raw=1";
        }
      } catch (ex) {
        return res
          .status(400)
          .send("Error uploading profile image: " + ex.response);
      }

      req.user_id = new mongoose.Types.ObjectId(req.user_id);
      let user = await Company.findOne({ user_id: req.user_id });
      if (!user) return res.status(400).send("User not logged in!");

      user.set(req.body);
      user.profile_completed = checkCompanyProfileCompletion(req.body);
      user.updated_at = new Date().toISOString();
      await user.save();

      res.send(`Company-${user._id} profile edited!`);
    }
  );

module.exports = router;
