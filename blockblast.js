const gridSize = 8;
let grid = [];
let blocks = [];
let score = 0;
let blocksPlaced = 0; // Track how many blocks have been placed in the current round
let ghostBlock = null; // Add ghost block reference
let grabOffsetX = 0;
let grabOffsetY = 0;

// Initialize the grid
function createGrid() {
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';

    for (let y = 0; y < gridSize; y++) {
        grid[y] = [];
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            gridElement.appendChild(cell);
        }
    }
}

// Generate random blocks
function generateBlocks() {
    const blockShapes = [
        [[1]], // Single block
        [[1, 1]], // 2x1 block
        [[1], [1]], // 1x2 block
        [[1, 1], [1, 1]], // 2x2 block
        [[1, 1, 1]], // 3x1 block
        [[1], [1], [1]], // 1x3 block
        [[1, 1], [0, 1]], // L-shape
        [[1, 1, 1, 1]], // 4x1 block
        [[1], [1], [1], [1]], // 1x4 block
        [[1, 1, 1], [0, 0, 1]], // L-shape (larger)
        [[1, 1], [1, 0], [1, 0]], // T-shape
        [[1, 1, 1], [0, 1, 0]], // T-shape (horizontal)
        [[1, 1, 1], [1, 0, 1]], // U-shape
        [[1, 0], [1, 1], [1, 0]], // Plus shape
        [[1, 1, 0], [0, 1, 1]], // Z-shape
        [[0, 1, 1], [1, 1, 0]], // S-shape
    ];

    blocks = [];
    const blocksContainer = document.getElementById('blocks-container');
    blocksContainer.innerHTML = '';

    for (let i = 0; i < 3; i++) {
        const shape = blockShapes[Math.floor(Math.random() * blockShapes.length)];
        const block = { shape, x: 0, y: 0 };
        blocks.push(block);

        const blockElement = document.createElement('div');
        blockElement.classList.add('block-piece');
        blockElement.draggable = true;
        blockElement.id = `block-${i}`; // Assign a unique ID

        // Render the block shape
        const shapeContainer = document.createElement('div');
        shapeContainer.style.display = 'grid';
        shapeContainer.style.gridTemplateColumns = `repeat(${shape[0].length}, 40px)`;
        shapeContainer.style.gridTemplateRows = `repeat(${shape.length}, 40px)`;
        shapeContainer.style.gap = '2px';

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                const cell = document.createElement('div');
                cell.style.backgroundColor = shape[y][x] ? '#a461e4' : 'transparent';
                cell.style.border = shape[y][x] ? '2px solidrgb(90, 22, 110)' : 'none';
                cell.style.borderRadius = '4px';
                shapeContainer.appendChild(cell);
            }
        }

        blockElement.appendChild(shapeContainer);
        blockElement.addEventListener('dragstart', (e) => {
            const rect = e.target.getBoundingClientRect();
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            // Calculate offset from the top-left corner of the block
            grabOffsetX = Math.floor((mouseX - rect.left) / 40); // Changed to 40
            grabOffsetY = Math.floor((mouseY - rect.top) / 40); // Changed to 40
            
            e.dataTransfer.setData('text/plain', JSON.stringify(block));
            e.dataTransfer.setData('blockElement', blockElement.id);
        });
        blocksContainer.appendChild(blockElement);
    }
}

// Highlight potential drop positions
function highlightDropPositions(block, x, y) {
    clearHighlights();
    
    // Adjust x and y based on grab offset
    x = x - grabOffsetX;
    y = y - grabOffsetY;
    
    // Check if block can be placed
    if (!canPlaceBlock(block, x, y)) return;
    
    // Get grid cell size
    const gridElement = document.getElementById('grid');
    const firstCell = gridElement.querySelector('.cell');
    const cellSize = firstCell ? firstCell.offsetWidth : 25; // Default to 25 if not found
    
    // Highlight cells where block will be placed
    for (let dy = 0; dy < block.shape.length; dy++) {
        for (let dx = 0; dx < block.shape[dy].length; dx++) {
            if (block.shape[dy][dx]) {
                const cellX = x + dx;
                const cellY = y + dy;
                const cell = document.querySelector(`[data-x="${cellX}"][data-y="${cellY}"]`);
                if (cell) {
                    cell.classList.add('highlight');
                }
            }
        }
    }
}

