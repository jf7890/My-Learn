import { useEffect, useState } from "react";
import { api } from "../api";

export default function CourseAccessEditor({ user, onClose }) {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    api.getUserCourseAccess(user.id).then((r) => { setData(r); setSelected(new Set(r.courses.filter((c) => c.granted).map((c) => c.id))); }).catch((e) => setError(e.message));
  }, [user.id]);
  const toggle = (id) => setSelected((old) => { const next = new Set(old); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const save = async () => { setSaving(true); setError(""); try { await api.setUserCourseAccess(user.id, [...selected]); setEditing(false); setNotice("Course access saved."); } catch(e) { setError(e.message); } finally { setSaving(false); } };
  return <div className="card ct-access-editor">
    <div className="ct-access-head"><div><strong>Course access — {user.username}</strong><p>Changes are enforced by the API, including video, subtitles, notes and progress.</p></div></div>
    <p role="status">{notice}</p>
    {error && <p className="alert alert-danger">{error}</p>}
    {!data ? <span className="spinner" /> : <>
      {editing && <div className="ct-access-actions"><button className="btn btn-secondary btn-sm" disabled={saving} onClick={() => setSelected(new Set(data.courses.map(c=>c.id)))}>Select all</button><button className="btn btn-secondary btn-sm" disabled={saving} onClick={() => setSelected(new Set())}>Select none</button></div>}
      <div className="ct-access-list">{data.courses.map((c) => <label key={c.id} className={`ct-checkbox access-checkbox ${!editing ? "access-readonly" : ""}`}><input disabled={!editing || saving} type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} /> <span>{c.title}</span></label>)}</div>
      <div className="ct-access-save"><button className="btn btn-primary" disabled={saving} onClick={editing ? save : ()=>{setEditing(true);setNotice("");}}>{saving ? "Saving…" : editing ? "Save" : "Edit access"}</button></div>
    </>}
    <style>{`.ct-access-editor{padding:18px}.ct-access-head{display:flex;justify-content:space-between;gap:12px}.ct-access-head p{margin:5px 0 0;color:var(--text-muted);font-size:12px}.ct-access-actions{display:flex;gap:8px;margin:14px 0}.ct-access-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;max-height:320px;overflow:auto}.ct-access-save{display:flex;justify-content:flex-end;margin-top:16px}`}</style>
  </div>;
}

