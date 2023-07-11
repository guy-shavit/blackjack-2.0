function newDeck() {
    let deck = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'a'];
    for (let suit of suits) {
      for (let value of values) {
        deck.push({ suit, value });
      }
    }
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }
  
  let deck = newDeck();
  
  function calculateScore(cards) {
    let score = 0;
    let aces = 0;
    for (let card of cards) {
      if (card.value === 'a') {
        aces++;
        score += 11;
      } else if (card.value === 'k' || card.value === 'q' || card.value === 'j') {
        score += 10;
      } else {
        score += parseInt(card.value);
      }
    }
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    return score;
  }
  
  module.exports = { deck, calculateScore, newDeck };
  