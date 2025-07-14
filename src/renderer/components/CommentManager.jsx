import React, { useEffect, useState } from 'react';

export default function CommentManager() {
  const [comments, setComments] = useState([]);
  const [newText, setNewText] = useState('');

  const fetchComments = async () => {
    const rows = await window.electronAPI.invoke('get-approval-comments');
    setComments(rows);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleAdd = async () => {
    if (newText.trim() === '') return;
    await window.electronAPI.invoke('add-approval-comment', newText.trim());
    setNewText('');
    fetchComments();
  };

  const handleDelete = async (id) => {
    await window.electronAPI.invoke('delete-approval-comment', id);
    fetchComments();
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Zarządzanie gotowymi komentarzami</h3>
      <input
        type="text"
        value={newText}
        onChange={e => setNewText(e.target.value)}
        placeholder="Nowy komentarz"
        style={{ marginRight: 10 }}
      />
      <button onClick={handleAdd}>Dodaj</button>

      <ul style={{ marginTop: 20 }}>
        {comments.map(c => (
          <li key={c.id} style={{ marginBottom: 10 }}>
            {c.text}
            <button
              style={{ marginLeft: 10 }}
              onClick={() => handleDelete(c.id)}
            >
              Usuń
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
