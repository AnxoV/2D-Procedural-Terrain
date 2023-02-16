export class DisplayText {
    constructor(text, color) {
        this.text = text.split("\n");
        this.color = color;
    }
}

DisplayText.prototype.getWidth = function(ctx) {
    let maxWidth = 0;
    let width;
    this.text.forEach(text => {
        width = ctx.measureText(text).width;
        if (width > maxWidth) {
            maxWidth = width;
        }
    });
    return width;
};