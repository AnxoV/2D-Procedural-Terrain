import {Vector} from "./Vector.js";
import {CanvasDisplay2D} from "./CanvasDisplay2D.js";
import {Chunk} from "./Structure.js";
import {Player} from "./Entities.js";
import {Noise} from "./Noise.js";
import * as Utils from "./Utils.js";

(function(App) {
    App.URL_PARAMS = new URLSearchParams(window.location.search);
    App.CHUNKS = {};

    App.TILE_SIZE = 10;
    App.CHUNKS_RENDER = 4;
    App.CHUNK_SIZE = 15;

    App.DISPLAY;
    App.DISPLAY_RESOLUTION = {
        w: App.CHUNK_SIZE * App.TILE_SIZE * App.CHUNKS_RENDER + App.TILE_SIZE*(App.CHUNKS_RENDER%2+1),
        h: App.CHUNK_SIZE * App.TILE_SIZE * App.CHUNKS_RENDER + App.TILE_SIZE*(App.CHUNKS_RENDER%2+1)
    };

    App.NOISE_SCALE = 0.1;
    App.NOISE_RESOLUTION = {
        w: App.DISPLAY_RESOLUTION.w / App.TILE_SIZE,
        h: App.DISPLAY_RESOLUTION.h / App.TILE_SIZE
    };

    App.MATERIALS = {
        "deep-water": "#074575",
        "water": "#1197ff",
        "sand": "#d7b448",
        "grass": "#11aa00",
        "mountain": "#063800"
    };

    function keyPress(event) {
        switch(event.key) {
            case "w":
                App.PLAYER.moveBy(Vector.from(0, -App.PLAYER.velocity));
                break;
            case "d":
                App.PLAYER.moveBy(Vector.from(App.PLAYER.velocity, 0));
                break;
            case "s":
                App.PLAYER.moveBy(Vector.from(0, App.PLAYER.velocity));
                break;
            case "a":
                App.PLAYER.moveBy(Vector.from(-App.PLAYER.velocity, 0));
                break;
            default:
                break;
        }
        Utils.writeIntoElements({
            "#player-position": App.PLAYER.position,
            "#player-chunk": Chunk.getPosition(App.PLAYER.position),
            "#player-chunk-position": Chunk.getRelativePosition(App.PLAYER.position)
        });
    }
    
    // ===== ===== //
    
    function init() {
        App.DISPLAY = new CanvasDisplay2D(Utils.$("#canvas"), App.DISPLAY_RESOLUTION);
        App.NOISE = new Noise();
        App.NOISE.setSeed(Utils.hash(App.URL_PARAMS.get("seed") || "1337"));
        App.PLAYER = new Player();
        Utils.writeIntoElements({
            "#player-position": App.PLAYER.position,
            "#player-chunk": Chunk.getPosition(App.PLAYER.position),
            "#player-chunk-position": Chunk.getRelativePosition(App.PLAYER.position)
        });
        addEventListener("keydown", keyPress);
    }
    
    function update() {
        App.DISPLAY.clear();
    
        for (let y = 0; y < App.NOISE_RESOLUTION.h; y++) {
            for (let x = 0; x < App.NOISE_RESOLUTION.w; x++) {
                let absolutePosition = App.PLAYER.position.substract(Vector.from(
                    Math.floor(App.TILE_SIZE/2),
                    Math.floor(App.TILE_SIZE/2)
                )).add(Vector.from(x, y));
                let chunkPosition = Chunk.getPosition(absolutePosition);
                let chunkRelativePosition = Chunk.getRelativePosition(absolutePosition);
    
                App.CHUNKS[`${chunkPosition}`] = Chunk.loadChunk(chunkPosition);
    
                App.DISPLAY.ctx.fillStyle = App.CHUNKS[`${chunkPosition}`].tiles[`${chunkRelativePosition}`].color;
                App.DISPLAY.ctx.fillRect(x*App.TILE_SIZE, y*App.TILE_SIZE, App.TILE_SIZE, App.TILE_SIZE);
            }
        }
    
        App.PLAYER.draw(App.DISPLAY.ctx);
    }
    
    // ===== ===== //
    
    init();
    CanvasDisplay2D.animation(update);
})(window.App = window.App || {});