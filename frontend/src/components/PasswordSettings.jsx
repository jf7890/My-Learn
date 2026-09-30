import { useState } from 'react';
import { api } from '../api';
export default function PasswordSettings({user, onClose}) {
  const [mode,setMode]=useState('generate');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [generated,setGenerated]=useState('');
  const [visible,setVisible]=useState(false);
  const [copyStatus,setCopyStatus]=useState('');
  const prefix=user ? `reset-${user.id}` : 'change-password';
  async function submit(e) {
    e.preventDefault(); const form=e.currentTarget; const data=new FormData(form);
    setMessage('');setGenerated('');setVisible(false);setCopyStatus('');
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
  return <section className="card password-panel" aria-labelledby={`${prefix}-title`}>
    <h2 id={`${prefix}-title`}>{user?`Reset password: ${user.username}`:'Change password'}</h2>
    <p>Use at least 12 characters (maximum 72 UTF-8 bytes). Never reuse a password.</p>
    <form className="password-form" onSubmit={submit}>
      {user ? <div className="field"><label htmlFor={`${prefix}-mode`}>Reset method</label><select id={`${prefix}-mode`} value={mode} onChange={e=>{setMode(e.target.value);setGenerated('');}} disabled={busy}><option value="generate">Generate a secure random password</option><option value="custom">Enter a new password</option></select></div> : <div className="field"><label htmlFor={`${prefix}-old`}>Current password</label><input id={`${prefix}-old`} name="old_password" type="password" autoComplete="current-password" required disabled={busy}/></div>}
      {(!user || mode==='custom') && <><div className="field"><label htmlFor={`${prefix}-new`}>New password</label><input id={`${prefix}-new`} name="new_password" type="password" autoComplete="new-password" minLength={12} required disabled={busy}/></div><div className="field"><label htmlFor={`${prefix}-confirm`}>Confirm new password</label><input id={`${prefix}-confirm`} name="confirm_password" type="password" autoComplete="new-password" minLength={12} required disabled={busy}/></div></>}
      <div className="password-actions">
      <button className="btn btn-primary" disabled={busy}>{busy?'Saving…':user?'Reset password':'Change password'}</button>
      {onClose && <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>Close</button>}
      </div>
    </form>
    <p className="password-status" role="status">{message}</p>
    {generated && <div className="password-result"><p>Copy this password and share it securely. It will not be available after leaving this page.</p>
      <div className="password-actions" aria-label="Generated password actions">
        <button type="button" className="btn btn-secondary" title="Copy password" aria-label="Copy password" onClick={async()=>{try{await navigator.clipboard.writeText(generated);setCopyStatus('Password copied.');}catch{setCopyStatus('Clipboard unavailable. Reveal the password and copy it manually.');}}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"/></svg></button>
        <button type="button" className="btn btn-secondary" title={visible?'Hide password':'Show password'} aria-label={visible?'Hide password':'Show password'} aria-pressed={visible} onClick={()=>setVisible(v=>!v)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>{!visible&&<path d="m3 3 18 18"/>}</svg></button>
      </div><code className="password-generated" aria-label={visible?'Generated password':'Password hidden'}>{visible?generated:'••••••••••••••••••••••••'}</code><p role="status">{copyStatus}</p></div>}
  </section>;
}
