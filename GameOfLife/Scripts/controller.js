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
            boardShapeOptions += `<option value="${index}">${shapeBuilder.Name}</option>`
        });
        $('#boardShape').append(boardShapeOptions);
    }
}