import {Vector} from "./Vector.js";
import {CanvasDisplay2D} from "./CanvasDisplay2D.js";
import {Chunk} from "./Structure.js";
import {Player} from "./Entities.js";
import {Noise} from "./Noise.js";
import * as Utils from "./Utils.js";

(function(App) {
    const URL_PARAMS = new URLSearchParams(window.location.search);

    App.DISPLAY = {
        TILE_SIZE: 15,
        CHUNK_SIZE: 15,
        CHUNKS_RENDER: 1
    };

    App.DISPLAY.RESOLUTION =  {
        w: App.DISPLAY.TILE_SIZE
            * App.DISPLAY.CHUNK_SIZE
            * App.DISPLAY.CHUNKS_RENDER
            + App.DISPLAY.TILE_SIZE
                * (App.DISPLAY.CHUNKS_RENDER%2 + 1),
        h: App.DISPLAY.TILE_SIZE
            * App.DISPLAY.CHUNK_SIZE
            * App.DISPLAY.CHUNKS_RENDER
            + App.DISPLAY.TILE_SIZE
                * (App.DISPLAY.CHUNKS_RENDER%2 + 1)
    };

    App.NOISE = {
        SCALE: 0.1,
        RESOLUTION: {
            w: App.DISPLAY.RESOLUTION.w / App.DISPLAY.TILE_SIZE,
            h: App.DISPLAY.RESOLUTION.h / App.DISPLAY.TILE_SIZE
        }
    };

    App.MATERIALS = {
        "deep-water": "#074575",
        "water": "#1197ff",
        "sand": "#d7b448",
        "grass": "#11aa00",
        "mountain": "#063800"
    };

    App.CHUNKS = {};

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

    function getAbsolutePosition(position) {
        return App.PLAYER.position.substract(Vector.from(
            Math.floor(App.DISPLAY.TILE_SIZE/2),
            Math.floor(App.DISPLAY.TILE_SIZE/2)
        )).add(position);
    }
    
    // =====-===== //
    
    function init() {
        App.DISPLAY.THIS = new CanvasDisplay2D(Utils.$("#canvas"), App.DISPLAY.RESOLUTION);
        App.NOISE.THIS = new Noise();
        App.NOISE.THIS.setSeed(Utils.hash(URL_PARAMS.get("seed") || "1337"));
        App.PLAYER = new Player();
        Utils.writeIntoElements({
            "#player-position": App.PLAYER.position,
            "#player-chunk": Chunk.getPosition(App.PLAYER.position),
            "#player-chunk-position": Chunk.getRelativePosition(App.PLAYER.position)
        });
        addEventListener("keydown", keyPress);
    }

    
    function update() {
        App.DISPLAY.THIS.clear();
    
        for (let y = 0; y < App.NOISE.RESOLUTION.h; y++) {
            for (let x = 0; x < App.NOISE.RESOLUTION.w; x++) {
                let absolutePosition = getAbsolutePosition(Vector.from(x, y));
                let chunkPosition = Chunk.getPosition(absolutePosition);
                let chunkRelativePosition = Chunk.getRelativePosition(absolutePosition);
    
                App.CHUNKS[`${chunkPosition}`] = Chunk.loadChunk(chunkPosition);
    
                App.DISPLAY.THIS.ctx.fillStyle = App.CHUNKS[`${chunkPosition}`].tiles[`${chunkRelativePosition}`].color;
                App.DISPLAY.THIS.ctx.fillRect(
                    x * App.DISPLAY.TILE_SIZE,
                    y * App.DISPLAY.TILE_SIZE,
                    App.DISPLAY.TILE_SIZE,
                    App.DISPLAY.TILE_SIZE
                );
            }
        }
    
        App.PLAYER.draw(App.DISPLAY.THIS.ctx);
    }
    
    // =====-===== //
    
    init();
    CanvasDisplay2D.animation(update);
})(window.App = window.App || {});