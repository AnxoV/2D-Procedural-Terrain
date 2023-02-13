const TILES = {};

const CHUNKS = {};

let TILE_SIZE = 17;

let DISPLAY;
let DISPLAY_RESOLUTION = { w: 289, h: 289 };

let NOISE;
let NOISE_SCALE = 0.1;
let NOISE_RESOLUTION = {
    w: DISPLAY_RESOLUTION.w / TILE_SIZE,
    h: DISPLAY_RESOLUTION.h / TILE_SIZE
};

let player;

const materials = {
    "grass": "#d7b448",
    "water": "#11aa00",
    "sand": "#1197ff",
    "deep-water": "#074575",
    "mountain": "#063800"
};

// ===== Canvas ===== //
class CanvasDisplay2D {
    constructor(canvas, size) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.resize(size);
    }
}
CanvasDisplay2D.prototype.resize = function(size) {
    this.canvas.width = size.w;
    this.canvas.height = size.h;
};
CanvasDisplay2D.prototype.clear = function() {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
}

// ===== Chunk ===== //
class Chunk {
    constructor() {
        this.tiles = {};
    }
}

// ===== Tile ===== //
class Tile {
    constructor(material) {
        this.material = material;
    }
}

// ===== Entity ===== //
class Entity {
    constructor(position) {
        this.position = position;
    }
}
Entity.prototype.moveTo = function(newPosition) {
    this.position = newPosition;
};
Entity.prototype.moveBy = function(force) {
    this.moveTo(this.position.add(force));
};
Entity.prototype.getChunkAbsolutePosition = function() {
    return Vector.clone(this.position)
                 .map((value) => Math.floor(value / TILE_SIZE));
};
Entity.prototype.getChunkRelativePosition = function() {
    return Vector.clone(this.position)
                 .map((value) => ((value < 0) ? TILE_SIZE : 0) + value % TILE_SIZE);
}

class Player extends Entity {
    constructor(position, velocity) {
        super(position);
        this.velocity = velocity;
    }
}
Player.size = { w: 1, h: 1 };
Player.prototype.draw = function(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(
        DISPLAY_RESOLUTION.w/2 - TILE_SIZE/2,
        DISPLAY_RESOLUTION.h/2 - TILE_SIZE/2,
        Player.size.w * TILE_SIZE,
        Player.size.h * TILE_SIZE
    );
}

