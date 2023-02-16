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
                Math.floor(App.DISPLAY.CHUNK_SIZE/2),
                Math.floor(App.DISPLAY.CHUNK_SIZE/2)
            ),
            material,
            { w: 1, h: 1 }
        );
        this.velocity = 1;
        Chunk.loadChunks(Chunk.getPosition(this.position));
    }
};

Player.prototype.moveTo = function(newPosition) {
    let chunkPosition = Chunk.getPosition(newPosition);
    let chunkRelativePosition = Chunk.getRelativePosition(newPosition);
    
    let chunk = App.CHUNKS[chunkPosition.toString()] = Chunk.loadChunk(chunkPosition);
    let tile = chunk.getTile(chunkRelativePosition);

    if (tile.block && !tile.block.walkable) {
        return false;
    }
    this.position = newPosition;
};

Player.prototype.moveBy = function(force) {
    return this.moveTo(this.position.add(force));
};

Player.prototype.getPositionFromPlayer = function(position) {
    return this.position.substract(Vector.from(
        Math.floor(App.DISPLAY.CHUNK_SIZE/2),
        Math.floor(App.DISPLAY.CHUNK_SIZE/2)
    )).add(position);
}