var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useEffect, useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import './TemplateFileSelector.css';
export default function TemplateFileSelector({ onSelectElements, preselectedElementIds = [] }) {
    const [folders, setFolders] = useState([]);
    const [folderElements, setFolderElements] = useState({});
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedKeys, setExpandedKeys] = useState([]);
    const folderRefs = useRef({});
    useEffect(() => {
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                const fetchedFolders = yield window.electronAPI.invoke('get-template-folders');
                setFolders(fetchedFolders);
                const allElementsPromises = fetchedFolders.map(folderName => window.electronAPI.invoke('get-elements-from-folder', folderName));
                const allElementsResults = yield Promise.all(allElementsPromises);
                const newFolderElements = {};
                fetchedFolders.forEach((folder, i) => {
                    newFolderElements[folder] = allElementsResults[i] || [];
                });
                setFolderElements(newFolderElements);
            }
            catch (err) {
                setError('Nie udało się załadować folderów.');
                console.error(err);
            }
        }))();
    }, []);
    useEffect(() => {
        if (preselectedElementIds.length > 0) {
            setSelectedIds(new Set(preselectedElementIds));
        }
    }, [preselectedElementIds]);
    const loadFolderElements = (folderName) => __awaiter(this, void 0, void 0, function* () {
        if (!folderElements[folderName]) {
            try {
                const items = yield window.electronAPI.invoke('get-elements-from-folder', folderName);
                setFolderElements((prev) => (Object.assign(Object.assign({}, prev), { [folderName]: items || [] })));
            }
            catch (err) {
                setError('Błąd podczas ładowania elementów.');
                console.error(err);
            }
        }
    });
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
    const toggleFolder = (idx) => {
        const key = idx.toString();
        if (expandedKeys.includes(key)) {
            setExpandedKeys(expandedKeys.filter(k => k !== key));
        }
        else {
            setExpandedKeys([...expandedKeys, key]);
            loadFolderElements(folders[idx]);
        }
    };
    const filteredFolders = folders
        .map((folder, idx) => {
        const elements = folderElements[folder] || [];
        const folderMatch = folder.toLowerCase().includes(searchTerm.toLowerCase());
        let filteredElements = elements.filter(({ name, id }) => (name || `Element ${id}`).toLowerCase().includes(searchTerm.toLowerCase()));
        if (preselectedElementIds.length > 0) {
            filteredElements = filteredElements.filter(({ id }) => preselectedElementIds.includes(id));
        }
        if (folderMatch || filteredElements.length > 0) {
            return { folder, idx, elements: filteredElements };
        }
        return null;
    })
        .filter(Boolean);
    const suggestions = [];
    if (searchTerm.trim() !== '') {
        folders.forEach((folder, idx) => {
            if (folder.toLowerCase().includes(searchTerm.toLowerCase())) {
                suggestions.push({ type: 'folder', folder, idx });
            }
            const elements = folderElements[folder] || [];
            elements.forEach(({ id, name }) => {
                if ((name || `Element ${id}`).toLowerCase().includes(searchTerm.toLowerCase())) {
                    suggestions.push({ type: 'element', folder, idx, id, name: name || `Element ${id}` });
                }
            });
        });
    }
    const onSuggestionClick = (suggestion) => {
        const key = suggestion.idx.toString();
        if (!expandedKeys.includes(key)) {
            setExpandedKeys((prev) => [...prev, key]);
            loadFolderElements(folders[suggestion.idx]);
        }
        setTimeout(() => {
            if (folderRefs.current[key]) {
                folderRefs.current[key].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 200);
    };
    return (React.createElement("div", { className: "template-selector-container" },
        React.createElement("h2", { className: "selector-title" }, "Wybierz pliki wzorcowe"),
        error && React.createElement("p", { className: "error-text" }, error),
        React.createElement("input", { type: "text", placeholder: "Szukaj folder\u00F3w lub element\u00F3w...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "search-input" }),
        searchTerm.trim() !== '' && suggestions.length > 0 && (React.createElement("div", { className: "suggestions-wrapper" }, suggestions.map((sugg, i) => {
            const baseClass = sugg.type === 'folder' ? 'suggestion-item folder' : 'suggestion-item element';
            return (React.createElement("div", { key: i, onClick: () => onSuggestionClick(sugg), className: baseClass, title: sugg.type === 'folder' ? `Folder: ${sugg.folder}` : `Element: ${sugg.name} w folderze ${sugg.folder}` },
                sugg.type === 'folder' ? '📁' : '📄',
                ' ',
                React.createElement("span", null,
                    sugg.type === 'folder' ? sugg.folder : `${sugg.name} `,
                    sugg.type === 'element' && React.createElement("small", { className: "folder-label" },
                        "(folder: ",
                        sugg.folder,
                        ")"))));
        }))),
        React.createElement("div", { className: "accordion-container" }, filteredFolders.length > 0 ? (filteredFolders.map(({ folder, idx, elements }) => {
            const isExpanded = expandedKeys.includes(idx.toString());
            return (React.createElement("div", { key: folder, className: `accordion-item ${isExpanded ? 'expanded' : ''}`, ref: el => { if (el)
                    folderRefs.current[idx.toString()] = el; } },
                React.createElement("div", { className: "accordion-header", onClick: () => toggleFolder(idx), role: "button", tabIndex: 0, onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ')
                        toggleFolder(idx); } },
                    React.createElement("span", { className: "folder-icon" }, isExpanded ? '▼' : '▶'),
                    " \uD83D\uDCC1 ",
                    folder),
                isExpanded && (React.createElement("div", { className: "accordion-body" }, elements.length > 0 ? (React.createElement("ul", { className: "accordion-elements-list" }, elements.map(({ id, name }) => (React.createElement("li", { key: id, style: {
                        backgroundColor: preselectedElementIds.includes(id) ? '#5566dd33' : 'transparent',
                        borderRadius: '6px',
                        padding: '2px 4px',
                    } },
                    React.createElement("label", { className: "accordion-label" },
                        React.createElement("input", { type: "checkbox", checked: selectedIds.has(id), onChange: () => toggleSelection(id), className: "checkbox" }),
                        React.createElement("span", null, name || `Element ${id}`))))))) : (React.createElement("p", { className: "empty-text" }, "Brak element\u00F3w w folderze."))))));
        })) : (React.createElement("p", { className: "empty-text" }, "Brak wynik\u00F3w wyszukiwania."))),
        React.createElement(Button, { variant: "primary", onClick: confirmSelection, className: "select-button" }, "Wybierz elementy")));
}
