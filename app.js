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


function renderHorizontalBraces(braces, measureIndex, beatIndex) {//unused yet
  return braces.filter(brace => brace.star1.startsWith(`${measureIndex + 1} ${beatIndex + 1}`) && brace.star2.startsWith(`${measureIndex + 1} ${beatIndex + 1}`))
      .map(brace => `              <horizontalBrace star1="${brace.star1}" star2="${brace.star2}" bracketType="${brace.bracketType}"></curvedBrace>`).join('\n');
}


function renderMeasureDescription(measureDescription) {
  // 定义要添加的前置空格
  const indent = "              ";
  
  // 创建 <description> 标签起始部分
  let result = `${indent}<description>\n`;

  // 添加 <box> 标签
  result += `${indent}  <box>${measureDescription.box}</box>\n`;

  // 添加 <mm> 标签
  result += `${indent}  <mm>${measureDescription.mm}</mm>\n`;

  // 添加 <msc> 标签及其内容
  result += `${indent}  <msc>\n`;
  measureDescription.msc.forEach(mscItem => {
      result += `${indent}    <div>\n`;
      result += `${indent}      <leftMscText>${mscItem[0]}</leftMscText>\n`;
      result += `${indent}      <rightMscText>${mscItem[1]}</rightMscText>\n`;
      result += `${indent}    </div>\n`;
  });
  result += `${indent}  </msc>\n`;

  // 结束 <description> 标签
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
