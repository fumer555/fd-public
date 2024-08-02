class SVGElementFactory {
    constructor(svgNS) {
        this.svgNS = svgNS;
    }

    createElement(type, attributes = {}) {
        let element = document.createElementNS(this.svgNS, type);
        Object.keys(attributes).forEach(attr => {
            element.setAttribute(attr, attributes[attr]);
        });
        return element;
    }
}

class LineStrategy {
    constructor(factory, lineMode) {
        this.factory = factory;
    }

    create(x1, y1, x2, y2, lineID, className = '') {
        return this.factory.createElement("polyline", {
            points: `${x1},${y1} ${x2},${y2}`,
            id: lineID,
            class: className
        });
    }
}

class TextStrategy {
    constructor(factory) {
        this.factory = factory;
        this.fontFamily = "Times New Roman";
        this.fontSize = 24;
        this.textClass = "black-fill";
        this.dominantBaseline = "middle";

    }

    create(x, y, textContent) {
        let text = this.factory.createElement("text", {
            x: x,
            y: y,
            "font-family": this.fontFamily,
            "font-size": this.fontSize,
            "dominant-baseline": this.dominantBaseline,
            class: this.textClass
        });
        text.textContent = textContent;
        return text;
    }
}

class CrossShapeStrategy {
    constructor(factory) {
        this.factory = factory;
        this.xExpansion = 8;
        this.yExpansion = 10;
    }

    create(x, y) {
        // Coordinates for the cross's horizontal and vertical arms
        let leftX = x - this.xExpansion;
        let rightX = x + this.xExpansion;
        let topY = y - this.yExpansion;
        let bottomY = y + this.yExpansion;
    
        // Path data using SVG's path syntax for drawing a cross
        // 'M' moves to a point, 'L' draws a line to a point
        let pathData = `M${leftX},${topY} L${rightX},${bottomY} ` + // Draws the first diagonal
                       `M${leftX},${bottomY} L${rightX},${topY}`;   // Draws the second diagonal
    
        // Creating the SVG path element with class 'cross'
        return this.factory.createElement("path", {
            d: pathData,
            class: "cross"
        });
    }    
}

class GrayAreaStrategy {
    constructor(factory) {
        this.factory = factory;
        this.horizontalExpansion = 18;
        this.verticalExpansion = 28;
    }

    create(x, headY, endY) {

        let cornerX = x - this.horizontalExpansion;
        let cornerY = headY - this.verticalExpansion;
        let horizontalWidth = this.horizontalExpansion * 2;
        let verticalHeight = endY - headY + this.verticalExpansion * 2;

        // <rect x="280" y="1175" width="80" height="180" fill="#cccccc" rx="40" ry="40" />
        return this.factory.createElement("rect", {
            x: cornerX,
            y: cornerY,
            width: horizontalWidth,
            height: verticalHeight,
            fill: "#cccccc",
            rx: this.horizontalExpansion,
            ry: this.horizontalExpansion
        });
    }    
}

class PolylineStrategy {
    constructor(factory) {
        this.factory = factory;
        this.defaultClassNames = "staff-line";
        this.leftX = 265;
        this.textLeftShiftValue = 60;
        // this.leftY = 855;
        // this.incrementX = 290;
        // this.numberLines = 12;
    }

    create(id, y, incrementX, className, textContent) {
        let polyline = this.factory.createElement("polyline", {
            points: `${this.leftX},${y} ${this.leftX + incrementX},${y}`,
            id: `line-${id}`,
            class: `${this.defaultClassNames} ${className}`
        });

        let text = this.factory.createElement("text", {
            x: this.leftX - this.textLeftShiftValue,
            y: y,
            "font-family": "Times New Roman",
            "font-size": "24",
            "dominant-baseline": "middle",
            class: "black-fill"
        });
        text.textContent = textContent;

        return { polyline, text };
    }
}

