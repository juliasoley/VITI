const gridSize = 3; // Start with a 3x3 grid
let sequence = [];
let playerSequence = [];
let level = 1;
let isPlayerTurn = false;

const flashColor = '#00FF00'; // All squares will flash this color

const grid = document.getElementById('grid');
const startBtn = document.getElementById('startBtn');
const statusText = document.getElementById('status');

// Initialize the grid
function createGrid() {
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${gridSize}, 100px)`;
    grid.style.gridTemplateRows = `repeat(${gridSize}, 100px)`;

    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        grid.appendChild(cell);
    }
}

// Start the game
function startGame() {
    sequence = [];
    playerSequence = [];
    level = 1;
    isPlayerTurn = false;
    statusText.textContent = 'Fylgstu með röðinni!';
    createGrid(); // Ensure the grid is created immediately
    generateSequence();
    playSequence();

}

// Generate a random sequence
function generateSequence() {
    // Add only one new square to the sequence
    sequence.push(Math.floor(Math.random() * (gridSize * gridSize)));
}

// Play the sequence
function playSequence() {
    let i = 0;
    const interval = setInterval(() => {
        if (i >= sequence.length) {
            clearInterval(interval);
            isPlayerTurn = true;
            statusText.textContent = 'Þú átt leik!';
            return;
        }
        const cell = grid.children[sequence[i]];
        flashCell(cell);
        i++;
    }, 1000);
}

// Flash a cell
function flashCell(cell) {
    const originalColor = cell.style.backgroundColor;
    cell.style.backgroundColor = flashColor;
    setTimeout(() => {
        cell.style.backgroundColor = originalColor;
    }, 500);
}

// Handle cell click
function handleCellClick(e) {
    if (!isPlayerTurn) return;

    const cell = e.target;
    const index = parseInt(cell.dataset.index);
    playerSequence.push(index);
    flashCell(cell);

    if (playerSequence.length === sequence.length) {
        checkSequence();
    }
}

// Check if the player's sequence matches the generated sequence
function checkSequence() {
    if (playerSequence.toString() === sequence.toString()) {
        level++;
        statusText.textContent = `Correct! Level ${level}`;
        playerSequence = [];
        isPlayerTurn = false;
        setTimeout(() => {
            generateSequence();
            playSequence();
        }, 1000);
    } else {
        statusText.textContent = 'Game Over! Press Start to Play Again';
    }
}

// Start the game when the button is clicked
startBtn.addEventListener('click', startGame);

// Initialize the grid when the page loads
createGrid();