const fs = require('fs');
let html = fs.readFileSync('olson-book.html', 'utf8');

// 1. Update Top Menu
html = html.replace(
    '<button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(16)">4.7 Analogies</button>',
    '<button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(16)">4.7 Analogies</button>\n            <button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(18)">5.21 Conical</button>\n            <button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(19)">5.22 Exp</button>'
);

// 2. Add Chapter 5 Pages
const chap5Pages = `            <!-- PAGE 17: CHAPTER 5 COVER -->
            <div class="page cover" data-density="hard">
                <div class="page-content">
                    <h1>CHAPTER 5</h1>
                    <h2>ACOUSTICAL<br>ELEMENTS</h2>
                    <p style="margin-top:40px; color:rgba(255,255,255,0.4); font-style:italic;">Acoustic Impedance & Horns</p>
                </div>
            </div>

            <!-- PAGE 18: 5.21 CONICAL HORN -->
            <div class="page">
                <div class="page-content">
                    <button class="history-btn" onclick="openHistory(118, 'Olson 5.21: Infinite Conical Horn (Page 102)')" title="View Original Book Capture">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H6v-4L3 12l3-3V6h4L12 2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <div class="page-header">5.21 Infinite Conical Horn</div>
                    <p class="description">
                        The conical horn is the simplest expanding waveguide. Its acoustic impedance behaves similarly to a pulsating sphere, exhibiting poor low-frequency resistance compared to exponential profiles.
                    </p>
                    
                    <div class="equation-box" style="font-size: 1.1rem;">
                        Z_A = (ρc/S)[ (k²r²) / (1+k²r²) + j(kr) / (1+k²r²) ]
                    </div>

                    <div class="controls">
                        <div class="control-group">
                            <label>Distance to Apex (r) [Meters]</label>
                            <input type="range" id="distApex" min="0.1" max="2.0" step="0.1" value="0.5">
                            <div class="control-value"><span id="distApexVal">0.5</span> m</div>
                        </div>
                    </div>
                    
                    <div class="graph-wrapper" style="height: 200px;">
                        <canvas id="chartConicalHorn"></canvas>
                    </div>
                    <p class="description" style="text-align: center; font-size: 0.8rem; color:var(--cyan); margin-top: 5px;">Acoustic Resistance (R) & Reactance (X)</p>

                    <div class="page-number">17</div>
                    <div class="hint" onclick="pageFlip.flipNext()">CLICK TO TURN →</div>
                </div>
            </div>

            <!-- PAGE 19: 5.22 EXPONENTIAL HORN -->
            <div class="page">
                <div class="page-content">
                    <button class="history-btn" onclick="openHistory(119, 'Olson 5.22: Infinite Exponential Horn (Page 103)')" title="View Original Book Capture">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H6v-4L3 12l3-3V6h4L12 2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <div class="page-header">5.22 Infinite Exponential Horn</div>
                    <p class="description">
                        The exponential horn is characterized by a "cutoff frequency" (f_c). Below f_c, the throat resistance is zero (pure reactance). Above f_c, it acts as a highly efficient acoustic transformer.
                    </p>
                    
                    <div class="equation-box" style="font-size: 1.1rem;">
                        f_c = (m * c) / (4 * π)
                    </div>

                    <div class="controls">
                        <div class="control-group">
                            <label>Cutoff Frequency (f_c) [Hz]</label>
                            <input type="range" id="cutoffFreq" min="50" max="500" step="10" value="150">
                            <div class="control-value"><span id="cutoffFreqVal">150</span> Hz</div>
                        </div>
                    </div>
                    
                    <div class="graph-wrapper" style="height: 200px;">
                        <canvas id="chartExponentialHorn"></canvas>
                    </div>
                    <p class="description" style="text-align: center; font-size: 0.8rem; color:var(--cyan); margin-top: 5px;">Notice the high-pass filter behavior at f_c.</p>

                    <div class="page-number">18</div>
                    <div class="hint" onclick="pageFlip.flipPrev()">← PREV PAGE</div>
                </div>
            </div>

`;

