require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jobSeekersRoute = require("./routes/job_seekers.route");
const companiesRoute = require("./routes/companies.route");
const authRoute = require("./routes/auth.route");
const registerRoute = require("./routes/register.route");
const vacanciesRoute = require("./routes/vacancies.route");
const uploadFilesRoute = require("./routes/upload.route");
const verifyUsersRoute = require("./routes/verify.route");
const applicantsRoute = require("./routes/applicants.route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/job-seeker", jobSeekersRoute);
app.use("/api/company", companiesRoute);
app.use("/api/auth", authRoute);
app.use("/api/register", registerRoute);
app.use("/api/verify", verifyUsersRoute);
app.use("/api/vacancy", vacanciesRoute);
app.use("/api/applicant", applicantsRoute);
app.use("/api/upload", uploadFilesRoute);

let PORT = 3000;
let DB_HOST = "mongodb://127.0.0.1:27017/job-market-place";
if (process.env.STATUS === "PRODUCTION") {
  PORT = process.env.PORT;
  DB_HOST = process.env.ATLAS_DATABASE;
}

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
mongoose
  .connect(DB_HOST)
  .then((mdb) =>
    console.log(`Database connected on port ${mdb.connection.port}`)
  )
  .catch((reason) =>
    console.log(`\nError connecting to database: \n${reason}`)
  );
