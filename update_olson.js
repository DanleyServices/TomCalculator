const fs = require('fs');

let content = fs.readFileSync('olson-book.html', 'utf8');

content = content.replace(
    /<script src="https:\/\/cdn.jsdelivr.net\/npm\/chartjs-plugin-zoom@2.0.1\/dist\/chartjs-plugin-zoom.min.js"><\/script>/,
    '<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.min.js"></script>\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>'
);

content = content.replace(
    /openHistory\('wave_eq_book',\s*'Olson Eq 1.2: Wave Equation \(Aprox Page 16\)'\)/g,
    "openHistory(24, 'Olson 1.2: Equation of Wave Motion (Page 24)')"
);

content = content.replace(
    /openHistory\('plane_waves_book',\s*'Olson Eq 1.10: Plane Sound Waves \(Aprox Page 18\)'\)/g,
    "openHistory(27, 'Olson 1.4: Plane Sound Waves (Page 27)')"
);

content = content.replace(
    /openHistory\('spherical_waves_book',\s*'Olson Fig 1.2: Specific Acoustic Impedance \(Aprox Page 20\)'\)/g,
    "openHistory(29, 'Olson 1.5: Spherical Sound Waves (Page 29)')"
);

content = content.replace(
    /openHistory\('point_source_book',\s*'Olson 2.2: Point Source \(Aprox Page 22\)'\)/g,
    "openHistory(50, 'Olson 2.2: Simple Point Source (Page 50)')"
);

content = content.replace(
    /openHistory\('dipole_source_book',\s*'Olson Fig 2.2: Double Source \(Aprox Page 24\)'\)/g,
    "openHistory(52, 'Olson 2.3: Double Source (Page 52)')"
);

content = content.replace(
    /openHistory\('line_source_book',\s*'Olson Eq 2.3: Line Source \(Aprox Page 26\)'\)/g,
    "openHistory(56, 'Olson 2.4: Straight Line Source (Page 56)')"
);

content = content.replace(
    /openHistory\('piston_source_book',\s*'Olson Eq 2.11: Circular Piston \(Aprox Page 28\)'\)/g,
    "openHistory(64, 'Olson 2.6: Circular Baffled Piston (Page 64)')"
);

// Replace history modal HTML
const oldModalHtml = `    <!-- History Modal -->
    <div id="historyModal" class="history-modal" onclick="closeHistory()">
        <div class="history-content" onclick="event.stopPropagation()">
            <button class="history-close" onclick="closeHistory()">×</button>
            <img id="historyImg" src="" alt="Book Capture" style="max-width: 100%; max-height: 70vh; border-radius: 5px; box-shadow: 0 0 20px rgba(0,0,0,0.8);">
            <div id="historyCaption" class="history-caption"></div>
        </div>
    </div>`;

const newModalHtml = `    <!-- History Modal -->
    <div id="historyModal" class="history-modal" onclick="closeHistory()">
        <div class="history-content" onclick="event.stopPropagation()">
            <button class="history-close" onclick="closeHistory()">×</button>
            <canvas id="historyCanvas" style="max-width: 100%; max-height: 70vh; border-radius: 5px; box-shadow: 0 0 20px rgba(0,0,0,0.8); background: #fff;"></canvas>
            <div id="historyCaption" class="history-caption"></div>
            <div id="pdfLoading" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:#00e5ff; font-family:'Rajdhani', sans-serif; display:none;">Loading PDF...</div>
        </div>
    </div>`;

content = content.replace(oldModalHtml, newModalHtml);

// Replace history logic
const oldHistoryLogic = `        // HISTORY MODAL LOGIC (Using pre-generated vintage captures)
        function openHistory(imageName, caption) {
            document.getElementById('historyCaption').innerText = caption;
            document.getElementById('historyImg').src = 'images/' + imageName + '.png';
            document.getElementById('historyModal').classList.add('active');
        }

        function closeHistory() {
            document.getElementById('historyModal').classList.remove('active');
        }`;

const newHistoryLogic = `        // HISTORY MODAL LOGIC (PDF.js Rendering)
        let pdfDoc = null;
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            pdfjsLib.getDocument('Olson.pdf').promise.then(function(pdfDoc_) {
                pdfDoc = pdfDoc_;
            }).catch(function(err) {
                console.error('Error loading PDF: ', err);
            });
        }

        function openHistory(pageNum, caption) {
            document.getElementById('historyCaption').innerText = caption;
            document.getElementById('historyModal').classList.add('active');
            
            const canvas = document.getElementById('historyCanvas');
            const loading = document.getElementById('pdfLoading');
            const ctx = canvas.getContext('2d');
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.display = 'none';
            loading.style.display = 'block';

            if (!pdfDoc) {
                loading.innerText = "Error: Olson.pdf not found or blocked by CORS.";
                return;
            }

            pdfDoc.getPage(pageNum).then(function(page) {
                const viewport = page.getViewport({scale: 1.5});
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };
                page.render(renderContext).promise.then(function() {
                    loading.style.display = 'none';
                    canvas.style.display = 'block';
                });
            });
        }

        function closeHistory() {
            document.getElementById('historyModal').classList.remove('active');
        }`;

content = content.replace(oldHistoryLogic, newHistoryLogic);

fs.writeFileSync('olson-book.html', content);
console.log("Updated olson-book.html successfully");