class SVGSystemManager {
    constructor(svgRootId, tones) {
        this.svgNS = "http://www.w3.org/2000/svg";
        this.svgRoot = document.getElementById(svgRootId);
        this.grayRoot = document.getElementById("grayRoot");
        // using the 3 classes above 
        this.factory = new SVGElementFactory(this.svgNS);
        this.crossShapeStrategy = new CrossShapeStrategy(this.factory);
        this.polylineStrategy = new PolylineStrategy(this.factory);
        this.grayAreaStrategy = new GrayAreaStrategy(this.factory);

        // other attributes to be redefined
        this.stafflineIncrementX = 290;
        this.starXStart = 300;
        this.starYStart = 855;

        this.idMap = {};
        tones.forEach((item, index) => {
            this.idMap[item] = index + 1;
        });
    }

    createStar(x, y) {
        let cross = this.crossShapeStrategy.create(x, y);
        this.svgRoot.appendChild(cross);
    }

    overFlow() {
        pass;
    }

    underFlow() {
        pass;
    }

    createXs(xAttributes) { //going from symbolic to numerical, this is pretty brutal, needs to be dynamic
        const xStart = 300;
        const yStart = 855;
        xAttributes.forEach(([xOffset, yOffset]) => {
            const x = xStart + (xOffset - 1) * 65;
            const y = yStart + (yOffset - 1) * 40;
            this.createStar(x, y);
        });
    }

    createMultipleStars(starAttributes){
        pass;
    }

    symbolic2Coordinate(starAttributes){
        pass;
    }

    createPolylines(lineAttributes, startY=855, includeNumber=false) {
        let y = startY;
        let gap = 40;
        let numLines = lineAttributes.length;

        for (let i = 0; i < numLines; i++) {
            let [key, className, override] = lineAttributes[i]; //override not used yet
            let { polyline, text } = this.polylineStrategy.create(
                key, y, this.stafflineIncrementX, className, key
            );

            this.svgRoot.appendChild(polyline);
            if (includeNumber && key !== undefined) {
                this.svgRoot.appendChild(text);
            }

            y += gap;
        }
    }

    createGrayAreasByCoordiante(grayAreaAttributes) {
        let numGrayAreas = grayAreaAttributes.length;
        for (let i = 0; i < numGrayAreas; i++){
            let [x, headY, endY] = grayAreaAttributes[i];
            let grayArea = this.grayAreaStrategy.create(x, headY, endY);
            this.grayRoot.appendChild(grayArea);
        }
    }
    createGrayArea() {
        let grayArea = this.grayAreaStrategy.create(300, 1175, 1295);
        this.grayRoot.appendChild(grayArea);
        // pass;
    }

    changeClass(lineId, newClass) {
        let line = document.getElementById(lineId);
        if (line) {
            line.setAttribute("class", newClass);
        }
    }
}

let globalSystemX = 300;
let globalSystemY = 855;
let globalBeatDistance = 65;
let globalStarX = globalSystemX + globalBeatDistance;
let globalStarY = globalSystemY;

// Using the class
document.addEventListener("DOMContentLoaded", () => {
    const systemManager = new SVGSystemManager('svgRoot', [6, 11, 4, 9, 2, 7, 0, 5, 10, 3, 8, 1]);
    systemManager.createPolylines([
        [6, "", false],
        [11, "dashed-line", false],
        [4, "", false],
        [9, "", false],
        [2, "dashed-line", false],
        [7, "", false],
        [0, "", false],
        [5, "", false],
        [10, "", false],
        [3, "", false],
        [8, "", false],
        [1, "dotted-line", false]
    ], 855, true);

    systemManager.createXs([
        [1, 9],
        [1, 10],
        [1, 12],
        [2, 3],
        [2, 5],
        [2, 7],
        [2, 8],
        [3, 4],
        [3, 6],
        [4, 4],
        [4, 6],
        [4, 7],
        [4, 8],
        [4, 9],

    ]);

    // systemManager.createGrayArea();
    systemManager.createGrayAreasByCoordiante([
        [300, 1175, 1295],
        [365, 855 + 40*2, 855 + 40*7]
    ]);
});
