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
  const leftMscText1 = document.getElementById('leftMscText1').value;
  const rightMscText1 = document.getElementById('rightMscText1').value;
  const boxText = document.getElementById('boxText').value;

  const leftMscText2 = document.getElementById('leftMscText2').value;
  const rightMscText2 = document.getElementById('rightMscText2').value;
  const mmText = document.getElementById('mmText').value;

  const leftMscText3 = document.getElementById('leftMscText3').value;
  const rightMscText3 = document.getElementById('rightMscText3').value;
  const beatCount = document.getElementById('beatCount').value;

  const measureDescription = {
      "box": boxText,
      "mm": mmText,
      "msc": [
          [leftMscText1, rightMscText1],
          [leftMscText2, rightMscText2],
          [leftMscText3, rightMscText3]
      ],
      "beatCount": beatCount
  };

  if (beatCount) {
      measures.push({ 
        beatCount, 
        braces: [],
        hBraces: [],
        offsets: [],
        measureDescription: measureDescription
    });


      document.getElementById('leftMscText1').value = '';  // Reset leftMscText1
      document.getElementById('rightMscText1').value = ''; // Reset rightMscText1
      document.getElementById('boxText').value = '';       // Reset boxText

      document.getElementById('leftMscText2').value = '';  // Reset leftMscText2
      document.getElementById('rightMscText2').value = ''; // Reset rightMscText2
      document.getElementById('mmText').value = '';        // Reset mmText

      document.getElementById('leftMscText3').value = '';  // Reset leftMscText3
      document.getElementById('rightMscText3').value = ''; // Reset rightMscText3
      document.getElementById('beatCount').value = '';     // Reset beatCount

      updateXMLPreview(); // Update XML preview
  }
}


function addCurvedBrace() {
  const starID1 = document.getElementById('starPair1').value;
  const starID2 = document.getElementById('starPair2').value;
  // Find measure and beat index for the stars, validate if they belong to the same beat
  const star1 = findStar(starID1);
  const star2 = findStar(starID2);

  document.getElementById('starPair1').value = '';
  document.getElementById('starPair2').value = '';

  if (star1 && star2 && star1.measureIndex === star2.measureIndex && star1.beatIndex === star2.beatIndex) {
      measures[star1.measureIndex].braces.push({ star1: starID1, star2: starID2, bracketType: "standard", ifOverride: "false" });
      updateXMLPreview();
  } else {
      alert("Stars must belong to the same beat.");
  }
}

function addHorizontalBrace() {
  const beatID1 = document.getElementById('beatPair1').value;
  const beatID2 = document.getElementById('beatPair2').value;
  // Find measure and beat index for the stars, validate if they belong to the same beat
  const beat1 = findBeat(beatID1);
  const beat2 = findBeat(beatID2);

  document.getElementById('beatPair1').value = '';
  document.getElementById('beatPair2').value = '';

  if (beat1 && beat2 && beat1.measureIndex === beat2.measureIndex) {
      measures[beat1.measureIndex].hBraces.push({ beat1: beatID1, beat2: beatID2, bracketType: "standard", ifOverride: "false" });
      updateXMLPreview();
  } else {
      alert("Beats must belong to the same measure.");
  }
}

function addOffset() {
  const beatID1 = document.getElementById('beatPair1').value;
  const beatID2 = document.getElementById('beatPair2').value;
  // Find measure and beat index for the stars, validate if they belong to the same beat
  const beat1 = findBeat(beatID1);
  const beat2 = findBeat(beatID2);

  document.getElementById('beatPair1').value = '';
  document.getElementById('beatPair2').value = '';

  if (beat1 && beat2 && beat1.measureIndex === beat2.measureIndex) {
      measures[beat1.measureIndex].offsets.push({ beat1: beatID1, beat2: beatID2, offsetType: "standard", ifOverride: "false" });
      updateXMLPreview();
  } else {
      alert("Beats must belong to the same measure.");
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

function findBeat(measureID) {
  let [measureIndex, beatIndex] = measureID.split(' ').map(Number);
  measureIndex--; // Adjust index as array is zero-based
  beatIndex--;
  if (measures[measureIndex] && measures[measureIndex].beatCount >= beatIndex) {
      return { measureIndex, beatIndex };
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
              <!-- optional vertical braces annotated beat-wise -->
${renderVerticalBraces(measure.braces, mIndex, bIndex)}`
              ).join('\n')}
              <!-- optional offsets -->
${renderOffsets(measure.offsets, mIndex)}
              <!-- optional horizontal braces -->
${renderHorizontalBraces(measure.hBraces, mIndex)}
${renderMeasureDescription(measure.measureDescription)}
            </measure>`
            ).join('\n')}
          </section>
        </score>
      </mdiv>
    </body>
  </music>
</mei>`;
}


function renderHorizontalBraces(hBraces, measureIndex) {//unused yet
  return hBraces.filter(hBrace => hBrace.beat1.startsWith(`${measureIndex + 1}`) && hBrace.beat2.startsWith(`${measureIndex + 1}`))
      .map(hBrace => `              <hBrace beat1="${hBrace.beat1}" beat2="${hBrace.beat2}" bracketType="${hBrace.bracketType}" ifOverride="${hBrace.ifOverride}"></hBrace>`).join('\n');
}

function renderOffsets(offsets, measureIndex) {//unused yet
  return offsets.filter(offset => offset.beat1.startsWith(`${measureIndex + 1}`) && offset.beat2.startsWith(`${measureIndex + 1}`))
      .map(offset => `              <offset beat1="${offset.beat1}" beat2="${offset.beat2}" offsetType="${offset.bracketType}" ifOverride="${offset.ifOverride}"/>`).join('\n');
}

function renderMeasureDescription(measureDescription) {
  const indent = "              ";
  let result = `${indent}<description>\n`;
  result += `${indent}  <box>${measureDescription.box}</box>\n`;
  result += `${indent}  <mm>${measureDescription.mm}</mm>\n`;
  result += `${indent}  <msc>\n`;
  measureDescription.msc.forEach(mscItem => {
      result += `${indent}    <div>\n`;
      result += `${indent}      <leftMscText>${mscItem[0]}</leftMscText>\n`;
      result += `${indent}      <rightMscText>${mscItem[1]}</rightMscText>\n`;
      result += `${indent}    </div>\n`;
  });
  result += `${indent}  </msc>\n`;
  result += `${indent}</description>`;
  return result;
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
