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

export default SVGElementFactory;