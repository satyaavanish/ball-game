console.log("Starting server...");
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/highscores');


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Score Schema & Model
const scoreSchema = new mongoose.Schema({
  player: { type: String, required: true, unique: true },
  highScore: { type: Number, default: 0 },
});

const Score = mongoose.model('Score', scoreSchema);

// API to get a player's high score
app.get('/score/:player', async (req, res) => {
  try {
    const playerName = req.params.player;
    const score = await Score.findOne({ player: playerName });

    if (score) {
      res.json({ player: playerName, highScore: score.highScore });
    } else {
      res.json({ player: playerName, highScore: 0 });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API to save/update player's high score
app.post('/score', async (req, res) => {
  try {
    const { player, score } = req.body;

    if (!player || score === undefined) {
      return res.status(400).json({ error: 'Player name and score required' });
    }

    const existingScore = await Score.findOne({ player });

    if (!existingScore) {
      const newScore = new Score({ player, highScore: score });
      await newScore.save();
    } else if (score > existingScore.highScore) {
      existingScore.highScore = score;
      await existingScore.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
