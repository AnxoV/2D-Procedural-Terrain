export class DisplayText {
    constructor(text, color) {
        this.text = text;
        this.color = color;
    }
}

DisplayText.prototype.getWidth = function() {
    return App.DISPLAY.THIS.ctx.measureText(this.text).width;
}