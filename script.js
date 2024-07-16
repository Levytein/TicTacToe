const Gameboard = (() => {
    let board = Array(9).fill(null);

    const getBoard = () => board;

    const resetBoard = () => {
        board.fill(null);
    };

    const setCell = (index, symbol) => {
        if (board[index] === null) {
            board[index] = symbol;
            return true;
        }
        return false;
    };

    return { getBoard, resetBoard, setCell };
})();

const Player = (name, symbol, isAI = false) => {
    return { name, symbol, isAI };
};

const Game = (() => {
    let player1;
    let player2;
    let currentPlayer;
    let isGameOver = false;

    const winningPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    const startGame = (playerOneName, playerTwoName, isAI = false) => {
        player1 = Player(playerOneName, 'X');
        player2 = Player(playerTwoName, 'O', isAI);
        currentPlayer = player1;
        isGameOver = false;
        Gameboard.resetBoard();
        DisplayController.renderBoard();
        DisplayController.updatePlayerDisplay();
        if (currentPlayer.isAI) {
            makeAIMove();
        }
    };

    const switchPlayer = () => {
        currentPlayer = (currentPlayer === player1) ? player2 : player1;
        DisplayController.updatePlayerDisplay();
        if (currentPlayer.isAI) {
            makeAIMove();
        }
    };

    const checkWin = (board, player) => {
        return winningPatterns.some(pattern =>
            pattern.every(index => board[index] === player)
        );
    };

    const checkTie = (board) => {
        return board.every(cell => cell !== null);
    };

    const makeMove = (index) => {
        if (isGameOver) return;

        if (Gameboard.setCell(index, currentPlayer.symbol)) {
            if (checkWin(Gameboard.getBoard(), currentPlayer.symbol)) {
                DisplayController.showPopup(`${currentPlayer.name} wins!`);
                isGameOver = true;
                return;
            }

            if (checkTie(Gameboard.getBoard())) {
                DisplayController.showPopup("It's a tie!");
                isGameOver = true;
                return;
            }

            switchPlayer();
            DisplayController.renderBoard();
        }
    };

    const makeAIMove = () => {
        const bestMove = minimax(Gameboard.getBoard(), player2.symbol).index;
        setTimeout(() => {
            makeMove(bestMove);
            DisplayController.renderBoard(); // Ensure the board updates after AI move
        }, 500); // Delay for natural feel
    };

    const getCurrentPlayer = () => currentPlayer;
    const getPlayer1 = () => player1;

    return { startGame, makeMove, getCurrentPlayer, getPlayer1, checkWin };
})();

const minimax = (newBoard, player) => {
    const humanPlayer = Game.getPlayer1().symbol;
    const aiPlayer = Game.getPlayer1().symbol === 'X' ? 'O' : 'X';  // Get AI symbol based on player1 symbol

    const availableSpots = newBoard.reduce((acc, cell, index) => cell === null ? acc.concat(index) : acc, []);

    if (Game.checkWin(newBoard, humanPlayer)) {
        return { score: -10 };
    } else if (Game.checkWin(newBoard, aiPlayer)) {
        return { score: 10 };
    } else if (availableSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];

    for (let i = 0; i < availableSpots.length; i++) {
        const move = {};
        move.index = availableSpots[i];
        newBoard[availableSpots[i]] = player;

        if (player === aiPlayer) {
            const result = minimax(newBoard, humanPlayer);
            move.score = result.score;
        } else {
            const result = minimax(newBoard, aiPlayer);
            move.score = result.score;
        }

        newBoard[availableSpots[i]] = null;
        moves.push(move);
    }

    let bestMove;
    if (player === aiPlayer) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
};

const DisplayController = (() => {
    const gameGrid = document.getElementById("gameGrid");
    const startScreen = document.getElementById("startScreen");
    const gameScreen = document.getElementById("gameScreen");
    const player1Display = document.getElementById("player1Display");
    const player2Display = document.getElementById("player2Display");
    const guraImg = document.getElementById("guraImg");
    const caliImg = document.getElementById("caliImg");
    const popup = document.getElementById("popup");
    const popupMessage = document.getElementById("popupMessage");
    const popupResetButton = document.getElementById("popupResetButton");
    const popupBackToTitleButton = document.getElementById("popupBackToTitleButton");
    const closePopup = document.getElementById("closePopup");

    const renderBoard = () => {
        gameGrid.innerHTML = '';
        Gameboard.getBoard().forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            // Clear any previous content
            cellElement.innerHTML = '';

            // Add image based on the symbol
            if (cell === 'X') {
                cellElement.insertAdjacentHTML('beforeend', `<img src='guraspin.gif' alt='X'>`);
            } else if (cell === 'O') {
                cellElement.insertAdjacentHTML('beforeend', `<img src='morispin.gif' alt='O'>`);
            }
            cellElement.addEventListener('click', () => {
                if (!Game.getCurrentPlayer().isAI) {
                    Game.makeMove(index);
                }
            });
            gameGrid.appendChild(cellElement);
        });
    };

    const updatePlayerDisplay = () => {
        const currentPlayer = Game.getCurrentPlayer();
        const player1 = Game.getPlayer1();
        if (currentPlayer === player1) {
            player1Display.classList.add('activeGura');
            player2Display.classList.remove('activeCali');
            caliImg.setAttribute("src", "mori-calliope-hololive.png");
            guraImg.setAttribute("src", "gawr-gura.gif");
        } else {
            player2Display.classList.add('activeCali');
            player1Display.classList.remove('activeGura');
            guraImg.setAttribute("src", "gawr-gura.png");
            caliImg.setAttribute("src", "mori-calliope-hololive.gif");
        }
        console.log("Switch Players");
    };

    const startGame = () => {
        const player1Name = document.getElementById("player1Name").value || "Player 1";
        const player2Name = document.getElementById("player2Name").value || "Player 2";

        startScreen.style.display = 'none';
        gameScreen.style.display = 'flex';

        player1Display.textContent = player1Name;
        player2Display.textContent = player2Name;

        Game.startGame(player1Name, player2Name);
    };

    const startAiGame = () => {
        const player1Name = document.getElementById("player1Name").value || "Player 1";

        startScreen.style.display = 'none';
        gameScreen.style.display = 'flex';

        player1Display.textContent = player1Name;
        player2Display.textContent = "AI";
        Game.startGame(player1Name, "AI", true);
    };

    const resetGame = () => {
        document.getElementById("player1Name").value = '';
        document.getElementById("player2Name").value = '';
        startScreen.style.display = 'flex';
        gameScreen.style.display = 'none';
        Gameboard.resetBoard();
    };

    const showPopup = (message) => {
        popupMessage.textContent = message;
        popup.style.display = "flex";
    };

    const hidePopup = () => {
        popup.style.display = "none";
    };

    /*popupResetButton.addEventListener("click", () => {
        hidePopup();
        startGame();
    });
    */
    popupBackToTitleButton.addEventListener("click", () => {
        hidePopup();
        resetGame();
    });

    closePopup.addEventListener("click", hidePopup);

    document.getElementById("startButton").addEventListener("click", startGame);
    document.getElementById("resetButton").addEventListener("click", startGame);
    document.getElementById("backToTitle").addEventListener("click", resetGame);
    document.getElementById("startAIButton").addEventListener("click", startAiGame);

    return { renderBoard, updatePlayerDisplay, showPopup };
})();

// Initial game setup
document.addEventListener("DOMContentLoaded", () => {
    DisplayController.renderBoard();
});
