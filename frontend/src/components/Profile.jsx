import PasswordSettings from "./PasswordSettings.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { IconTrophy, IconCheckCircle, IconLibrary, IconChevronLeft } from "../icons.jsx";

function formatWatchTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export default function Profile() {
  const [tab, setTab] = useState("overview");
  const [courses, setCourses] = useState([]);
  const [courseError, setCourseError] = useState("");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("ct_user") || "null");

  useEffect(() => {
    api.getCourses().then(setCourses).catch(e => setCourseError(e.message));
    api.getMyStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="alert alert-danger" style={{ margin: 20 }}>{error}</p>;
  if (!stats) return <div className="state-screen"><span className="spinner" /></div>;

  const memberSince = stats.member_since
    ? new Date(stats.member_since.replace(" ", "T") + "Z").toLocaleDateString(undefined, { year: "numeric", month: "long" })
    : null;

  return (
    <div className="ct-profile">
      <Link to="/" className="ct-profile-back"><IconChevronLeft width={16} height={16} /> Back to your courses</Link>
      <h2 className="ct-profile-heading">{user?.username}</h2>
      {memberSince && <p className="ct-profile-sub">Member since {memberSince}</p>}

      <nav aria-label="Profile sections" style={{display:'flex',gap:12,margin:'24px 0'}}>
        <button className={`btn ${tab==='overview'?'btn-primary':'btn-secondary'}`} aria-pressed={tab==='overview'} onClick={()=>setTab('overview')}>Overview</button>
        {!user?.is_admin && <button className={`btn ${tab==='settings'?'btn-primary':'btn-secondary'}`} aria-pressed={tab==='settings'} onClick={()=>setTab('settings')}>Settings</button>}
        {user?.is_admin && <Link className="btn btn-secondary" to="/admin">Manage account in Admin</Link>}
      </nav>
      {tab==='overview' && <>
      <div className="ct-stat-grid">
        <div className="card ct-stat-card">
          <IconTrophy width={20} height={20} />
          <span className="ct-stat-value">{stats.streak_days}</span>
          <span className="ct-stat-label">day streak</span>
        </div>
        <div className="card ct-stat-card">
          <IconCheckCircle width={20} height={20} />
          <span className="ct-stat-value">{stats.lessons_completed}</span>
          <span className="ct-stat-label">lessons completed</span>
        </div>
        <div className="card ct-stat-card">
          <IconLibrary width={20} height={20} />
          <span className="ct-stat-value">{stats.courses_completed}</span>
          <span className="ct-stat-label">courses completed</span>
        </div>
        <div className="card ct-stat-card">
          <span className="ct-stat-value">{formatWatchTime(stats.watch_seconds)}</span>
          <span className="ct-stat-label">total watch time</span>
        </div>
      </div>

      <section style={{marginTop:32}}>
        <h2>Your learning</h2><p className="ct-profile-sub">Courses with saved learning progress.</p>
        {courseError && <p role="alert">{courseError}</p>}
        {!courseError && courses.filter(c=>c.has_access && c.percent_complete>0).length===0 && <div className="card" style={{padding:24}}><h3>Your next chapter starts here</h3><p>Start a lesson and your learning progress will appear here.</p><Link to="/" className="btn btn-primary">Explore courses</Link></div>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>{courses.filter(c=>c.has_access && c.percent_complete>0).map(c=><Link className="card" style={{padding:24,textDecoration:'none'}} key={c.id} to={`/course/${c.id}`}><h3>{c.title}</h3><p>{c.lesson_count} lessons · {c.percent_complete}% complete</p><progress max="100" value={c.percent_complete} aria-label={`${c.title} completion`} style={{width:'100%',accentColor:'var(--accent)'}} /></Link>)}</div>
      </section></>}
      {tab==='settings' && !user?.is_admin && <section><h2>Account settings</h2><p>Manage the security of your account.</p><PasswordSettings /></section>}
      <style>{`
        .ct-profile { max-width: 640px; margin: 0 auto; padding: var(--space-6) var(--space-5); }
        .ct-profile-back { display:inline-flex;align-items:center;gap:3px;color:var(--text-muted);text-decoration:none;font-size:var(--text-sm);margin-bottom:var(--space-5); }
        .ct-profile-back:hover { color:var(--accent); }
        .ct-profile-heading { font-size: var(--text-xl); }
        .ct-profile-sub { color: var(--text-muted); font-size: var(--text-sm); margin: 4px 0 var(--space-6); }
        .ct-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-3);
        }
        .ct-stat-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          padding: var(--space-4);
        }
        .ct-stat-card svg { color: var(--accent); margin-bottom: 2px; }
        .ct-stat-value { font-family: var(--font-display); font-size: 28px; font-weight: 700; }
        .ct-stat-label { font-size: var(--text-sm); color: var(--text-muted); }
      `}</style>
    </div>
  );
}
