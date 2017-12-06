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
    }

    addAneighbour(neighbour) {
        this._neighbours.push(neighbour);
    }

    calcNextGenerationState() {
        this._nextGenerationState = this._policy(this._state, this._neighbours.filter(n=>n._state === cellState.Live).length);
    }

    switchGenerations() {
        this._state = this._nextGenerationState
    }

    get state() {
        return this._state;
    }
}

GameOfLife.Board = class Board {
    constructor(sizeX, sizeY)    {
        this._sizeX = sizeX;
        this._sizeY = sizeY;
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

    neighboursVisitor(x, y, action) {
        for (let ry = -1; ry <= 1; ++ry) {
            for (let rx = -1; rx <= 1; ++rx) {
                action(x + rx, y + ry);
            }
        }
    }

    initiate(cellFactory) {
        this.boardVisitor((x,y)=> { 
            let newCell = cellFactory(x, y);
            this._cells[x][y] = newCell;

            this.neighboursVisitor(x,y, (nx,ny)=> {
                if (this._cells[nx] && this._cells[nx][ny]) { //if cell has been defined update the neighbour array
                    (this._cells[nx][ny]).addAneighbour(newCell);
                    newCell.addAneighbour(this._cells[nx][ny]);
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

      static defaultRules(state, nLiveCells) {
        let result = state === cellState.NotActive ? cellState.NotActive : //Not active state stays no active
         state === cellState.Live && (nLiveCells < 2 || nLiveCells > 3) ? cellState.Dead :  //Any live cell with fewer than two live neighbours dies, Any live cell with more than three live neighbours dies
         state === cellState.Dead && nLiveCells === 3 ? cellState.Live : //Any dead cell with exactly three live neighbours becomes a live cell
         state; //Any live cell with two or three live neighbours lives, Any dead cell with non three live neighbours stays dead

         return result;
      }

      createDiamondBoard(sizeX, sizeY, seedFactor) {
        let size = sizeX; //in the case of diamond we take only one value
        let board = new GameOfLife.Board(size, size);
        board.initiate((x,y) => new GameOfLife.Cell(GameOfLife.BoardFactory.defaultRules, ( y < size/2 && ( x < (size/2 - 1 - y) || x > (size/2 + y) ) || 
                                                                       ( y > size/2 && ( x < (y - size/2) || x > (size/2 + (size - y) - 1)))) ? cellState.NotActive : Math.random() < seedFactor ? cellState.Live : cellState.Dead));
        return board;
      }

      createRectangularBoard(sizeX, sizeY, seedFactor) {
        let board = new GameOfLife.Board(sizeX, sizeY);
        board.initiate((x,y) =>  new GameOfLife.Cell(GameOfLife.BoardFactory.defaultRules, Math.random() < seedFactor ? cellState.Live : cellState.Dead));
        return board;
      }

      createCrossBoard(sizeX, sizeY, seedFactor) {
        let board = new GameOfLife.Board(sizeX, sizeY);
        board.initiate((x,y) =>  new GameOfLife.Cell(GameOfLife.BoardFactory.defaultRules, (x < 3 || x > sizeX - 3) && (y < 3 || y > sizeY - 3) ? cellState.NotActive : Math.random() < seedFactor ? cellState.Live : cellState.Dead));
        return board;
      }

      getBoardBuilders() {
          return [
                    {"name" : "Rectengular", "factory" : this.createRectangularBoard},
                    {"name" : "Diamond", "factory" : this.createDiamondBoard},
                    {"name" : "Cross", "factory" : this.createCrossBoard}
          ];
        }  
}
