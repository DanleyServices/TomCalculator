const fs = require('fs');

let html = fs.readFileSync('olson-book.html', 'utf8');

// Update menu
html = html.replace(
    '<button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(9)">2.13 Piston</button>',
    '<button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(9)">2.6 Tilting</button>\n            <button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(10)">2.13 Piston</button>'
);

// We need to extract the Circular Piston page and replace it.
// Let's find exactly the Piston page
const pistonStartStr = '            <!-- PAGE 9: 2.5 CIRCULAR PISTON -->';
const pistonStartIndex = html.indexOf(pistonStartStr);

if (pistonStartIndex !== -1) {
    // Find the end of piston page (which is just before </div>\n    </div>\n\n    <!-- History Modal -->)
    const bookEndIndex = html.indexOf('        </div>\n    </div>\n\n    <!-- History Modal -->');
    let pistonHtml = html.substring(pistonStartIndex, bookEndIndex);
    
    // Remove it from the original HTML
    html = html.substring(0, pistonStartIndex) + html.substring(bookEndIndex);
    
    // Fix pistonHtml numbering
    pistonHtml = pistonHtml.replace('PAGE 9: 2.5 CIRCULAR PISTON', 'PAGE 10: 2.13 CIRCULAR PISTON');
    pistonHtml = pistonHtml.replace('<div class="page-number">7</div>', '<div class="page-number">10</div>'); // Wait, previous page number was 7?! Oh yeah, page numbers were out of sync. Let's fix them all!
    
    const beamTiltingHtml = `            <!-- PAGE 9: 2.6 BEAM TILTING -->
            <div class="page">
                <div class="page-content">
                    <button class="history-btn" onclick="openHistory(57, 'Olson 2.6: Beam Tilting by Phase Shifting (Page 57)')" title="View Original Book Capture">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H6v-4L3 12l3-3V6h4L12 2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <div class="page-header">2.6 Beam Tilting</div>
                    <p class="description">
                        By applying a progressive phase shift (δ) along the length of a line source, the main radiation lobe can be electronically "steered" without physically moving the array.
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
    
    pistonHtml = pistonHtml.replace('CLICK TO TURN →', '← PREV PAGE');
    pistonHtml = pistonHtml.replace('onclick="pageFlip.flipNext()"', 'onclick="pageFlip.flipPrev()"');
    
    // Inject them back
    html = html.replace('        </div>\n    </div>\n\n    <!-- History Modal -->', beamTiltingHtml + pistonHtml + '        </div>\n    </div>\n\n    <!-- History Modal -->');
    
    // Also we must update page numbers globally inside the book to be sequential
    // Cover: no number
    // Preface: 1
    // 1.3: 2
    // 1.4: 3
    // 1.5: 4
    // Chapter 2 Cover: no number
    // 2.2: 6
    // 2.3: 7
    // 2.5: 8
    // 2.6: 9
    // 2.13: 10
    
    html = html.replace('<div class="page-number">5</div>', '<div class="page-number">7</div>');
    html = html.replace('<div class="page-number">6</div>', '<div class="page-number">8</div>');
    
    // Wait, the "Chart JS logic for Beam Tilting" wasn't added yet!
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
            
    html = html.replace('            // Bessel function J1 approximation', initChart + '\n\n            // Bessel function J1 approximation');

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

                requestAnimationFrame(renderCharts);`;
                
    html = html.replace('                requestAnimationFrame(renderCharts);', updateLoop);

    fs.writeFileSync('olson-book.html', html);
    console.log("FIXED");
} else {
    console.log("PISTON START NOT FOUND");
}
