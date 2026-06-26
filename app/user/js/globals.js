const PAL=['#1B3487','#F5C400','#2563EB','#9C27B0','#00BCD4','#4CAF50','#FF9800','#E91E63','#F44336','#795548','#009688','#3F51B5'];

const DB={
  get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
};
const uid=()=>Math.random().toString(36).slice(2,10);

let U=null, editWkId=null, editExId=null, authMode='login', editColor=PAL[0], pendingDiff=5, _pendingSess=null;

const A={wkId:null,exs:[],exIdx:0,set:0,start:0,timerInt:null,restInt:null,results:[],weight:0,exStart:0};
