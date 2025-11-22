// Game class manages the overall chess game logic, including state, moves, and rules
class Game {
	constructor() {
		this.board = new Chessboard(this) // Chessboard instance linked to this game
		this.classicFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' // Standard chess starting position
		this.elementalFen = 'rfbekanw/pppppppp/8/8/8/8/PPPPPPPP/RFBEKANW' // Elemental variant starting position

		this.handleSquareClick = this.handleSquareClick.bind(this) // Bind click handler to game instance
		this.activePlayerElement = document.getElementById('activePlayer') // DOM element showing active player

		this.selectedSquare = null // Tracks currently selected square
	}

	// Initialises the game
	start(gameMode = 'pvp', gameType = 'elemental') {
		this.gameMode = gameMode // pvp or pvb
		this.gameType = gameType // elemental or classic
		this.activePlayer = 'white'
		this.activePlayerElement.innerHTML = 'White'
		this.gameOver = false
		this.availableMoves = [] // Valid moves for selected piece
		this.moveHistory = [] // List of executed moves
		this.undoneMoves = [] // List of undone moves (for redo)

		this.enPassantIndex = null // Index for en passant captures
		this.castlingRights = {
			// Track castling availability
			white: { kingside: true, queenside: true },
			black: { kingside: true, queenside: true }
		}

		this.startPosition = gameType === 'elemental' ? this.elementalFen : this.classicFen
		this.bot = gameMode === 'pvb' ? new Bot(this, 'black', 1) : null // Initialize bot if PvB
		this.board.draw(this.startPosition) // Draw board
	}

	//!-------------- Game Flow --------------

	// Handle square click events
	handleSquareClick(event) {
		if (this.board.promotionInProgress) return // Ignore clicks during promotion

		const square = event.currentTarget
		if (!this.selectedSquare) {
			this.handleFirstClick(square)
		} else {
			if (square === this.selectedSquare) {
				this.resetSquareSelection()
			} else if (this.isActivePlayersPiece(square)) {
				this.resetSquareSelection()
				this.handleFirstClick(square)
			} else {
				this.handleSecondClick(square)
			}
		}
	}

	// Actions for first click (select piece)
	handleFirstClick(square) {
		this.selectedSquare = square
		const piece = this.board.getPieceFromCoord(square.getAttribute('coordinate'))
		if (!this.isActivePlayersPiece(square)) return
		this.availableMoves = this.calculateValidMoves(piece, parseInt(square.getAttribute('index120')))
		this.board.highlightSquares(this.availableMoves)
		square.classList.add('clickedSquare')
	}

	// Actions for second click (attempt move)
	handleSecondClick(square) {
		if (!this.availableMoves.includes(parseInt(square.getAttribute('index120')))) return
		const fromCoord = this.selectedSquare.getAttribute('coordinate')

		this.executeMove(fromCoord, square.getAttribute('coordinate'), this.board.getPieceFromCoord(fromCoord))
		this.resetSquareSelection()

		if (this.isKingCheckmated(this.getOpponentColour(this.activePlayer))) {
			this.gameOver = true
			console.log('Checkmate!')
			const winner = this.activePlayer
			showCheckmateModal(winner)
		} else if (this.isKingInCheck(this.getOpponentColour(this.activePlayer))) {
			console.log('Check!')
		}

		this.toggleTurn()
		this.undoneMoves = []
	}

	// Switch turn between players
	toggleTurn() {
		this.activePlayer = this.getOpponentColour(this.activePlayer)
		this.activePlayerElement.innerHTML = this.activePlayer.charAt(0).toUpperCase() + this.activePlayer.slice(1)
		console.log(this.displayMoveHistory())

		// If game type is 'pvb' and it's bot's turn, make the bot play
		if (this.gameMode === 'pvb' && this.activePlayer === this.bot.colour) {
			setTimeout(() => {
				this.bot.makeBestMove()
				this.toggleTurn()
			}, 500) // Delay to simulate thinking time
		}
	}

