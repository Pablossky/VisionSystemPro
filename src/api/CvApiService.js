import { CvApiSimulator } from "./CvApiSimulator";
let cvApi;
if (process.env.NODE_ENV === "development") {
    // 🔧 w dev używamy mocka
    cvApi = new CvApiSimulator();
}
else {
    // 🔧 w produkcji – realne IPC do Electron + DLL
    cvApi = {
        getCalibrationInfo: () => window.electronAPI.invoke("get-calibration-info"),
        takeCalibrationPhotos: () => window.electronAPI.invoke("take-calibration-photos"),
        getMeasurementInfo: () => window.electronAPI.invoke("get-measurement-info"),
        takeMeasurementPhotos: () => window.electronAPI.invoke("take-measurement-photos"),
        detectElements: () => window.electronAPI.invoke("detect-elements"),
        getDetectedElements: () => window.electronAPI.invoke("get-detected-elements"),
        measureElement: (elementI, shapeId, elementThickness) => window.electronAPI.invoke("measure-element", { elementI, shapeId, elementThickness }),
        getMeasuredElement: (elementI) => window.electronAPI.invoke("get-measured-element", { elementI }),
        clearMeasurementData: () => window.electronAPI.invoke("clear-measurement-data"),
        listShapes: () => window.electronAPI.invoke("list-shapes"),
        readShape: (id) => window.electronAPI.invoke("read-shape", id),
    };
}
export default cvApi;
