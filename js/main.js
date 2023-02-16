import {Vector} from "./Vector.js";
import {Canvas} from "./Canvas.js";
import {Chunk} from "./Structure.js";
import {Player} from "./Entity.js";
import {Block} from "./Block.js";
import {Noise} from "./Noise.js";
import {DisplayText} from "./DisplayText.js";
import * as Utils from "./Utils.js";

(function(APP) {
    const URL_PARAMS = new URLSearchParams(window.location.search);

    APP.MAIN_DISPLAY = {
        TILE_SIZE: 30,
        CHUNK_SIZE: 15,
        CHUNKS_RENDER: 1
    };

    APP.MAIN_DISPLAY.RESOLUTION =  {
        w: APP.MAIN_DISPLAY.TILE_SIZE
            * APP.MAIN_DISPLAY.CHUNK_SIZE
            * APP.MAIN_DISPLAY.CHUNKS_RENDER,
        h: APP.MAIN_DISPLAY.TILE_SIZE
            * APP.MAIN_DISPLAY.CHUNK_SIZE
            * APP.MAIN_DISPLAY.CHUNKS_RENDER
    };

    APP.NOISE = {
        SCALE: 0.1,
        RESOLUTION: {
            w: APP.MAIN_DISPLAY.RESOLUTION.w / APP.MAIN_DISPLAY.TILE_SIZE,
            h: APP.MAIN_DISPLAY.RESOLUTION.h / APP.MAIN_DISPLAY.TILE_SIZE
        }
    };

    APP.MATERIALS = {
        "deep-water": "#074575",
        "water": "#1197ff",
        "sand": "#d7b448",
        "grass": "#11aa00",
        "mountain": "#063800"
    };

    APP.CHUNKS = {};

    let CACHED_DISPLAY_TEXTS = [];

    function keyPress(event) {
        switch(event.key) {
            case "w":
                APP.PLAYER.moveBy(Vector.from(0, -APP.PLAYER.velocity));
                break;
            case "d":
                APP.PLAYER.moveBy(Vector.from(APP.PLAYER.velocity, 0));
                break;
            case "s":
                APP.PLAYER.moveBy(Vector.from(0, APP.PLAYER.velocity));
                break;
            case "a":
                APP.PLAYER.moveBy(Vector.from(-APP.PLAYER.velocity, 0));
                break;
            default:
                break;
        }
        Utils.writeIntoElements({
            "#player-position": APP.PLAYER.position,
            "#player-chunk": Chunk.getPosition(APP.PLAYER.position),
            "#player-chunk-position": Chunk.getRelativePosition(APP.PLAYER.position)
        });
    }

    function drawTile(position) {
        let absolutePosition = APP.PLAYER.getPositionFromPlayer(position);
        let chunkPosition = Chunk.getPosition(absolutePosition);
        let chunkRelativePosition = Chunk.getRelativePosition(absolutePosition);
        let chunk = APP.CHUNKS[chunkPosition.toString()] = Chunk.loadChunk(chunkPosition);
        let tile = chunk.getTile(chunkRelativePosition);

        APP.MAIN_DISPLAY.THIS.fillRect(
            position.multiply(APP.MAIN_DISPLAY.TILE_SIZE),
            {
                w: APP.MAIN_DISPLAY.TILE_SIZE,
                h: APP.MAIN_DISPLAY.TILE_SIZE
            },
            tile.color
        );

        if (tile.block) {
            APP.MAIN_DISPLAY.THIS.fillRect(
                position.multiply(APP.MAIN_DISPLAY.TILE_SIZE),
                {
                    w: APP.MAIN_DISPLAY.TILE_SIZE,
                    h: APP.MAIN_DISPLAY.TILE_SIZE
                },
                tile.block.material
            );
        }

        if (tile.displayText) {
            let cachedDisplayText = {};
            cachedDisplayText.displayText = tile.displayText;
            cachedDisplayText.width = tile.displayText.getWidth(APP.MAIN_DISPLAY.THIS.ctx);
            cachedDisplayText.position = new Vector(
                position.x*APP.MAIN_DISPLAY.TILE_SIZE+cachedDisplayText.width/16,
                position.y*APP.MAIN_DISPLAY.TILE_SIZE-APP.MAIN_DISPLAY.TILE_SIZE*0.2
            );
            CACHED_DISPLAY_TEXTS.push(cachedDisplayText);
        }
    }

    function drawTerrain() {
        for (let y = 0; y < APP.NOISE.RESOLUTION.h; y++) {
            for (let x = 0; x < APP.NOISE.RESOLUTION.w; x++) {
                drawTile(Vector.from(x, y));
            }
        }
    }


    function drawPlayer() {
        APP.MAIN_DISPLAY.THIS.fillRect(
            {
                x: APP.MAIN_DISPLAY.RESOLUTION.w/2 - APP.MAIN_DISPLAY.TILE_SIZE/2,
                y: APP.MAIN_DISPLAY.RESOLUTION.h/2 - APP.MAIN_DISPLAY.TILE_SIZE/2
            },
            {
                w: APP.MAIN_DISPLAY.TILE_SIZE,
                h: APP.MAIN_DISPLAY.TILE_SIZE
            },
            APP.PLAYER.material
        );
    }

    function drawCachedDisplayTexts() {
        CACHED_DISPLAY_TEXTS.forEach(cachedDisplayText => {
            let displayText = cachedDisplayText.displayText;
            let padding = Vector.from(16, 16);


            APP.MAIN_DISPLAY.THIS.fillRect(
                cachedDisplayText.position
                                 .substract(Vector.from(
                                    cachedDisplayText.width/2 + padding.x,
                                    displayText.text.length*16 + padding.y*2
                                 )),
                {
                    w: cachedDisplayText.width + padding.x*2,
                    h: displayText.text.length*16 + padding.y*2
                },
                "white"
            );

            APP.MAIN_DISPLAY.THIS.writeMultiLine(
                cachedDisplayText.position,
                displayText.text,
                displayText.color
            );
        });
        CACHED_DISPLAY_TEXTS = [];
    }

    // =====-===== //
    
    function init() {
        APP.MAIN_DISPLAY.THIS = new Canvas(Utils.$("#canvas"), APP.MAIN_DISPLAY.RESOLUTION);

        APP.NOISE.THIS = new Noise();
        APP.NOISE.THIS.setSeed(Utils.hash(URL_PARAMS.get("seed") || "1337"));

        APP.PLAYER = new Player("red");

        Utils.writeIntoElements({
            "#player-position": APP.PLAYER.position,
            "#player-chunk": Chunk.getPosition(APP.PLAYER.position),
            "#player-chunk-position": Chunk.getRelativePosition(APP.PLAYER.position)
        });
        addEventListener("keydown", keyPress);
    }

    function testInit() {
        let tile = Chunk.loadChunk(Vector.from(0, 0)).getTile(Vector.from(4, 3));
        tile.setProperties({
            "block": new Block({
                material: "purple",
                walkable: false
            }),
            "displayText": new DisplayText("No puedes pasar este bloque UwU", "black")
        });

        let tile2 = Chunk.loadChunk(Vector.from(0, 0)).getTile(Vector.from(12, 3));
        tile2.setProperties({
            "block": new Block({
                material: "purple",
                walkable: false
            }),
            "displayText": new DisplayText("No puedes\npasar este\nbloque UwU", "black")
        });


    }

    
    function update() {
        APP.MAIN_DISPLAY.THIS.clear();
        drawTerrain();
        drawPlayer();
        drawCachedDisplayTexts();
    }
    
    // =====-===== //
    
    init();
    testInit();
    setInterval(update, 100);
    //Canvas.animation(update);
    
})(window.APP = window.APP || {});
