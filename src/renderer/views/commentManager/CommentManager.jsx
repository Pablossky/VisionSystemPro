import React, { useEffect, useState } from 'react';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import './CommentManager.css'; // Możesz stworzyć plik CSS

export default function CommentManager() {
  const [comments, setComments] = useState([]);
  const [newText, setNewText] = useState('');

  const fetchComments = async () => {
    try {
      const rows = await window.electronAPI.invoke('get-approval-comments');
      setComments(rows);
    } catch (err) {
      console.error('Błąd pobierania komentarzy:', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleAdd = async () => {
    if (newText.trim() === '') return;
    try {
      await window.electronAPI.invoke('add-approval-comment', newText.trim());
      setNewText('');
      fetchComments();
    } catch (err) {
      console.error('Błąd dodawania komentarza:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await window.electronAPI.invoke('delete-approval-comment', id);
      fetchComments();
    } catch (err) {
      console.error('Błąd usuwania komentarza:', err);
    }
  };

  return (
    <div className="comment-manager">
      <h2 className="cm-header">Zarządzanie komentarzami</h2>

      <div className="cm-input-wrapper">
        <input
          type="text"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          placeholder="Dodaj nowy komentarz..."
          className="cm-input"
        />
        <button className="cm-add-btn" onClick={handleAdd}>
          <FiPlus size={18} /> Dodaj
        </button>
      </div>

      <ul className="cm-list">
        {comments.map(c => (
          <li key={c.id} className="cm-item">
            <span className="cm-text">{c.text}</span>
            <button className="cm-delete-btn" onClick={() => handleDelete(c.id)}>
              <FiTrash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
