const axios = require("axios");
const mongoose = require("mongoose");
const authorization = require("../middleware/authorization");
const express = require("express");
const multer = require("multer");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { User } = require("../models/user.model");
const {
  JobSeeker,
  checkJobSeekerProfileCompletion,
  validateJobSeekerProfile,
} = require("../models/job_seeker.model");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router
  .get("/me", authorization, async (req, res) => {
    const jobSeeker = await JobSeeker.findOne({ user_id: req.user_id });
    if (!jobSeeker) return res.status(404).send("Job Seeker not found");
    
    res.send(jobSeeker);
  })
  .post(
    "/new-profile",
    [authorization, upload.array("files", 2)],
    async (req, res) => {
      req.body.education = JSON.parse(req.body.education);
      req.body.experience = JSON.parse(req.body.experience);
      req.body.job_set = JSON.parse(req.body.job_set);
      req.body.skill_set = JSON.parse(req.body.skill_set);

      const { error } = validateJobSeekerProfile(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      if (req.files && req.files.length > 0) {
        let uploadUrl =
          process.env.STATUS === "PRODUCTION"
            ? "https://hases-backend.onrender.com/api"
            : "http://localhost:3000/api";

        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          if (file) {
            if (file.mimetype.startsWith("image/")) {
              try {
                const response = await axios.post(
                  uploadUrl + "/upload?fileType=image&accountType=job-seeker",
                  { file: file, user_id: req.user_id }
                );
                req.body.user_image = response.data.fileLink + "&raw=1";
              } catch (ex) {
                return res
                  .status(400)
                  .send("Error uploading profile image: " + ex.response);
              }
            } else if (
              file.mimetype === "application/pdf" ||
              file.mimetype === "application/msword" ||
              file.mimetype ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ) {
              try {
                const response = await axios.post(
                  uploadUrl + "/upload?fileType=resume&accountType=job-seeker",
                  { file: file, user_id: req.user_id }
                );
                req.body.resume = response.data.fileLink.replace(
                  "dl=0",
                  "dl=1"
                );
              } catch (ex) {
                return res
                  .status(400)
                  .send("Error uploading resume: " + ex.response);
              }
            } else {
              return res
                .status(400)
                .send("Unsupported file type: " + file.mimetype);
            }
          }
        }
      }

      req.user_id = new mongoose.Types.ObjectId(req.user_id);
      let user = await User.findById(req.user_id);
      if (!user) return res.status(400).send("User hasn't registered yet!");

      user = new JobSeeker(req.body);
      user.user_id = req.user_id;
      user.profile_completed = checkJobSeekerProfileCompletion(req.body);
      await user.save();

      res.send(`JobSeeker-${user._id} profile saved!`);
    }
  )
  .put(
    "/edit-profile",
    [authorization, upload.array("files", 2)],
    async (req, res) => {
      req.body.education = JSON.parse(req.body.education);
      req.body.experience = JSON.parse(req.body.experience);
      req.body.job_set = JSON.parse(req.body.job_set);
      req.body.skill_set = JSON.parse(req.body.skill_set);

      const { error } = validateJobSeekerProfile(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      if (req.files && req.files.length > 0) {
        let uploadUrl =
          process.env.STATUS === "PRODUCTION"
            ? "https://hases-backend.onrender.com/api"
            : "http://localhost:3000/api";

        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          if (file) {
            if (file.mimetype.startsWith("image/")) {
              try {
                const response = await axios.post(
                  uploadUrl + "/upload?fileType=image&accountType=job-seeker",
                  { file: file, user_id: req.user_id }
                );
                req.body.user_image = response.data.fileLink + "&raw=1";
              } catch (ex) {
                return res
                  .status(400)
                  .send("Error uploading profile image: " + ex.response);
              }
            } else if (
              file.mimetype === "application/pdf" ||
              file.mimetype === "application/msword" ||
              file.mimetype ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ) {
              try {
                const response = await axios.post(
                  uploadUrl + "/upload?fileType=resume&accountType=job-seeker",
                  { file: file, user_id: req.user_id }
                );
                req.body.resume = response.data.fileLink.replace(
                  "dl=0",
                  "dl=1"
                );
              } catch (ex) {
                return res
                  .status(400)
                  .send("Error uploading resume: " + ex.response);
              }
            } else {
              return res
                .status(400)
                .send("Unsupported file type: " + file.mimetype);
            }
          }
        }
      }

      req.user_id = new mongoose.Types.ObjectId(req.user_id);
      let user = await JobSeeker.findOne({ user_id: req.user_id });
      if (!user) return res.status(400).send("User not logged in!");

      user.set(req.body);
      user.profile_completed = checkJobSeekerProfileCompletion(req.body);
      user.updated_at = new Date().toISOString();
      await user.save();

      res.send(`JobSeeker-${user._id} profile edited!`);
    }
  );

module.exports = router;
