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
        this._delay = 500; //default delay
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

    set delay(val) {
        this._delay = val;
    }
    get delay() {
        return this._delay;
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

let _boardFactoryinstance = null;

GameOfLife.BoardFactory = class BoardFactory {

    constructor() {
        if(!_boardFactoryinstance){
            _boardFactoryinstance = this;
        }

        return _boardFactoryinstance;
      }

      createDiamondBoard(sizeX, sizeY, seedFactor, policy, isActiveCellAlive) {
        let size = sizeX; //in the case of diamond we take only one value
        let board = new GameOfLife.Board(size, size, isActiveCellAlive);
        board.initiate((x,y) => new GameOfLife.Cell(policy, ( y < size/2 && ( x < (size/2 - 1 - y) || x > (size/2 + y) ) || 
                                                                       ( y > size/2 && ( x < (y - size/2) || x > (size/2 + (size - y) - 1)))) ? cellState.NotActive : Math.random() < seedFactor ? cellState.Live : cellState.Dead));
        return board;
      }

      createRectangularBoard(sizeX, sizeY, seedFactor, policy, isActiveCellAlive) {
        let board = new GameOfLife.Board(sizeX, sizeY, isActiveCellAlive);
        board.initiate((x,y) =>  new GameOfLife.Cell(policy, Math.random() < seedFactor ? cellState.Live : cellState.Dead));
        return board;
      }

      createCrossBoard(sizeX, sizeY, seedFactor, policy, isActiveCellAlive) {
        let crossSizeX = sizeX / 3;
        let crossSizeY = sizeY / 3;
        let board = new GameOfLife.Board(sizeX, sizeY, isActiveCellAlive);
        board.initiate((x,y) =>  new GameOfLife.Cell(policy, (x < crossSizeX || x > sizeX - crossSizeX - 1) && (y < crossSizeY || y > sizeY - crossSizeY - 1) ? cellState.NotActive : Math.random() < seedFactor ? cellState.Live : cellState.Dead));
        return board;
      }

      createCircularBoard(sizeX, sizeY, seedFactor, policy, isActiveCellAlive) {
        let radius = sizeX / 2.0; //in the case of a circle we take only one value
        let center = radius - 0.5;
        let board = new GameOfLife.Board(sizeX, sizeY, isActiveCellAlive);
        board.initiate((x,y) =>  new GameOfLife.Cell(policy, (Math.pow(x - center, 2) + Math.pow(y - center, 2) > Math.pow(radius, 2)) ? cellState.NotActive : Math.random() < seedFactor ? cellState.Live : cellState.Dead));
        return board;
      }

      createRingBoard(sizeX, sizeY, seedFactor, policy, isActiveCellAlive) {
        let outerRadius = sizeX / 2.0; //in the case of a circle we take only one value
        let center = outerRadius - 0.5;
        let innerRadius = sizeX / 3.0;
        let board = new GameOfLife.Board(sizeX, sizeY, isActiveCellAlive);
        board.initiate((x,y) =>  new GameOfLife.Cell(policy, 
            (Math.pow(x - center, 2) + Math.pow(y - center, 2) > Math.pow(outerRadius, 2)) ||
            (Math.pow(x - center, 2) + Math.pow(y - center, 2) < Math.pow(innerRadius, 2))
             ? cellState.NotActive : Math.random() < seedFactor ? cellState.Live : cellState.Dead));
        return board;
      }

      getBoardBuilders() {
          return [
                    {"name" : "Rectengular", "factory" : this.createRectangularBoard},
                    {"name" : "Diamond", "factory" : this.createDiamondBoard},
                    {"name" : "Cross", "factory" : this.createCrossBoard},
                    {"name" : "Circular", "factory" : this.createCircularBoard},
                    {"name" : "Ring", "factory" : this.createRingBoard}
          ];
        }  

        getBoardPolicies() {
            return [
                {"name" : "Conway", "policy" : GameOfLife.BoardPolicies.defaultRules},
                {"name" : "Fertile ", "policy" : GameOfLife.BoardPolicies.fertile},
                {"name" : "High Life", "policy" : GameOfLife.BoardPolicies.highLife}
      ];
        }
}
