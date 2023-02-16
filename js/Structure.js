import {Vector} from "./Vector.js";
import * as Utils from "./Utils.js";
export class Chunk {
    constructor(position) {
        this.position = position;;
        this.tiles = {};
    }
}

Chunk.setChunk = function(position, chunk) {
    APP.CHUNKS[position.toString()] = chunk;
};

Chunk.getChunk = function(position) {
    return APP.CHUNKS[position.toString()] || false;
};

Chunk.loadChunk = function(position) {
    if (Chunk.getChunk(position)) {
        return Chunk.getChunk(position);
    }

    let chunk = new Chunk(position);
    chunk.populate();
    Chunk.setChunk(position, chunk);
    return chunk;
};

Chunk.loadChunks = function(position) {
    let chunkPosition;
    for (let y = -APP.MAIN_DISPLAY.CHUNKS_RENDER; y <= APP.MAIN_DISPLAY.CHUNKS_RENDER; y++) {
        for (let x = -APP.MAIN_DISPLAY.CHUNKS_RENDER; x <= APP.MAIN_DISPLAY.CHUNKS_RENDER; x++) {
            chunkPosition = Chunk.getPosition(position).add(Vector.from(x, y));
            APP.CHUNKS[`${chunkPosition}`] = Chunk.loadChunk(chunkPosition);
        }
    }
};

Chunk.getPosition = function getChunkPosition(position) {
    position = Vector.clone(position);
    position.map((value) => {
        return Math.floor(value / APP.MAIN_DISPLAY.CHUNK_SIZE);
    });
    return position;
};

Chunk.getRelativePosition = function getChunkRelativePosition(position) {
    position = Vector.clone(position);
    position.map((value) => {
        if (value < 0) {
            return (value % APP.MAIN_DISPLAY.CHUNK_SIZE + APP.MAIN_DISPLAY.CHUNK_SIZE) % APP.MAIN_DISPLAY.CHUNK_SIZE;
        }
        return value % APP.MAIN_DISPLAY.CHUNK_SIZE;
    });
    return position;
};

Chunk.prototype.getTile = function(position) {
    return this.tiles[position.toString()];
};

Chunk.prototype.setTile = function(position, tile) {
    this.tiles[position.toString()] = tile;
};

Chunk.prototype.populate = function() {
    let noise_value;
    for (let y = 0; y < APP.NOISE.RESOLUTION.h; y++) {
        for (let x = 0; x < APP.NOISE.RESOLUTION.w; x++) {
            let position = new Vector(x, y);
            noise_value = Utils.round(
                Utils.transformValue(
                    Utils.getTile(
                        this.position.multiply(APP.MAIN_DISPLAY.CHUNK_SIZE)
                                     .add(position)
                                     .multiply(APP.NOISE.SCALE)
                    ),
                    { min: -1, max: 1 },
                    { min: 0, max: 1 }
                ),
                2
            );
            this.setTile(position,
                new Tile(position, {
                    color: Utils.getColor(noise_value),
                    value: noise_value
                })
            );
        }
    }
};


export class Tile {
    constructor(position, data) {
        this.position = position;
        Object.assign(this, data);
    }
}

Tile.prototype.setProperty = function(property, value) {
    this[property] = value;
};

Tile.prototype.setProperties = function(properties) {
    for (const property in properties) {
        this.setProperty(property, properties[property]);
    }
}