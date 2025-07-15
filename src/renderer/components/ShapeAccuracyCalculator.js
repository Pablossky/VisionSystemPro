// ShapeAccuracyCalculator.js
export default class ShapeAccuracyCalculator {
  constructor(tolerance) {
    this.tolerance = tolerance;
  }

  calculateAccuracy(elementData) {
    if (
      !elementData ||
      !elementData.mainContour ||
      !Array.isArray(elementData.mainContour.points) ||
      elementData.mainContour.points.length === 0
    ) {
      return 0;
    }

    const points = elementData.mainContour.points;
    const inside = points.filter(pt => Math.abs(pt.distance) <= this.tolerance).length;
    const percent = (inside / points.length) * 100;
    return Math.round(percent * 10) / 10;
  }
}