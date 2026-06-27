// ── DATA ──────────────────────────────────────────────────────
const k=s=>`${s}_${U.email}`;
const getWks=()=>DB.get(k('wk'),[]);
const setWks=v=>DB.set(k('wk'),v);
const getSess=()=>DB.get(k('sess'),[]);
const setSess=v=>DB.set(k('sess'),v);

function syncFromTemplates(){
  const templates=DB.get('wk_templates',[]);
  if(!templates.length)return;
  const userWks=getWks();
  const synced=templates.map(tmpl=>{
    const existing=userWks.find(w=>w.id===tmpl.id);
    return{
      id:tmpl.id,
      label:tmpl.label,
      name:tmpl.name,
      color:tmpl.color,
      exercises:tmpl.exercises.map(ex=>{
        const existingEx=existing?.exercises?.find(e=>e.name===ex.name);
        return{
          id:ex.exId||uid(),
          num:ex.num,
          mac:ex.mac||'',
          name:ex.name,
          sets:ex.sets,
          reps:ex.reps,
          wt:existingEx?.wt??0,
          obs:''
        };
      })
    };
  });
  setWks(synced);
}

// ── CYCLE ─────────────────────────────────────────────────────
function cycleInfo(){
  const wks=getWks(); if(!wks.length)return{done:new Set(),next:null,pct:0,cycles:0};
  const ids=wks.map(w=>w.id);
  const sessions=[...getSess()].sort((a,b)=>a.date-b.date);
  let done=[],cycles=0;
  for(const s of sessions){
    if(!ids.includes(s.wkId))continue;
    done.push(s.wkId);
    if(ids.every(id=>done.includes(id))){cycles++;done=[];}
  }
  const doneSet=new Set(done);
  return{done:doneSet,next:ids.find(id=>!doneSet.has(id)),pct:ids.length?(doneSet.size/ids.length)*100:0,cycles};
}
