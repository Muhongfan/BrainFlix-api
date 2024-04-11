const express = require('express');
const router = express.Router();
const { v4: uuid } = require('uuid');
const fs = require('fs');

const VIDEO_DATA_FILE = './data/videos.json';
const VIDEO_DETAILS_DATA_FILE = './data/video-details.json';


const readVideos = () => {
    const videosData = JSON.parse(fs.readFileSync(VIDEO_DETAILS_DATA_FILE));
    return videosData;
  }
// GET /videos - Get all videos
router.get('/', (req, res) => {
    const videosData = readVideos();
    res.status(200).json(videosData);
});

// GET /videos/:id - Get video by ID
router.get('/:id', (req, res) => {
  const videoId = req.params.id;
  const videosData = readVideos();
  const currentVideos = videosData.find(video => video.id === videoId);

  if (!currentVideos) {
    return res.status(404).send('Videos not found');
  }
  res.status(200).json(currentVideos);

});

// POST /videos - Add a new video
router.post('/', (req, res) => {

  const videosData = readVideos();
  const videoImage = './public/images/Upload-video-preview.jpg'; // Corrected path

  const newVideoObj = {
    id: uuid(),
    title: req.body.title,
    description: req.body.description,
    image: videoImage,
  };

  videosData.unshift(newVideoObj);

  fs.writeFileSync(VIDEO_DATA_FILE, JSON.stringify(videosData));

  res.status(201).json(newVideoObj);
});



module.exports = router;