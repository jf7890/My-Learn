import {useState} from 'react';
import PasswordSettings from './PasswordSettings.jsx';
export default function AccountSettings(){
 const [section,setSection]=useState('');const [theme,setTheme]=useState(()=>document.documentElement.dataset.theme||'soft');
 function changeTheme(e){setTheme(e.target.value);document.documentElement.dataset.theme=e.target.value;try{localStorage.setItem('my-learn-theme',e.target.value)}catch{}}
 return <section style={{maxWidth:850,margin:'auto'}}><span className="sl-eyebrow">YOUR ACCOUNT</span><h1>Settings</h1><p>Security, appearance and account recovery.</p><div className="settings-list">
 <div className="card settings-item"><button className="settings-disclosure" aria-expanded={section==='password'} onClick={()=>setSection(section==='password'?'':'password')}><span><strong>Change password</strong><small>Confirm your current password to choose a new one.</small></span><span aria-hidden="true">{section==='password'?'−':'+'}</span></button>{section==='password'&&<PasswordSettings onClose={()=>setSection('')}/>}</div>
 <div className="card settings-item"><label className="settings-disclosure" htmlFor="appearance"><span><strong>Change appearance</strong><small>Choose the appearance for this browser.</small></span><select id="appearance" value={theme} onChange={changeTheme}><option value="soft">Light — Sky & ivory</option><option value="dark">Dark — Slate</option></select></label></div>
 <div className="card settings-item"><button className="settings-disclosure" aria-expanded={section==='email'} onClick={()=>setSection(section==='email'?'':'email')}><span><strong>Recovery email</strong><small>Manage the email used to recover your account.</small></span><span aria-hidden="true">{section==='email'?'−':'+'}</span></button>{section==='email'&&<p role="status">Email verification setup is being implemented. Your existing recovery email has not been changed.</p>}</div>
 </div></section>
}
