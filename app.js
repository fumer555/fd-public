let lineOrder = '';
let measures = [];

document.getElementById('lineOrder').addEventListener('change', function() {
    lineOrder = this.value;
});

function addMeasure() {
    const beatCount = document.getElementById('beatCount').value;
    if (beatCount) {
        measures.push({ beatCount });
        document.getElementById('beatCount').value = ''; // Reset input
        updateXMLPreview(); // Update XML preview
    }
}

function updateXMLPreview() {
    const xmlContent = renderXML();
    document.getElementById('xmlPreview').textContent = xmlContent;
}

function renderXML() {
    const lines = lineOrder.split(' ').map(n => `<line n="${n}" class="" ifBracket="false"/>`).join('');

    return `
<mei xmlns="http://www.music-encoding.org/ns/mei">
    <meiHead>
        <fileDesc>
            <titleStmt>
                <title type="main">Stravinsky</title>
            </titleStmt>
            <pubStmt/>
        </fileDesc>
    </meiHead>
    <music>
        <body>
            <mdiv>
                <score>
                    <scoreDef line-order="${lineOrder}">
                        <measureGrp>
                            ${measures.map((m, index) => `<measureDef n="${index + 1}" bcount="${m.beatCount}"/>`).join('')}
                        </measureGrp>
                    </scoreDef>
                    <section>
                        ${measures.map((measure, index) => `
                        <measure n="${index + 1}">
                            ${Array.from({length: measure.beatCount}, (_, beatIndex) => `
                            <beat n="${beatIndex + 1}">
                                ${lines}
                            </beat>
                            <setLabel beat="${beatIndex + 1}" place="above"></setLabel>
                            <curvedBrace beat="${beatIndex + 1}" place="right"></curvedBrace>
                            `).join('')}
                        </measure>
                        `).join('')}
                    </section>
                </score>
            </mdiv>
        </body>
    </music>
</mei>`;
}

function downloadXML() {
    const xmlBlob = new Blob([renderXML()], { type: 'application/xml' });
    const url = URL.createObjectURL(xmlBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "MEI_Stravinsky.xml";
    link.click();
    URL.revokeObjectURL(url); // Clean up
}

// Initialize XML preview
updateXMLPreview();
