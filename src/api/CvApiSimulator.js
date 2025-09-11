var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import el1Result from "./el1-result.json";
import shapes from "./shapes.json";
export class CvApiSimulator {
    constructor() {
        this.calibrationInfo = null;
        this.measurementInfo = {
            imagesCaptures: false,
            elementsDetected: false,
            measuredElementIndexes: []
        };
    }
    takeCalibrationPhotos() {
        return __awaiter(this, void 0, void 0, function* () {
            this.calibrationInfo = {
                px_for_mm: 2.57142857142857,
                boardAreaBox: {
                    x: 0,
                    y: 0,
                    width: 746.666666666667,
                    height: 420,
                    angle: 0,
                },
                coveredAreaBox: {
                    x: 43.78991703798725,
                    y: 32.75125601780349,
                    width: 659.0868325906925,
                    height: 354.497487964393,
                    angle: 0,
                },
                camerasInfo: [
                    {
                        cameraName: '0a',
                        coveredBox: {
                            x: 43.78991703798725,
                            y: 32.75125601780349,
                            width: 329.54341629534625,
                            height: 177.2487439821965,
                            angle: 0,
                        }
                    },
                    {
                        cameraName: '0b',
                        coveredBox: {
                            x: 43.78991703798725,
                            y: 210,
                            width: 329.54341629534625,
                            height: 177.2487439821965,
                            angle: 0,
                        }
                    },
                    {
                        cameraName: '1a',
                        coveredBox: {
                            x: 373.3333333333335,
                            y: 32.75125601780349,
                            width: 329.54341629534625,
                            height: 177.2487439821965,
                            angle: 0,
                        }
                    },
                    {
                        cameraName: '1b',
                        coveredBox: {
                            x: 373.3333333333335,
                            y: 210,
                            width: 329.54341629534625,
                            height: 177.2487439821965,
                            angle: 0,
                        }
                    }
                ]
            };
            return {};
        });
    }
    getCalibrationInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                calibrationInfo: this.calibrationInfo
            };
        });
    }
    getMeasurementInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return { measurementInfo: this.measurementInfo };
        });
    }
    takeMeasurementPhotos() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.measurementInfo.imagesCaptures) {
                throw Error("Measurement photos were already taken");
            }
            this.measurementInfo = Object.assign(Object.assign({}, (this.measurementInfo)), { imagesCaptures: true });
            return {};
        });
    }
    detectElements() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.measurementInfo.imagesCaptures) {
                throw Error("Measurement photos were not taken");
            }
            if (this.measurementInfo.elementsDetected) {
                throw Error("Elements were already detected");
            }
            this.measurementInfo = Object.assign(Object.assign({}, (this.measurementInfo)), { elementsDetected: true });
            return {};
        });
    }
    getDetectedElements() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.measurementInfo.elementsDetected) {
                throw Error("Elements were not detected");
            }
            const detectedElement = {
                i: 0,
                shapeComparisons: [
                    {
                        diff: 0.246743646,
                        reversed: false,
                        shape: {
                            _id: "1abee980-0f4b-42da-9c58-27fbe101eb09",
                            name: "L001728656NCPAB"
                        }
                    },
                    {
                        diff: 0.246743646,
                        reversed: true,
                        shape: {
                            _id: "52afe9da-bbc9-4bc9-a8ef-8a753546e04d",
                            name: "L001728655NCPAB"
                        }
                    }
                ],
                elementBox: {
                    x: 129.44235355323642,
                    y: 75.04338645390149,
                    width: 264.3393234208776,
                    height: 163.25181868465802,
                    angle: 0,
                }
            };
            return {
                detectedElements: [detectedElement]
            };
        });
    }
    measureElement(elementI, shapeId, elementThickness) {
        return __awaiter(this, void 0, void 0, function* () {
            if (elementI !== 0) {
                throw Error("Element not detected");
            }
            if (!this.measurementInfo.elementsDetected) {
                throw Error("Elements were not detected");
            }
            if (this.measurementInfo.measuredElementIndexes.includes(elementI)) {
                throw Error("Element was already measured");
            }
            return {};
        });
    }
    getMeasuredElement(elementI) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.measurementInfo.measuredElementIndexes.includes(elementI)) {
                throw Error("Element was not measured");
            }
            //@ts-ignore
            const measurement = el1Result;
            return { measurement };
        });
    }
    clearMeasurementData() {
        return __awaiter(this, void 0, void 0, function* () {
            this.measurementInfo = {
                imagesCaptures: false,
                elementsDetected: false,
                measuredElementIndexes: []
            };
            return {};
        });
    }
    listShapes() {
        return __awaiter(this, void 0, void 0, function* () {
            const shapeDescriptions = shapes.map(({ _id, name }) => ({ _id, name }));
            return { shapes: shapeDescriptions };
        });
    }
    readShape(id) {
        return __awaiter(this, void 0, void 0, function* () {
            //@ts-ignore
            const shape = shapes.find(shape => shape._id === id) || null;
            return { shape };
        });
    }
}
