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

    AddAneighbour(neighbour) {
        this._neighbours.push(neighbour);
    }

    CalcNextGenerationState() {
        this._nextGenerationState = this._policy(this._state, this._neighbours.filter(n=>n._state === cellState.Live).length);
    }

    SwitchGenerations() {
        this._state = this._nextGenerationState
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

    BoardVisitor(action) {
        for (let y = 0; y < this._sizeY; ++y) {
            for (let x = 0; x < this._sizeX; ++x) {
                action(x,y);
            }
        }
    }

    NeighboursVisitor(x, y, action) {
        for (let ry = -1; ry <= 1; ++ry) {
            for (let rx = -1; rx <= 1; ++rx) {
                action(x + rx, y + ry);
            }
        }
    }

    Initiate(cellFactory) {
        this.BoardVisitor((x,y)=> { 
            let newCell = cellFactory(x, y);
            this._cells[x][y] = newCell;

            this.NeighboursVisitor(x,y, (nx,ny)=> {
                if (this._cells[nx] && this._cells[nx][ny]) { //if cell has been defined update the neighbour array
                    (this._cells[nx][ny]).AddAneighbour(newCell);
                    newCell.AddAneighbour(this._cells[nx][ny]);
                }
            });
        });
    }

    GenerateNextGeneration() {
        this.BoardVisitor((x,y) => this._cells[x][y].CalcNextGenerationState());
        this.BoardVisitor((x,y) => this._cells[x][y].SwitchGenerations());
    }


    DebugDumpBoard()  {
        function DebugShape(cell) {
            switch(cell._state) {
                case cellState.NotActive:
                    return 'O';
    
                case cellState.Live:
                    return 'X';
                
                case cellState.Dead:
                    return ' ';
            }
            return ' ';
        };

        for (let y = 0; y < this._sizeY; ++y) {
            let line = "";
            for (let x = 0; x < this._sizeX; ++x) {
               line += DebugShape(this._cells[x][y]);
            }
            console.log(line);
        }
        console.log();
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

      DefaultRules(state, nLiveCells) {
        let result = state === cellState.NotActive ? cellState.NotActive : //Not active state stays no active
         state === cellState.Live && (nLiveCells < 2 || nLiveCells > 3) ? cellState.Dead :  //Any live cell with fewer than two live neighbours dies, Any live cell with more than three live neighbours dies
         state === cellState.Dead && nLiveCells === 3 ? cellState.Live : //Any dead cell with exactly three live neighbours becomes a live cell
         state; //Any live cell with two or three live neighbours lives, Any dead cell with non three live neighbours stays dead

         return result;
      }

      CreateDiamondBoard(size) {
        let board = new GameOfLife.Board(size, size);
        board.Initiate((x,y) => new GameOfLife.Cell(this.DefaultRules, ( y < size/2 && ( x < (size/2 - 1 - y) || x > (size/2 + y) ) || 
                                                                       ( y > size/2 && ( x < (y - size/2) || x > (size/2 + (size - y) - 1)))) ? cellState.NotActive : Math.random() > 0.5 ? cellState.Live : cellState.Dead));
        return board;
      }

      CreateRectangularBoard(sizeX, sizeY) {
        let board = new GameOfLife.Board(sizeX, sizeY);
        board.Initiate((x,y) =>  new GameOfLife.Cell(this.DefaultRules, Math.random() > 0.5 ? cellState.Live : cellState.Dead));
        return board;
      }

      CreateCrossBoard() {
        let board = new GameOfLife.Board(8, 8);
        board.Initiate((x,y) =>  new GameOfLife.Cell(this.DefaultRules, (x < 3 || x > 4) && (y < 3 || y > 4) ? cellState.NotActive : Math.random() > 0.5 ? cellState.Live : cellState.Dead));
        return board;
      }
      
}