	// Reset square selection and valid moves
	resetSquareSelection() {
		if (!this.selectedSquare) return
		this.selectedSquare.classList.remove('clickedSquare')
		this.board.unhighlightSquares(this.availableMoves)
		this.selectedSquare = null
		this.availableMoves = []
	}

	//!-------------- Move Management --------------

	// Execute a move, handling special moves and history
	executeMove(fromCoord, toCoord, piece) {
		let capturedPiece = null
		let capturedCoord = null
		let moveType = 'normal'
		const castlingRightsBefore = JSON.parse(JSON.stringify(this.castlingRights))
		const enPassantIndexBefore = this.enPassantIndex

		if (this.isEnPassantMove(toCoord, piece)) {
			const dir = piece === piece.toUpperCase() ? -1 : 1
			const enPassantCoord = Chessboard.index120ToCoord(this.enPassantIndex - 10 * dir)
			capturedPiece = this.retrieveCapturedPiece(enPassantCoord)
			capturedCoord = enPassantCoord
			this.board.enPassant(fromCoord, toCoord)
			moveType = 'enPassant'
		} else if (this.isCastleMove(fromCoord, toCoord, piece)) {
			this.board.castle(fromCoord, toCoord)
			moveType = 'castle'
		} else {
			capturedPiece = this.retrieveCapturedPiece(toCoord)
			if (capturedPiece) capturedCoord = toCoord
			this.board.move(fromCoord, toCoord)
			if (this.isPawnPromotion(piece, toCoord)) {
				this.board.promote(toCoord)
				moveType = 'promotion'
			}
		}

		this.moveHistory.push({ piece, fromCoord, toCoord, capturedPiece, capturedCoord, moveType, castlingRightsBefore, enPassantIndexBefore })
		this.updateCastlingRights(fromCoord, piece)
	}

	// Undo the last move
	undoMove() {
		this.resetSquareSelection()
		this.board.hidePromotionOptions()
		this.board.promotionInProgress = false

		if (this.moveHistory.length === 0) return
		const lastMove = this.moveHistory.pop()
		const { fromCoord, toCoord, capturedPiece, capturedCoord, moveType, piece, castlingRightsBefore, enPassantIndexBefore } = lastMove
		switch (moveType) {
			case 'enPassant':
				this.board.move(toCoord, fromCoord)
				this.board.place(capturedPiece, capturedCoord)
				break
			case 'promotion':
				this.board.place(capturedPiece, capturedCoord)
				this.board.place(piece, fromCoord)
				break
			case 'castle':
				this.board.move(toCoord, fromCoord)
				if (toCoord === 'g1') this.board.move('f1', 'h1')
				else if (toCoord === 'b1') this.board.move('c1', 'a1')
				else if (toCoord === 'g8') this.board.move('f8', 'h8')
				else if (toCoord === 'b8') this.board.move('c8', 'a8')
				break
			default:
				this.board.move(toCoord, fromCoord)
				if (capturedPiece) this.board.place(capturedPiece, capturedCoord)
		}
		this.castlingRights = castlingRightsBefore
		this.enPassantIndex = enPassantIndexBefore
		this.gameOver = false
		this.toggleTurn()
		this.undoneMoves.push(lastMove)
	}

	// Redo last undone move
	redoMove() {
		if (this.undoneMoves.length === 0) return
		const lastUndoneMove = this.undoneMoves.pop()
		const { fromCoord, toCoord, moveType } = lastUndoneMove

		switch (moveType) {
			case 'enPassant':
				this.board.enPassant(fromCoord, toCoord)
				break
			case 'promotion':
				this.board.move(fromCoord, toCoord)
				this.board.promote(toCoord)
				break
			case 'castle':
				this.board.castle(fromCoord, toCoord)
				this.updateCastlingRights(fromCoord, this.board.getPieceFromCoord(toCoord))
				break
			default:
				this.board.move(fromCoord, toCoord)
		}
		this.moveHistory.push(lastUndoneMove)
		this.toggleTurn()
	}

	//!-------------- Move Validity and Calculation --------------

