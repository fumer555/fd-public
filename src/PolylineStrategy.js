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

export default PolylineStrategy;