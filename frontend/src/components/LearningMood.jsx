import {useEffect,useState} from 'react';
import {api} from '../api';
export default function LearningMood(){
 const [stats,setStats]=useState(null);
 useEffect(()=>{const refresh=()=>api.getMyStats().then(setStats).catch(()=>{});refresh();window.addEventListener('focus',refresh);return()=>window.removeEventListener('focus',refresh)},[]);
 return <div className="learning-mood">{stats&&<div className={`learning-streak ${stats.streak_today?'is-lit':''}`}><svg width="34" height="40" viewBox="0 0 32 40" fill="none" aria-hidden="true"><path d="M18 2C21 13 29 14 29 25A13 13 0 1 1 3 25C3 19 7 14 11 11C10 18 15 20 16 15C18 11 18 7 18 2Z" fill="currentColor"/><path d="M17 22C18 27 23 28 21 33C18 39 9 35 11 29C12 26 14 25 17 22Z" fill="#ffe9aa"/></svg><div><strong>{stats.streak_days} day streak</strong><small>{stats.streak_today?'Daily goal complete. Nice work!':'Finish a new video to light your flame.'}</small></div></div>}</div>
}
