import {Vector} from "./Vector.js";

export class Canvas {
    constructor(canvas, size) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.resize(size);
    }
}

Canvas.prototype.resize = function(size) {
    this.canvas.width = size.w;
    this.canvas.height = size.h;
};

Canvas.prototype.clear = function() {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

Canvas.prototype.fillRect = function(position, size, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
        position.x,
        position.y,
        size.w,
        size.h
    );
};

Canvas.prototype.writeLine = function(position, line, config) {
    config = Object.assign({
        fillStyle: "black",
        font: "16px Arial",
        textBaseline: "top"
    }, config);

    Object.keys(config).forEach((property) => {
        this.ctx[property] = config[property];
    });

    this.ctx.fillText(
        line,
        Math.floor(position.x),
        Math.floor(position.y)
    );
};

Canvas.prototype.writeMultiLine = function(position, lines, config) {
    config = Object.assign({
        fillStyle: "black",
        font: "16px Arial",
        textBaseline: "top",
        lineHeight: "16px"
    }, config);

    lines.forEach((line, index) => {
        this.writeLine(
            position.substract(
                Vector.from(0, config.lineHeight*lines.length)
            ).add(
                Vector.from(0, index*config.lineHeight)
            ),
            line,
            config
        );
    });
}

Canvas.animation = function(animate) {
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
};