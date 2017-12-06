"use strict";


GameOfLife.BoardPainter = class BoardPainter {
    constructor(sizeX, sizeY, canvas) {
        this._sizeX = sizeX;
        this._sizeY = sizeY;
        this._canvas = canvas;
        this._cellWidth = (canvas.width - sizeX - 1)/sizeX;
        this._cellHeight = (canvas.height - sizeY - 1)/sizeY;
    }

    drawGrid() {
        let ctx = this._canvas.getContext('2d');
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 160 ,160, 1)";
        ctx.beginPath();

        for (let y = 0; y <= this._canvas.height; y += this._cellHeight + 1)
        {
            ctx.moveTo(y, 0);
            ctx.lineTo(y, this._canvas.width);
        }

        for (let x = 0; x <= this._canvas.width; x += this._cellWidth + 1)
        {
            ctx.moveTo(0, x);
            ctx.lineTo(this._canvas.height, x);
        }

        ctx.stroke();
    }

    drawCell(x, y, color) {
        let ctx = this._canvas.getContext('2d');
        ctx.fillStyle = color;

        let topX = x * this._cellWidth + x + 2;        
        let topY = y * this._cellHeight + y + 2;
        
        ctx.fillRect(topX, topY, this._cellWidth - 3, this._cellHeight - 3);
    }

    drawBoard(board) {
        for (let y = 0; y < this._sizeY; ++y) {
            for (let x = 0; x < this._sizeX; ++x) {
                drawCell(x, y, board[x][y]);
            }
        }
    }
}