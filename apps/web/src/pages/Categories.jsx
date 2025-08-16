import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import ConfirmModal from '../components/ConfirmModal';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New category form
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Delete state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const data = await api.get('/categories');
      setCategories(data.categories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreateError('');
    setCreating(true);

    try {
      const data = await api.post('/categories', { name: newName });
      setCategories(prev => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function startEdit(category) {
    if (category.name === 'uncategorized') return;
    setEditingId(category.id);
    setEditName(category.displayName);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
  }

  async function handleUpdate(id) {
    setSaving(true);
    try {
      const data = await api.put(`/categories/${id}`, { name: editName });
      setCategories(prev => 
        prev.map(c => c.id === id ? data.category : c)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/categories/${deleteId}`);
      setCategories(prev => prev.filter(c => c.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  const categoryToDelete = categories.find(c => c.id === deleteId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Categories</h1>

      {/* Create new category */}
      <div className="card p-4">
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name..."
            className="input flex-1"
            maxLength={50}
            required
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="btn btn-primary"
          >
            {creating ? 'Adding...' : 'Add'}
          </button>
        </form>
        {createError && (
          <p className="text-red-400 text-sm mt-2">{createError}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Categories list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          No categories yet
        </div>
      ) : (
        <div className="card divide-y divide-slate-700/50">
          {categories.map((category) => (
            <div key={category.id} className="p-4 flex items-center gap-4">
              {editingId === category.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input flex-1"
                    maxLength={50}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') cancelEdit();
                      if (e.key === 'Enter') handleUpdate(category.id);
                    }}
                  />
                  <button
                    onClick={() => handleUpdate(category.id)}
                    disabled={saving || !editName.trim()}
                    className="btn btn-primary text-sm"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="btn btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-slate-100">
                    {category.displayName}
                    {category.name === 'uncategorized' && (
                      <span className="text-slate-500 text-sm ml-2">(default)</span>
                    )}
                  </span>
                  {category.name !== 'uncategorized' && (
                    <>
                      <button
                        onClick={() => startEdit(category)}
                        className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(category.id)}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.displayName}"? Expenses in this category will be moved to Uncategorized.`}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        isLoading={deleting}
      />
    </div>
  );
}

