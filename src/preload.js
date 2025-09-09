const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  getMarker: (number) => ipcRenderer.invoke('get-marker', number),
  searchMarkers: (term) => ipcRenderer.invoke('search-markers', term),
  getElementsByMarker: (markerNumber) => ipcRenderer.invoke('get-elements-by-marker', markerNumber),
  getLogs: () => ipcRenderer.invoke('get-logs'),
  logAction: (data) => ipcRenderer.invoke('log-action', data),
  getAllUsers: () => ipcRenderer.invoke('get-all-users'),
  addUser: (data) => ipcRenderer.invoke('add-user', data),
  updateUserRole: (data) => ipcRenderer.invoke('update-user-role', data),
  savePDF: (buffer, defaultName) => ipcRenderer.invoke('save-pdf', buffer, defaultName),
});
