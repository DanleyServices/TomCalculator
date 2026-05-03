/**
 * Olson Acoustics Engine
 * 
 * Based on Harry F. Olson's Elements of Acoustical Engineering (1957)
 * 
 * This engine handles the core mathematical calculations for the acoustic
 * simulation modules. It translates classic acoustical formulas into 
 * JavaScript functions.
 */

class OlsonEngine {
    constructor() {
        // Core acoustical constants
        this.constants = {
            c: 343, // Speed of sound in air at 20°C (m/s)
            rho: 1.204, // Density of air at 20°C (kg/m³)
            p0: 0.00002 // Reference sound pressure in air (Pa), 20 μPa
        };
    }

    /**
     * Calculate Wavelength (λ)
     * λ = c / f
     * @param {number} frequency - Frequency in Hz
     * @returns {number} Wavelength in meters
     */
    calculateWavelength(frequency) {
        if (frequency <= 0) return 0;
        return this.constants.c / frequency;
    }

    /**
     * Calculate Sound Pressure Level (SPL)
     * SPL = 20 * log10(p / p0)
     * @param {number} pressure - Sound pressure in Pascals
     * @returns {number} SPL in Decibels (dB)
     */
    calculateSPL(pressure) {
        if (pressure <= 0) return -Infinity;
        return 20 * Math.log10(pressure / this.constants.p0);
    }
    
    // Additional equations from Stage 1 will be added here
}

// Export or initialize
const olsonCalc = new OlsonEngine();
console.log("Olson Engine initialized.");
