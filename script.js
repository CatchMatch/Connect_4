document.addEventListener('DOMContentLoaded', () => {
    
    const ROWS = 10;
    const COLS = 10;
    const WINNING_LENGTH = 4;
   
    let currentPlayer = 1;
    let board = createEmptyBoard();
    let gameActive = false;
    let player1Name = "Player 1";
    let player2Name = "Player 2";
   
    const body = document.body;
    const nameModal = document.getElementById('nameModal');
    const gameContainer = document.querySelector('.game-container');
    const boardElement = document.getElementById('board');
    const statusElement = document.getElementById('status');
    const resetButton = document.getElementById('reset');
    const startButton = document.getElementById('startGame');
    const player1Input = document.getElementById('player1');
    const player2Input = document.getElementById('player2');
    const patternSelector = document.getElementById('bgPattern');
    
    const patterns = {
        circuit: {
            background: '#121212',
            image: `
                radial-gradient(circle at 10% 20%, rgba(0, 150, 136, 0.1) 0%, transparent 20%),
                radial-gradient(circle at 90% 80%, rgba(0, 150, 136, 0.1) 0%, transparent 25%),
                linear-gradient(45deg, #121212 25%, transparent 25%, transparent 75%, #121212 75%),
                linear-gradient(-45deg, #121212 25%, transparent 25%, transparent 75%, #121212 75%)
            `,
            size: '20px 20px'
        },
        stars: {
            background: '#0a0a1a',
            image: `
                radial-gradient(1px 1px at 20px 30px, #4fc3f7, rgba(0,0,0,0)),
                radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
                radial-gradient(1px 1px at 60px 20px, #fff, rgba(0,0,0,0)),
                radial-gradient(1px 1px at 80px 50px, #4fc3f7, rgba(0,0,0,0)),
                radial-gradient(1px 1px at 100px 30px, #fff, rgba(0,0,0,0)),
                radial-gradient(1px 1px at 120px 70px, #4fc3f7, rgba(0,0,0,0)),
                radial-gradient(1px 1px at 140px 20px, #fff, rgba(0,0,0,0)),
                radial-gradient(1px 1px at 160px 50px, #4fc3f7, rgba(0,0,0,0))
            `,
            size: '200px 200px'
        },
        grid: {
            background: '#121212',
            image: `
                linear-gradient(#333 1px, transparent 1px),
                linear-gradient(90deg, #333 1px, transparent 1px)
            `,
            size: '20px 20px'
        },
        hexagon: {
            background: '#121212',
            image: `
                radial-gradient(circle at center, #1e1e1e 0%, #121212 100%),
                repeating-linear-gradient(0deg, transparent 0px, transparent 19px, #333 19px, #333 20px),
                repeating-linear-gradient(60deg, transparent 0px, transparent 19px, #333 19px, #333 20px),
                repeating-linear-gradient(-60deg, transparent 0px, transparent 19px, #333 19px, #333 20px)
            `,
            size: '40px 40px'
        },
        dots: {
            background: '#121212',
            image: `
                radial-gradient(#333 2px, transparent 3px)
            `,
            size: '20px 20px'
        }
    };

    initGame();
    
    function initGame() {
        nameModal.style.display = 'flex';
        setBackground('circuit');
        setupEventListeners();
    }
    
    function setupEventListeners() {
        startButton.addEventListener('click', startGame);
        resetButton.addEventListener('click', resetGame);
        patternSelector.addEventListener('change', (e) => setBackground(e.target.value));
        boardElement.addEventListener('click', handleCellClick);
    }
    
    function setBackground(pattern) {
        const p = patterns[pattern];
        body.style.background = `${p.image} ${p.background}`;
        body.style.backgroundSize = p.size;
    }
    
    function startGame() {
        player1Name = player1Input.value.trim() || "Player 1";
        player2Name = player2Input.value.trim() || "Player 2";
        
        nameModal.style.display = 'none';
        gameContainer.style.display = 'block';
        resetGame();
    }
    
    function createEmptyBoard() {
        return Array(ROWS).fill().map(() => Array(COLS).fill(0));
    }
    
    function createBoard() {
        boardElement.innerHTML = '';
        
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                boardElement.appendChild(cell);
            }
        }
    }
    
    function handleCellClick(e) {
        if (!gameActive) return;
        
        const cell = e.target.closest('.cell');
        if (!cell) return;
        
        const col = parseInt(cell.dataset.col);
        const row = getFirstEmptyRow(col);
        
        if (row === -1) return;
        
        makeMove(row, col);
    }
    
    function getFirstEmptyRow(col) {
        for (let row = ROWS - 1; row >= 0; row--) {
            if (board[row][col] === 0) {
                return row;
            }
        }
        return -1;
    }
    
    function makeMove(row, col) {
        board[row][col] = currentPlayer;
        const cellIndex = row * COLS + col;
        const cellToUpdate = boardElement.children[cellIndex];
        cellToUpdate.classList.add(currentPlayer === 1 ? 'red' : 'yellow');
        
        if (checkWin(row, col)) {
            endGame(`${currentPlayer === 1 ? player1Name : player2Name} Wins!`);
            highlightWinningCells();
            return;
        }
        
        if (checkDraw()) {
            endGame("It's a Draw!");
            return;
        }
        
        switchPlayer();
    }
    
    function checkWin(row, col) {
        const directions = [
            [0, 1],  // Horizontal
            [1, 0],  // Vertical
            [1, 1],  // Diagonal down-right
            [1, -1]  // Diagonal down-left
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1;
            count += countDirection(row, col, dx, dy);
            count += countDirection(row, col, -dx, -dy);
            
            if (count >= WINNING_LENGTH) return true;
        }
        
        return false;
    }
    
    function countDirection(row, col, dx, dy) {
        let count = 0;
        let r = row + dx;
        let c = col + dy;
        
        while (
            r >= 0 && r < ROWS &&
            c >= 0 && c < COLS &&
            board[r][c] === currentPlayer
        ) {
            count++;
            r += dx;
            c += dy;
        }
        
        return count;
    }
    
    function checkDraw() {
        return board.every(row => row.every(cell => cell !== 0));
    }
    
    function switchPlayer() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateStatus();
    }
    
    function updateStatus() {
        const playerName = currentPlayer === 1 ? player1Name : player2Name;
        const playerColor = currentPlayer === 1 ? 'Red' : 'Yellow';
        statusElement.textContent = `${playerName}'s Turn (${playerColor})`;
        
        body.classList.remove('player1-turn', 'player2-turn');
        body.classList.add(currentPlayer === 1 ? 'player1-turn' : 'player2-turn');
    }
    
    function highlightWinningCells() {
        document.querySelectorAll('.cell').forEach(cell => {
            if (board[parseInt(cell.dataset.row)][parseInt(cell.dataset.col)] === currentPlayer) {
                cell.classList.add('win-animation');
            }
        });
    }
    
    function endGame(message) {
        gameActive = false;
        statusElement.textContent = message;
    }
    
    function resetGame() {
        board = createEmptyBoard();
        currentPlayer = 1;
        gameActive = true;
        createBoard();
        updateStatus();
        
        document.querySelectorAll('.win-animation').forEach(el => {
            el.classList.remove('win-animation');
        });
    }
});