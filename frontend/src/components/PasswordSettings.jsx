import { useState } from 'react';
import { api } from '../api';
export default function PasswordSettings({user, onClose}) {
  const [mode,setMode]=useState('generate');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [generated,setGenerated]=useState('');
  const prefix=user ? `reset-${user.id}` : 'change-password';
  async function submit(e) {
    e.preventDefault(); const form=e.currentTarget; const data=new FormData(form);
    setMessage('');setGenerated('');
    const password=data.get('new_password');
    if ((!user || mode==='custom') && password!==data.get('confirm_password')) {setMessage('New passwords do not match.');return;}
    setBusy(true);
    try {
      if(user) {
        const result=await api.resetPassword(user.id,mode==='generate'?null:password);
        setGenerated(result.generated_password || '');
      } else {await api.changePassword(Object.fromEntries(data));}
      form.reset();setMessage('Password updated successfully.');
    } catch(err) {setMessage(err.message);} finally {setBusy(false);}
  }
  return <section className="card" style={{padding:24,marginTop:24,maxWidth:640}} aria-labelledby={`${prefix}-title`}>
    <h2 id={`${prefix}-title`}>{user?`Reset password: ${user.username}`:'Change password'}</h2>
    <p>Use at least 12 characters (maximum 72 UTF-8 bytes). Never reuse a password.</p>
    <form onSubmit={submit}>
      {user ? <div className="field"><label htmlFor={`${prefix}-mode`}>Reset method</label><select id={`${prefix}-mode`} value={mode} onChange={e=>{setMode(e.target.value);setGenerated('');}} disabled={busy}><option value="generate">Generate a secure random password</option><option value="custom">Enter a new password</option></select></div> : <div className="field"><label htmlFor={`${prefix}-old`}>Current password</label><input id={`${prefix}-old`} name="old_password" type="password" autoComplete="current-password" required disabled={busy}/></div>}
      {(!user || mode==='custom') && <><div className="field"><label htmlFor={`${prefix}-new`}>New password</label><input id={`${prefix}-new`} name="new_password" type="password" autoComplete="new-password" minLength={12} required disabled={busy}/></div><div className="field"><label htmlFor={`${prefix}-confirm`}>Confirm new password</label><input id={`${prefix}-confirm`} name="confirm_password" type="password" autoComplete="new-password" minLength={12} required disabled={busy}/></div></>}
      <button className="btn btn-primary" disabled={busy}>{busy?'Saving…':user?'Reset password':'Change password'}</button>
      {onClose && <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>Close</button>}
    </form>
    <p role="status">{message}</p>
    {generated && <div><p>Copy this password now and share it securely. It is shown only here for this reset.</p><code style={{overflowWrap:'anywhere',userSelect:'all'}}>{generated}</code><button type="button" className="btn btn-secondary" onClick={()=>setGenerated('')}>Hide password</button></div>}
  </section>;
}
