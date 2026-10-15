(() => {
  const API_URL = 'https://script.google.com/macros/s/AKfycbxj-Gwc6ZLz_bHvt_TLCiKlLEYWbYI0zN34Hz2nyGkk0srKrFP9tu7bUtnS9v-rwLu1/exec';
  const fallback = {radio:{name:'Rádio Simplificada',description:'Uma rádio baseada em playlists',accentColor:'#9a9c9e',banner:'',maintenance:false},sequences:{active:'sequence1',sequence1:{tracks:[]}},tracks:[],content:{}};
  let config = fallback, playing = false, index = 0, audio = null, audioContext, analyser, analyserData, vuFrame;
  const $ = id => document.getElementById(id);
  async function loadConfig(){
    try {
      const local = localStorage.getItem('radiosimplificada-config');
      config = local ? {...fallback,...JSON.parse(local)} : await fetch(API_URL+'?ts='+Date.now()).then(r=>r.json());
    } catch { config = fallback; }
    const radio = config.radio || fallback.radio;
    document.documentElement.style.setProperty('--accent', radio.accentColor || fallback.radio.accentColor);
    $('radio-name').textContent=radio.name||fallback.radio.name; $('footer-name').textContent=radio.name||fallback.radio.name; $('radio-description').textContent=radio.description||fallback.radio.description;
    const c=config.content||{}; for(const key of ['message','notices','sponsors','contact']) $(key).textContent=c[key]||'';
    if(radio.banner) $('hero-image').style.backgroundImage=`url(${radio.banner})`;
    if(radio.maintenance){ document.body.classList.add('maintenance'); $('track').textContent='Rádio em manutenção'; }
  }
  function tracks(){ const byId=Object.fromEntries((config.tracks||[]).map(t=>[String(t.id),t])); const sequences=config.sequences||{}; const active=sequences[sequences.active]||sequences.sequence1||{tracks:[]}; return (active.tracks||[]).map(id=>byId[String(id)]).filter(t=>t&&t.active!==false&&t.url); }
  function setupAudio(){ if(audioContext) return; audioContext=new (window.AudioContext||window.webkitAudioContext)(); analyser=audioContext.createAnalyser(); analyser.fftSize=128; analyser.smoothingTimeConstant=.82; analyserData=new Uint8Array(analyser.frequencyBinCount); audio=new Audio(); audio.crossOrigin='anonymous'; audio.addEventListener('ended',next); const source=audioContext.createMediaElementSource(audio); source.connect(analyser).connect(audioContext.destination); }
  function drawVu(){ if(!playing||!analyser){cancelAnimationFrame(vuFrame); vuFrame=0; document.querySelectorAll('.vu-bar').forEach(b=>b.style.transform='scaleY(.28)'); return;} analyser.getByteFrequencyData(analyserData); [2,8,18].forEach((band,i)=>{const level=Math.max(.18,Math.min(1,(analyserData[band]||0)/255*1.55));document.querySelectorAll('.vu-bar')[i].style.transform=`scaleY(${level})`;}); vuFrame=requestAnimationFrame(drawVu); }
  async function next(){const list=tracks(); if(!list.length){$('track').textContent='Adicione faixas no admin'; return;} const item=list[index%list.length]; index=(index+1)%list.length; audio.src=item.url; $('track').textContent=item.title||item.id; try{await audio.play();}catch(e){playing=false;state();}}
  async function toggle(){setupAudio(); if(audioContext.state==='suspended') await audioContext.resume(); if(playing){audio.pause();playing=false;state();return;} playing=true;state();await next();}
  function state(){ $('play-glyph').innerHTML=playing?'<svg viewBox="0 0 64 64"><rect x="17" y="14" width="11" height="36" rx="2"/><rect x="36" y="14" width="11" height="36" rx="2"/></svg>':'▶'; $('play').setAttribute('aria-pressed',String(playing));$('play').setAttribute('aria-label',playing?'Pausar rádio':'Iniciar rádio');$('vu-meter').classList.toggle('is-active',playing);if(playing){cancelAnimationFrame(vuFrame);vuFrame=requestAnimationFrame(drawVu);}else{cancelAnimationFrame(vuFrame);drawVu();}}
  document.querySelectorAll('.quick-nav button').forEach(button=>button.addEventListener('click',()=>{const panel=document.querySelector(`[data-content="${button.dataset.panel}"]`);const open=panel.classList.contains('is-open');document.querySelectorAll('.panel').forEach(p=>p.classList.remove('is-open'));document.querySelectorAll('.quick-nav button').forEach(b=>b.removeAttribute('aria-expanded'));if(!open){panel.classList.add('is-open');button.setAttribute('aria-expanded','true');}}));
  $('play').addEventListener('click',toggle); loadConfig();
})();
