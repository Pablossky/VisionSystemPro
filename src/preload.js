const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),

  // Markery i elementy
  getMarker: (number) => ipcRenderer.invoke('get-marker', number),
  searchMarkers: (term) => ipcRenderer.invoke('search-markers', term),
  getElementsByMarker: (markerNumber) => ipcRenderer.invoke('get-elements-by-marker', markerNumber),

  // Logi
  getLogs: () => ipcRenderer.invoke('get-logs'),
  logAction: (data) => ipcRenderer.invoke('log-action', data),

  // Użytkownicy
  getAllUsers: () => ipcRenderer.invoke('get-all-users'),
  addUser: (data) => ipcRenderer.invoke('add-user', data),
  updateUserRole: (data) => ipcRenderer.invoke('update-user-role', data),

  // PDF
  savePDF: (buffer, defaultName) => ipcRenderer.invoke('save-pdf', buffer, defaultName),

  // --- API CV ---
  takeCalibrationPhotos: () => ipcRenderer.invoke('take-calibration-photos'),
  getCalibrationInfo: () => ipcRenderer.invoke('get-calibration-info'),
  takeMeasurementPhotos: () => ipcRenderer.invoke('take-measurement-photos'),
  detectElements: () => ipcRenderer.invoke('detect-elements'),
  getDetectedElements: () => ipcRenderer.invoke('get-detected-elements'),
  measureElement: (elementI, shapeId, thickness) =>
    ipcRenderer.invoke('measure-element', { elementI, shapeId, thickness }),
  getMeasuredElement: (elementI) => ipcRenderer.invoke('get-measured-element', { elementI }),
  clearMeasurementData: () => ipcRenderer.invoke('clear-measurement-data'),
});
