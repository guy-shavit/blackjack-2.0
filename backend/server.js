const express = require('express');
const cors = require('cors');
const game = require('./game');
const app = express();
app.use(cors());
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Hello from Blackjack game server!');
});

app.get('/deal', (req, res) => {
  if (game.deck.length < 4) {
    res.status(400).send('Not enough cards in the deck.');
    return;
  }
  const playerCards = [game.deck.pop(), game.deck.pop()];
  const dealerCards = [
    game.deck.pop(),
    { suit: 'unknown', value: 'unknown' },
  ];
  game.dealerHiddenCard = game.deck.pop();
  res.send({ playerCards, dealerCards });
});


app.get('/hit', (req, res) => {
  if (game.deck.length < 1) {
    res.status(400).send('No cards left in the deck.');
    return;
  }
  const card = game.deck.pop();
  res.send(card);
});

app.get('/stand', (req, res) => {
  if (!game.dealerHiddenCard) {
    res.status(400).send('Invalid game state.');
    return;
  }

  const dealerCards = [game.dealerHiddenCard];
  let score = game.calculateScore(dealerCards);
  while (score <= 16 && game.deck.length > 0) {
    const card = game.deck.pop();
    dealerCards.push(card);
    score = game.calculateScore(dealerCards);
  }

  game.dealerHiddenCard = null;
  res.send(dealerCards);
});


app.get('/shuffle', (req, res) => {
  game.deck = game.newDeck();
  res.send('New deck has been shuffled.');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});