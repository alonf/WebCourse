"use strict";

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
        let outerRadius = sizeX / 2.0; //in the case of a ring we take only one value
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
                {"name" : "Conway", "policy" : GameOfLife.BoardPolicies.conway},
                {"name" : "Hyperactive ", "policy" : GameOfLife.BoardPolicies.hyperactive},
                {"name" : "High Life", "policy" : GameOfLife.BoardPolicies.highLife},
                {"name" : "Spontaneous", "policy" : GameOfLife.BoardPolicies.spontaneous}
      ];
    }
}
