const fs = require('fs');
let html = fs.readFileSync('olson-book.html', 'utf8');

// 1. Update Top Menu
html = html.replace(
    '<button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(14)">3.4 Membranes</button>',
    '<button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(14)">3.4 Membranes</button>\n            <button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(16)">4.7 Analogies</button>'
);

// 2. Add Chapter 4 Pages
const chap4Pages = `            <!-- PAGE 15: CHAPTER 4 COVER -->
            <div class="page cover" data-density="hard">
                <div class="page-content">
                    <h1>CHAPTER 4</h1>
                    <h2>DYNAMICAL<br>ANALOGIES</h2>
                    <p style="margin-top:40px; color:rgba(255,255,255,0.4); font-style:italic;">Electrical, Mechanical & Acoustical Isomorphisms</p>
                </div>
            </div>

            <!-- PAGE 16: 4.7 ANALOGIES -->
            <div class="page">
                <div class="page-content">
                    <button class="history-btn" onclick="openHistory(99, 'Olson 4.7: Representation of Elements (Page 83)')" title="View Original Book Capture">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H6v-4L3 12l3-3V6h4L12 2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <div class="page-header">4.7 Dynamical Analogies</div>
                    <p class="description">
                        Olson's masterpiece: unifying physics. A series resonant circuit behaves identically across domains. Toggle the domain below to see how terms change while the math remains exactly the same!
                    </p>
                    
                    <div class="controls" style="display:flex; justify-content:center; gap:10px; margin-bottom:10px;">
                        <button class="menu-btn" style="padding:5px 10px;" onclick="setAnalogy('electrical')">Electrical</button>
                        <button class="menu-btn" style="padding:5px 10px;" onclick="setAnalogy('mechanical')">Mechanical</button>
                        <button class="menu-btn" style="padding:5px 10px;" onclick="setAnalogy('acoustical')">Acoustical</button>
                    </div>

                    <div class="equation-box" id="analogyEq" style="font-size: 1.1rem; padding: 10px;">
                        Z_E = R_E + j(ωL - 1/ωC)
                    </div>

                    <div class="controls">
                        <div class="control-group">
                            <label id="lblR">Resistance (R) [Ohms]</label>
                            <input type="range" id="valR" min="1" max="100" step="1" value="20">
                            <div class="control-value"><span id="dispR">20</span></div>
                        </div>
                        <div class="control-group" style="margin-top: 5px;">
                            <label id="lblL">Inductance (L) [Henrys]</label>
                            <input type="range" id="valL" min="0.01" max="0.5" step="0.01" value="0.1">
                            <div class="control-value"><span id="dispL">0.1</span></div>
                        </div>
                        <div class="control-group" style="margin-top: 5px;">
                            <label id="lblC">Capacitance (C) [Farads]</label>
                            <input type="range" id="valC" min="0.001" max="0.05" step="0.001" value="0.01">
                            <div class="control-value"><span id="dispC">0.01</span></div>
                        </div>
                    </div>
                    
                    <div class="graph-wrapper" style="height: 180px;">
                        <canvas id="chartAnalogy"></canvas>
                    </div>

                    <div class="page-number">15</div>
                    <div class="hint" onclick="pageFlip.flipPrev()">← PREV PAGE</div>
                </div>
            </div>

`;

// Change 3.4 Membrane "PREV PAGE" to "CLICK TO TURN"
html = html.replace(
    '<div class="page-number">13</div>\n                    <div class="hint" onclick="pageFlip.flipPrev()">← PREV PAGE</div>',
    '<div class="page-number">13</div>\n                    <div class="hint" onclick="pageFlip.flipNext()">CLICK TO TURN →</div>'
);

// Inject pages
html = html.replace('        </div>\n    </div>\n\n    <!-- History Modal -->', chap4Pages + '        </div>\n    </div>\n\n    <!-- History Modal -->');

// 3. Add Analogy Simulation Logic
const initAnalogy = `            // 4.7 Analogy Chart
            const ctxAnalogy = document.getElementById('chartAnalogy').getContext('2d');
            let chartAnalogy = new Chart(ctxAnalogy, {
                type: 'line',
                data: {
                    labels: Array.from({length: 100}, (_, i) => 1 + i), // Frequency 1 to 100
                    datasets: [
                        { label: 'Impedance Magnitude |Z|', data: [], borderColor: '#00e5ff', borderWidth: 2, tension: 0.4, pointRadius: 0 },
                        { label: 'Admittance |Y| (Response)', data: [], borderColor: '#f0c040', borderWidth: 2, tension: 0.4, pointRadius: 0 }
                    ]
                },
                options: { ...chartOptions, animation: false, scales: { x: { display: true, title: { display: true, text: 'Frequency (ω)', color: '#c8daf0' }, ticks: {color: '#c8daf0'} }, y: { min: 0, max: 200, ticks: {color: '#c8daf0'} } } }
            });

            // Domain switching logic
            let currentDomain = 'electrical';
            const domainConfig = {
                'electrical': {
                    eq: "Z_E = R_E + j(ωL - 1/ωC)",
                    lblR: "Resistance (R_E) [Ohms]",
                    lblL: "Inductance (L) [Henrys]",
                    lblC: "Capacitance (C) [Farads]"
                },
                'mechanical': {
                    eq: "Z_M = R_M + j(ωm - 1/ωC_M)",
                    lblR: "Mech. Resistance (R_M) [Mech. Ohms]",
                    lblL: "Mass (m) [Grams]",
                    lblC: "Compliance (C_M) [cm/Dyne]"
                },
                'acoustical': {
                    eq: "Z_A = R_A + j(ωM - 1/ωC_A)",
                    lblR: "Acoustic Resistance (R_A) [Acoustic Ohms]",
                    lblL: "Inertance (M) [g/cm^4]",
                    lblC: "Acoustic Capacitance (C_A) [cm^5/Dyne]"
                }
            };

            window.setAnalogy = function(domain) {
                currentDomain = domain;
                document.getElementById('analogyEq').innerText = domainConfig[domain].eq;
                document.getElementById('lblR').innerText = domainConfig[domain].lblR;
                document.getElementById('lblL').innerText = domainConfig[domain].lblL;
                document.getElementById('lblC').innerText = domainConfig[domain].lblC;
            };

            // Bessel function J1 approximation`;
html = html.replace('            // Bessel function J1 approximation', initAnalogy);

const updateAnalogy = `                // 4.7 Analogy Update
                const valR = parseFloat(document.getElementById('valR').value);
                const valL = parseFloat(document.getElementById('valL').value);
                const valC = parseFloat(document.getElementById('valC').value);
                
                document.getElementById('dispR').innerText = valR;
                document.getElementById('dispL').innerText = valL.toFixed(2);
                document.getElementById('dispC').innerText = valC.toFixed(3);
                
                const zMags = chartAnalogy.data.labels.map(w => {
                    const reactance = (w * valL) - (1 / (w * valC));
                    return Math.sqrt(valR*valR + reactance*reactance);
                });
                const admMags = zMags.map(z => 1000 / z); // Scaled for visual representation
                
                chartAnalogy.data.datasets[0].data = zMags;
                chartAnalogy.data.datasets[1].data = admMags;
                chartAnalogy.update();

                requestAnimationFrame(renderCharts);`;
html = html.replace('                requestAnimationFrame(renderCharts);', updateAnalogy);

fs.writeFileSync('olson-book.html', html);
console.log("CHAPTER 4 INJECTED");
