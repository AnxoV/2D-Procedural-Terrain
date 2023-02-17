export class DisplayText {
    constructor(text, config) {
        this.text = text.split("\n");
        this.shown = true;

        Object.assign(this,
            {
                fillStyle: "black",
                font : "16px Arial",
                lineHeight: "16px"
            },
            config
        );
    }
}
DisplayText.cached = [];

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