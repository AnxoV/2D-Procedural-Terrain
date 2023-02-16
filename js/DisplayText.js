export class DisplayText {
    constructor(text, color) {
        this.text = text;
        this.color = color;
    }
}

DisplayText.prototype.getWidth = function(ctx) {
    return ctx.measureText(this.text).width;
}