export default class ShapeAccuracyCalculator {
  constructor(pointTolerance = 0) {
    this.pointTolerance = pointTolerance;
  }

  // 🔹 Liczymy dokładność konturu na podstawie distance
  calculateAccuracy(contourData) {
    if (!contourData?.mainContour?.points) return 0;

    const points = contourData.mainContour.points;
    if (points.length === 0) return 0;

    const goodPoints = points.filter(p => Math.abs(p.distance ?? 0) <= this.pointTolerance).length;
    return (goodPoints / points.length) * 100;
  }

  // 🔹 Alternatywnie można dodać metodę do całego elementu, z dodatkContours
  calculateAccuracyFull(contourData) {
    let allPoints = [...(contourData.mainContour?.points || [])];
    contourData.additionalContours?.forEach(c => allPoints.push(...c.points));

    if (allPoints.length === 0) return 0;
    const goodPoints = allPoints.filter(p => Math.abs(p.distance ?? 0) <= this.pointTolerance).length;
    return (goodPoints / allPoints.length) * 100;
  }
}
