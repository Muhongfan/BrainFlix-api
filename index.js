require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const videoRouter = require('./routes/videos');
const PORT = process.env.PORT || 8080;
const CLIENT_URL = process.env.CLIENT_URL;

app.use(express.static('public'));
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.use('/videos', videoRouter);

app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
  });