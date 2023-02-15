import {Vector} from "./Vector.js";

export class Entity {
    constructor(position, material, size) {
        this.position = position;
        this.material = material;
        this.size = size;
    }
}

Entity.prototype.moveTo = function(newPosition) {
    this.position = newPosition;
};

Entity.prototype.moveBy = function(force) {
    this.moveTo(this.position.add(force));
};

Entity.prototype.draw = function(ctx) {
    ctx.fillStyle = this.material;
    // Posición relativa a la pantall no debería estar aquí
    ctx.fillRect(
        this.position.x * App.DISPLAY.TILE_SIZE,
        this.position.y * App.DISPLAY.TILE_SIZE,
        this.size.w * App.DISPLAY.TILE_SIZE,
        this.size.h * App.DISPLAY.TILE_SIZE
    );
}

export class Block extends Entity {
    constructor(position, material) {
        super(position, material);
    }
};

export class Player extends Entity {
    constructor(material) {
        super(
            Vector.from(
                Math.floor(App.DISPLAY.TILE_SIZE/2),
                Math.floor(App.DISPLAY.TILE_SIZE/2)
            ),
            material,
            { w: 1, h: 1 }
        );
        this.velocity = 1;
    }
};