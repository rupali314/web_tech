import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function getAge(dob) {
  const diff = Date.now() - new Date(dob).getTime();
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} old`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}m old` : `${years} year${years !== 1 ? 's' : ''} old`;
}

const STATUS_STYLES = {
  done:    'bg-emerald-50 text-emerald-700 border border-emerald-100',
  overdue: 'bg-red-50 text-red-600 border border-red-100',
  pending: 'bg-amber-50 text-amber-700 border border-amber-100',
};

const STATUS_LABEL = {
  done: '✓ Done',
  overdue: '⚠ Overdue',
  pending: '○ Pending',
};

export default function ChildTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editVaccine, setEditVaccine] = useState(null);
  const [vForm, setVForm] = useState({ status: 'done', givenOn: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchChild(); }, [id]);

  const fetchChild = async () => {
    try {
      const res = await api.get(`/children/${id}`);
      setChild(res.data);
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (vaccine) => {
    setEditVaccine(vaccine);
    setVForm({
      status: vaccine.status,
      givenOn: vaccine.givenOn ? vaccine.givenOn.split('T')[0] : '',
      notes: vaccine.notes || '',
    });
  };

  const handleVaccineSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch(`/children/${id}/vaccines/${editVaccine._id}`, vForm);
      setChild(res.data);
      setEditVaccine(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const quickMark = async (vaccine, status) => {
    try {
      const payload = { status };
      if (status === 'done') payload.givenOn = new Date().toISOString().split('T')[0];
      const res = await api.patch(`/children/${id}/vaccines/${vaccine._id}`, payload);
      setChild(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading...</div>;
  if (!child)  return null;

  const vaccines = child.vaccines || [];
  const filtered = filter === 'all' ? vaccines : vaccines.filter(v => v.status === filter);
  const done    = vaccines.filter(v => v.status === 'done').length;
  const overdue = vaccines.filter(v => v.status === 'overdue').length;
  const pending = vaccines.filter(v => v.status === 'pending').length;
  const pct = vaccines.length > 0 ? Math.round((done / vaccines.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="text-sm text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-1 transition"
      >
        ← Back to Dashboard
      </button>

      {/* Child header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-3xl">
            {child.gender === 'female' ? '👧' : '👦'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{child.name}</h1>
            <p className="text-sm text-slate-400">{getAge(child.dob)} · {child.gender}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Vaccination progress</span>
            <span>{pct}% complete</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center bg-emerald-50 rounded-xl py-3">
            <div className="text-xl font-bold text-emerald-600">{done}</div>
            <div className="text-xs text-emerald-500 mt-0.5">Done</div>
          </div>
          <div className="text-center bg-red-50 rounded-xl py-3">
            <div className="text-xl font-bold text-red-500">{overdue}</div>
            <div className="text-xs text-red-400 mt-0.5">Overdue</div>
          </div>
          <div className="text-center bg-amber-50 rounded-xl py-3">
            <div className="text-xl font-bold text-amber-500">{pending}</div>
            <div className="text-xs text-amber-400 mt-0.5">Pending</div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'pending', 'done', 'overdue'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-4 py-1.5 rounded-full border transition capitalize ${
              filter === f
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
          >
            {f === 'all' ? `All (${vaccines.length})` :
             f === 'done' ? `Done (${done})` :
             f === 'overdue' ? `Overdue (${overdue})` :
             `Pending (${pending})`}
          </button>
        ))}
      </div>

      {/* Vaccine list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">No vaccines in this category</div>
        )}

        {filtered.map(vaccine => (
          <div
            key={vaccine._id}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-slate-800 text-sm">{vaccine.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[vaccine.status]}`}>
                  {STATUS_LABEL[vaccine.status]}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Due: {vaccine.dueAt}
                {vaccine.givenOn && (
                  <span className="ml-2 text-emerald-500">
                    · Given: {new Date(vaccine.givenOn).toLocaleDateString()}
                  </span>
                )}
                {vaccine.notes && <span className="ml-2 text-slate-400">· {vaccine.notes}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {vaccine.status !== 'done' && (
                <button
                  onClick={() => quickMark(vaccine, 'done')}
                  className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-lg transition"
                >
                  Mark done
                </button>
              )}
              <button
                onClick={() => openEdit(vaccine)}
                className="text-xs text-slate-400 hover:text-blue-600 border border-slate-200 px-2.5 py-1 rounded-lg transition"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit vaccine modal */}
      {editVaccine && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Update Vaccine</h2>
            <p className="text-sm text-slate-400 mb-5">{editVaccine.name} · {editVaccine.dueAt}</p>

            <form onSubmit={handleVaccineSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={vForm.status}
                  onChange={e => setVForm({ ...vForm, status: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="pending">Pending</option>
                  <option value="done">Done</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              {vForm.status === 'done' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date given</label>
                  <input
                    type="date"
                    value={vForm.givenOn}
                    onChange={e => setVForm({ ...vForm, givenOn: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={vForm.notes}
                  onChange={e => setVForm({ ...vForm, notes: e.target.value })}
                  placeholder="e.g. mild fever after"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditVaccine(null)}
                  className="flex-1 border border-slate-300 text-slate-600 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg text-sm font-semibold transition"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
