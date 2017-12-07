"use strict";

var GameOfLife = GameOfLife || {}

const cellState = {
    NotActive : 0,
    Live : 1,
    Dead : 2
};


GameOfLife.Cell = class Cell {
    constructor(policy, initialState = cellState.Dead) {
        this._neighbours = new Array();
        this._policy = policy;
        this._state = initialState;
        this._nextGenerationState = initialState;
        this._isNotActiveCellAlive = false;
    }

    addAneighbour(neighbour) {
        this._neighbours.push(neighbour);
    }

    calcNextGenerationState() {
        this._nextGenerationState = this._policy(this._state, this._neighbours.filter(n=> this._isNotActiveCellAlive ? n._state != cellState.Dead : n._state === cellState.Live).length);
    }



    switchGenerations() {
        this._state = this._nextGenerationState
    }

    get state() {
        return this._state;
    }

    toggleState() {
        if (this._state != cellState.NotActive) {
            this._state = this._state === cellState.Live ? cellState.Dead : cellState.Live;
            this._nextGenerationState =  this._state;
        }
    }

    set isNotActiveCellAlive(val) {
        this._isNotActiveCellAlive = val;
    }
    get isNotActiveCellAlive() {
        return this._isNotActiveCellAlive;
    }
}

GameOfLife.Board = class Board {
    constructor(sizeX, sizeY, isNotActiveCellAlive)    {
        this._sizeX = sizeX;
        this._sizeY = sizeY;
        this._isNotActiveCellAlive = isNotActiveCellAlive;
        this._cells = new Array(sizeX);
        this._delay = 500; //default delay

        for (let y = 0; y < sizeY; ++y)
            this._cells[y] = new Array(sizeX);
    }

    boardVisitor(action) {
        for (let y = 0; y < this._sizeY; ++y) {
            for (let x = 0; x < this._sizeX; ++x) {
                action(x,y);
            }
        }
    }

    getCellState(x, y) {
        return (this._cells[x][y]).state;
    }

    toggleCellState(x, y) {
        if (this._cells[x] && this._cells[x][y] && this._cells[x][y]) {
            this._cells[x][y].toggleState();
        }
    }

    neighboursVisitor(x, y, action) {
        for (let ry = -1; ry <= 1; ++ry) {
            for (let rx = -1; rx <= 1; ++rx) {
                if (rx === 0 && ry === 0) //don't include self cell
                    continue;

                action(x + rx, y + ry);
            }
        }
    }

    set delay(val) {
        this._delay = val;
    }
    get delay() {
        return this._delay;
    }

    initiate(cellFactory) {
            this.boardVisitor((x,y)=> { 
            this._cells[x][y] = cellFactory(x, y);
            this._cells[x][y].isNotActiveCellAlive = this._isNotActiveCellAlive;
        });

        //update neigbours arrays
        this.boardVisitor((x,y)=> { 
            this.neighboursVisitor(x,y, (nx,ny)=> {
                if (this._cells[nx] && this._cells[nx][ny]) { //if the neigbour cell is defined, update the neighbour array
                    (this._cells[x][y]).addAneighbour(this._cells[nx][ny]);
                }
            });
        });
    }

    generateNextGeneration() {
        this.boardVisitor((x,y) => this._cells[x][y].calcNextGenerationState());
        this.boardVisitor((x,y) => this._cells[x][y].switchGenerations());
    }
}