// Change 4.7 Analogies "PREV PAGE" to "CLICK TO TURN"
html = html.replace(
    '<div class="page-number">15</div>\n                    <div class="hint" onclick="pageFlip.flipPrev()">← PREV PAGE</div>',
    '<div class="page-number">15</div>\n                    <div class="hint" onclick="pageFlip.flipNext()">CLICK TO TURN →</div>'
);

// Inject pages
html = html.replace('        </div>\n    </div>\n\n    <!-- History Modal -->', chap5Pages + '        </div>\n    </div>\n\n    <!-- History Modal -->');

// 3. Add Horns Initialization Logic
const initHorns = `            // 5.21 Conical Horn Chart
            const ctxConical = document.getElementById('chartConicalHorn').getContext('2d');
            let chartConical = new Chart(ctxConical, {
                type: 'line',
                data: {
                    labels: Array.from({length: 100}, (_, i) => 20 + i * (1000/100)), // Frequency 20 to 1000
                    datasets: [
                        { label: 'Resistance (R)', data: [], borderColor: '#00e5ff', borderWidth: 2, tension: 0.4, pointRadius: 0 },
                        { label: 'Reactance (X)', data: [], borderColor: '#f0c040', borderDash: [5, 5], borderWidth: 2, tension: 0.4, pointRadius: 0 }
                    ]
                },
                options: { ...chartOptions, animation: false, scales: { x: { display: true, title: { display: true, text: 'Frequency (Hz)', color: '#c8daf0' }, ticks: {color: '#c8daf0'} }, y: { min: 0, max: 1.5, ticks: {color: '#c8daf0'} } } }
            });

            // 5.22 Exponential Horn Chart
            const ctxExp = document.getElementById('chartExponentialHorn').getContext('2d');
            let chartExp = new Chart(ctxExp, {
                type: 'line',
                data: {
                    labels: Array.from({length: 100}, (_, i) => 20 + i * (1000/100)),
                    datasets: [
                        { label: 'Resistance (R)', data: [], borderColor: '#00e5ff', borderWidth: 2, tension: 0.4, pointRadius: 0 },
                        { label: 'Reactance (X)', data: [], borderColor: '#f0c040', borderDash: [5, 5], borderWidth: 2, tension: 0.4, pointRadius: 0 }
                    ]
                },
                options: { ...chartOptions, animation: false, scales: { x: { display: true, title: { display: true, text: 'Frequency (Hz)', color: '#c8daf0' }, ticks: {color: '#c8daf0'} }, y: { min: 0, max: 1.5, ticks: {color: '#c8daf0'} } } }
            });

            // Bessel function J1 approximation`;
html = html.replace('            // Bessel function J1 approximation', initHorns);

const updateHorns = `                // 5.21 Conical Horn Update
                const distApex = parseFloat(document.getElementById('distApex').value);
                document.getElementById('distApexVal').innerText = distApex.toFixed(1);
                
                const freqs = chartConical.data.labels;
                const c_sound = 343;
                const conicalR = freqs.map(f => {
                    const k = 2 * Math.PI * f / c_sound;
                    const kr = k * distApex;
                    return (kr * kr) / (1 + kr * kr);
                });
                const conicalX = freqs.map(f => {
                    const k = 2 * Math.PI * f / c_sound;
                    const kr = k * distApex;
                    return kr / (1 + kr * kr);
                });
                chartConical.data.datasets[0].data = conicalR;
                chartConical.data.datasets[1].data = conicalX;
                chartConical.update();

                // 5.22 Exponential Horn Update
                const fc = parseFloat(document.getElementById('cutoffFreq').value);
                document.getElementById('cutoffFreqVal').innerText = fc;
                
                const expR = freqs.map(f => {
                    if (f < fc) return 0;
                    return Math.sqrt(1 - Math.pow(fc/f, 2));
                });
                const expX = freqs.map(f => {
                    if (f < fc) return fc/f; // Pure mass reactance below cutoff
                    return fc/f;
                });
                chartExp.data.datasets[0].data = expR;
                chartExp.data.datasets[1].data = expX;
                chartExp.update();

                requestAnimationFrame(renderCharts);`;
html = html.replace('                requestAnimationFrame(renderCharts);', updateHorns);

fs.writeFileSync('olson-book.html', html);
console.log("CHAPTER 5 INJECTED");
