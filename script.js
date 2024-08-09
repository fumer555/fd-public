let globalSystemXStart = 265;
let globalSystemYStart = 855;
let globalBeatDistance = 65;
let globalLineDistance = 40;
let globalVerticalLineSpan = 35;
let globalStarX = globalSystemXStart + globalVerticalLineSpan;
let globalStarY = globalSystemYStart;
let globalStafflineIncrementX = 290;


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
        this.fontWeight = "normal"; 
        this.textClass = "black-fill";
        this.dominantBaseline = "middle";
        this.textAnchor = "start";
    }

    create(x, y, textContent) {
        let text = this.factory.createElement("text", {
            x: x,
            y: y,
            "font-family": this.fontFamily,
            "font-size": this.fontSize,
            "font-weight": this.fontWeight,
            "dominant-baseline": this.dominantBaseline,
            class: this.textClass,
            "text-anchor": this.textAnchor
        });
        text.textContent = textContent;

        // Adjust the y-coordinate for better vertical centering
        if (this.textAnchor=="middle"){
            const adjustment = this.fontSize * 0.1; // Adjust this value as needed
            text.setAttribute("y", y + adjustment);
        }

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
        // make 2 cases headY > endY; or headY > endY, override no need here
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

class BraceShapeStrategy {
    constructor(factory) {
        this.factory = factory;
        this.arcRadius = 25;
        this.lineLength = 350;
    }

    create(x, y, ifDashed=false) {
        // Coordinates for the brace's arcs and connecting line
        let startX = x;
        let startY = y;
        let endX = x + this.arcRadius;
        let endY = y + this.lineLength;
        let lineClass = "brace";
        if (ifDashed) {
            lineClass += " dashed-line";
        }

        // Path data using SVG's path syntax for drawing a brace
        let pathData = `M${startX},${startY} ` +
                       `A${this.arcRadius},${this.arcRadius} 0 0 1 ${endX},${startY + this.arcRadius} ` +
                       `L${endX},${startY + this.lineLength - this.arcRadius} ` +
                       `A${this.arcRadius},${this.arcRadius} 0 0 1 ${startX},${endY}`;

        // Creating the SVG path element with class 'brace'
        return this.factory.createElement("path", {
            d: pathData,
            class: lineClass,
            fill: "none",
            "stroke-width": 2
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

    create(id, y, incrementX, className, textContent) {// this method's got be changed
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
        // this.grayRoot = document.getElementById("grayRoot");
        // using the 3 classes above 
        this.factory = new SVGElementFactory(this.svgNS);
        this.crossShapeStrategy = new CrossShapeStrategy(this.factory);
        this.polylineStrategy = new PolylineStrategy(this.factory);
        this.grayAreaStrategy = new GrayAreaStrategy(this.factory);
        this.braceShapeStrategy = new BraceShapeStrategy(this.factory);

        // other attributes to be redefined
        this.stafflineIncrementX = globalStafflineIncrementX;
        this.starXStart = globalSystemXStart;
        this.starYStart = globalSystemYStart;

        this.idMap = {};
        tones.forEach((item, index) => {
            this.idMap[item] = index + 1;
        });
    }



    overFlow() {
        pass;
    }

    underFlow() {
        pass;
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



    changeClass(lineId, newClass) {
        let line = document.getElementById(lineId);
        if (line) {
            line.setAttribute("class", newClass);
        }
    }
}

class SVGMeasureManager {
    constructor(svgRootId, measureXStart=265, measureYStart=855) {
        this.svgNS = "http://www.w3.org/2000/svg";
        this.svgRoot = document.getElementById(svgRootId);
        this.grayRoot = document.getElementById("grayRoot");
        // using the 3 classes above 
        this.factory = new SVGElementFactory(this.svgNS);

        // instance definitions 
        this.singlePolylineStrategy = new PolylineStrategy(this.factory); //this origial one has to be taken out
        this.crossShapeStrategy = new CrossShapeStrategy(this.factory);
        this.grayAreaStrategy = new GrayAreaStrategy(this.factory);
        this.braceShapeStrategy = new BraceShapeStrategy(this.factory);

        // other attributes to be redefined
        this.stafflineIncrementX = globalStafflineIncrementX;
        this.measureXStart = measureXStart;
        this.measureYStart = measureYStart;
        this.starXStart = measureXStart + globalVerticalLineSpan;
        this.starYStart = measureYStart;
        // the above non used
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

    createListStarsBySymbolic(xAttributes) { //going from symbolic to numerical, this is pretty brutal, needs to be dynamic
        // const xStart = 300;
        // const yStart = 855;
        // this.starXStart = 300;
        xAttributes.forEach(([xOffset, yOffset]) => {
            const x = this.starXStart + (xOffset - 1) * globalBeatDistance;
            const y = this.starYStart + (yOffset - 1) * globalLineDistance;
            this.createStar(x, y);
        });
    }

    createMultipleStars(starAttributes){
        pass;
    }

    symbolic2Coordinate(starAttributes){ //got to work here
        pass;
    }

    createPolylines(lineAttributes, startY=this.starYStart, includeNumber=false) {
        let y = startY;
        let gap = 40;
        let numLines = lineAttributes.length;

        for (let i = 0; i < numLines; i++) {
            let [key, className, override] = lineAttributes[i]; //override not used yet
            let { polyline, text } = this.singlePolylineStrategy.create(
                key, y, this.stafflineIncrementX, className, key
            );

            this.svgRoot.appendChild(polyline);
            if (includeNumber && key !== undefined) {
                this.svgRoot.appendChild(text);
            }

            y += gap;
        }
    }

    // gray area group 

    createListGrayAreasByCoordiante(grayAreaAttributes) {
        let numGrayAreas = grayAreaAttributes.length;
        // consider overrides 
        for (let i = 0; i < numGrayAreas; i++){
            let [x, headY, endY] = grayAreaAttributes[i];
            let grayArea = this.grayAreaStrategy.create(x, headY, endY);
            this.grayRoot.appendChild(grayArea);
        }
    }

    createGrayAreasByCoordiante(grayAreaAttributes) {
        let numGrayAreas = grayAreaAttributes.length;
        // consider overrides 
        for (let i = 0; i < numGrayAreas; i++){
            let [x, headY, endY] = grayAreaAttributes[i];
            let grayArea = this.grayAreaStrategy.create(x, headY, endY);
            this.grayRoot.appendChild(grayArea);
        }
    }

    createGrayArea(x, headY, endY) {
        let grayArea = this.grayAreaStrategy.create(300, 1175, 1295);
        this.grayRoot.appendChild(grayArea);
        // pass;
    }

    createBraceByCoordiante(x, y, ifDashed=false){ //I think by coordinate should disappear not here
        let brace = this.braceShapeStrategy.create(x, y, ifDashed);
        this.svgRoot.appendChild(brace);
    }

    changeClass(lineId, newClass) {
        let line = document.getElementById(lineId);
        if (line) {
            line.setAttribute("class", newClass);
        }
    }
}


// Using the class
// document.addEventListener("DOMContentLoaded", () => {
//     const systemManager = new SVGSystemManager('svgRoot', [6, 11, 4, 9, 2, 7, 0, 5, 10, 3, 8, 1]);
// });
document.addEventListener("DOMContentLoaded", () => {
    window.measureManager = new SVGMeasureManager('svgRoot', 265, 855);
    // maybe I need to construct a for loop before the overrides if statements
    // only for overrides; should have an if statement here: 
    measureManager.createPolylines([
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

    // I think just keep it as if it were 
    measureManager.createListStarsBySymbolic([
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

    // measureManager.createGrayArea(); where should I put the method and how do I make it talk to each other?
    // I think I should save the symbolic and exact (relative) coordinates of stars as dictionaries;
    // and those dictionnaries should be created in the constructor function, since stars and brackets will be givem in the XML
    // and the XML come beforehand 
    // so at the end of each loop, I need to object.coordinateSet = {} to empty it out nonono dont do it, create a list and save the instances to them
    measureManager.createListGrayAreasByCoordiante([
        [300, 1175, 1295],
        [300 + 65, 855 + 40*2, 855 + 40*7],
        [300 + 65 *2, 855 + 40*3, 855 + 40*5],
        [300 + 65 *3, 855 + 40*3, 855 + 40*8]
    ]);

    // similarly, I need redefine another function here to manage so it uses symbolic coordinate 
    measureManager.createBraceByCoordiante(300 + 65 *3 + 15, 855 + 40*3 - 60);

    let outterFactory = new SVGElementFactory("http://www.w3.org/2000/svg");

    // I think those two instances could be mount to the measure class just need to create 3 instances of TextStrategy instead of one
    const boxTextManager = new TextStrategy(outterFactory);
    boxTextManager.fontWeight = "bold"; 
    boxTextManager.textAnchor = "middle";
    boxTextManager.fontSize = 30;
    let measureText = boxTextManager.create(330,405,"25");
    measureManager.svgRoot.appendChild(measureText);

    const mmTextManager = new TextStrategy(outterFactory);
    mmTextManager.fontWeight = "thin";
    mmTextManager.fontSize = 28; 
    // metaTextManager.textAnchor = "middle";
    let mmText = mmTextManager.create(300,460,"mm.89-98");
    measureManager.svgRoot.appendChild(mmText);

    const metaTextManager = new TextStrategy(outterFactory);
    metaTextManager.fontWeight = "bold";
    metaTextManager.fontSize = 24; 
    // // metaTextManager.textAnchor = "middle";
    let metaText1 = metaTextManager.create(300,460+50,"Aggregate");
    measureManager.svgRoot.appendChild(metaText1);
    let metaText2 = metaTextManager.create(300,460+90,"Octat. III");
    measureManager.svgRoot.appendChild(metaText2);
    let metaText3 = metaTextManager.create(300,460+130,"Diat. region");
    measureManager.svgRoot.appendChild(metaText3);
    metaTextManager.textAnchor = "end";
    let metaText1r = metaTextManager.create(500,460+50,"9/12");
    measureManager.svgRoot.appendChild(metaText1r);
    let metaText2r = metaTextManager.create(500,460+90,"7/8");
    measureManager.svgRoot.appendChild(metaText2r);
    let metaText3r = metaTextManager.create(500,460+130,"7/7");
    measureManager.svgRoot.appendChild(metaText3r);
});
