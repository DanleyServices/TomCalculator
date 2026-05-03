const fs = require('fs');
let html = fs.readFileSync('olson-book.html', 'utf8');

// 1. Update Top Menu
html = html.replace(
    '<button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(13)">3.3 Bars</button>',
    '<button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(13)">3.3 Bars</button>\n            <button class="menu-btn" onclick="if(pageFlip) pageFlip.turnToPage(14)">3.4 Membranes</button>'
);

// 2. Add Chapter 3.4 Page
const membranePage = `            <!-- PAGE 14: 3.4 MEMBRANES -->
            <div class="page">
                <div class="page-content">
                    <button class="history-btn" onclick="openHistory(77, 'Olson 3.4: Stretched Membranes (Page 61)')" title="View Original Book Capture">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H6v-4L3 12l3-3V6h4L12 2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <div class="page-header">3.4 Membranes</div>
                    <p class="description">
                        A stretched membrane (like a drumhead or condenser microphone diaphragm) vibrates in 2D modes. Its restoring force is tension. <br>
                        <span style="color:var(--cyan); font-weight:bold;">Tap the membrane below to strike it!</span>
                    </p>
                    
                    <div class="equation-box" style="font-size: 1.1rem;">
                        f₀₁ = (0.382 / R) √(T / m)
                    </div>

                    <div class="controls">
                        <div class="control-group">
                            <label>Tension (T) [N/m]</label>
                            <input type="range" id="membraneTension" min="10" max="1000" step="10" value="200">
                            <div class="control-value"><span id="membraneTensionVal">200</span></div>
                        </div>
                    </div>
                    
                    <div class="graph-wrapper" style="height: 200px; display:flex; justify-content:center; align-items:center; background: #000; border-radius: 5px; overflow: hidden; position: relative;">
                        <canvas id="membraneCanvas" width="100" height="100" style="width: 100%; height: 100%; cursor: crosshair; image-rendering: pixelated;"></canvas>
                        <div style="position:absolute; top:5px; right:5px; font-size:0.7rem; color:var(--cyan);">f₀₁: <span id="memFreq">0</span> Hz</div>
                    </div>

                    <div class="page-number">13</div>
                    <div class="hint" onclick="pageFlip.flipPrev()">← PREV PAGE</div>
                </div>
            </div>

`;

// Change 3.3 Bars "PREV PAGE" to "CLICK TO TURN"
html = html.replace(
    '<div class="page-number">12</div>\n                    <div class="hint" onclick="pageFlip.flipPrev()">← PREV PAGE</div>',
    '<div class="page-number">12</div>\n                    <div class="hint" onclick="pageFlip.flipNext()">CLICK TO TURN →</div>'
);

// Inject pages
html = html.replace('        </div>\n    </div>\n\n    <!-- History Modal -->', membranePage + '        </div>\n    </div>\n\n    <!-- History Modal -->');

// 3. Add Membrane Simulation Logic
const initMembrane = `            // 3.4 Membrane Simulation
            const memCanvas = document.getElementById('membraneCanvas');
            const memCtx = memCanvas.getContext('2d');
            const memSize = 100;
            let memU = new Float32Array(memSize * memSize);
            let memV = new Float32Array(memSize * memSize);
            const memImgData = memCtx.createImageData(memSize, memSize);
            
            // Strike the membrane on click/touch
            function strikeMembrane(e) {
                const rect = memCanvas.getBoundingClientRect();
                // Get click position relative to canvas
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                const x = Math.floor((clientX - rect.left) / rect.width * memSize);
                const y = Math.floor((clientY - rect.top) / rect.height * memSize);
                
                // Add a gaussian disturbance
                const radius = 4;
                for(let dy = -radius; dy <= radius; dy++) {
                    for(let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if(nx > 0 && nx < memSize-1 && ny > 0 && ny < memSize-1) {
                            const dist = Math.sqrt(dx*dx + dy*dy);
                            if(dist < radius) {
                                const idx = ny * memSize + nx;
                                memU[idx] -= (radius - dist) * 2.0; // Negative for downward strike
                            }
                        }
                    }
                }
            }
            
            memCanvas.addEventListener('mousedown', strikeMembrane);
            memCanvas.addEventListener('touchstart', strikeMembrane, {passive: true});

            // Prevent page turn when interacting with membrane
            memCanvas.addEventListener('mousedown', e => e.stopPropagation());
            memCanvas.addEventListener('touchstart', e => e.stopPropagation());

            // Bessel function J1 approximation`;
