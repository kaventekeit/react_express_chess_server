const express = require('express');
const router = express.Router();

const secret = require('./secrets');
const jwt = require('jsonwebtoken');

const { validate_token } = require('./auth_middleware');
const Game = require('../game/game_model');
const Players = require('./players_model');

function generate_token(player) {
  const payload = {
                    id: player.id,
                  };
  const options = {
                    expiresIn: '1d',
                  };
  return jwt.sign(payload, secret, options);
}

router.get('/', validate_token, (req, res) => {
  Players.get_all()
    .then(result => {
      res.status(200).json(result);
      return;
    })
    .catch(err => {
      console.error(err);
    })
});

router.post('/', async (req, res) => {

  const result = await Players.get_all();
 
  if (result.length > 1) {
    res.status(422).json({ message: 'Sorry, 2 players are already playing' });
    return;
  } else if (result.length > 0) {
    req.body.id = 2;
    req.body.active = 0;

		console.log(result);
  } else {
    req.body.id = 1;
    req.body.active = 1;
  }

  req.body.queening = 0;
  req.body.castle_possible_kingside = 1;
  req.body.castle_possible_queenside = 1;
  req.body.won = 0;
  await Players.add(req.body);
        
  const token = generate_token(req.body);
  console.log('generated token:',token);

  res.status(201).json({ message: 'Welcome to the game! Here is your token:',
                                  token });                                       
  
});

module.exports = router;
