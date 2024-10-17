# Elemental Chess

Welcome to Elemental Chess, a dynamic and innovative variant of the classic game of chess! Elemental Chess introduces new pieces alongside the standard chess pieces, enhancing strategic depth and player engagement. This project aims to reimagine traditional chess, providing a thrilling gaming experience for players of all skill levels.

## New Pieces and Their Abilities

1. **Fire Mage**:

    - Moves like a knight but can also move one square in any direction.

2. **Water Mage**:

    - Moves like a rook but can also move two squares in any direction.

3. **Earth Golem**:

    - Moves like a queen but can only move up to three squares in any direction.

4. **Air Spirit**:

    - Moves like a bishop but can also move two squares in any direction.

## Setup

-   The new pieces are placed in specific positions, while the rest of the board is set up as in standard chess.
-   Positions:
    -   Fire Mage on b1 (White) and b8 (Black)
    -   Water Mage on h1 (White) and h8 (Black)
    -   Earth Golem on d1 (White) and d8 (Black)
    -   Air Spirit on f1 (White) and f8 (Black)

## Rules

1. **Piece Movement and Capture**:

    - Standard pieces (king, queen, rook, bishop, knight, and pawns) move and capture as usual.
    - New pieces move and capture according to their descriptions above.

2. **Check and Checkmate**:

    - Check and checkmate rules remain the same as in standard chess.
    - Special abilities can be used to escape check if applicable (e.g., Air Spirit teleporting).

3. **Pawn Promotion**:

    - In addition to promoting to a queen, rook, bishop, or knight, pawns can also promote to any of the new pieces (Fire Mage, Water Mage, Earth Golem, Air Spirit).

## Setup Guide

To start playing Elemental Chess, follow these simple steps:

1. Clone the repository to your local machine:

    ```bash
    git clone https://github.com/1Brandon1/Elemental-Chess.git
    ```

2. Navigate to the project directory:

    ```bash
    cd Elemental-Chess
    ```

3. Install Node.js dependencies using npm:

    ```bash
    npm install
    ```

4. Start the local server using Express.js:

    ```bash
    npm start
    ```

5. Open your web browser and navigate to `http://localhost:3000` to launch the game.

6. Enjoy playing Elemental Chess with your friends or against the computer!
