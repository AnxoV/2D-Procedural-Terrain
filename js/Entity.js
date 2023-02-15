import {Vector} from "./Vector.js";
import {Chunk} from "./Structure.js";

export class Entity {
    constructor(position, material) {
        this.position = position;
        this.material = material;
    }
}

Entity.prototype.moveTo = function(newPosition) {
    this.position = newPosition;
};

Entity.prototype.moveBy = function(force) {
    this.moveTo(this.position.add(force));
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

Player.prototype.moveTo = function(newPosition) {
    let positions = Chunk.getPositions(newPosition);
    console.log(newPosition, positions);

    let chunk = App.CHUNKS[positions.chunk.toString()] = Chunk.loadChunk(positions.chunk);
    let tile = chunk.tiles[newPosition.toString()];

    if (tile.block && !tile.block.walkable) {
        return false;
    }
    this.position = newPosition;
};

Player.prototype.moveBy = function(force) {
    return this.moveTo(this.position.add(force));
};