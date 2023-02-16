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