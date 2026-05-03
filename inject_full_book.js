const fs = require('fs');

let html = fs.readFileSync('olson-book.html', 'utf8');

// 1. EXTEND TOP MENU TO INCLUDE ALL KEY NEW PAGES
// We need to replace the last menu item to append the rest
let menuRegex = /<button class="menu-btn" onclick="if\(pageFlip\) pageFlip.turnToPage\(19\)">5\.22 Exp<\/button>/;
let newMenuItems = `<button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(19)">5.22 Exp</button>
            <button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(20)">5.27 Finite</button>
            <button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(23)">6.8 Baffles</button>
            <button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(25)">8.3 Mics</button>
            <button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(31)">11.2 Reverb</button>
            <button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(33)">12.6 Hearing</button>
            <button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(42)">End</button>`;
html = html.replace(menuRegex, newMenuItems);

// 2. BUILD THE MASSIVE REMAINING PAGES
// Currently ends at PAGE 19: 5.22 EXPONENTIAL HORN
// It has: <div class="page-number">18</div> <div class="hint" onclick="pageFlip.flipPrev()">← PREV PAGE</div>
html = html.replace(
    '<div class="page-number">18</div>\n                    <div class="hint" onclick="pageFlip.flipPrev()">← PREV PAGE</div>',
    '<div class="page-number">18</div>\n                    <div class="hint" onclick="pageFlip.flipNext()">CLICK TO TURN →</div>'
);

