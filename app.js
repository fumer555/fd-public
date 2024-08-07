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
    document.getElementById('xmlPreview').value = renderXML();
}

function renderXML() {
    return `<mei xmlns="http://www.music-encoding.org/ns/mei">
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
${measures.map((m, index) => `              <measureDef n="${index + 1}" bcount="${m.beatCount}"/>`).join('\n')}
            </measureGrp>
          </scoreDef>
          <section>
${measures.map((measure, mIndex) => `            <measure n="${mIndex + 1}">
${Array.from({length: measure.beatCount}, (_, bIndex) => `              <beat n="${bIndex + 1}">
${lineOrder.split(' ').map(line => `                <star id="${mIndex + 1} ${bIndex + 1} ${line}" class="" ifStar="false" ifBracket="false"/>`).join('\n')}
              </beat>
              <setLabel beat="${bIndex + 1}" place="above"></setLabel>
              <curvedBrace beat="${bIndex + 1}" place="right"></curvedBrace>`).join('\n')}
            </measure>`).join('\n')}
          </section>
        </score>
      </mdiv>
    </body>
  </music>
</mei>`;
}

function downloadXML() {
    const xmlContent = document.getElementById('xmlPreview').value;
    const xmlBlob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(xmlBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "MEI_Stravinsky.xml";
    link.click();
    URL.revokeObjectURL(url); // Clean up
}

// Initialize XML preview
updateXMLPreview();
