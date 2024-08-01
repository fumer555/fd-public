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

class CrossShapeStrategy {
    constructor(factory) {
        this.factory = factory;
    }

    create(x, y) {
        // Coordinates for the cross's horizontal and vertical arms
        let leftX = x - 8;
        let rightX = x + 8;
        let topY = y - 10;
        let bottomY = y + 10;
    
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

class PolylineStrategy {
    constructor(factory) {
        this.factory = factory;
        this.defaultClassNames = "staff-line";
    }

    create(id, y, incrementX, className, textContent) {
        let polyline = this.factory.createElement("polyline", {
            points: `265,${y} ${265 + incrementX},${y}`,
            id: `line-${id}`,
            class: `${this.defaultClassNames} ${className}`
        });

        let text = this.factory.createElement("text", {
            x: 265 - 60,
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
        this.factory = new SVGElementFactory(this.svgNS);
        this.crossShapeStrategy = new CrossShapeStrategy(this.factory);
        this.polylineStrategy = new PolylineStrategy(this.factory);
        this.idMap = {};
        tones.forEach((item, index) => {
            this.idMap[item] = index + 1;
        });
    }

    createX(x, y) {
        let cross = this.crossShapeStrategy.create(x, y);
        this.svgRoot.appendChild(cross);
    }

    createXs(xAttributes) {
        const xStart = 300;
        const yStart = 855;
        xAttributes.forEach(([xOffset, yOffset]) => {
            const x = xStart + (xOffset - 1) * 65;
            const y = yStart + (yOffset - 1) * 40;
            this.createX(x, y);
        });
    }

    createPolylines(startY, incrementX, numLines, lineAttributes) {
        let y = startY;
        for (let i = 0; i < numLines; i++) {
            let attributes = lineAttributes[i];
            let { polyline, text } = this.polylineStrategy.create(
                i, y, incrementX, attributes[0] || '', attributes[1] !== undefined ? attributes[1] : ''
            );

            this.svgRoot.appendChild(polyline);
            if (attributes[1] !== undefined) {
                this.svgRoot.appendChild(text);
            }

            y += 40;
        }
    }

    changeClass(lineId, newClass) {
        let line = document.getElementById(lineId);
        if (line) {
            line.setAttribute("class", newClass);
        }
    }
}

// Using the class
document.addEventListener("DOMContentLoaded", () => {
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