const newPages = `
            <!-- PAGE 20: 5.27 FINITE EXPONENTIAL HORN -->
            <div class="page">
                <div class="page-content">
                    <button class="history-btn" onclick="openHistory(124, 'Olson 5.27: Finite Exponential Horn (Page 108)')" title="View Original Book Capture">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H6v-4L3 12l3-3V6h4L12 2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <div class="page-header">5.27 Finite Horn</div>
                    <p class="description">
                        Unlike the infinite horn, a finite horn has acoustic reflections at the mouth. This creates standing waves (ripples in throat impedance) which cause uneven frequency response.
                    </p>
                    <div class="controls">
                        <div class="control-group">
                            <label>Horn Length (Meters)</label>
                            <input type="range" id="finiteLength" min="0.5" max="3.0" step="0.1" value="1.0">
                            <div class="control-value"><span id="finiteLengthVal">1.0</span> m</div>
                        </div>
                    </div>
                    <div class="graph-wrapper" style="height: 220px;">
                        <canvas id="chartFiniteHorn"></canvas>
                    </div>
                    <div class="page-number">19</div>
                </div>
            </div>

            <!-- PAGE 21: CHAPTER 6 COVER -->
            <div class="page cover" data-density="hard">
                <div class="page-content">
                    <h1>CHAPTER 6</h1>
                    <h2>DIRECT RADIATOR<br>LOUDSPEAKERS</h2>
                    <p style="margin-top:40px; color:rgba(255,255,255,0.4); font-style:italic;">Cones, Baffles and Enclosures</p>
                </div>
            </div>

            <!-- PAGE 22: CHAPTER 7 COVER -->
            <div class="page cover" data-density="hard">
                <div class="page-content">
                    <h1>CHAPTER 7</h1>
                    <h2>HORN<br>LOUDSPEAKERS</h2>
                    <p style="margin-top:40px; color:rgba(255,255,255,0.4); font-style:italic;">High Efficiency Systems</p>
                </div>
            </div>

            <!-- PAGE 23: 6.8 BAFFLES -->
            <div class="page">
                <div class="page-content">
                    <button class="history-btn" onclick="openHistory(165, 'Olson 6.8: Loudspeaker Baffles (Page 149)')" title="View Original Book Capture">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H6v-4L3 12l3-3V6h4L12 2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <div class="page-header">6.8 Baffles</div>
                    <p class="description">
                        Without a baffle, the rear wave cancels the front wave at low frequencies (acoustic short circuit). A finite baffle pushes this cancellation to lower frequencies.
                    </p>
                    <div class="controls">
                        <div class="control-group">
                            <label>Baffle Size (Meters)</label>
                            <input type="range" id="baffleSize" min="0.2" max="3.0" step="0.1" value="1.0">
                            <div class="control-value"><span id="baffleSizeVal">1.0</span> m</div>
                        </div>
                    </div>
                    <div class="graph-wrapper" style="height: 220px;">
                        <canvas id="chartBaffle"></canvas>
                    </div>
                    <div class="page-number">22</div>
                </div>
            </div>

            <!-- PAGE 24: CHAPTER 8 COVER -->
            <div class="page cover" data-density="hard">
                <div class="page-content">
                    <h1>CHAPTER 8</h1>
                    <h2>MICROPHONES</h2>
                    <p style="margin-top:40px; color:rgba(255,255,255,0.4); font-style:italic;">Pressure, Velocity & Gradients</p>
                </div>
            </div>

            <!-- PAGE 25: 8.3 VELOCITY MICS -->
            <div class="page">
                <div class="page-content">
                    <button class="history-btn" onclick="openHistory(291, 'Olson 8.3: Velocity Microphones (Page 275)')" title="View Original Book Capture">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H6v-4L3 12l3-3V6h4L12 2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <div class="page-header">8.3 Velocity Mics</div>
                    <p class="description">
                        A ribbon microphone operates on pressure gradient, giving it a natural Figure-8 (bidirectional) polar pattern, following cos(θ).
                    </p>
                    <div class="equation-box">R(θ) = cos(θ)</div>
                    <div class="graph-wrapper" style="height: 250px;">
                        <canvas id="chartMic"></canvas>
                    </div>
                    <div class="page-number">24</div>
                </div>
            </div>

            <!-- PAGE 26 TO 30: COVERS 9-10 -->
            <div class="page cover" data-density="hard"><div class="page-content"><h1>CHAPTER 9</h1><h2>MISC<br>TRANSDUCERS</h2></div></div>
            <div class="page cover" data-density="hard"><div class="page-content"><h1>CHAPTER 10</h1><h2>MEASUREMENTS</h2></div></div>
            
            <!-- PAGE 30: CHAPTER 11 COVER -->
            <div class="page cover" data-density="hard"><div class="page-content"><h1>CHAPTER 11</h1><h2>ARCHITECTURAL<br>ACOUSTICS</h2><p style="margin-top:40px; color:rgba(255,255,255,0.4); font-style:italic;">Collection & Dispersion</p></div></div>

            <!-- PAGE 31: 11.2 REVERBERATION -->
            <div class="page">
                <div class="page-content">
                    <div class="page-header">11.2 Reverberation</div>
                    <p class="description">Sabine's equation for T60 is the cornerstone of architectural acoustics.</p>
                    <div class="equation-box">T60 = 0.161 * V / A</div>
                    <div class="controls">
                        <div class="control-group">
                            <label>Volume V (m³)</label>
                            <input type="range" id="roomVol" min="100" max="10000" step="100" value="1000">
                            <div class="control-value"><span id="roomVolVal">1000</span> m³</div>
                        </div>
                    </div>
                    <div class="graph-wrapper" style="height: 220px;">
                        <canvas id="chartReverb"></canvas>
                    </div>
                    <div class="page-number">30</div>
                </div>
            </div>

            <!-- PAGE 32: CHAPTER 12 COVER -->
            <div class="page cover" data-density="hard"><div class="page-content"><h1>CHAPTER 12</h1><h2>SPEECH, MUSIC<br>& HEARING</h2></div></div>

            <!-- PAGE 33: 12.6 HEARING -->
            <div class="page">
                <div class="page-content">
                    <div class="page-header">12.6 Hearing Contours</div>
                    <p class="description">Fletcher-Munson equal-loudness contours show the non-linear frequency response of human hearing.</p>
                    <div class="graph-wrapper" style="height: 250px;">
                        <canvas id="chartHearing"></canvas>
                    </div>
                    <div class="page-number">32</div>
                </div>
            </div>

            <!-- PAGES 34-37: COVERS 13-16 -->
            <div class="page cover" data-density="hard"><div class="page-content"><h1>CHAPTER 13</h1><h2>COMPLETE<br>SYSTEMS</h2></div></div>
            <div class="page cover" data-density="hard"><div class="page-content"><h1>CHAPTER 14</h1><h2>COMMUNICATION</h2></div></div>
            <div class="page cover" data-density="hard"><div class="page-content"><h1>CHAPTER 15</h1><h2>ULTRASONICS</h2></div></div>
            <div class="page cover" data-density="hard"><div class="page-content"><h1>CHAPTER 16</h1><h2>UNDERWATER<br>SOUND</h2></div></div>

            <!-- PAGE 42: BACK COVER -->
            <div class="page cover" data-density="hard">
                <div class="page-content">
                    <h1>THE END</h1>
                    <h2>ELEMENTS OF<br>ACOUSTICAL ENGINEERING</h2>
                    <p style="margin-top:40px; color:rgba(255,255,255,0.4);">A Tribute to Harry F. Olson (1957)</p>
                    <div class="hint" onclick="pageFlip.flipPrev()">← PREV PAGE</div>
                </div>
            </div>
`;

html = html.replace('        </div>\n    </div>\n\n    <!-- History Modal -->', newPages + '        </div>\n    </div>\n\n    <!-- History Modal -->');

