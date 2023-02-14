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

Chunk.getPosition = function getChunkPosition(position) {
    return Vector.clone(position)
                 .map((value) => Math.floor(value / App.TILE_SIZE));
};

Chunk.getRelativePosition = function getChunkRelativePosition(position) {
    return Vector.clone(position)
                 .map((value) => (value < 0) ? (value % App.TILE_SIZE + App.TILE_SIZE) % App.TILE_SIZE : value % App.TILE_SIZE);
};

Chunk.prototype.populate = function() {
    let noise_value;
    for (let y = 0; y < App.NOISE_RESOLUTION.h; y++) {
        for (let x = 0; x < App.NOISE_RESOLUTION.w; x++) {
            noise_value = Utils.round(
                Utils.transformValue(
                    Utils.getTile(
                        this.position.multiply(App.TILE_SIZE).add(Vector.from(x, y)).multiply(App.NOISE_SCALE)
                    ),
                    { min: -1, max: 1 },
                    { min: 0, max: 1 }
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