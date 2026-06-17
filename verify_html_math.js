const fs = require('fs');
const path = require('path');

function runVerification() {
    console.log("=== VERIFYING MATH INSIDE speaker-design.html ===");
    
    const htmlPath = path.join(__dirname, 'speaker-design.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Extract speakerDesignModule object from html
    const startMarker = 'const speakerDesignModule = {';
    const startIndex = htmlContent.indexOf(startMarker);
    if (startIndex === -1) {
        console.error("Could not find speakerDesignModule declaration in HTML!");
        process.exit(1);
    }
    
    // Find the matching closing brace for speakerDesignModule
    const endMarker = '// --- INTERACTIVE UI BINDINGS ---';
    const endIndex = htmlContent.indexOf(endMarker);
    if (endIndex === -1) {
        console.error("Could not find end marker in HTML!");
        process.exit(1);
    }
    
    // Extract the block
    let block = htmlContent.substring(startIndex, endIndex).trim();
    if (block.endsWith(';')) {
        block = block.slice(0, -1);
    }
    
    // Create an executable context
    let moduleInstance;
    try {
        eval(block + '; moduleInstance = speakerDesignModule;');
    } catch (err) {
        console.error("Error evaluating extracted speakerDesignModule block:", err);
        process.exit(1);
    }
    
    if (!moduleInstance) {
        console.error("Evaluation did not result in a valid module instance!");
        process.exit(1);
    }
    
    console.log("Extracted speakerDesignModule successfully.");
    
    // Test 1: Sealed alignment (Auto Mode, target Qtc = 0.707)
    // To get Qts = 0.38 exactly with Qms = 5.0:
    // 1/Qes = 1/0.38 - 1/5 = 2.431578 -> Qes = 0.4112676
    const test1Inputs = {
        fs: 35.0,
        qes: 0.4112676,
        qms: 5.00,
        vas: 80.0,
        sd: 220.0,
        xmax: 5.0,
        re: 6.0,
        pe: 50.0,
        qtc: 0.707,
        type: 'sealed',
        alignmentMode: 'auto',
        customVb: 40.0,
        customFb: 35.0,
        portDiameter: 7.5
    };
    
    const res1 = moduleInstance.compute(test1Inputs);
    console.log("Sealed Auto Test Results:", {
        vb: res1.vb,
        f3: res1.f3,
        qtc: res1.qtc,
        alignment: res1.alignment,
        cms: res1.cms,
        cab: res1.cab,
        eta0: res1.eta0
    });
    
    const vbExpected = 80 / (Math.pow(0.707/0.38, 2) - 1); // ~32.44
    const ratio = 0.707 / 0.38;
    const ftc = 35 * ratio; // 65.11
    const g2_num = (1 / (0.707 * 0.707)) - 2; // ~0
    const g2 = (g2_num + Math.sqrt(g2_num * g2_num + 4)) / 2; // 1
    const f3Expected = ftc * Math.sqrt(g2); // 65.11
    
    if (Math.abs(res1.vb - vbExpected) > 0.1) {
        console.error(`FAIL: Vb expected ${vbExpected}, got ${res1.vb}`);
        process.exit(1);
    }
    if (Math.abs(res1.f3 - f3Expected) > 0.1) {
        console.error(`FAIL: F3 expected ${f3Expected}, got ${res1.f3}`);
        process.exit(1);
    }
    
    console.log("Sealed Auto Test: PASS");
    
    // Test 2: Ported B4 alignment (Auto Mode, qts = 0.38)
    const test2Inputs = {
        fs: 35.0,
        qes: 0.4112676,
        qms: 5.00,
        vas: 80.0,
        sd: 220.0,
        xmax: 5.0,
        re: 6.0,
        pe: 50.0,
        qtc: 0.707,
        type: 'ported',
        alignmentMode: 'auto',
        customVb: 40.0,
        customFb: 35.0,
        portDiameter: 7.5
    };
    
    const res2 = moduleInstance.compute(test2Inputs);
    console.log("Ported B4 Auto Test Results:", {
        vb: res2.vb,
        f3: res2.f3,
        fb: res2.fb,
        portLength: res2.portLength,
        dmin: res2.dmin,
        alignment: res2.alignment,
        fpipe: res2.fpipe,
        vp: res2.vp,
        wmax: res2.wmax
    });
    
    const vbExpected2 = 80 * 0.38 * 0.38; // 11.552
    const fbExpected2 = 35 * Math.pow(0.38, -0.9); // 83.61
    const dminExpected2 = 0.1 * Math.sqrt(220 * 5 * res2.fb);
    
    if (Math.abs(res2.vb - vbExpected2) > 0.01) {
        console.error(`FAIL: Vb expected ${vbExpected2}, got ${res2.vb}`);
        process.exit(1);
    }
    if (Math.abs(res2.fb - fbExpected2) > 0.1) {
        console.error(`FAIL: Fb expected ${fbExpected2}, got ${res2.fb}`);
        process.exit(1);
    }
    if (Math.abs(res2.dmin - dminExpected2) > 0.1) {
        console.error(`FAIL: Dmin expected ${dminExpected2}, got ${res2.dmin}`);
        process.exit(1);
    }
    
    console.log("Ported B4 Test: PASS");

    // Test 3: Ported QB3 alignment (Auto Mode, qts = 0.30)
    // 1/Qes = 1/0.30 - 1/5 = 3.333 - 0.2 = 3.1333 -> Qes = 0.3191489
    const test3Inputs = {
        fs: 35.0,
        qes: 0.3191489,
        qms: 5.00,
        vas: 80.0,
        sd: 220.0,
        xmax: 5.0,
        re: 6.0,
        pe: 50.0,
        qtc: 0.707,
        type: 'ported',
        alignmentMode: 'auto',
        customVb: 40.0,
        customFb: 35.0,
        portDiameter: 7.5
    };
    
    const res3 = moduleInstance.compute(test3Inputs);
    console.log("Ported QB3 Auto Test Results:", {
        vb: res3.vb,
        f3: res3.f3,
        fb: res3.fb,
        portLength: res3.portLength,
        dmin: res3.dmin,
        alignment: res3.alignment
    });
    
    const vbExpected3 = 80 * 15 * Math.pow(0.30, 2.87);
    const fbExpected3 = 35 * 0.42 * Math.pow(0.30, -0.9);
    
    if (Math.abs(res3.vb - vbExpected3) > 1.0) {
        console.error(`FAIL: Vb expected ${vbExpected3}, got ${res3.vb}`);
        process.exit(1);
    }
    if (Math.abs(res3.fb - fbExpected3) > 1.0) {
        console.error(`FAIL: Fb expected ${fbExpected3}, got ${res3.fb}`);
        process.exit(1);
    }
    
    console.log("Ported QB3 Test: PASS");
    
    // Test 4: Curves check
    if (!res1.curves || !res1.curves.freqs || res1.curves.freqs.length === 0) {
        console.error("FAIL: Curves array empty or missing");
        process.exit(1);
    }
    console.log(`Curves generated successfully. Total data points: ${res1.curves.freqs.length}`);
    
    console.log("=== ALL MATH VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
    process.exit(0);
}

runVerification();