// 3. INJECT JS LOGIC FOR NEW CHARTS
const initJS = `            // 5.27 Finite Horn Chart
            const ctxFinite = document.getElementById('chartFiniteHorn').getContext('2d');
            let chartFinite = new Chart(ctxFinite, {
                type: 'line',
                data: { labels: Array.from({length: 100}, (_, i) => 20 + i * 8), datasets: [{ label: 'Throat Resistance', data: [], borderColor: '#00e5ff', borderWidth: 2, pointRadius: 0 }] },
                options: { ...chartOptions, animation: false, scales: { x: { display: true }, y: { min: 0, max: 2 } } }
            });

            // 6.8 Baffle Chart
            const ctxBaffle = document.getElementById('chartBaffle').getContext('2d');
            let chartBaffle = new Chart(ctxBaffle, {
                type: 'line',
                data: { labels: Array.from({length: 100}, (_, i) => 20 + i * 5), datasets: [{ label: 'Response (dB)', data: [], borderColor: '#f0c040', borderWidth: 2, pointRadius: 0 }] },
                options: { ...chartOptions, animation: false, scales: { x: { display: true }, y: { min: -20, max: 5 } } }
            });

            // 8.3 Mic Polar
            const ctxMic = document.getElementById('chartMic').getContext('2d');
            let chartMic = new Chart(ctxMic, {
                type: 'radar',
                data: { labels: labelsAngles, datasets: [{ label: 'Figure-8 Pattern', data: labelsAngles.map(a => Math.abs(Math.cos(a * Math.PI/180))), backgroundColor: 'rgba(0, 229, 255, 0.2)', borderColor: '#00e5ff', borderWidth: 2, pointRadius: 0 }] },
                options: { ...polarConfig, animation: false }
            });

            // 11.2 Reverb Chart
            const ctxReverb = document.getElementById('chartReverb').getContext('2d');
            let chartReverb = new Chart(ctxReverb, {
                type: 'line',
                data: { labels: Array.from({length: 50}, (_, i) => i/49 * 2.0), datasets: [{ label: 'Decay Curve', data: [], borderColor: '#a300ff', borderWidth: 2, fill: true, backgroundColor: 'rgba(163,0,255,0.1)', pointRadius: 0 }] },
                options: { ...chartOptions, animation: false, scales: { x: { title: {display:true, text:'Time (s)', color:'#fff'} }, y: { title:{display:true, text:'Level (dB)'}, min: -60, max: 0 } } }
            });

            // 12.6 Hearing Contours (Static approximations)
            const ctxHearing = document.getElementById('chartHearing').getContext('2d');
            let chartHearing = new Chart(ctxHearing, {
                type: 'line',
                data: { 
                    labels: [20, 50, 100, 200, 500, 1000, 2000, 4000, 8000, 16000], 
                    datasets: [
                        { label: '40 Phon', data: [70, 50, 40, 40, 40, 40, 38, 35, 45, 55], borderColor: '#00e5ff', tension: 0.4 },
                        { label: '80 Phon', data: [90, 85, 82, 80, 80, 80, 78, 75, 85, 90], borderColor: '#f0c040', tension: 0.4 }
                    ] 
                },
                options: { ...chartOptions, animation: false, scales: { x: { type: 'category' }, y: { min: 20, max: 120 } } }
            });

            // Bessel function J1 approximation`;

html = html.replace('            // Bessel function J1 approximation', initJS);

const updateJS = `                // 5.27 Finite Update
                const L_fin = parseFloat(document.getElementById('finiteLength').value);
                document.getElementById('finiteLengthVal').innerText = L_fin.toFixed(1);
                chartFinite.data.datasets[0].data = chartFinite.data.labels.map(f => {
                    const c = 343;
                    const wavelength = c/f;
                    // Standing wave ripples: 1 + 0.5 * sin(4pi L / lambda) (Simplified physics)
                    if (f < 150) return 0.1;
                    return 1 + 0.6 * Math.sin(4 * Math.PI * L_fin / wavelength) * (150/f);
                });
                chartFinite.update();

                // 6.8 Baffle Update
                const bSize = parseFloat(document.getElementById('baffleSize').value);
                document.getElementById('baffleSizeVal').innerText = bSize.toFixed(1);
                chartBaffle.data.datasets[0].data = chartBaffle.data.labels.map(f => {
                    const lambda = 343/f;
                    const ratio = bSize / lambda;
                    // Baffle roll-off simplified: 6dB per octave below where ratio = 0.5
                    if (ratio >= 0.5) return 0;
                    return Math.max(-20, 20 * Math.log10(ratio / 0.5));
                });
                chartBaffle.update();

                // 11.2 Reverb Update
                const vol = parseFloat(document.getElementById('roomVol').value);
                document.getElementById('roomVolVal').innerText = vol;
                const A = Math.pow(vol, 0.66) * 0.1; // Assumed absorption
                const t60 = 0.161 * vol / A;
                chartReverb.data.datasets[0].data = chartReverb.data.labels.map(t => {
                    return Math.max(-60, -60 * (t / t60));
                });
                chartReverb.update();

                requestAnimationFrame(renderCharts);`;

html = html.replace('                requestAnimationFrame(renderCharts);', updateJS);

fs.writeFileSync('olson-book.html', html);
console.log("FULL BOOK INJECTED");
