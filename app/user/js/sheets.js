// ── SHEETS ────────────────────────────────────────────────────
function openSheet(id){
  document.getElementById('ov-'+id.replace('sh-','')).classList.add('active');
  document.getElementById(id).classList.add('active');
}
function closeSheet(id){
  document.getElementById('ov-'+id.replace('sh-','')).classList.remove('active');
  document.getElementById(id).classList.remove('active');
}
