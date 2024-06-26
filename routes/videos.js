const SERVER_URL = process.env.SERVER_URL || 8089;

const express = require("express");
const router = express.Router();
const { v4: uuid } = require("uuid");
const fs = require("fs");
const multer = require("multer");
const path = require('path');


const VIDEO_DETAILS_DATA_FILE = "./data/video-details.json";
const uploadVideoPreview = "/images/Upload-video-preview.jpg";

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

  // Initialize multer instance with the storage options
const upload = multer({ storage: storage });



const readVideos = () => {
  const videosData = JSON.parse(fs.readFileSync(VIDEO_DETAILS_DATA_FILE));
  return videosData;
};
// GET /videos - Get all videos
router.get("/", (req, res) => {
  const videosData = readVideos();
  res.status(200).json(videosData);
});

// GET /videos/:id - Get video by ID
router.get("/:id", (req, res) => {
  const videoId = req.params.id;
  const videosData = readVideos();
  const currentVideo = videosData.find((video) => video.id === videoId);

  if (!currentVideo) {
    return res.status(404).json({ message: "Video not found" });
  }
  res.status(200).json(currentVideo);
});

// POST /videos - Add a new video
router.post("/", upload.single('thumbnail'),  (req, res) => {
  const videosData = readVideos();
  const thumbnail = req.file; // The uploaded image file
  let imgPath;

//   const videoImage = SERVER_URL + uploadVideoPreview;
if (!thumbnail) {
    imgPath = SERVER_URL + uploadVideoPreview;
    // return res.status(400).json({ error: 'Thumbnail is required' });
  }
  else{
    imgPath = SERVER_URL + thumbnail.path;
  }

  const newVideoObj = {
    id: uuid(),
    title: req.body.title,
    description: req.body.description,
    comments:"",
    image: imgPath, 
    timestamp: Date.now(),
  };

  videosData.push(newVideoObj);
  fs.writeFileSync(VIDEO_DETAILS_DATA_FILE, JSON.stringify(videosData));
  res.status(201).json(newVideoObj);
});

// POST /videos/:id/comments - Add a new comment
router.post("/:id/comments", (req, res) => {
  const videoId = req.params.id;
  const videosData = readVideos();
  const currentVideo = videosData.find((video) => video.id === videoId);
  if (!currentVideo) {
    return res.status(404).json({ message: "Video not found" });
  }
  const currentVideosComment = currentVideo.comments;

  const { name, comment } = req.body;
  const newComment = {
    id: uuid(),
    name,
    comment,
    likes: 0,
    timestamp: Date.now(),
  };

  if (currentVideosComment && currentVideosComment.length > 0) {
    currentVideosComment.unshift(newComment); 
  } else {
    currentVideo.comments = [newComment]; 
  }

  fs.writeFileSync(VIDEO_DETAILS_DATA_FILE, JSON.stringify(videosData));

  res.status(201).json(newComment);
});

// DELETE /videos/:id/comments/:commentId - Delete a new comment
router.delete("/:id/comments/:commentsId", (req, res) => {
  const videoId = req.params.id;
  const commentsId = req.params.commentsId;
  const videosData = readVideos();
  const currentVideo = videosData.find((video) => video.id === videoId);

  if (!currentVideo) {
    return res.status(404).json({ message: "Video not found" });
  }

  const currentVideosComment = currentVideo.comments;

  const updatedComments = currentVideosComment.filter(
    (comment) => comment.id !== commentsId
  );
  currentVideo.comments = updatedComments;

  fs.writeFileSync(VIDEO_DETAILS_DATA_FILE, JSON.stringify(videosData));

  res.status(200).json(updatedComments);
});

// PUT /videos/:videoId/comments/:commentId/like - Increment like count of a comment
router.put("/:videoId/comments/:commentId/likes", (req, res) => {
  const videoId = req.params.videoId;
  const commentId = req.params.commentId;

  const videosData = readVideos();
  const currentVideo = videosData.find((video) => video.id === videoId);

  if (!currentVideo) {
    return res.status(404).json({ message: "Video not found" });
  }

  const currentComment = currentVideo.comments.find(
    (comment) => comment.id === commentId
  );

  if (!currentComment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  const likes = currentComment.likes;
  currentComment.likes++;

  fs.writeFileSync(VIDEO_DETAILS_DATA_FILE, JSON.stringify(videosData));

  res.status(200).json(currentComment);
});

module.exports = router;
