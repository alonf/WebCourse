"use strict";

const cellStateColorMap = ["#000000", "#0000FF", "#FFFFFF" ];
const boardSizes = [6, 8, 10, 15, 20, 30, 50];
const boardSeedFactors = [{"name":"Low", "seed":0.1}, {"name":"Medium", "seed":0.3}, {"name":"Large", "seed":0.5}];
const updateRate = 500;

var GameOfLife = GameOfLife || {}

let _controllerInstance = null;
GameOfLife.Controller = class Controller {
    constructor() {
        if(!_controllerInstance){
            _controllerInstance = this;
        }

        this._boardFactory = new GameOfLife.BoardFactory();

        return _controllerInstance;
      }

    populateBoardShapeSelection() {
        let boardShapeOptions = "";
        
        this._boardFactory.getBoardBuilders().map((shapeBuilder, index) => {
            boardShapeOptions += `<option value="${index}">${shapeBuilder.name}</option>`
        });
        $('#boardShape').append(boardShapeOptions);
    }

    populateBoardSizeSelection() {
        let boardSizeOptions = "";
        
        boardSizes.map((size) => {
            boardSizeOptions += `<option value="${size}">${size} X ${size}</option>`
        });
        $('#boardSize').append(boardSizeOptions);
    }

    populateBoardSeedSelection() {
        let boardSeedOptions = "";
        
        boardSeedFactors.map((seedFactor) => {
            boardSeedOptions += `<option value="${seedFactor.seed}">${seedFactor.name}</option>`
        });
        $('#seedFactor').append(boardSeedOptions);
    }

    bindStartButton() {
        $("#startButton").click(()=>{this.restartGame();});
    }

    drawBoard() {
        for (let y = 0; y < this._boardSize; ++y) {
            for (let x = 0; x < this._boardSize; ++x) {
                this._boardPainter.drawCell(x, y, cellStateColorMap[this._board.getCellState(x,y)]);
            }
        }
    }

    nextGeneration() {
        this._board.generateNextGeneration();
        this.drawBoard();
        this._timer = setTimeout(()=>this.nextGeneration(), updateRate);
    }

    restartGame() {
        let boardFactoryIndex = $('#boardShape').val();
        let factories = this._boardFactory.getBoardBuilders();
        let factoryEntry = factories[boardFactoryIndex];
        let seedFactor = parseFloat($('#seedFactor').val());

        this._boardSize = parseInt($('#boardSize').val());
        this._board = factoryEntry.factory(this._boardSize, this._boardSize, seedFactor);

        let canvas = $('#gameBoard').get(0);
        this._boardPainter = new GameOfLife.BoardPainter(this._boardSize, this._boardSize, canvas);
        this._boardPainter.drawGrid(this._boardSize, this._boardSize, canvas);
        this.drawBoard();

        if (this._timer)
            clearTimeout(this._timer);
        
        this._timer = setTimeout(()=>this.nextGeneration(), updateRate);
    }

    initControls() {
        this.populateBoardShapeSelection();
        this.populateBoardSizeSelection();
        this.populateBoardSeedSelection();
        this.bindStartButton();
    }

}