require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const cors = require('cors');
const videoRouter = require('./routes/videos');
const PORT = process.env.PORT || 8089; // Change the port number to 3000 or any other available port
const CLIENT_URL = process.env.CLIENT_URL;

app.use(express.static('public'));
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.use('/videos', videoRouter);
app.use('/public', express.static(path.join(__dirname, 'public')));


app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
  });