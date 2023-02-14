export class CanvasDisplay2D {
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
};

CanvasDisplay2D.animation = function(animate) {
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