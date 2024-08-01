import SVGElementFactory from './SVGElementFactory.js';
import CrossShapeStrategy from './CrossShapeStrategy.js';
import PolylineStrategy from './PolylineStrategy.js';

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

export default SVGSystemManager;
