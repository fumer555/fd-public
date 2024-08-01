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

export default CrossShapeStrategy;