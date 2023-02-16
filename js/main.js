import {Vector} from "./Vector.js";
import {Canvas} from "./Canvas.js";
import {Chunk} from "./Structure.js";
import {Player} from "./Entity.js";
import {Block} from "./Block.js";
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
            * App.DISPLAY.CHUNKS_RENDER,
        h: App.DISPLAY.TILE_SIZE
            * App.DISPLAY.CHUNK_SIZE
            * App.DISPLAY.CHUNKS_RENDER
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

    function drawTile(position) {
        let absolutePosition = App.PLAYER.getPositionFromPlayer(position);
        let chunkPosition = Chunk.getPosition(absolutePosition);
        let chunkRelativePosition = Chunk.getRelativePosition(absolutePosition);


        let chunk = App.CHUNKS[`${chunkPosition}`] = Chunk.loadChunk(chunkPosition);
        let tile = chunk.tiles[`${chunkRelativePosition}`];

        App.DISPLAY.THIS.fillRect(
            position.multiply(App.DISPLAY.TILE_SIZE),
            {
                w: App.DISPLAY.TILE_SIZE,
                h: App.DISPLAY.TILE_SIZE
            },
            tile.color
        );

        if (tile.block) {
            App.DISPLAY.THIS.fillRect(
                position.multiply(App.DISPLAY.TILE_SIZE),
                {
                    w: App.DISPLAY.TILE_SIZE,
                    h: App.DISPLAY.TILE_SIZE
                },
                tile.block.material
            );
        }
    }

    function drawTerrain() {
        for (let y = 0; y < App.NOISE.RESOLUTION.h; y++) {
            for (let x = 0; x < App.NOISE.RESOLUTION.w; x++) {
                drawTile(Vector.from(x, y));
            }
        }
    }


    function drawPlayer() {
        App.DISPLAY.THIS.fillRect(
            {
                x: App.DISPLAY.RESOLUTION.w/2 - App.DISPLAY.TILE_SIZE/2,
                y: App.DISPLAY.RESOLUTION.h/2 - App.DISPLAY.TILE_SIZE/2
            },
            {
                w: App.DISPLAY.TILE_SIZE,
                h: App.DISPLAY.TILE_SIZE
            },
            App.PLAYER.material
        );
    }

    // =====-===== //
    
    function init() {
        App.DISPLAY.THIS = new Canvas(Utils.$("#canvas"), App.DISPLAY.RESOLUTION);

        App.NOISE.THIS = new Noise();
        App.NOISE.THIS.setSeed(Utils.hash(URL_PARAMS.get("seed") || "1337"));

        App.PLAYER = new Player("red");

        App.CHUNKS["0 0"].tiles["7 14"].block = new Block(
            {
                position: Vector.from(7, 14),
                material: "purple",
                walkable: false
            }
        );

        Utils.writeIntoElements({
            "#player-position": App.PLAYER.position,
            "#player-chunk": Chunk.getPosition(App.PLAYER.position),
            "#player-chunk-position": Chunk.getRelativePosition(App.PLAYER.position)
        });
        addEventListener("keydown", keyPress);
    }

    
    function update() {
        App.DISPLAY.THIS.clear();
        drawTerrain();
        drawPlayer();
    }
    
    // =====-===== //
    
    init();
    setInterval(update, 100);
    //Canvas.animation(update);
    
})(window.App = window.App || {});
