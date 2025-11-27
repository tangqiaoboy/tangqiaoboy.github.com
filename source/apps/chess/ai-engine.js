// AI引擎 - 使用Minimax算法

class AIEngine {
    constructor(difficulty = 2) {
        this.difficulty = difficulty; // 搜索深度
        this.pieceValues = {
            'p': 100, 'P': 100,
            'n': 320, 'N': 320,
            'b': 330, 'B': 330,
            'r': 500, 'R': 500,
            'q': 900, 'Q': 900,
            'k': 20000, 'K': 20000
        };
    }

    setDifficulty(difficulty) {
        this.difficulty = parseInt(difficulty);
    }

    // 评估棋盘位置
    evaluateBoard(engine) {
        let score = 0;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = engine.getPiece(row, col);
                if (piece) {
                    const value = this.pieceValues[piece] || 0;
                    if (engine.isWhite(piece)) {
                        score += value;
                        score += this.getPositionValue(piece, row, col, true);
                    } else {
                        score -= value;
                        score -= this.getPositionValue(piece, row, col, false);
                    }
                }
            }
        }

        // 检查将军状态
        if (engine.isInCheck(true)) {
            score -= 50;
        }
        if (engine.isInCheck(false)) {
            score += 50;
        }

        // 检查将死状态
        if (engine.isCheckmate(true)) {
            score = -100000;
        }
        if (engine.isCheckmate(false)) {
            score = 100000;
        }

        return score;
    }

    // 获取位置价值（鼓励棋子占据中心位置）
    getPositionValue(piece, row, col, isWhite) {
        const pieceType = piece.toLowerCase();
        let value = 0;

        // 中心控制奖励
        const centerDistance = Math.abs(row - 3.5) + Math.abs(col - 3.5);
        value -= centerDistance * 5;

        // 兵的位置价值
        if (pieceType === 'p') {
            const pawnRow = isWhite ? row : 7 - row;
            value += (7 - pawnRow) * 10; // 鼓励兵前进
        }

        // 马的位置价值（中心更好）
        if (pieceType === 'n') {
            const knightTable = [
                [-50, -40, -30, -30, -30, -30, -40, -50],
                [-40, -20,   0,   0,   0,   0, -20, -40],
                [-30,   0,  10,  15,  15,  10,   0, -30],
                [-30,   5,  15,  20,  20,  15,   5, -30],
                [-30,   0,  15,  20,  20,  15,   0, -30],
                [-30,   5,  10,  15,  15,  10,   5, -30],
                [-40, -20,   0,   5,   5,   0, -20, -40],
                [-50, -40, -30, -30, -30, -30, -40, -50]
            ];
            value += isWhite ? knightTable[row][col] : knightTable[7 - row][col];
        }

        return value;
    }

    // Minimax算法（带Alpha-Beta剪枝）
    minimax(engine, depth, alpha, beta, maximizingPlayer) {
        // 终止条件
        if (depth === 0 || engine.gameOver) {
            return this.evaluateBoard(engine);
        }

        const isWhite = maximizingPlayer;
        const moves = engine.getAllPossibleMoves(isWhite);

        if (moves.length === 0) {
            // 没有合法走法
            if (engine.isInCheck(isWhite)) {
                return maximizingPlayer ? -100000 : 100000; // 将死
            } else {
                return 0; // 和棋
            }
        }

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const clonedEngine = engine.clone();
                clonedEngine.movePiece(move.from.row, move.from.col, move.to.row, move.to.col);
                const evaluation = this.minimax(clonedEngine, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) {
                    break; // Alpha-Beta剪枝
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const clonedEngine = engine.clone();
                clonedEngine.movePiece(move.from.row, move.from.col, move.to.row, move.to.col);
                const evaluation = this.minimax(clonedEngine, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) {
                    break; // Alpha-Beta剪枝
                }
            }
            return minEval;
        }
    }

    // 获取最佳走法
    getBestMove(engine) {
        const isWhite = engine.currentPlayer === 'white';
        const moves = engine.getAllPossibleMoves(isWhite);

        if (moves.length === 0) {
            return null;
        }

        let bestMove = null;
        let bestEval = isWhite ? -Infinity : Infinity;

        // 随机打乱走法顺序，增加变化性
        const shuffledMoves = this.shuffleArray([...moves]);

        for (const move of shuffledMoves) {
            const clonedEngine = engine.clone();
            clonedEngine.movePiece(move.from.row, move.from.col, move.to.row, move.to.col);
            
            const evaluation = this.minimax(
                clonedEngine,
                this.difficulty - 1,
                -Infinity,
                Infinity,
                !isWhite
            );

            if (isWhite) {
                if (evaluation > bestEval) {
                    bestEval = evaluation;
                    bestMove = move;
                }
            } else {
                if (evaluation < bestEval) {
                    bestEval = evaluation;
                    bestMove = move;
                }
            }
        }

        return bestMove;
    }

    // 随机打乱数组
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // 异步获取最佳走法（用于显示思考过程）
    async getBestMoveAsync(engine, onProgress) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (onProgress) {
                    onProgress('AI正在思考...');
                }
                const bestMove = this.getBestMove(engine);
                resolve(bestMove);
            }, 100); // 添加小延迟，让UI有时间更新
        });
    }
}

