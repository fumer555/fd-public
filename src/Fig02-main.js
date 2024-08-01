// fichier inutile voici les bugs:

// Uncaught SyntaxError: Cannot use import statement outside a module (at Fig02-main.js:2:1)


console.log('check');
import SVGSystemManager from './SVGSystemManager.js';

document.addEventListener("DOMContentLoaded", () => {
    console.log('check');
    const systemManager = new SVGSystemManager('svgRoot', [6, 11, 4, 9, 2, 7, 0, 5, 10, 3, 8, 1]);
    systemManager.createPolylines(855, 290, 12, [
        ["", 6],
        ["dashed-line", 11],
        ["", 4],
        ["", 9],
        ["dashed-line", 2],
        ["", 7],
        ["", 0],
        ["", 5],
        ["", 10],
        ["", 3],
        ["", 8],
        ["", 1]
    ]);

    systemManager.createXs([
        [1, 9],
        [1, 10],
        [1, 12],
        [2, 3],
        [2, 5],
        [2, 7],
        [2, 8]
    ]);
});
