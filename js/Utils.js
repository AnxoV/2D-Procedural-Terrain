export function $(query) {
    return document.querySelector(query);
}

export function getColor(value) {
    if (value < 0.3) return App.MATERIALS["deep-water"];
    else if (value < 0.4) return App.MATERIALS["water"];
    else if (value < 0.5) return App.MATERIALS["sand"];
    else if (value < 0.8) return App.MATERIALS["grass"];
    else if (value < 1) return App.MATERIALS["mountain"];
}

export function getTile(position) {
    return App.NOISE.THIS.perlin2D(position.x, position.y);
}


export function hash(string) {
    let character, hash = 0;
    if (string.length == 0) {
        return hash;
    }
    for (let i = 0; i < string.length; i++) {
        character = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash &= hash;
    }
    return hash;
}

export function writeIntoElements(elements) {
    for (const selector in elements) {
        $(selector).innerText = elements[selector];
    }
}

export function round(float, decimals) {
    return parseFloat(float.toFixed(decimals));
}

export function transformValue(value, oldRange, newRange) {
    return (((value - oldRange.min) * (newRange.max - newRange.min)) / (oldRange.max - oldRange.min)) + newRange.min;
}