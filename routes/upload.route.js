const authorization = require('../middleware/authorization');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { Dropbox } = require('dropbox');

const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });
const router = express.Router();

const accessToken = process.env.DROPBOX_ACCESS_TOKEN; // Replace with your own access token
const dropbox = new Dropbox({ accessToken });

router.post('/', upload.single('file'), (req, res) => {
  const fileType = req.params.file;
  const accountType = req.params.account;
  if (!req.file) {
    console.log(req.file);
    res.status(400).send('No file uploaded.');
    return;
  }

  const fileName = req.file.originalname;
  const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
  const fileData = fs.readFileSync(req.file.path);
  
  const uploadOptions = {
    path: `/hases-${accountType}-data/${fileType}/${req.body.user_id}.${fileExtension}`,
    contents: fileData,
    mode: 'overwrite' // Overwrite existing file with the same name
  };

  dropbox.filesUpload(uploadOptions)
    .then((response) => {
      const fileMetadata = response.result;

      dropbox.sharingCreateSharedLinkWithSettings({ path: fileMetadata.path_display })
        .then((linkResponse) => {
          const sharedLink = linkResponse.result.url;

          fs.unlinkSync(req.file.path); // Delete the temporary file

          res.send({ fileLink: sharedLink });
        })
        .catch((error) => {
          console.error('Error generating shared link:', error);
          res.status(500).send('Error generating shared link.');
        });
    })
    .catch((error) => {
      console.error('Error uploading file to Dropbox:', error);
      res.status(500).send('Error uploading file to Dropbox.');
    });
});

module.exports = router;
