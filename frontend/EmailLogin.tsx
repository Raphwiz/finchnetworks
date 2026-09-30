'use client';
import {useEffect,useState} from 'react';
import {api} from './api';
function nextPath(){const next=new URLSearchParams(location.search).get('next');return next==='admin'?'/admin':next==='cart'?'/cart':'/account';}
export default function EmailLogin({emailEnabled}:{emailEnabled:boolean}){
  const [mode,setMode]=useState('login'),[token,setToken]=useState(''),[draft,setDraft]=useState<{name:string;email:string;password:string;consent:true}|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  useEffect(()=>{const q=new URLSearchParams(location.hash.slice(1));if(['verify','reset'].includes(q.get('action')||'')&&q.get('token')){setMode(q.get('action')!);setToken(q.get('token')!);history.replaceState(null,'',location.pathname+location.search);}},[]);
  function change(next:string){setMode(next);setMessage('');setError('');}
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setError('');setMessage('');
    const f=Object.fromEntries(new FormData(e.currentTarget));
    if((mode==='register'||mode==='reset')&&f.password!==f.confirm){setError('Passwords do not match.');setBusy(false);return;}
    try{
      const result=await api('customer/'+(mode==='confirm'?'confirm':mode),mode==='confirm'?{email:draft?.email,code:String(f.code||'').trim()}:{...f,token,consent:f.consent==='on'});
      if(mode==='register'&&result.needsCode){setDraft({name:String(f.name||''),email:String(f.email||''),password:String(f.password||''),consent:true});setMode('confirm');setMessage(result.message);return;}
      if(mode==='login'||result.ok){location.assign(nextPath());return;}
      setMessage(result.message);
      if(mode==='verify'||mode==='reset'){setMode('login');setToken('');}
    }catch(e:any){setError(e.message);}finally{setBusy(false);}
  }
  async function resend(){if(!draft)return;setBusy(true);setError('');setMessage('');try{const result=await api('customer/register',draft);setMessage(result.message||'We sent a new code to your email.');}catch(e:any){setError(e.message);}finally{setBusy(false);}}
  const title=mode==='login'?'Sign in with email':mode==='register'?'Create your Finch account':mode==='forgot'?'Reset your password':mode==='verify'?'Verify your email':mode==='confirm'?'Enter your confirmation code':'Choose a new password';
  const submitLabel=busy?'Please wait…':mode==='login'?'Sign in':mode==='register'?'Send confirmation code':mode==='forgot'?'Send reset link':mode==='verify'?'Verify email':mode==='confirm'?'Create account':'Save new password';
  const emailBlocked=!emailEnabled&&(mode==='forgot'||mode==='register'||mode==='confirm');
  return <div>
    <div className="commerce-tabs"><button type="button" className={mode==='login'?'button yellow':'button'} onClick={()=>change('login')}>Sign in</button><button type="button" className={mode==='register'||mode==='confirm'?'button yellow':'button'} onClick={()=>change('register')}>Create account</button></div>
    <form className="form" onSubmit={submit} key={mode}>
      <h2>{title}</h2>
      {mode==='register'&&<label>Full name<input name="name" autoComplete="name" required maxLength={100}/></label>}
      {!['verify','reset','confirm'].includes(mode)&&<label>Email address<input name="email" type="email" required autoComplete="email" maxLength={254}/></label>}
      {['login','register','reset'].includes(mode)&&<label>Password<input name="password" type="password" required minLength={mode==='login'?1:12} maxLength={128} autoComplete={mode==='login'?'current-password':'new-password'}/></label>}
      {['register','reset'].includes(mode)&&<><label>Confirm password<input name="confirm" type="password" required minLength={12} maxLength={128} autoComplete="new-password"/></label><p className="helper">Use at least 12 characters. A long, unique passphrase works well.</p></>}
      {mode==='register'&&<label className="check-label account-consent"><input name="consent" type="checkbox" required/><span>I have read the <a href="/privacy">privacy notice</a>.</span></label>}
      {mode==='confirm'&&<><p>We sent a 6-digit code to <strong>{draft?.email}</strong>. Enter it to create your account. The code expires in 15 minutes.</p><label>Confirmation code<input name="code" inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{6}" minLength={6} maxLength={6}/></label></>}
      {mode==='verify'&&<p>Confirm your email address to finish an older registration link.</p>}
      {!emailEnabled&&mode==='forgot'&&<p className="notice">Password reset emails are not available yet.</p>}
      {!emailEnabled&&(mode==='register'||mode==='confirm')&&<p className="notice">Account confirmation emails are not available yet.</p>}
      {mode==='register'&&emailEnabled&&<p className="helper">We email a 6-digit code to this address. The account is created after you enter that code.</p>}
      {error&&<p className="error" role="alert">{error}</p>}
      {message&&<p className="notice" role="status">{message}</p>}
      <div className="auth-submit-actions">
        <button className="button dark" disabled={busy||emailBlocked}>{submitLabel}</button>
        {mode==='login'&&<button type="button" className="textlink" onClick={()=>change('forgot')}>Forgot password?</button>}
        {mode==='confirm'&&<button type="button" className="textlink" disabled={busy||!emailEnabled} onClick={resend}>Send a new code</button>}
      </div>
    </form>
  </div>;
}
