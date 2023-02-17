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

    function keyPress(event) {
        if (APP.MAIN_DISPLAY.KEYBOARD.HISTORY) {
            let history = APP.MAIN_DISPLAY.KEYBOARD.HISTORY
            delete APP.MAIN_DISPLAY.KEYBOARD.HISTORY;
            APP.MAIN_DISPLAY.KEYBOARD.KEYS[history][event.key]();
        } else {
            switch (typeof APP.MAIN_DISPLAY.KEYBOARD.KEYS[event.key]) {
                case "function":
                    APP.MAIN_DISPLAY.KEYBOARD.KEYS[event.key]();
                    break;
                case "object":
                    APP.MAIN_DISPLAY.KEYBOARD.HISTORY = event.key;
                    break;
                default:
                    break;
            }
        }
        

        Utils.writeIntoElements({
            "#player-position": APP.PLAYER.position,
            "#player-chunk": Chunk.getPosition(APP.PLAYER.position),
            "#player-chunk-position": Chunk.getRelativePosition(APP.PLAYER.position)
        });
    }

    function drawTile(position) {
        let positions = {
            absolute: APP.PLAYER.getPositionFromPlayer(position)
        };
        Object.assign(positions, Chunk.getPositions(positions.absolute));

        let chunk = APP.CHUNKS[positions.chunk.toString()] = Chunk.loadChunk(positions.chunk);
        let tile = chunk.getTile(positions.relative);

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
            DisplayText.cached.push({
                this: tile.displayText,
                tile: tile,
                position: position.multiply(APP.MAIN_DISPLAY.TILE_SIZE)
                                    .substract(
                                        Vector.from(
                                            tile.displayText.getWidth(APP.MAIN_DISPLAY.THIS.ctx)/2,
                                            tile.displayText.text.length*parseInt(tile.displayText.lineHeight)+1.5*APP.MAIN_DISPLAY.TILE_SIZE
                                        )
                                    )
            });
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
        DisplayText.cached.forEach(displayText => {
            if (displayText.this.shown) {
                let padding = displayText.this.padding || Vector.from(0, 0);

                APP.MAIN_DISPLAY.THIS.fillRect(
                    displayText.position,
                    {
                        w: displayText.this.getWidth(APP.MAIN_DISPLAY.THIS.ctx) + padding.x*2,
                        h: displayText.this.text.length*parseInt(displayText.this.lineHeight) + padding.y*2
                    },
                    "rgba(255, 255, 255, .5)"
                );

                APP.MAIN_DISPLAY.THIS.writeMultiLine(
                    displayText.position,
                    displayText.this.text
                );
                
            }
        });
        DisplayText.cached = [];
    }

    // =====-===== //
    
    function init() {
        APP.MAIN_DISPLAY.THIS = new Canvas(Utils.$("#canvas"), APP.MAIN_DISPLAY.RESOLUTION);

        APP.NOISE.THIS = new Noise();
        APP.NOISE.THIS.setSeed(Utils.hash(URL_PARAMS.get("seed") || "1337"));

        APP.PLAYER = new Player("red");

        APP.MAIN_DISPLAY.KEYBOARD = {
            KEYS: {
                "w": function() { APP.PLAYER.moveBy(Vector.from(0, -APP.PLAYER.velocity)) },
                "d": function() { APP.PLAYER.moveBy(Vector.from(APP.PLAYER.velocity, 0)) },
                "s": function() { APP.PLAYER.moveBy(Vector.from(0, APP.PLAYER.velocity)) },
                "a": function() { APP.PLAYER.moveBy(Vector.from(-APP.PLAYER.velocity, 0)) },
                "i": {
                    "w": function() {
                        APP.PLAYER.getTileFromPlayer(Vector.from(0, -1)).displayText.shown = true; },
                    "d": function() { console.log("Info derecha"); },
                    "s": function() { console.log("Info abajo"); },
                    "a": function() { console.log("Info izquierda"); }
                }
            }
        };

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
            "displayText": new DisplayText(
                "No puedes pasar este bloque UwU",
                {
                    padding: Vector.from(16, 16)
                }
            )
        });

        let tile2 = Chunk.loadChunk(Vector.from(0, 0)).getTile(Vector.from(12, 3));
        tile2.setProperties({
            "block": new Block({
                material: "purple",
                walkable: false
            }),
            "displayText": new DisplayText(
                "No puedes\npasar este\nbloque UwU",
                {
                    padding: Vector.from(16, 16)
                }
            )
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
