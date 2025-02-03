const cardFaces = ["🍎", "🍌", "🍇", "🍒", "🍑", "🍕", "🍦", "🍔"];
let deck = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchesFound = 0;
let timerInterval = null;
let startTime = 0;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createBoard() {
  const board = document.getElementById("game-board");
  board.innerHTML = "";

  deck.forEach((face) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const cardInner = document.createElement("div");
    cardInner.classList.add("card-inner");

    const front = document.createElement("div");
    front.classList.add("card-front");
    front.textContent = face;

    const back = document.createElement("div");
    back.classList.add("card-back");
    back.textContent = "";

    cardInner.appendChild(front);
    cardInner.appendChild(back);
    card.appendChild(cardInner);

    card.addEventListener("click", () => flipCard(card, face));
    board.appendChild(card);
  });
}

function flipCard(cardElement, faceValue) {
  if (lockBoard) return;
  const inner = cardElement.querySelector(".card-inner");

  // Prevent clicking on the same card twice
  if (inner.classList.contains("flipped") || cardElement.classList.contains("hidden")) return;

  // Flip the current card
  inner.classList.add("flipped");

  if (!firstCard) {
    firstCard = { cardElement, faceValue };
  } else {
    secondCard = { cardElement, faceValue };
    lockBoard = true;

    if (firstCard.faceValue === secondCard.faceValue) {
      // It's a match!
      setTimeout(() => {
        firstCard.cardElement.classList.add("hidden");
        secondCard.cardElement.classList.add("hidden");
        resetTurn();
        matchesFound++;
        checkWin();
      }, 600);
    } else {
      // No match, flip cards back after a short delay
      setTimeout(() => {
        firstCard.cardElement.querySelector(".card-inner").classList.remove("flipped");
        secondCard.cardElement.querySelector(".card-inner").classList.remove("flipped");
        resetTurn();
      }, 1000);
    }
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function checkWin() {
  if (matchesFound === cardFaces.length) {
    document.getElementById("status").textContent = "Vel gert!";
    stopTimer();
  }
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const currentTime = Date.now();
    const elapsed = Math.floor((currentTime - startTime) / 1000);
    document.getElementById("timer").textContent = "Time: " + elapsed + "s";
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  stopTimer();
  document.getElementById("timer").textContent = "Time: 0s";
}

function resetGameVariables() {
  matchesFound = 0;
  lockBoard = false;
  firstCard = null;
  secondCard = null;
  document.getElementById("status").textContent = "";
  deck = [...cardFaces, ...cardFaces];
  resetTimer();
}

function startGame() {
  resetGameVariables();
  shuffle(deck);
  createBoard();
  startTimer();
}

function resetGame() {
  startGame();
}

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("resetBtn").addEventListener("click", resetGame);

window.addEventListener("load", startGame);
