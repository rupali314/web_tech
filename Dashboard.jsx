import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function getAge(dob) {
  const diff = Date.now() - new Date(dob).getTime();
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}m` : `${years} year${years !== 1 ? 's' : ''}`;
}

function getVaccineSummary(vaccines = []) {
  const done = vaccines.filter(v => v.status === 'done').length;
  const overdue = vaccines.filter(v => v.status === 'overdue').length;
  return { done, overdue, total: vaccines.length };
}

const EMPTY_FORM = { name: '', dob: '', gender: 'male' };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editChild, setEditChild] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchChildren(); }, []);

  const fetchChildren = async () => {
    try {
      const res = await api.get('/children');
      setChildren(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditChild(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (child) => {
    setEditChild(child);
    setForm({
      name: child.name,
      dob: child.dob?.split('T')[0] || '',
      gender: child.gender || 'male',
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditChild(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) return setFormError('Name is required');
    if (!form.dob) return setFormError('Date of birth is required');
    setSaving(true);
    try {
      if (editChild) {
        const res = await api.put(`/children/${editChild._id}`, form);
        setChildren(prev => prev.map(c => c._id === editChild._id ? res.data : c));
      } else {
        const res = await api.post('/children', form);
        setChildren(prev => [res.data, ...prev]);
      }
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/children/${id}`);
      setChildren(prev => prev.filter(c => c._id !== id));
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome, {user?.name}</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
        >
          + Add Child
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-slate-400">Loading...</div>
      )}

      {/* Empty state */}
      {!loading && children.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="text-5xl mb-4">👶</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No children added yet</h3>
          <p className="text-slate-400 text-sm mb-6">Add your child to start tracking vaccinations</p>
          <button
            onClick={openAdd}
            className="bg-blue-600 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition"
          >
            Add First Child
          </button>
        </div>
      )}

      {/* Children grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {children.map(child => {
          const { done, overdue, total } = getVaccineSummary(child.vaccines);
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <div
              key={child._id}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition cursor-pointer"
              onClick={() => navigate(`/child/${child._id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-xl">
                    {child.gender === 'female' ? '👧' : '👦'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{child.name}</h3>
                    <p className="text-xs text-slate-400">Age: {getAge(child.dob)}</p>
                  </div>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => openEdit(child)}
                    className="text-xs text-slate-500 hover:text-blue-600 border border-slate-200 px-2.5 py-1 rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(child._id)}
                    className="text-xs text-slate-500 hover:text-red-600 border border-slate-200 px-2.5 py-1 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{done} of {total} vaccines done</span>
                  <span>{pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                  ✓ {done} done
                </span>
                {overdue > 0 && (
                  <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2.5 py-0.5 rounded-full">
                    ⚠ {overdue} overdue
                  </span>
                )}
                <span className="text-xs bg-slate-50 text-slate-500 border border-slate-100 px-2.5 py-0.5 rounded-full">
                  {total - done - overdue} pending
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">
              {editChild ? 'Edit Child' : 'Add Child'}
            </h2>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Child's name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Arjun"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of birth</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={e => setForm({ ...form, dob: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={e => setForm({ ...form, gender: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-slate-300 text-slate-600 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg text-sm font-semibold transition"
                >
                  {saving ? 'Saving...' : editChild ? 'Save Changes' : 'Add Child'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Delete child?</h2>
            <p className="text-sm text-slate-500 mb-6">This will remove all vaccination records. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-slate-300 text-slate-600 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
