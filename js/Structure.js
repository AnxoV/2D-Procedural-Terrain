import {Vector} from "./Vector.js";
import * as Utils from "./Utils.js";

export class Chunk {
    constructor(position) {
        this.position = position;;
        this.tiles = {};
    }
}

Chunk.loadChunk = function(position) {
    let chunk = new Chunk(position);
    if (App.CHUNKS[`${position}`]) {
        return App.CHUNKS[`${position}`];
    }
    chunk.populate();
    return chunk;
};

Chunk.loadChunks = function(position) {
    let chunkPosition;
    for (let y = -App.DISPLAY.CHUNKS_RENDER; y <= App.DISPLAY.CHUNKS_RENDER; y++) {
        for (let x = -App.DISPLAY.CHUNKS_RENDER; x <= App.DISPLAY.CHUNKS_RENDER; x++) {
            chunkPosition = Chunk.getPosition(position).add(Vector.from(x, y));
            App.CHUNKS[`${chunkPosition}`] = Chunk.loadChunk(chunkPosition);
        }
    }
}

Chunk.getPosition = function getChunkPosition(position) {
    position = Vector.clone(position);
    position.map((value) => {
        return Math.floor(value / App.DISPLAY.TILE_SIZE);
    });
    return position;
};

Chunk.getRelativePosition = function getChunkRelativePosition(position) {
    position = Vector.clone(position);
    position.map((value) => {
        if (value < 0) {
            return (value % App.DISPLAY.TILE_SIZE + App.DISPLAY.TILE_SIZE) % App.DISPLAY.TILE_SIZE;
        }
        return value % App.DISPLAY.TILE_SIZE;
    });
    return position;
};

Chunk.prototype.populate = function() {
    let noise_value;
    for (let y = 0; y < App.NOISE.RESOLUTION.h; y++) {
        for (let x = 0; x < App.NOISE.RESOLUTION.w; x++) {
            noise_value = Utils.round(
                Utils.transformValue(
                    Utils.getTile(
                        this.position.multiply(App.DISPLAY.TILE_SIZE)
                                     .add(Vector.from(x, y))
                                     .multiply(App.NOISE.SCALE)
                    ),
                    {
                        min: -1,
                        max: 1
                    },
                    {
                        min: 0,
                        max: 1
                    }
                ),
                1
            );
            this.tiles[`${x} ${y}`] = new Tile({
                color: Utils.getColor(noise_value),
                value: noise_value
            });
        }
    }
};

export class Tile {
    constructor(data) {
        Object.assign(this, data);
    }
}