	// Calculate all valid moves for a piece, considering king safety
	calculateValidMoves(piece, currentPosition) {
		const colour = Chessboard.getPieceColour(piece)
		let moves = []

		// prettier-ignore
		switch (piece.toLowerCase()) {
            case 'k': moves = this.calculateKingMoves(currentPosition, colour); break
            case 'p': moves = this.calculatePawnMoves(currentPosition, colour); break
            case 'n': moves = this.calculateMoves(currentPosition, colour, [-21, -19, -12, -8, 8, 12, 19, 21], false); break
            case 'b': moves = this.calculateMoves(currentPosition, colour, [-11, -9, 9, 11], true); break
            case 'r': moves = this.calculateMoves(currentPosition, colour, [-10, -1, 1, 10], true); break
            case 'q': moves = this.calculateMoves(currentPosition, colour, [-11, -10, -9, -1, 1, 9, 10, 11], true); break
            case 'f': moves = this.calculateMoves(currentPosition, colour, [-21, -19, -12, -11, -10, -9, -8, -1, 1, 8, 9, 10, 11, 12, 19, 21], false); break
            case 'e': moves = this.calculateEarthMoves(currentPosition, colour); break
            case 'w': moves = this.calculateWaterMoves(currentPosition, colour); break
            case 'a': moves = this.calculateAirMoves(currentPosition, colour); break
            default:moves = []
        }

		return moves.filter((move) => this.doesMoveLeaveKingSafe(currentPosition, move))
	}

	// Get moves for different pieces
	calculateMoves(currentPosition, colour, offsets, sliding) {
		const availableMoves = []
		for (let offset of offsets) {
			let newPosition = currentPosition + offset
			while (Chessboard.isValidIndex(newPosition) && !this.isSquareOccupiedByAlly(newPosition, colour)) {
				availableMoves.push(newPosition)
				if (this.isSquareOccupiedByOpponent(newPosition, colour) || !sliding) break
				newPosition += offset
			}
		}
		return availableMoves
	}

	// Get valid moves for a king including castling
	calculateKingMoves(currentPosition, colour) {
		const moves = this.calculateMoves(currentPosition, colour, [-11, -10, -9, -1, 1, 9, 10, 11], false)
		if (this.canKingCastleKingside(colour)) moves.push(currentPosition + 2)
		if (this.canKingCastleQueenside(colour)) moves.push(currentPosition - 3)
		return moves
	}

	// Get valid moves for a pawn
	calculatePawnMoves(currentPosition, colour) {
		const dir = colour === 'white' ? -1 : 1
		const startRank = colour === 'white' ? 8 : 3
		const offsets = [10 * dir]
		const availableMoves = []

		if (
			Math.floor(currentPosition / 10) === startRank &&
			!this.board.isSquareOccupied(currentPosition + 10 * dir) &&
			!this.board.isSquareOccupied(currentPosition + 20 * dir)
		) {
			offsets.push(20 * dir)
		}

		for (let offset of [9 * dir, 11 * dir]) {
			let newPosition = currentPosition + offset
			if (Chessboard.isValidIndex(newPosition)) {
				if (this.isSquareOccupiedByOpponent(newPosition, colour) || newPosition === this.enPassantIndex) {
					availableMoves.push(newPosition)
				}
			}
		}

		for (let offset of offsets) {
			let newPosition = currentPosition + offset
			if (Chessboard.isValidIndex(newPosition) && !this.board.isSquareOccupied(newPosition)) availableMoves.push(newPosition)
		}
		return availableMoves
	}

	// Calculate moves for Fire Mage
	calculateFireMoves(currentPosition, colour) {
		const knightMoves = [-21, -19, -12, -8, 8, 12, 19, 21]
		const kingMoves = [-11, -10, -9, -1, 1, 9, 10, 11]
		return this.calculateMoves(currentPosition, colour, knightMoves.concat(kingMoves), false)
	}

