import React, { useEffect, useState } from 'react';

export default function TemplateFileSelector({ onSelectElements }) {
  const [folders, setFolders] = useState([]);
  const [expandedFolder, setExpandedFolder] = useState('');
  const [folderElements, setFolderElements] = useState({});
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFolders = async () => {
      try {
        const fetchedFolders = await window.electronAPI.invoke('get-template-folders');
        setFolders(fetchedFolders);
      } catch (err) {
        setError('Nie udało się załadować folderów.');
        console.error(err);
      }
    };
    loadFolders();
  }, []);

  const toggleFolder = async (folderName) => {
    if (expandedFolder === folderName) {
      setExpandedFolder('');
      return;
    }

    setExpandedFolder(folderName);
    setError('');

    if (!folderElements[folderName]) {
      try {
        const items = await window.electronAPI.invoke('get-elements-from-folder', folderName);
        setFolderElements((prev) => ({ ...prev, [folderName]: items || [] }));
      } catch (err) {
        setError('Błąd podczas ładowania elementów.');
        console.error(err);
      }
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const confirmSelection = () => {
    const allElements = Object.values(folderElements).flat();
    const selected = allElements.filter(({ id }) => selectedIds.has(id));
    if (selected.length === 0) {
      setError('Proszę wybrać przynajmniej jeden element.');
      return;
    }
    onSelectElements(selected);
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Wybierz pliki wzorcowe</h2>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="space-y-2">
        {folders.map((folder) => (
          <div key={folder} className="border border-gray-700 rounded">
            <button
              onClick={() => toggleFolder(folder)}
              className="w-full text-left p-2 bg-gray-800 hover:bg-gray-700 font-semibold"
            >
              📁 {folder}
            </button>

            {expandedFolder === folder && (
              <div className="p-2 bg-gray-800">
                {folderElements[folder]?.length > 0 ? (
                  <ul className="space-y-1">
                    {folderElements[folder].map(({ id, name }) => (
                      <li key={id}>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(id)}
                            onChange={() => toggleSelection(id)}
                            className="accent-blue-500"
                          />
                          <span>{name || `Element ${id}`}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">Brak elementów w folderze.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {folders.length > 0 && (
        <button
          className="mt-4 w-full p-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
          onClick={confirmSelection}
        >
          Wybierz elementy
        </button>
      )}
    </div>
  );
}
