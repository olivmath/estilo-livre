// ── CONSTANTS ───────────────────────────────────────────────
const FALLBACK_EMAIL = 'admin@estilo.com';
const FALLBACK_PW    = 'admin2024';
const AV_COLORS = ['#1B3487','#9C27B0','#00BCD4','#4CAF50','#FF9800','#E91E63','#F44336','#795548','#009688','#3F51B5'];
const PAL = ['#1B3487','#F5C400','#2563EB','#9C27B0','#00BCD4','#4CAF50','#FF9800','#E91E63','#F44336','#795548','#009688','#3F51B5'];
const DAY = 86400000;

// ── STORAGE ─────────────────────────────────────────────────
const DB = {
  get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
};
const uid = () => Math.random().toString(36).slice(2,10);

// ── STATE ────────────────────────────────────────────────────
let currentFilter  = 'all';
let currentRankTab = 'freq';
let currentAdmin   = null;
let editingWkId    = null;
let editingExId    = null;
let wkModalColor   = PAL[0];
let wkSelections   = {};
let activeDetailTab = 'dash';
let activeStudentEmail = null;
