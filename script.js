class Board {
    constructor() {
        this.size = 4;
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.bestScore = localStorage.getItem('2048-best') || 0;
        this.init();
    }

    init() {
        this.addRandomTile();
        this.addRandomTile();
        this.draw();
    }

    createEmptyGrid() {
        return Array(this.size).fill(0).map(() => Array(this.size).fill(0));
    }

    reset() {
        this.grid = this.createEmptyGrid();
        this.score = 0;
        document.getElementById('game-over').classList.add('hidden');
        this.init();
    }

    addRandomTile() {
        let options = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) options.push({ x: i, y: j });
            }
        }
        if (options.length > 0) {
            let spot = options[Math.floor(Math.random() * options.length)];
            this.grid[spot.x][spot.y] = Math.random() > 0.1 ? 2 : 4;
        }
    }

    draw() {
        const boardElement = document.getElementById('game-board');
        const scoreElement = document.getElementById('score');
        const bestElement = document.getElementById('best');
        if (!boardElement) return;

        boardElement.innerHTML = '';
        scoreElement.textContent = this.score;
        bestElement.textContent = this.bestScore;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];
                const tile = document.createElement('div');
                tile.classList.add('tile');
                if (value > 0) {
                    tile.textContent = value;
                    tile.classList.add(`tile-${value}`);
                    if (value > 2048) tile.classList.add('tile-super');
                }
                boardElement.appendChild(tile);
            }
        }
    }

    canMove() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) return true;
                if (j < this.size - 1 && this.grid[i][j] === this.grid[i][j + 1]) return true;
                if (i < this.size - 1 && this.grid[i][j] === this.grid[i + 1][j]) return true;
            }
        }
        return false;
    }

    slide(row) {
        let arr = row.filter(val => val !== 0);
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                this.score += arr[i];
                arr[i + 1] = 0;
            }
        }
        arr = arr.filter(val => val !== 0);
        while (arr.length < this.size) arr.push(0);
        return arr;
    }

    moveLeft() {
        let changed = false;
        for (let i = 0; i < this.size; i++) {
            let oldRow = [...this.grid[i]];
            this.grid[i] = this.slide(this.grid[i]);
            if (JSON.stringify(oldRow) !== JSON.stringify(this.grid[i])) changed = true;
        }
        if (changed) this.afterAction();
    }

    moveRight() {
        let changed = false;
        for (let i = 0; i < this.size; i++) {
            let oldRow = [...this.grid[i]];
            let row = [...this.grid[i]].reverse();
            row = this.slide(row);
            this.grid[i] = row.reverse();
            if (JSON.stringify(oldRow) !== JSON.stringify(this.grid[i])) changed = true;
        }
        if (changed) this.afterAction();
    }

    moveUp() {
        let changed = false;
        for (let j = 0; j < this.size; j++) {
            let oldCol = [this.grid[0][j], this.grid[1][j], this.grid[2][j], this.grid[3][j]];
            let column = this.slide(oldCol);
            for (let i = 0; i < this.size; i++) {
                this.grid[i][j] = column[i];
            }
            if (JSON.stringify(oldCol) !== JSON.stringify(column)) changed = true;
        }
        if (changed) this.afterAction();
    }

    moveDown() {
        let changed = false;
        for (let j = 0; j < this.size; j++) {
            let oldCol = [this.grid[0][j], this.grid[1][j], this.grid[2][j], this.grid[3][j]];
            let column = [...oldCol].reverse();
            column = this.slide(column);
            column.reverse();
            for (let i = 0; i < this.size; i++) {
                this.grid[i][j] = column[i];
            }
            if (JSON.stringify(oldCol) !== JSON.stringify(column)) changed = true;
        }
        if (changed) this.afterAction();
    }

    afterAction() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('2048-best', this.bestScore);
        }
        this.addRandomTile();
        this.draw();

        if (!this.canMove()) {
            document.getElementById('final-score').textContent = this.score;
            document.getElementById('game-over').classList.remove('hidden');
        }
    }
}

const myGame = new Board();

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowLeft': myGame.moveLeft(); break;
        case 'ArrowRight': myGame.moveRight(); break;
        case 'ArrowUp': myGame.moveUp(); break;
        case 'ArrowDown': myGame.moveDown(); break;
    }
});

document.getElementById('reset-button').addEventListener('click', () => myGame.reset());
document.getElementById('try-again-button').addEventListener('click', () => myGame.reset());