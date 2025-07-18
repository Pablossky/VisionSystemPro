export default class ContourData {
  constructor(mainContour = { points: [] }) {
    this.mainContour = mainContour;
  }

  static fromRaw(rawData) {
    return new ContourData(rawData.mainContour);
  }

  toJSON() {
    return {
      mainContour: this.mainContour
    };
  }
}
