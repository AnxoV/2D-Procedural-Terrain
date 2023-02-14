import {Vector} from "./Vector.js";

export class Entity {
    constructor(position) {
        this.position = position;
    }
}

Entity.prototype.moveTo = function(newPosition) {
    this.position = newPosition;
};

Entity.prototype.moveBy = function(force) {
    this.moveTo(this.position.add(force));
};

export class Player extends Entity {
    constructor() {
        super();
        this.moveTo(Vector.from(
            Math.floor(App.DISPLAY.TILE_SIZE/2),
            Math.floor(App.DISPLAY.TILE_SIZE/2)
        ));
        this.velocity = 1;
    }
}

Player.size = { w: 1, h: 1 };

Player.prototype.draw = function(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(
        App.DISPLAY.RESOLUTION.w/2 - App.DISPLAY.TILE_SIZE/2,
        App.DISPLAY.RESOLUTION.h/2 - App.DISPLAY.TILE_SIZE/2,
        Player.size.w * App.DISPLAY.TILE_SIZE,
        Player.size.h * App.DISPLAY.TILE_SIZE
    );
};