	// Calculate moves for Water Mage
	calculateWaterMoves(currentPosition, colour) {
		const rookMoves = [-10, -1, 1, 10]
		const specialMoves = [22, 20, 18, 2, -2, -18, -20, -22]
		return this.calculateMoves(currentPosition, colour, rookMoves.concat(specialMoves), false)
	}

	// Calculate moves for Earth Golem
	calculateEarthMoves(currentPosition, colour) {
		const validMoves = []
		const offsets = [-10, -1, 1, 10, -11, -9, 9, 11]
		for (const offset of offsets) {
			let newPosition = currentPosition
			for (let i = 0; i < 3; i++) {
				// Limit to 3 squares
				newPosition += offset
				if (!Chessboard.isValidIndex(newPosition)) break
				if (this.isSquareOccupiedByAlly(newPosition, colour)) break
				validMoves.push(newPosition)
				if (this.isSquareOccupiedByOpponent(newPosition, colour)) break
			}
		}
		return validMoves
	}

	// Calculate moves for Air Spirit
	calculateAirMoves(currentPosition, colour) {
		const bishopMoves = [-11, -9, 9, 11]
		const specialMoves = [22, 20, 18, 2, -2, -18, -20, -22]
		return this.calculateMoves(currentPosition, colour, bishopMoves.concat(specialMoves), false)
	}

	// Get all possible moves of the specified colour
	calculateAllMoves(colour) {
		const allMoves = []
		for (let i = 21; i <= 98; i++) {
			if (this.isSquareOccupiedByAlly(i, colour)) {
				const fromcoord = Chessboard.index120ToCoord(i)
				const piece = this.board.getPieceFromCoord(fromcoord)
				allMoves.push(...this.calculateValidMoves(piece, i).map((move) => [fromcoord, Chessboard.index120ToCoord(move)]))
			}
		}
		return allMoves
	}

	//  Checks if a move leaves the king safe
	doesMoveLeaveKingSafe(from, to) {
		const tempBoard = [...this.board.boardArray120]
		const pieceToMove = tempBoard[from]
		const kingColour = Chessboard.getPieceColour(pieceToMove)

		tempBoard[to] = pieceToMove
		tempBoard[from] = ''

		const tempBoardInstance = new Chessboard(this)
		tempBoardInstance.boardArray120 = tempBoard

		const kingIndex = tempBoardInstance.findKingIndex(kingColour)

		return !tempBoardInstance.isSquareUnderAttack(kingIndex, this.getOpponentColour(kingColour))
	}

	//!-------------- Castling and En Passant --------------

	// Update castling rights based on the move
	updateCastlingRights(fromCoord, piece) {
		const colour = Chessboard.getPieceColour(piece)

		if (piece.toLowerCase() === 'k') {
			this.castlingRights[colour].kingside = false
			this.castlingRights[colour].queenside = false
		} else if (piece.toLowerCase() === 'r') {
			if (fromCoord === 'a1' || fromCoord === 'a8') this.castlingRights[colour].queenside = false
			if (fromCoord === 'h1' || fromCoord === 'h8') this.castlingRights[colour].kingside = false
		}
	}

	// Check if kingside castling is possible
	canKingCastleKingside(colour) {
		const emptySquares = colour === 'white' ? [96, 97] : [26, 27]
		const rookPiece = this.board.getPieceFromCoord(Chessboard.index120ToCoord(colour === 'white' ? 98 : 28))

		return (
			this.castlingRights[colour].kingside &&
			this.board.areSquaresEmpty(emptySquares) &&
			!this.areSquaresUnderAttack(emptySquares, colour) &&
			rookPiece &&
			rookPiece.toLowerCase() === 'r' &&
			Chessboard.getPieceColour(rookPiece) === colour
		)
	}

	// Check if queenside castling is possible
	canKingCastleQueenside(colour) {
		const emptySquares = colour === 'white' ? [94, 93, 92] : [24, 23, 22]
		const rookPiece = this.board.getPieceFromCoord(Chessboard.index120ToCoord(colour === 'white' ? 91 : 21))

		return (
			this.castlingRights[colour].queenside &&
			this.board.areSquaresEmpty(emptySquares) &&
			!this.areSquaresUnderAttack(emptySquares, colour) &&
			rookPiece &&
			rookPiece.toLowerCase() === 'r' &&
			Chessboard.getPieceColour(rookPiece) === colour
		)
	}

