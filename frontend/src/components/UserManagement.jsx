import {useEffect,useState} from 'react';
import {Link,useParams,useSearchParams} from 'react-router-dom';
import {api} from '../api';
import PasswordSettings from './PasswordSettings.jsx';
import {CourseAccessEditor} from './AdminDashboard.jsx';
export default function UserManagement(){
 const {userId}=useParams();const [params,setParams]=useSearchParams();const tab=params.get('section')||'overview';
 const [data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const load=()=>api.getManagedUser(userId).then(setData).catch(e=>setError(e.message));
 useEffect(()=>{setData(null);load();const refresh=()=>load();window.addEventListener('focus',refresh);return()=>window.removeEventListener('focus',refresh)},[userId]);
 const self=String(JSON.parse(localStorage.getItem('ct_user')||'null')?.id)===String(userId);
 async function emailSubmit(e){e.preventDefault();const form=e.currentTarget;setBusy(true);setNotice('');try{await api.setManagedEmail(userId,Object.fromEntries(new FormData(form)));form.reset();await load();setNotice('Recovery email updated. Existing reset links revoked.')}catch(err){setNotice(err.message)}finally{setBusy(false)}}
 if(!data)return <p role="status">{error||'Loading user…'}</p>;
 const {user,stats}=data;
 return <section><Link to="/admin">← All users</Link><header style={{margin:'24px 0'}}><span className="sl-eyebrow">USER MANAGEMENT</span><h1>{user.username}</h1><p>{user.is_admin?'Administrator':'Member'} · {user.email||'No recovery email'}</p></header><div className="managed-user-layout"><nav aria-label="User management sections" className="managed-user-nav">{[['overview','Overview'],['access','Course access'],['password',self?'Change my password':'Reset password'],['email','Authentication email']].map(([id,label])=><button className={`btn ${tab===id?'btn-primary':'btn-secondary'}`} key={id} aria-current={tab===id?'page':undefined} onClick={()=>{setParams({section:id});setNotice('')}}>{label}</button>)}</nav><div className="managed-user-content">
 {tab==='overview'&&<><div className="card" style={{padding:24}}><h2>Identity</h2><dl><dt>Username</dt><dd>{user.username}</dd><dt>Recovery email</dt><dd>{user.email||'Not configured'}</dd><dt>Created</dt><dd>{user.created_at}</dd><dt>Last sign-in</dt><dd>{user.last_login_at||'Never'}</dd><dt>Authentication</dt><dd>{user.jellyfin_user_id?'Jellyfin linked':'Local account'}</dd></dl></div><div className="ct-stat-grid">{[[stats.streak_days,'day streak'],[stats.lessons_completed,'lessons completed'],[stats.courses_completed,'courses completed']].map(([n,label])=><div className="card" style={{padding:22}} key={label}><strong style={{fontSize:30}}>{n}</strong><p>{label}</p></div>)}</div></>}
 {tab==='access'&&(user.is_admin?<div className="card" style={{padding:24}}>Administrators have access to all courses.</div>:<CourseAccessEditor key={userId} user={user} onClose={()=>setParams({section:'overview'})}/>)}
 {tab==='password'&&<PasswordSettings user={self?undefined:user} onClose={()=>setParams({section:'overview'})}/>}
 {tab==='email'&&<section className="card password-panel"><h2>Authentication email</h2><p>Administrative recovery override. Confirm the address with the account owner before saving. This does not verify ownership of the mailbox.</p><p>Current email: <strong>{user.email||'Not configured'}</strong></p><form className="password-form" onSubmit={emailSubmit}><div className="field"><label htmlFor="managed-email">New recovery email</label><input id="managed-email" name="email" type="email" autoComplete="off" required maxLength={254}/></div><div className="field"><label htmlFor="actor-password">Your admin password</label><input id="actor-password" name="admin_password" type="password" autoComplete="current-password" required/></div><div className="password-actions"><button className="btn btn-primary" disabled={busy}>{busy?'Saving…':'Update email'}</button></div></form><p role="status">{notice}</p></section>}
 </div></div></section>
}
