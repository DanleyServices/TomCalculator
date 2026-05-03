const fs = require('fs');
let html = fs.readFileSync('olson-book.html', 'utf8');

// 1. Update Top Menu
html = html.replace(
    '<button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(10)">2.13 Piston</button>',
    '<button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(10)">2.13 Piston</button>\n            <button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(12)">3.2 Strings</button>\n            <button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(13)">3.3 Bars</button>'
);

// 2. Add Chapter 3 Pages
const chap3Pages = `            <!-- PAGE 11: CHAPTER 3 COVER -->
            <div class="page cover" data-density="hard">
                <div class="page-content">
                    <h1>CHAPTER 3</h1>
                    <h2>MECHANICAL<br>VIBRATING<br>SYSTEMS</h2>
                    <p style="margin-top:40px; color:rgba(255,255,255,0.4); font-style:italic;">Strings, Bars, and Membranes</p>
                </div>
            </div>

            <!-- PAGE 12: 3.2 STRINGS -->
            <div class="page">
                <div class="page-content">
                    <button class="history-btn" onclick="openHistory(72, 'Olson 3.2: Strings (Page 56)')" title="View Original Book Capture">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H6v-4L3 12l3-3V6h4L12 2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <div class="page-header">3.2 Strings</div>
                    <p class="description">
                        The fundamental frequency of a stretched string depends on its length (l), tension (T), and mass per unit length (m). It is the basis of all stringed instruments.
                    </p>
                    
                    <div class="equation-box" style="font-size: 1.2rem;">
                        f = (1 / 2l) √(T / m)
                    </div>

                    <div class="controls">
                        <div class="control-group">
                            <label>Tension (T) [Newtons]</label>
                            <input type="range" id="stringTension" min="10" max="500" step="10" value="100">
                            <div class="control-value"><span id="stringTensionVal">100</span> N</div>
                        </div>
                        <div class="control-group" style="margin-top: 5px;">
                            <label>Length (l) [Meters]</label>
                            <input type="range" id="stringLength" min="0.3" max="2.0" step="0.1" value="1.0">
                            <div class="control-value"><span id="stringLengthVal">1.0</span> m</div>
                        </div>
                    </div>
                    
                    <div class="graph-wrapper" style="height: 180px;">
                        <canvas id="chartString"></canvas>
                    </div>
                    <p class="description" style="text-align: center; font-size: 0.9rem; color:var(--cyan); margin-top: 5px;">Fundamental Frequency: <span id="stringFreqDisp">15.8</span> Hz</p>

                    <div class="page-number">11</div>
                </div>
            </div>

            <!-- PAGE 13: 3.3 BARS -->
            <div class="page">
                <div class="page-content">
                    <button class="history-btn" onclick="openHistory(73, 'Olson 3.3: Transverse Vibration of Bars (Page 57)')" title="View Original Book Capture">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H6v-4L3 12l3-3V6h4L12 2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <div class="page-header">3.3 Transverse Bars</div>
                    <p class="description">
                        A bar clamped at one end (cantilever) vibrates transversely. The restoring force is due to stiffness, governed by Young's modulus (Q) and the radius of gyration (K).
                    </p>
                    
                    <div class="equation-box" style="font-size: 1.1rem;">
                        f = (0.5596 / l²) √(Q K² / ρ)
                    </div>

                    <div class="controls">
                        <div class="control-group">
                            <label>Length (l) [Meters]</label>
                            <input type="range" id="barLength" min="0.1" max="1.0" step="0.05" value="0.5">
                            <div class="control-value"><span id="barLengthVal">0.5</span> m</div>
                        </div>
                    </div>
                    
                    <div class="graph-wrapper" style="height: 180px;">
                        <canvas id="chartBar"></canvas>
                    </div>
                    <p class="description" style="text-align: center; font-size: 0.8rem; margin-top: 5px;">Animation showing transverse cantilever vibration.</p>

                    <div class="page-number">12</div>
                    <div class="hint" onclick="pageFlip.flipPrev()">← PREV PAGE</div>
                </div>
            </div>

`;

// Change Piston "PREV PAGE" to "CLICK TO TURN"
html = html.replace(
    '<div class="page-number">10</div>\n                    <div class="hint" onclick="pageFlip.flipPrev()">← PREV PAGE</div>',
    '<div class="page-number">10</div>\n                    <div class="hint" onclick="pageFlip.flipNext()">CLICK TO TURN →</div>'
);

// Inject pages
html = html.replace('        </div>\n    </div>\n\n    <!-- History Modal -->', chap3Pages + '        </div>\n    </div>\n\n    <!-- History Modal -->');

// 3. Add JS logic
const initCharts = `            // 3.2 String Chart
            const ctxString = document.getElementById('chartString').getContext('2d');
            let chartString = new Chart(ctxString, {
                type: 'line',
                data: {
                    labels: Array.from({length: 50}, (_, i) => i / 49),
                    datasets: [{
                        label: 'String Displacement',
                        data: Array(50).fill(0),
                        borderColor: '#00e5ff',
                        borderWidth: 3,
                        tension: 0.4,
                        pointRadius: 0
                    }]
                },
                options: { ...chartOptions, animation: false, scales: { x: { display: false }, y: { min: -1, max: 1, display: false } } }
            });

            // 3.3 Bar Chart
            const ctxBar = document.getElementById('chartBar').getContext('2d');
            let chartBar = new Chart(ctxBar, {
                type: 'line',
                data: {
                    labels: Array.from({length: 50}, (_, i) => i / 49),
                    datasets: [{
                        label: 'Bar Displacement',
                        data: Array(50).fill(0),
                        borderColor: '#f0c040',
                        borderWidth: 5,
                        tension: 0.2,
                        pointRadius: 0
                    }]
                },
                options: { ...chartOptions, animation: false, scales: { x: { display: false }, y: { min: -2, max: 2, display: false } } }
            });

            // Bessel function J1 approximation`;
html = html.replace('            // Bessel function J1 approximation', initCharts);

const updateLoop = `                // 3.2 Strings Update
                const T = parseFloat(document.getElementById('stringTension').value);
                const L = parseFloat(document.getElementById('stringLength').value);
                document.getElementById('stringTensionVal').innerText = T;
                document.getElementById('stringLengthVal').innerText = L.toFixed(1);
                
                const m = 0.01; // 10 grams per meter
                const freq = (1 / (2 * L)) * Math.sqrt(T / m);
                document.getElementById('stringFreqDisp').innerText = freq.toFixed(1);
                
                // Animate fundamental standing wave
                const stringData = chartString.data.labels.map(x => {
                    return Math.sin(x * Math.PI) * Math.sin(time * freq * 0.1);
                });
                chartString.data.datasets[0].data = stringData;
                chartString.update();

                // 3.3 Bars Update
                const barL = parseFloat(document.getElementById('barLength').value);
                document.getElementById('barLengthVal').innerText = barL.toFixed(2);
                
                // Cantilever mode shape approximation: y(x) = (cosh(k*x) - cos(k*x)) - 0.734*(sinh(k*x) - sin(k*x))
                const barFreq = 50 / (barL * barL); // Normalized for visual
                const barData = chartBar.data.labels.map(x => {
                    // x goes from 0 to 1
                    const val = x * x; // Simplified visual cantilever shape
                    return val * Math.sin(time * barFreq * 0.1);
                });
                chartBar.data.datasets[0].data = barData;
                chartBar.update();

                requestAnimationFrame(renderCharts);`;
html = html.replace('                requestAnimationFrame(renderCharts);', updateLoop);

fs.writeFileSync('olson-book.html', html);
console.log("CHAPTER 3 INJECTED");