html = html.replace('            // Bessel function J1 approximation', initMembrane);

const updateMembrane = `                // 3.4 Membrane Update
                const tension = parseFloat(document.getElementById('membraneTension').value);
                document.getElementById('membraneTensionVal').innerText = tension;
                
                const memFreq = (0.382 / 0.1) * Math.sqrt(tension / 0.05); // Simulated params
                document.getElementById('memFreq').innerText = memFreq.toFixed(1);

                // Wave simulation physics
                const damping = 0.985; // Air friction / internal friction
                // Wave speed c relates to tension. For stability c must be < 0.5
                const c = Math.min(0.45, 0.1 + (tension / 1000) * 0.35); 
                
                let newU = new Float32Array(memSize * memSize);
                for(let y=1; y<memSize-1; y++) {
                    for(let x=1; x<memSize-1; x++) {
                        const i = y * memSize + x;
                        // Enforce circular boundary
                        const dx = x - memSize/2;
                        const dy = y - memSize/2;
                        if (dx*dx + dy*dy > (memSize/2)*(memSize/2)) {
                            newU[i] = 0;
                            continue;
                        }
                        
                        const laplacian = memU[i-1] + memU[i+1] + memU[i-memSize] + memU[i+memSize] - 4 * memU[i];
                        memV[i] += c * laplacian;
                        memV[i] *= damping;
                        newU[i] = memU[i] + memV[i];
                    }
                }
                memU = newU;

                // Render to imageData
                for(let i=0; i<memU.length; i++) {
                    const val = memU[i];
                    const pixelIdx = i * 4;
                    // Map val (-2 to 2) to color
                    // Base color dark blue #030a10 -> RGB(3, 10, 16)
                    // High amplitude cyan #00e5ff -> RGB(0, 229, 255)
                    // Negative amplitude gold #f0c040 -> RGB(240, 192, 64)
                    
                    if (val > 0) {
                        const intensity = Math.min(1, val * 0.5);
                        memImgData.data[pixelIdx] = 3 + intensity * 237;     // R
                        memImgData.data[pixelIdx+1] = 10 + intensity * 182;  // G
                        memImgData.data[pixelIdx+2] = 16 + intensity * 48;   // B (Mapped towards gold)
                    } else {
                        const intensity = Math.min(1, -val * 0.5);
                        memImgData.data[pixelIdx] = 3;                       // R
                        memImgData.data[pixelIdx+1] = 10 + intensity * 219;  // G
                        memImgData.data[pixelIdx+2] = 16 + intensity * 239;  // B (Mapped towards cyan)
                    }
                    
                    // Draw circular border
                    const x = i % memSize;
                    const y = Math.floor(i / memSize);
                    const dx = x - memSize/2;
                    const dy = y - memSize/2;
                    const rSq = dx*dx + dy*dy;
                    const maxRSq = (memSize/2)*(memSize/2);
                    if (rSq > maxRSq) {
                        memImgData.data[pixelIdx] = 0;
                        memImgData.data[pixelIdx+1] = 0;
                        memImgData.data[pixelIdx+2] = 0;
                        memImgData.data[pixelIdx+3] = 0; // Transparent outside circle
                    } else if (rSq > maxRSq - memSize) {
                        memImgData.data[pixelIdx] = 200; // Ring
                        memImgData.data[pixelIdx+1] = 218;
                        memImgData.data[pixelIdx+2] = 240;
                        memImgData.data[pixelIdx+3] = 255;
                    } else {
                        memImgData.data[pixelIdx+3] = 255; // Alpha
                    }
                }
                memCtx.putImageData(memImgData, 0, 0);

                requestAnimationFrame(renderCharts);`;
html = html.replace('                requestAnimationFrame(renderCharts);', updateMembrane);

fs.writeFileSync('olson-book.html', html);
console.log("MEMBRANE INJECTED");
