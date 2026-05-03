const fs = require('fs');
let html = fs.readFileSync('olson-book.html', 'utf8');

// 1. Fix the top menu navigation names
html = html.replace('1.2 Wave Eq', '1.3 Wave Eq');
html = html.replace('2.4 Line', '2.5 Line');
html = html.replace('2.5 Piston', '2.13 Piston');

// Remove Chapter 5 from menu
html = html.replace(/\s*<button class="menu-btn" onclick="if\(pageFlip\) pageFlip.turnToPage\(11\)">5.2 Conical<\/button>/g, '');
html = html.replace(/\s*<button class="menu-btn" onclick="if\(pageFlip\) pageFlip.turnToPage\(12\)">5.3 Exp<\/button>/g, '');

// 2. Fix the page headers and descriptions
html = html.replace('1.2 Equation of Wave Motion', '1.3 Acoustical Wave Equation');
html = html.replace("openHistory(24, 'Olson 1.2: Equation of Wave Motion (Page 24)')", "openHistory(24, 'Olson 1.3: Acoustical Wave Equation (Page 24)')");

html = html.replace('2.4 Straight Line Source', '2.5 Straight Line Source');
html = html.replace("openHistory(56, 'Olson 2.4: Straight Line Source (Page 56)')", "openHistory(57, 'Olson 2.5: Straight Line Source (Page 57)')"); // Page 36 = 57 in PDF

html = html.replace('2.5 Circular Piston', '2.13 Plane Circular-Piston Source');
html = html.replace("openHistory(64, 'Olson 2.6: Circular Baffled Piston (Page 64)')", "openHistory(64, 'Olson 2.13: Plane Circular-Piston Source (Page 64)')"); // Page 43 = 64 in PDF

// 3. Remove Chapter 5 pages completely (pages 10, 11, 12)
// Since this is a bit hard with regex, I will use string splitting
const chap5Start = html.indexOf('<!-- PAGE 10: CHAPTER 5 COVER -->');
if (chap5Start !== -1) {
    const chap5End = html.indexOf('<!-- History Modal -->');
    if (chap5End !== -1) {
        // We need to keep the closing </div> for the book
        html = html.substring(0, chap5Start) + '        </div>\n    </div>\n\n    ' + html.substring(chap5End);
    }
}

// 4. Fix "CLICK TO TURN" vs "PREV PAGE"
html = html.replace(
    '<div class="page-number">9</div>\n                    <div class="hint" onclick="pageFlip.flipNext()">CLICK TO TURN →</div>',
    '<div class="page-number">9</div>\n                    <div class="hint" onclick="pageFlip.flipPrev()">← PREV PAGE</div>'
);

html = html.replace(
    '<div class="page-number">7</div>\n                    <div class="hint" onclick="pageFlip.flipNext()">CLICK TO TURN →</div>',
    '<div class="page-number">7</div>\n                    <div class="hint" onclick="pageFlip.flipNext()">CLICK TO TURN →</div>'
);
// Actually Page 9 should have PREV PAGE since it's the last page now.

// 5. Insert 2.6 Beam Tilting by Phase Shifting
// It will be page 9, and Piston will become page 10.
// Let's rewrite the Pages 8, 9, 10
// Page 8: 2.5 Line
// Page 9: 2.6 Beam Tilting
// Page 10: 2.13 Piston

// First, find the start of 2.13 Piston
const pistonRegex = /<!-- PAGE 9: 2\.5 CIRCULAR PISTON -->(.|\n)*?<div class="page-number">9<\/div>\n\s*<div class="hint" onclick="pageFlip.flipPrev\(\)">← PREV PAGE<\/div>\n\s*<\/div>\n\s*<\/div>/;
const pistonMatch = html.match(pistonRegex);

