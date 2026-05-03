const fs = require('fs');
let html = fs.readFileSync('olson-book.html', 'utf8');

// 1. Add to top menu
html = html.replace(
    '<button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(9)">2.5 Piston</button>',
    '<button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(9)">2.5 Piston</button>\n            <button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(11)">5.2 Conical</button>\n            <button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(12)">5.3 Exp</button>'
);

// 2. Change PREV PAGE on Piston to CLICK TO TURN ->
html = html.replace(
    '<div class="page-number">7</div>\n                    <div class="hint" onclick="pageFlip.flipPrev()">← PREV PAGE</div>',
    '<div class="page-number">7</div>\n                    <div class="hint" onclick="pageFlip.flipNext()">CLICK TO TURN →</div>'
);

// 3. Add Pages 10, 11, 12 before closing book-wrapper
const newPages = `            <!-- PAGE 10: CHAPTER 5 COVER -->
            <div class="page cover" data-density="hard">
                <div class="page-content">
                    <h1>CHAPTER 5</h1>
                    <h2>HORNS</h2>
                    <p style="margin-top:40px; color:rgba(255,255,255,0.4); font-style:italic;">Acoustic Transformers</p>
                </div>
            </div>

            <!-- PAGE 11: 5.2 CONICAL HORN -->
            <div class="page">
                <div class="page-content">
                    <button class="history-btn" onclick="openHistory(122, 'Olson 5.2: Conical Horn (Page 122)')" title="View Original Book Capture">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H6v-4L3 12l3-3V6h4L12 2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <div class="page-header">5.2 Conical Horn</div>
                    <p class="description">
                        A conical horn has a cross-sectional area that increases as the square of the distance from the apex. Its acoustic resistance rises smoothly but never exhibits a sharp cutoff frequency.
                    </p>
                    
                    <div class="equation-box" style="font-size: 1.1rem;">
                        Z_{A1} = (ρc/S₁) [ (kr₁)²/(1+(kr₁)²) + j kr₁/(1+(kr₁)²) ]
                    </div>

                    <div class="controls">
                        <div class="control-group">
                            <label>Distance from Apex (r₁) [meters]</label>
                            <input type="range" id="distApex" min="0.1" max="5.0" step="0.1" value="1.0">
                            <div class="control-value"><span id="distApexVal">1.0</span> m</div>
                        </div>
                    </div>
                    
                    <div class="graph-wrapper" style="height: 250px;">
                        <canvas id="chartConicalHorn"></canvas>
                    </div>

                    <div class="page-number">8</div>
                </div>
            </div>

            <!-- PAGE 12: 5.3 EXPONENTIAL HORN -->
            <div class="page">
                <div class="page-content">
                    <button class="history-btn" onclick="openHistory(123, 'Olson 5.3: Exponential Horn (Page 123)')" title="View Original Book Capture">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H6v-4L3 12l3-3V6h4L12 2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <div class="page-header">5.3 Exponential Horn</div>
                    <p class="description">
                        An exponential horn's area increases exponentially. It acts as a high-pass filter, where acoustic resistance is zero below the cutoff frequency ($f_c$) and rises sharply above it.
                    </p>
                    
                    <div class="equation-box" style="font-size: 1.1rem;">
                        Z_{A1} = (ρc/S₁) [ √(1 - (f_c/f)²) + j (f_c/f) ]
                    </div>

                    <div class="controls">
                        <div class="control-group">
                            <label>Cutoff Frequency (f_c) [Hz]</label>
                            <input type="range" id="cutoffFreq" min="20" max="1000" step="10" value="100">
                            <div class="control-value"><span id="cutoffFreqVal">100</span> Hz</div>
                        </div>
                    </div>
                    
                    <div class="graph-wrapper" style="height: 250px;">
                        <canvas id="chartExponentialHorn"></canvas>
                    </div>

                    <div class="page-number">9</div>
                    <div class="hint" onclick="pageFlip.flipPrev()">← PREV PAGE</div>
                </div>
            </div>

        </div>`;
html = html.replace('        </div>\n    </div>\n\n    <!-- History Modal -->', newPages + '\n    </div>\n\n    <!-- History Modal -->');

// 4. Add Chart JS initialization
const initCharts = `            // 5.2 Conical Horn Chart
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

            // 5.3 Exponential Horn Chart
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
html = html.replace('            // Bessel function J1 approximation', initCharts);

// 5. Add update loop
const updateLoop = `                // 5.2 Conical Horn Update
                const distApex = parseFloat(document.getElementById('distApex').value);
                document.getElementById('distApexVal').innerText = distApex.toFixed(1);
                
                const freqs = chartConical.data.labels;
                const c = 343;
                const conicalR = freqs.map(f => {
                    const k = 2 * Math.PI * f / c;
                    const kr = k * distApex;
                    return (kr * kr) / (1 + kr * kr);
                });
                const conicalX = freqs.map(f => {
                    const k = 2 * Math.PI * f / c;
                    const kr = k * distApex;
                    return kr / (1 + kr * kr);
                });
                chartConical.data.datasets[0].data = conicalR;
                chartConical.data.datasets[1].data = conicalX;
                chartConical.update();

                // 5.3 Exponential Horn Update
                const fc = parseFloat(document.getElementById('cutoffFreq').value);
                document.getElementById('cutoffFreqVal').innerText = fc;
                
                const expR = freqs.map(f => {
                    if (f < fc) return 0;
                    return Math.sqrt(1 - Math.pow(fc/f, 2));
                });
                const expX = freqs.map(f => {
                    if (f < fc) return fc/f; // Pure mass reactance
                    return fc/f;
                });
                chartExp.data.datasets[0].data = expR;
                chartExp.data.datasets[1].data = expX;
                chartExp.update();

                requestAnimationFrame(renderCharts);`;
html = html.replace('                requestAnimationFrame(renderCharts);', updateLoop);

fs.writeFileSync('olson-book.html', html);
console.log("SUCCESS");