// ===== Vector ===== //
class Vector {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
Vector.from = function(x = 0, y = 0, z = 0) {
    return new Vector(x, y, z);
};
Vector.clone = function(vector) {
    return new Vector(vector.x, vector.y, vector.z);
};
Vector.prototype.toString = function() {
    return `${this.x} ${this.y}`;
}
Vector.prototype.map = function(callbackFn) {
    for ([key, value] of Object.entries(this)) {
        this[key] = callbackFn(value);
    }
    return this;
};
Vector.prototype.add = function(vector) {
    return new Vector(
        this.x + vector.x,
        this.y + vector.y,
        this.z + vector.z
    );
};
Vector.prototype.substract = function(vector) {
    return new Vector(
        this.x - vector.x,
        this.y - vector.y,
        this.z - vector.z
    );
};
Vector.prototype.multiply = function(scalar) {
    return new Vector(
        this.x * scalar,
        this.y * scalar,
        this.z * scalar
    )
};
Vector.prototype.dotProduct = function(x = 0, y = 0, z = 0) {
    return this.x*x + this.y*y + this.z*z;
};


// ===== Noise ===== //
class Noise {
    constructor() {
        this.setSeed();
    }
}
Noise.prototype.permutationTable = [
    151,160,137,91,90,15,
    131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
    190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
    88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
    77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
    102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
    135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
    223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
    129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
    251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
    49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
];
Noise.prototype.extendedPermutationTable = new Array(512);
Noise.prototype.extendedGradientPermutationTable = new Array(512);
Noise.gradient3D = [
    new Vector(1,1,0),new Vector(-1,1,0),new Vector(1,-1,0),new Vector(-1,-1,0),
    new Vector(1,0,1),new Vector(-1,0,1),new Vector(1,0,-1),new Vector(-1,0,-1),
    new Vector(0,1,1),new Vector(0,-1,1),new Vector(0,1,-1),new Vector(0,-1,-1)
];
Noise.prototype.scaleSeed = function(seed) {
    if (seed > 0 && seed < 1)
        seed *= 65536;
    seed = Math.floor(seed);
    if (seed < 256)
        seed |= seed << 8;
    return seed;
};
Noise.prototype.setPermutationTableValue = function(position) {
    if (position & 1) {
        return this.permutationTable[position] ^ (this.seed & 255);
    } else {
        return this.permutationTable[position] ^ ((this.seed >> 8) & 255);
    }
};
Noise.prototype.generatePermutationValues = function() {
    let currentPermutationTableIndex = 0;
    let permutationTableLength = 256;
    let permutationTableValue;

    while (currentPermutationTableIndex < permutationTableLength) {
        permutationTableValue = this.setPermutationTableValue(currentPermutationTableIndex);
        this.extendedPermutationTable[currentPermutationTableIndex]
            = this.extendedPermutationTable[currentPermutationTableIndex + 256]
                = permutationTableValue;
        this.extendedGradientPermutationTable[currentPermutationTableIndex]
            = this.extendedGradientPermutationTable[currentPermutationTableIndex + 256]
                = Noise.gradient3D[permutationTableValue % 12];
        currentPermutationTableIndex++;
    }
};
Noise.prototype.setSeed = function(seed) {
    seed = seed || 1337;
    this.seed = this.scaleSeed(seed);
    this.generatePermutationValues();
};
Noise.prototype.getHashedIndex = function(value) {
    return value &= 255;
};
Noise.prototype.fade = function(t) {
    return t**3*(t*(t*6-15)+10);
};
Noise.prototype.lerp = function(a, b, t) {
    return (1-t)*a + t*b;
};
Noise.prototype.getCornerNoiseContribution = function(gridVector, relativeVector, cornerVector) {
    return this.extendedGradientPermutationTable[
                gridVector.x
                + cornerVector.x
                + this.extendedPermutationTable[gridVector.y + cornerVector.y]
            ].dotProduct(
                relativeVector.x - cornerVector.x,
                relativeVector.y - cornerVector.y
            );
};
Noise.prototype.interpolateNoise = function(noiseCorners, fadeVector) {
    return this.lerp(
        this.lerp(noiseCorners["00"], noiseCorners["10"], fadeVector.x),
        this.lerp(noiseCorners["01"], noiseCorners["11"], fadeVector.x),
        fadeVector.y
    );
};
Noise.prototype.perlin2D = function(x, y) {
    let vector = Vector.from(x, y);
    let gridVector = Vector.clone(vector)
                           .map(Math.floor);
    let relativeVector = vector.substract(gridVector);
    gridVector.map(this.getHashedIndex);
    let noiseCorners = {
        "00": this.getCornerNoiseContribution(gridVector, relativeVector, Vector.from(0, 0)),
        "01": this.getCornerNoiseContribution(gridVector, relativeVector, Vector.from(0, 1)),
        "10": this.getCornerNoiseContribution(gridVector, relativeVector, Vector.from(1, 0)),
        "11": this.getCornerNoiseContribution(gridVector, relativeVector, Vector.from(1, 1)),
    };

    let fadeVector = Vector.clone(relativeVector)
                           .map(this.fade);
    return this.interpolateNoise(noiseCorners, fadeVector);
};

// ===== ===== //

function $(query) {
    return document.querySelector(query);
}

function getColor(value) {
    if (value < 0.3) return materials["deep-water"];
    else if (value < 0.4) return materials["water"];
    else if (value < 0.5) return materials[""];
    else if (value < 0.8) return "#11aa00";
    else if (value < 1) return "#063800";
}

function getTile(position) {
    return NOISE.perlin2D(position.x, position.y);
}

// ===== ===== //

function init() {
    DISPLAY = new CanvasDisplay2D($("#canvas"), DISPLAY_RESOLUTION);
    NOISE = new Noise();
    player = new Player(Vector.from(0, 0), 1);
    $("#player-position").innerText = player.position;
    $("#player-chunk").innerText = player.getChunkAbsolutePosition();
    $("#player-chunk-position").innerText = player.getChunkRelativePosition();
}

function update() {
    DISPLAY.clear();
    let tileMapPosition = Vector.clone(player.position);

    for (let y = 0; y < NOISE_RESOLUTION.h; y++) {
        for (let x = 0; x < NOISE_RESOLUTION.w; x++) {
            let tileRelativePosition = tileMapPosition.add(Vector.from(x, y));
            
            let noiseValue = getTile(tileRelativePosition.multiply(NOISE_SCALE));
            TILES[`${tileRelativePosition}`] = noiseValue;

            let chunkRelativePosition = new Vector(
                Math.floor(tileRelativePosition.x / (TILE_SIZE * 17)),
                Math.floor(tileRelativePosition.y / (TILE_SIZE * 17))
            );

            if (!CHUNKS[`${player.getChunkAbsolutePosition()}`]) {
                CHUNKS[`${player.getChunkAbsolutePosition()}`] = new Chunk();
            }

            CHUNKS[`${player.getChunkAbsolutePosition()}`]
                .tiles[`${player.getChunkRelativePosition()}`] = new Tile(
                    getColor(noiseValue)
                );

            DISPLAY.ctx.fillStyle = getColor((TILES[`${tileRelativePosition}`] + 1) / 2);
            DISPLAY.ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
    
    player.draw(DISPLAY.ctx);
}

// ===== ===== //


function animation(animate) {
    let then, deltaTime;

    function frame(now) {
        if (then) {
            deltaTime = now-then;
            if (animate(deltaTime) === false) {
                return;
            }
        }
        
        then = now;
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

function keyPress(event) {
    switch(event.key) {
        case " ":
            NOISE.setSeed(Date.now());
            break;
        case "w":
            player.moveBy(Vector.from(0, -player.velocity));
            break;
        case "d":
            player.moveBy(Vector.from(player.velocity, 0));
            break;
        case "s":
            player.moveBy(Vector.from(0, player.velocity));
            break;
        case "a":
            player.moveBy(Vector.from(-player.velocity, 0));
            break;
        default:
            break;
    }
    $("#player-position").innerText = player.position;
    $("#player-chunk").innerText = player.getChunkAbsolutePosition();
    $("#player-chunk-position").innerText = player.getChunkRelativePosition();
}

init();
addEventListener("keydown", keyPress);
animation(update);