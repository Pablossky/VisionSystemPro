export default class ShapeAccuracyCalculator {
    constructor(tolerance = 2.0) {
        this.tolerance = tolerance;
    }

    /**
     * Oblicza procent punktów rzeczywistych zgodnych z modelem w granicach tolerancji
     * @param {Object} elementData - JSON z `mainContour.points`
     * @returns {number} - Procentowa zgodność (0–100)
     */
    calculateAccuracy(elementData) {
        const points = elementData.mainContour.points;
        if (!points || points.length === 0) return 0;

        const inside = points.filter(pt => Math.abs(pt.distance) <= this.tolerance).length;
        const percent = (inside / points.length) * 100;
        return Math.round(percent * 10) / 10;
    }
}
