export class Vector {
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
};

Vector.prototype.map = function(callbackFn) {
    for (const [key, value] of Object.entries(this)) {
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
    );
};

Vector.prototype.dotProduct = function(x = 0, y = 0, z = 0) {
    return this.x*x + this.y*y + this.z*z;
};

Vector.prototype.divide = function(scalar) {
    return new Vector(
        this.x / scalar,
        this.y / scalar,
        this.z / scalar
    );
}