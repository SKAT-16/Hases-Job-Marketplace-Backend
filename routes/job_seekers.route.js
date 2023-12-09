const express = require('express');
const router = express.Router();
const authorization = require('../middleware/authorization');

router.get('/', authorization, (req, res) => {
  res.send("Test Job Seekers Route");
});

module.exports = router;