const axios = require('axios');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { Dropbox } = require('dropbox');

const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });
const router = express.Router();

router.post('/', upload.single('file'), (req, res) => {
  const fileType = req.query.fileType;
  const accountType = req.query.accountType;
  
  if (!req.body.file) {
    console.log(req.file);
    res.status(400).send('No file uploaded.');
    return;
  }

  let dbx = new Dropbox({
    clientId: process.env.DROPBOX_APP_KEY,
    clientSecret: process.env.DROPBOX_APP_SECRET,
    refreshToken: process.env.DROPBOX_REFRESH_TOKEN
  });

  const fileName = req.body.file.originalname;
  const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
  const fileData = fs.readFileSync(req.body.file.path);

  const uploadOptions = {
    path: `/${accountType}-data/${fileType}/${req.body.user_id}.${fileExtension}`,
    contents: fileData,
    mode: 'overwrite' // Overwrite existing file with the same name
  };

  dbx.filesUpload(uploadOptions)
    .then((response) => {
      const fileMetadata = response.result;

      dbx.sharingListSharedLinks({ path: fileMetadata.path_display })
        .then((listResponse) => {
          const sharedLinks = listResponse.result.links;
          if (sharedLinks.length > 0) {
            const sharedLink = sharedLinks[0].url;
            // Delete the file from the 'uploads/' folder
            fs.unlinkSync(req.body.file.path);
            res.send({ fileLink: sharedLink });
          } else {
            dbx.sharingCreateSharedLinkWithSettings({ path: fileMetadata.path_display })
              .then((linkResponse) => {
                const sharedLink = linkResponse.result.url;
                // Delete the file from the 'uploads/' folder
                fs.unlinkSync(req.body.file.path);
                res.send({ fileLink: sharedLink });
              })
              .catch((error) => {
                console.error('Error generating shared link:', error);
                return res.status(500).send('Error generating shared link.');
              });
          }
        })
        .catch((error) => {
          console.error('Error retrieving shared link:', error);
          return res.status(500).send('Error retrieving shared link.');
        });
    })
    .catch((error) => {
      console.error('Error uploading file to Dropbox:', error);
      return res.status(500).send('Error uploading file to Dropbox.');
    });
});

module.exports = router;