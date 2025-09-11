"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CvApiSimulator = void 0;
const el1_result_json_1 = __importDefault(require("./el1-result.json"));
const shapes_json_1 = __importDefault(require("./shapes.json"));
class CvApiSimulator {
    constructor() {
        this.calibrationInfo = null;
        this.measurementInfo = {
            imagesCaptures: false,
            elementsDetected: false,
            measuredElementIndexes: []
        };
    }
    async takeCalibrationPhotos() {
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
    }
    async getCalibrationInfo() {
        return {
            calibrationInfo: this.calibrationInfo
        };
    }
    async getMeasurementInfo() {
        return { measurementInfo: this.measurementInfo };
    }
    async takeMeasurementPhotos() {
        if (this.measurementInfo.imagesCaptures) {
            throw Error("Measurement photos were already taken");
        }
        this.measurementInfo = { ...(this.measurementInfo), imagesCaptures: true };
        return {};
    }
    async detectElements() {
        if (!this.measurementInfo.imagesCaptures) {
            throw Error("Measurement photos were not taken");
        }
        if (this.measurementInfo.elementsDetected) {
            throw Error("Elements were already detected");
        }
        this.measurementInfo = { ...(this.measurementInfo), elementsDetected: true };
        return {};
    }
    async getDetectedElements() {
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
    }
    async measureElement(elementI, shapeId, elementThickness) {
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
    }
    async getMeasuredElement(elementI) {
        if (!this.measurementInfo.measuredElementIndexes.includes(elementI)) {
            throw Error("Element was not measured");
        }
        //@ts-ignore
        const measurement = el1_result_json_1.default;
        return { measurement };
    }
    async clearMeasurementData() {
        this.measurementInfo = {
            imagesCaptures: false,
            elementsDetected: false,
            measuredElementIndexes: []
        };
        return {};
    }
    async listShapes() {
        const shapeDescriptions = shapes_json_1.default.map(({ _id, name }) => ({ _id, name }));
        return { shapes: shapeDescriptions };
    }
    async readShape(id) {
        //@ts-ignore
        const shape = shapes_json_1.default.find(shape => shape._id === id) || null;
        return { shape };
    }
}
exports.CvApiSimulator = CvApiSimulator;