if (pistonMatch) {
    let pistonHtml = pistonMatch[0];
    pistonHtml = pistonHtml.replace('PAGE 9: 2.5 CIRCULAR PISTON', 'PAGE 10: 2.13 CIRCULAR PISTON');
    pistonHtml = pistonHtml.replace('<div class="page-number">9</div>', '<div class="page-number">10</div>');
    // Remove the old piston
    html = html.replace(pistonMatch[0], '');
    
    // Create new Page 9
    const beamTiltingHtml = `            <!-- PAGE 9: 2.6 BEAM TILTING -->
            <div class="page">
                <div class="page-content">
                    <button class="history-btn" onclick="openHistory(57, 'Olson 2.6: Beam Tilting by Phase Shifting (Page 57)')" title="View Original Book Capture">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H6v-4L3 12l3-3V6h4L12 2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <div class="page-header">2.6 Beam Tilting</div>
                    <p class="description">
                        By applying a progressive phase shift along the length of a line source, the main radiation lobe can be electronically "steered" or tilted without physically moving the array.
                    </p>
                    
                    <div class="equation-box" style="font-size: 1.1rem;">
                        R(α) = | sin((πL/λ)(sin α - δ)) / ((πL/λ)(sin α - δ)) |
                    </div>

                    <div class="controls">
                        <div class="control-group">
                            <label>Phase Delay (δ) [Steering Angle]</label>
                            <input type="range" id="steerAngle" min="-0.8" max="0.8" step="0.05" value="0.3">
                            <div class="control-value"><span id="steerAngleVal">0.30</span></div>
                        </div>
                    </div>
                    
                    <div class="graph-wrapper" style="height: 250px;">
                        <canvas id="chartBeamTilting"></canvas>
                    </div>

                    <div class="page-number">9</div>
                    <div class="hint" onclick="pageFlip.flipNext()">CLICK TO TURN →</div>
                </div>
            </div>

`;
    // Insert Beam tilting and then Piston
    // The previous page was 2.5 Line (which ends with page-number 8)
    // Find the end of 2.5 Line
    const lineSourceEnd = '                    <div class="page-number">8</div>\n                </div>\n            </div>';
    html = html.replace(lineSourceEnd, lineSourceEnd + '\n\n' + beamTiltingHtml + pistonHtml);
    
    // Fix the top menu turnToPage links
    html = html.replace('<button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(9)">2.13 Piston</button>', '<button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(9)">2.6 Tilting</button>\n            <button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(10)">2.13 Piston</button>');

    // Add Chart JS logic for Beam Tilting
    const initChart = `            // 2.6 Beam Tilting Chart
            const ctxBeam = document.getElementById('chartBeamTilting').getContext('2d');
            let chartBeam = new Chart(ctxBeam, {
                type: 'radar',
                data: {
                    labels: labelsAngles,
                    datasets: [{
                        label: 'Beam Tilting R(θ)',
                        data: Array(72).fill(0),
                        backgroundColor: 'rgba(240, 192, 64, 0.2)',
                        borderColor: '#f0c040',
                        borderWidth: 2,
                        pointRadius: 0
                    }]
                },
                options: { ...polarConfig, animation: false }
            });

            // 2.13 Circular Piston`;
    html = html.replace('            // 2.5 Circular Piston', initChart);

    // Add update loop for Beam Tilting
    const updateLoop = `                // 2.6 Beam Tilting Update
                const delta = parseFloat(document.getElementById('steerAngle').value);
                document.getElementById('steerAngleVal').innerText = delta.toFixed(2);
                
                const beamData = labelsAngles.map(a => {
                    const theta = a * Math.PI / 180;
                    // L/lambda fixed to 2.0 for clear visualization
                    const arg = Math.PI * 2.0 * (Math.sin(theta) - delta);
                    if (Math.abs(arg) < 0.001) return 1.0;
                    return Math.abs(Math.sin(arg) / arg);
                });
                chartBeam.data.datasets[0].data = beamData;
                chartBeam.update();

                // 2.13 Circular Piston Update`;
    html = html.replace('                // 2.5 Circular Piston Update', updateLoop);
}

// Save
fs.writeFileSync('olson-book.html', html);
console.log("AUDIT FIX COMPLETE");
