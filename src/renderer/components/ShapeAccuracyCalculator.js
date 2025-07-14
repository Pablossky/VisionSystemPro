// ShapeAccuracyCalculator.js
export default class ShapeAccuracyCalculator {
  constructor(tolerance) {
    this.tolerance = tolerance;
  }

  calculateAccuracy(elementData) {
    const points = elementData.mainContour.points;
    if (!points || points.length === 0) return 0;

    const inside = points.filter(pt => Math.abs(pt.distance) <= this.tolerance).length;
    const percent = (inside / points.length) * 100;
    return Math.round(percent * 10) / 10;
  }
}
