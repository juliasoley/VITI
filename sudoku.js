class Sudoku {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.board = this.generateNewBoard();
    }

    generateNewBoard() {
        const emptyBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
        this.solveSudoku(emptyBoard);
        return this.removeNumbers(emptyBoard);
    }

    solveSudoku(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const numbers = this.shuffleNumbers();
                    for (const num of numbers) {
                        if (this.isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (this.solveSudoku(board)) return true;
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    shuffleNumbers() {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        return numbers;
    }

    removeNumbers(board) {
        const newBoard = board.map(row => [...row]);
        const cells = this.shuffleCells();
        let numbersToRemove;
        
        switch(this.difficulty) {
            case 'easy':
                numbersToRemove = 30;
                break;
            case 'medium':
                numbersToRemove = 45;
                break;
            case 'hard':
                numbersToRemove = 60;
                break;
            default:
                numbersToRemove = 40;
        }

        let removed = 0;
        for (const cell of cells) {
            if (removed >= numbersToRemove) break;
            
            const [row, col] = cell;
            if (newBoard[row][col] !== 0) {
                const temp = newBoard[row][col];
                newBoard[row][col] = 0;
                
                // Only check for unique solution in hard difficulty
                if (this.difficulty === 'hard') {
                    const tempBoard = newBoard.map(row => [...row]);
                    if (!this.hasUniqueSolution(tempBoard)) {
                        newBoard[row][col] = temp;
                        continue;
                    }
                }
                removed++;
            }
        }
        return newBoard;
    }

    shuffleCells() {
        const cells = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                cells.push([row, col]);
            }
        }
        for (let i = cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cells[i], cells[j]] = [cells[j], cells[i]];
        }
        return cells;
    }

    hasUniqueSolution(board) {
        // More efficient unique solution checker
        const tempBoard = board.map(row => [...row]);
        return this.countSolutions(tempBoard) === 1;
    }

    countSolutions(board, count = 0) {
        for (let row = 0; row < 9 && count < 2; row++) {
            for (let col = 0; col < 9 && count < 2; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= 9 && count < 2; num++) {
                        if (this.isValid(board, row, col, num)) {
                            board[row][col] = num;
                            count = this.countSolutions(board, count);
                            board[row][col] = 0;
                        }
                    }
                    return count;
                }
            }
        }
        return count + 1;
    }

    isValid(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num || board[i][col] === num) return false;
        }
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[startRow + i][startCol + j] === num) return false;
            }
        }
        return true;
    }

    isSolved() {
        return this.board.every(row => row.every(cell => cell !== 0));
    }
}

// Game Initialization
let currentDifficulty = 'medium';
let sudoku = new Sudoku(currentDifficulty);
const grid = document.getElementById('sudoku-grid');

// Add timer variables at the top
let startTime;
let timerInterval;

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('timer').textContent = `Tími: ${elapsed}s`;
}

function renderGrid() {
    grid.innerHTML = '';
    sudoku.board.forEach((row, rowIndex) => {
        row.forEach((num, colIndex) => {
            const cell = document.createElement('input');
            cell.classList.add('cell');
            cell.type = 'text';
            cell.maxLength = 1;
            cell.value = num === 0 ? '' : num;
            
            if (num !== 0) {
                cell.classList.add('fixed');
                cell.readOnly = true;
            } else {
                cell.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    if (isNaN(value) || value < 1 || value > 9) {
                        e.target.value = '';
                        return;
                    }
                    if (!sudoku.isValid(sudoku.board, rowIndex, colIndex, value)) {
                        cell.classList.add('error');
                    } else {
                        cell.classList.remove('error');
                        sudoku.board[rowIndex][colIndex] = value;
                        if (sudoku.isSolved()) {
                            alert('Til hamingju! Þú leystir Sudoku!');
                        }
                    }
                });

                // Add arrow key navigation
                cell.addEventListener('keydown', (e) => {
                    const currentIndex = Array.from(grid.children).indexOf(e.target);
                    let nextIndex;
                    
                    switch(e.key) {
                        case 'ArrowUp':
                            nextIndex = currentIndex - 9;
                            break;
                        case 'ArrowDown':
                            nextIndex = currentIndex + 9;
                            break;
                        case 'ArrowLeft':
                            nextIndex = currentIndex - 1;
                            break;
                        case 'ArrowRight':
                            nextIndex = currentIndex + 1;
                            break;
                        default:
                            return;
                    }

                    if (nextIndex >= 0 && nextIndex < 81) {
                        grid.children[nextIndex].focus();
                    }
                });
            }
            grid.appendChild(cell);
        });
    });
}

// Difficulty selection
document.querySelectorAll('.difficulty-btn').forEach(button => {
    button.addEventListener('click', () => {
        currentDifficulty = button.dataset.difficulty;
        sudoku = new Sudoku(currentDifficulty);
        renderGrid();
        stopTimer();
        startTimer();
    });
});

// Modify the new game button functionality
document.getElementById('new-game-btn')?.addEventListener('click', () => {
    stopTimer();
    sudoku.board = sudoku.generateNewBoard();
    renderGrid();
    startTimer();
});

// Add timer to initial render
renderGrid();
startTimer();