	// Update en passant index based on move
	updateEnPassantIndex(fromCoord, toCoord, piece) {
		this.enPassantIndex = null
		if (piece && piece.toLowerCase() === 'p') {
			const fromSquareIndex = Chessboard.coordToIndex120(fromCoord)
			const toSquareIndex = Chessboard.coordToIndex120(toCoord)
			if (Math.abs(toSquareIndex - fromSquareIndex) === 20) {
				this.enPassantIndex = (fromSquareIndex + toSquareIndex) / 2
			}
		}
	}

	//!-------------- Game Status and Utility --------------

	// Check if the king of the given colour is in check
	isKingInCheck(colour) {
		return this.board.isSquareUnderAttack(this.board.findKingIndex(colour), this.getOpponentColour(colour))
	}

	// Check if the king of the given colour is in checkmate
	isKingCheckmated(colour) {
		if (!this.isKingInCheck(colour)) return false
		for (let i = 21; i <= 98; i++) {
			if (this.isSquareOccupiedByAlly(i, colour)) {
				const piece = this.board.getPieceFromCoord(Chessboard.index120ToCoord(i))
				if (this.calculateValidMoves(piece, i).length > 0) return false
			}
		}
		return true
	}

	// Get opponent colour
	getOpponentColour(colour) {
		return colour === 'white' ? 'black' : 'white'
	}

	// Get captured piece at the destination square
	retrieveCapturedPiece(toCoord) {
		const pieceAtDestination = this.board.getPieceFromCoord(toCoord)
		return pieceAtDestination ? pieceAtDestination : null
	}

	// Convert move to a description (eg. P from d2 to d4)
	convertMoveToString(move) {
		let moveString = `${move.piece} from ${move.fromCoord} to ${move.toCoord}`
		if (move.capturedPiece) moveString += `, capturing ${move.capturedPiece}`
		return moveString
	}

	// Print move history
	displayMoveHistory() {
		if (this.moveHistory.length === 0) {
			return 'No moves have been made yet.'
		} else {
			return this.moveHistory.map((move, index) => `${index + 1}. ${this.convertMoveToString(move)}`).join('\n')
		}
	}

	//!-------------- Helpers --------------
	isSquareOccupiedByAlly(idx, colour) {
		const p = this.board.boardArray120[idx]
		return p && Chessboard.getPieceColour(p) === colour
	}

	isSquareOccupiedByOpponent(idx, colour) {
		const p = this.board.boardArray120[idx]
		return p && Chessboard.getPieceColour(p) !== colour
	}

	// Check if the clicked square contains the current player's piece
	isActivePlayersPiece(square) {
		const piece = square.querySelector('.piece')
		return piece && piece.classList.contains(this.activePlayer)
	}

	// Checks if a move is en passant
	isEnPassantMove(toCoord, piece) {
		return Chessboard.coordToIndex120(toCoord) === this.enPassantIndex && piece.toLowerCase() === 'p'
	}

	// Checks if a move is castling
	isCastleMove(fromCoord, toCoord, piece) {
		if (piece.toLowerCase() !== 'k') return false
		const moveDistance = Math.abs(Chessboard.coordToIndex120(fromCoord) - Chessboard.coordToIndex120(toCoord))
		return moveDistance === 2 || moveDistance === 3
	}

	// Checks if a move is a pawn promotion
	isPawnPromotion(piece, toCoord) {
		return piece.toLowerCase() === 'p' && (toCoord[1] === '1' || toCoord[1] === '8')
	}

	// Check if the given squares are under attack
	areSquaresUnderAttack(indices, colour) {
		return indices.some((index) => this.board.isSquareUnderAttack(index, this.getOpponentColour(colour)))
	}
}
