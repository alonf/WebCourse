"use strict";

GameOfLife.BoardPolicies = class BoardPolicies {

    static defaultRules(state, nLiveCells) {
        let result = state === cellState.NotActive
            ? cellState.NotActive
            : //Not active state stays no active
            state === cellState.Live && (nLiveCells < 2 || nLiveCells > 3)
                ? cellState.Dead
                : //Any live cell with fewer than two live neighbours dies, Any live cell with more than three live neighbours dies
                state === cellState.Dead && nLiveCells === 3
                    ? cellState.Live
                    : //Any dead cell with exactly three live neighbours becomes a live cell
                    state; //Any live cell with two or three live neighbours lives, Any dead cell with non three live neighbours stays dead

        return result;
    }

    static fertile(state, nLiveCells) {
        let result = state === cellState.NotActive
            ? cellState.NotActive
            : //Not active state stays no active
            state === cellState.Live && (nLiveCells < 2 || nLiveCells > 5)
                ? cellState.Dead
                : //Any live cell with fewer than two live neighbours dies, Any live cell with more than five live neighbours dies
                state === cellState.Dead && nLiveCells === 3
                    ? cellState.Live
                    : //Any dead cell with exactly three live neighbours becomes a live cell
                    state; //Any live cell with two or three live neighbours lives, Any dead cell with non three live neighbours stays dead

        return result;
    }

    static highLife(state, nLiveCells) { //http://kaytdek.trevorshp.com/projects/computer/neuralNetworks/gameOfLife2.htm
        let result = state === cellState.NotActive
            ? cellState.NotActive
            : //Not active state stays no active
            state === cellState.Live && (nLiveCells < 2 || nLiveCells > 3)
                ? cellState.Dead
                : //Any live cell with fewer than two live neighbours dies, Any live cell with more than three live neighbours dies
                state === cellState.Dead && (nLiveCells === 3 || nLiveCells === 6)
                    ? cellState.Live
                    : //Any dead cell with exactly three live neighbours becomes a live cell
                    state; //Any live cell with two or three live neighbours lives, Any dead cell with non three live neighbours stays dead

        return result;
    }
}
