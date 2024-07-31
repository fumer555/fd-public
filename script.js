class SVGSystemManager {
    constructor(svgRootId, tones) {
        this.svgNS = "http://www.w3.org/2000/svg";
        this.svgRoot = document.getElementById(svgRootId);
        this.idMap = {};
        tones.forEach((item, index) => {
            this.idMap[item] = index + 1;
        });
    }

    createX(x, y) {
        let x1 = x - 8;
        let x2 = x + 8;
        let y1 = y - 10;
        let y2 = y + 10;
        let pathData = `M${x1},${y1} L${x2},${y2} M${x1},${y2} L${x2},${y1}`;
        let path = document.createElementNS(this.svgNS, "path");
        path.setAttribute("d", pathData);
        path.setAttribute("class", "cross"); // Ensure you have a 'cross' class defined in your CSS
        this.svgRoot.appendChild(path);
    }

    createXs(xAttributes) {
        const xStart = 300;
        const yStart = 855;
        for (let i = 0; i < xAttributes.length; i++) {
            const x = xStart + (xAttributes[i][0] - 1) * 65; // Calculate x based on the attribute
            const y = yStart + (xAttributes[i][1] - 1) * 40; // Calculate y based on the attribute
            this.createX(x, y); // Use 'this.' to refer to another method in the same class
        }
    }
    

    createPolylines(startY, incrementX, numLines, lineAttributes) {
        let y = startY;
        for (let i = 0; i < numLines; i++) {
            let attributes = lineAttributes[i];
            let polyline = document.createElementNS(this.svgNS, "polyline");
            polyline.setAttribute("points", `265,${y} ${265 + incrementX},${y}`);
            polyline.setAttribute("id", `line-${i}`);
            if (attributes && attributes[0]) {
                polyline.setAttribute("class", attributes[0]);
            }
            this.svgRoot.appendChild(polyline);

            // Create and append the text element for the number
            if (attributes && attributes[1] !== undefined) {
                let text = document.createElementNS(this.svgNS, "text");
                text.setAttribute("x", 265 - 60); //  units to the left of the line start
                text.setAttribute("y", y);
                text.setAttribute("font-family", "Times New Roman");
                text.setAttribute("font-size", "24");
                text.setAttribute("dominant-baseline", "middle"); // Center text vertically
                text.setAttribute("class", "black-fill");
                text.textContent = attributes[1];
                this.svgRoot.appendChild(text);
                console.log(`Creating text at x: 165, y: ${y} with value: ${attributes[1]}`);
            }

            y += 40; // Increment y by 40 for each line
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
        ["hidden", 4],
        ["", 9], // Add more tuples as needed for each line
        ["", 2],
        ["", 7],
        ["", 0],
        ["", 5],
        ["", 10],
        ["", 3],
        ["", 8],
        ["", 1]
    ]);
    // systemManager.createX(300, 1175);

    systemManager.createXs([
        [1,9],
        [1,10],
        [1,12],
        [2, 3]
    ]);
    
});