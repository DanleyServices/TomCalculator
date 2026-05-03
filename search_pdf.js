const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const fs = require('fs');

async function searchPdf() {
    const loadingTask = pdfjsLib.getDocument({
        url: 'Olson.pdf',
        standardFontDataUrl: 'node_modules/pdfjs-dist/standard_fonts/',
        disableFontFace: true
    });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    for (let i = 5; i <= 15; i++) { 
        try {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            let text = '';
            let lastY = -1;
            textContent.items.forEach(item => {
                if (lastY !== item.transform[5]) {
                    text += '\n';
                    lastY = item.transform[5];
                }
                text += item.str + ' ';
            });
            fullText += `\n--- PAGE ${i} ---\n` + text;
        } catch(e) {}
    }
    fs.writeFileSync('toc.txt', fullText);
}
searchPdf().catch(console.error);
