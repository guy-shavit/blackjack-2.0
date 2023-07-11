import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [gameStatus, setGameStatus] = useState("");  
  const [isGameActive, setIsGameActive] = useState(false);
  const [betAmount, setBetAmount] = useState(10); //  bet amount
  const [wallet, setWallet] = useState(100); //  wallet amount


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

  function endGame(message) {
    setIsGameActive(false);
    setGameStatus(message);
  }  

  async function hit() {
    if (!isGameActive) {
      return;
    }
    try {
      const res = await axios.get('http://localhost:3001/hit');
      console.log('Server response:', res.data); 
      if (res.data && typeof res.data === 'object') {
        setPlayerCards(prevCards => {
          const newCards = [...prevCards, res.data];
          const newScore = calculateScore(newCards);
          setPlayerScore(newScore);
          if (newScore > 21) {
            endGame("Player Busted! Dealer Wins!");
            setWallet(wallet - betAmount); // Double the bet amount on win
          }   
          
          return newCards;
        });
      } else {
        console.error('Invalid server response:', res.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function deal() {
    if (wallet < betAmount) {
      setGameStatus('Insufficient funds. Please adjust your bet amount.');
      return;
    }
    setIsGameActive(true);
    try {
      const res = await axios.get('http://localhost:3001/deal');
      if (res.data && typeof res.data === 'object') {
        const { playerCards, dealerCards } = res.data;
        setPlayerCards(playerCards);
        setPlayerScore(calculateScore(playerCards));
        setGameStatus("Game On! Good Luck!");
        setDealerCards(dealerCards);
        setDealerScore(calculateScore([dealerCards[0]])); 
      } else {
        console.error('Invalid server response:', res.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  async function handleStand() {
    setIsGameActive(false);
    try {
      const res = await axios.get('http://localhost:3001/stand');
      if (res.data && Array.isArray(res.data)) {
        setDealerCards(prevDealerCards => {
          const allDealerCards = [
            prevDealerCards[0],
            res.data[0],  
            ...res.data.slice(1), 
          ];
          const newDealerScore = calculateScore(allDealerCards);
          setDealerScore(newDealerScore);
          if (newDealerScore > 21) {
            endGame('Dealer Busted! Player Wins!');
            setWallet(wallet + betAmount * 2); // Double the bet amount on win
          } else if (newDealerScore >= playerScore) {
            endGame('Dealer Wins!');
          } else {
            endGame('Player Wins!');
            setWallet(wallet + betAmount); // Double the bet amount on win
          }
          return allDealerCards;
        });
        
      } else {
        console.error('Invalid server response:', res.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function shuffle() {
    try {
      await axios.get('http://localhost:3001/shuffle');
      setPlayerCards([]);
      setDealerCards([]);
      setPlayerScore(0);
      setDealerScore(0);
      setGameStatus("");
    } catch (error) {
      console.error('Error:', error);
    }
  }  

  function cardImage(card) {
    return `${card.value}_of_${card.suit}.png`;
  }

  function handleBetAmountChange(event) {
    const amount = parseInt(event.target.value);
    if (amount > 0 && amount <= wallet) {
      setBetAmount(amount);
    }
  }

  return (
    <div className="App">
      <h1>Blackjack</h1>
      <button onClick={shuffle}>Shuffle</button>
      <p className={`game-status ${gameStatus.includes("Wins") ? "win" : "lose"}`}>
           Game Status: {gameStatus}
      </p>
      <div>
      <button onClick={deal}>Deal</button>
      <button disabled={!isGameActive} onClick={hit}>Hit</button>
      <button disabled={!isGameActive} onClick={handleStand}>Stand</button>
      </div>
      <div classname="space">
      <div className="line">
        <h2>Player Cards</h2>
        {playerCards.map((card, i) => (
           <img key={i} className="card-img" src={`/cards/${cardImage(card)}`} alt={`${card.value} of ${card.suit}`} />
        ))}
        <h2>Player Score: {playerScore}</h2>
      </div>
      <div className="line">
        <h2>Dealer Cards</h2>
        {dealerCards.map((card, i) => (
          <img key={i} className="card-img" src={`/cards/${cardImage(card)}`} alt={`${card.value} of ${card.suit}`} />
        ))}
        <h2>Dealer Score: {dealerScore}</h2>
       </div>
      </div> 
      <div className="betting-section">
        <label htmlFor="betAmount">Bet Amount:</label>
        <input
          type="number"
          id="betAmount"
          value={betAmount}
          onChange={handleBetAmountChange}
          min={10}
          max={wallet}
          disabled={isGameActive}
        />
        <p>Wallet: ${wallet}</p>
      </div>  
    </div>
  );
}


export default App;