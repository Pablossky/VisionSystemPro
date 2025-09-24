export default class ContourData {
  constructor(elementBox) {
    this.mainContour = elementBox.mainContour || { points: [] };
    this.additionalContours = elementBox.additionalContours || [];
    this.vcuts = elementBox.vcuts || [];
    
    // 🔹 uzupełniamy distance jeśli brak
    this.mainContour.points = this.mainContour.points.map(pt => ({
      position: pt.position || [0,0],
      modelPosition: pt.modelPosition || pt.position,
      distance: pt.distance ?? 0
    }));

    this.additionalContours = this.additionalContours.map(contour => ({
      points: contour.points.map(pt => ({
        position: pt.position || [0,0],
        modelPosition: pt.modelPosition || pt.position,
        distance: pt.distance ?? 0
      }))
    }));
  }

  // 🔹 konwertujemy do JSON do logów
  toJSON() {
    return {
      mainContour: this.mainContour,
      additionalContours: this.additionalContours,
      vcuts: this.vcuts
    };
  }

  // 🔹 obliczamy max distance dla konturów (przydatne np. do podświetlania)
  getMaxDistance() {
    const mainMax = Math.max(...this.mainContour.points.map(p => Math.abs(p.distance)));
    const additionalMax = Math.max(
      0,
      ...this.additionalContours.flatMap(c => c.points.map(p => Math.abs(p.distance)))
    );
    return Math.max(mainMax, additionalMax);
  }
}
