"use strict";

const cellStateColorMap = ["#000000", "#0000FF", "#FFFFFF" ];
const customCellColor = "#FF00FF";

const boardSizes = [6, 8, 10, 15, 20, 30, 50, 75, 100];
const defaultBoardSize = 10;

const boardSeedFactors = [{"name":"Low", "seed":0.1, "isDefault":false}, {"name":"Medium", "seed":0.3, "isDefault":true}, 
                          {"name":"Large", "seed":0.5, "isDefault":false}];

const updateFrequencyFactors = [{"name":"Stop", "delay":860000, "isDefault":false}, {"name":"Very Slow", "delay":2000, "isDefault":false}, 
                                {"name":"Slow", "delay":1000, "isDefault":false}, {"name":"Normal", "delay":500, "isDefault":true},
                                {"name":"Fast", "delay":200, "isDefault":false},  {"name":"Very Fast", "delay":0, "isDefault":false}];


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
            let setDefault = size === defaultBoardSize ? 'selected="selected"' : '';
            boardSizeOptions += `<option value="${size}" ${setDefault}>${size} X ${size}</option>`
        });
        $('#boardSize').append(boardSizeOptions);
    }

    populateBoardSeedSelection() {
        let boardSeedOptions = "";
        
        boardSeedFactors.map((seedFactor) => {
            let setDefault = seedFactor.isDefault ? 'selected="selected"' : '';
            boardSeedOptions += `<option value="${seedFactor.seed}" ${setDefault}>${seedFactor.name}</option>`
        });
        $('#seedFactor').append(boardSeedOptions);
    }

    populateUpdateFrequencyFactorSelection() {
        let updateFrequencyFactor = "";
        
        updateFrequencyFactors.map((frequencyFactor) => {
            let setDefault = frequencyFactor.isDefault ? 'selected="selected"' : '';
            updateFrequencyFactor += `<option value="${frequencyFactor.delay}" ${setDefault}>${frequencyFactor.name}</option>`
        });
        $('#updateFrequencyFactor').append(updateFrequencyFactor);
        $('#updateFrequencyFactor').on('change', ()=> {
            this._board && (this._board.delay = parseInt($('#updateFrequencyFactor').val()));
            this.setBoardTimer();
        });
    }

    populateBoardPolicySelection() {
        let boardPolicyOptions = "";
        
        this._boardFactory.getBoardPolicies().map((boardPolicy, index) => {
            boardPolicyOptions += `<option value="${index}">${boardPolicy.name}</option>`
        });
        $('#boardPolicy').append(boardPolicyOptions);
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
        this.setBoardTimer();
    }

    setBoardTimer() {
        if (this._timer)
        clearTimeout(this._timer);
    
        this._timer = setTimeout(()=>this.nextGeneration(), this._board.delay);
    }

    restartGame() {
        let boardFactoryIndex = $('#boardShape').val();
        let factories = this._boardFactory.getBoardBuilders();
        let factoryEntry = factories[boardFactoryIndex];

        let boardPolicyIndex = $('#boardPolicy').val();
        let policies = this._boardFactory.getBoardPolicies();
        let policy = policies[boardPolicyIndex].policy;

        let seedFactor = parseFloat($('#seedFactor').val());
        let delay = parseInt($('#updateFrequencyFactor').val());
        

        this._boardSize = parseInt($('#boardSize').val());
        this._board = factoryEntry.factory(this._boardSize, this._boardSize, seedFactor, policy);
        this._board.delay = delay;

        let canvas = $('#gameBoard').get(0);
        this._boardPainter = new GameOfLife.BoardPainter(this._boardSize, this._boardSize, canvas);
        this._boardPainter.drawGrid(this._boardSize, this._boardSize, canvas);
        this.drawBoard();
        $('#gameBoard').click(e=> {
            let mouseX = e.pageX - canvas.offsetLeft;
            let mouseY = e.pageY - canvas.offsetTop;
            let cellSizeX = canvas.width / this._boardSize;
            let cellSizeY = canvas.height / this._boardSize;
            let x =  Math.floor(mouseX / cellSizeX);
            let y =  Math.floor(mouseY /cellSizeY);
            this._board.toggleCellState(x , y);
            if (this._board.getCellState(x,y) != cellState.NotActive)
                this._boardPainter.drawCell(x, y, customCellColor);
        })

        this.setBoardTimer();
    }

    initControls() {
        this.populateBoardShapeSelection();
        this.populateBoardSizeSelection();
        this.populateBoardSeedSelection();
        this.populateUpdateFrequencyFactorSelection();
        this.populateBoardPolicySelection();
        this.bindStartButton();
    }

}