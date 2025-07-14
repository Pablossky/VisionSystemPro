const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  receive: (channel, callback) => {
    const validChannels = ['preview-element'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, data) => callback(data));
    }
  },
  getMarker: (number) => ipcRenderer.invoke('get-marker', number),
  searchMarkers: (term) => ipcRenderer.invoke('search-markers', term),
  getElementsByMarker: (markerNumber) => ipcRenderer.invoke('get-elements-by-marker', markerNumber),
  getElementById: (id) => ipcRenderer.invoke('get-element-by-id', id),
  getLogs: () => ipcRenderer.invoke('get-logs'),
  logAction: (data) => ipcRenderer.invoke('log-action', data),
  getAllUsers: () => ipcRenderer.invoke('get-all-users'),
  addUser: (data) => ipcRenderer.invoke('add-user', data),
  updateUserRole: (data) => ipcRenderer.invoke('update-user-role', data),
  replayLog: (log) => ipcRenderer.invoke('replay-log', log),
});