// Clear all highlights
function clearHighlights() {
    const highlightedCells = document.querySelectorAll('.highlight');
    highlightedCells.forEach(cell => cell.classList.remove('highlight'));
    
    if (ghostBlock) {
        ghostBlock.remove();
        ghostBlock = null;
    }
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    const cell = e.target;
    if (cell.classList.contains('cell')) {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        highlightDropPositions(data, x, y);
    }
}

// Handle drag leave
function handleDragLeave(e) {
    clearHighlights();
}

// Handle block drop
function handleDrop(e) {
    e.preventDefault();
    clearHighlights();
    
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const blockElementId = e.dataTransfer.getData('blockElement');
    const cell = e.target;
    
    if (cell.classList.contains('cell')) {
        const x = parseInt(cell.dataset.x) - grabOffsetX;
        const y = parseInt(cell.dataset.y) - grabOffsetY;
        
        if (canPlaceBlock(data, x, y)) {
            placeBlock(data, x, y);
            const blockElement = document.getElementById(blockElementId);
            if (blockElement) {
                blockElement.remove();
            }
            blocksPlaced++;
            
            checkRowsAndColumns();
            
            if (blocksPlaced === 3) {
                generateBlocks();
                blocksPlaced = 0;
            }
        }
    }
}

// Check if a block can be placed
function canPlaceBlock(block, x, y) {
    for (let dy = 0; dy < block.shape.length; dy++) {
        for (let dx = 0; dx < block.shape[dy].length; dx++) {
            if (block.shape[dy][dx]) {
                const cellX = x + dx;
                const cellY = y + dy;
                if (cellX >= gridSize || cellY >= gridSize || grid[cellY][cellX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Place a block on the grid
function placeBlock(block, x, y) {
    for (let dy = 0; dy < block.shape.length; dy++) {
        for (let dx = 0; dx < block.shape[dy].length; dx++) {
            if (block.shape[dy][dx]) {
                const cellX = x + dx;
                const cellY = y + dy;
                grid[cellY][cellX] = true;
                const cell = document.querySelector(`[data-x="${cellX}"][data-y="${cellY}"]`);
                if (cell) {
                    cell.classList.add('block');
                }
            }
        }
    }
}

// Check for completed rows and columns
function checkRowsAndColumns() {
    let rowsCleared = 0;
    let columnsCleared = 0;

    // Check rows
    for (let y = 0; y < gridSize; y++) {
        let rowFull = true;
        for (let x = 0; x < gridSize; x++) {
            if (!grid[y][x]) {
                rowFull = false;
                break;
            }
        }
        if (rowFull) {
            for (let x = 0; x < gridSize; x++) {
                grid[y][x] = false;
                const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
                cell.classList.remove('block');
            }
            rowsCleared++;
        }
    }

    // Check columns
    for (let x = 0; x < gridSize; x++) {
        let columnFull = true;
        for (let y = 0; y < gridSize; y++) {
            if (!grid[y][x]) {
                columnFull = false;
                break;
            }
        }
        if (columnFull) {
            for (let y = 0; y < gridSize; y++) {
                grid[y][x] = false;
                const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
                cell.classList.remove('block');
            }
            columnsCleared++;
        }
    }

    // Update score
    score += (rowsCleared + columnsCleared) * 10;
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Start the game
function startGame() {
    createGrid();
    generateBlocks();
    const gridElement = document.getElementById('grid');
    gridElement.addEventListener('dragover', handleDragOver);
    gridElement.addEventListener('dragleave', handleDragLeave);
    gridElement.addEventListener('drop', handleDrop);
}

// Initialize the game
startGame();
