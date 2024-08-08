let lineOrder = '';
let measures = [];
let scoreTitle = '';
let customFileName = '';

document.getElementById('scoreTitle').addEventListener('change', function() {
    scoreTitle = this.value;
});

document.getElementById('fileName').addEventListener('change', function() {
    customFileName = this.value;
});

document.getElementById('lineOrder').addEventListener('change', function() {
    lineOrder = this.value;
});

function addMeasure() {
  const beatCount = document.getElementById('beatCount').value;
  if (beatCount) {
      measures.push({ beatCount, braces: [] });
      document.getElementById('beatCount').value = ''; // Reset input
      updateXMLPreview(); // Update XML preview
  }
}


function addCurvedBrace() {
  const starID1 = document.getElementById('starPair1').value;
  const starID2 = document.getElementById('starPair2').value;
  // Find measure and beat index for the stars, validate if they belong to the same beat
  const star1 = findStar(starID1);
  const star2 = findStar(starID2);

  if (star1 && star2 && star1.measureIndex === star2.measureIndex && star1.beatIndex === star2.beatIndex) {
      measures[star1.measureIndex].braces.push({ star1: starID1, star2: starID2, bracketType: "standard" });
      updateXMLPreview();
  } else {
      alert("Stars must belong to the same beat.");
  }
}

function findStar(starID) {
  let [measureIndex, beatIndex, line] = starID.split(' ').map(Number);
  measureIndex--; // Adjust index as array is zero-based
  beatIndex--;
  if (measures[measureIndex] && measures[measureIndex].beatCount >= beatIndex) {
      return { measureIndex, beatIndex, line };
  }
  return null;
}

function updateXMLPreview() {
    document.getElementById('xmlPreview').value = renderXML();
}

function renderXML() {
  const lines = lineOrder.split(' ').map(n => `                <star id="${n}" class="" ifStar="false" ifBracket="false"/>`).join('\n');
  return `<mei xmlns="http://www.music-encoding.org/ns/mei">
  <meiHead>
    <fileDesc>
      <titleStmt>
        <title type="main">${scoreTitle || 'Untitled'}</title>
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
${lines}
              </beat>
              <setLabel beat="${bIndex + 1}" place="above"></setLabel>
              <!-- optional vertical braces -->
${renderVerticalBraces(measure.braces, mIndex, bIndex)}`
              ).join('\n')}
            </measure>`
            ).join('\n')}
          </section>
        </score>
      </mdiv>
    </body>
  </music>
</mei>`;
}


function renderHorizontalBraces(braces, measureIndex, beatIndex) {//unused yet
  return braces.filter(brace => brace.star1.startsWith(`${measureIndex + 1} ${beatIndex + 1}`) && brace.star2.startsWith(`${measureIndex + 1} ${beatIndex + 1}`))
      .map(brace => `              <horizontalBrace star1="${brace.star1}" star2="${brace.star2}" bracketType="${brace.bracketType}"></curvedBrace>`).join('\n');
}

function renderVerticalBraces(braces, measureIndex, beatIndex) {
  return braces.filter(brace => brace.star1.startsWith(`${measureIndex + 1} ${beatIndex + 1}`) && brace.star2.startsWith(`${measureIndex + 1} ${beatIndex + 1}`))
      .map(brace => `              <curvedBrace star1="${brace.star1}" star2="${brace.star2}" bracketType="${brace.bracketType}"></curvedBrace>`).join('\n');
}


function sanitizeFilename(title) {
    return title.replace(/[<>:"/\\|?*]+/g, '').replace(/[\s]+/g, '_'); // Remove problematic characters and replace spaces with underscores
}

function downloadXML() {
    const xmlContent = document.getElementById('xmlPreview').value;
    let filename = customFileName.trim() ? customFileName : sanitizeFilename(scoreTitle || 'MEI_Score');
    filename = filename ? `${filename}.xml` : 'MEI_Score.xml'; // Ensure there's a default filename
    const xmlBlob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(xmlBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url); // Clean up
}

// Initialize XML preview
updateXMLPreview();
