(() => {
  const API_URL = 'https://script.google.com/macros/s/AKfycbxGz_3dcFXz538G2oqEM2arOSJGuFO_xdqf5tMXSPx_LFeKxXDwlICP1dz39MTh40lX/exec';
  const fallback = {radio:{name:'Rádio Simplificada',description:'Uma rádio baseada em playlists',accentColor:'#9a9c9e',banner:'',maintenance:false},sequences:{active:'sequence1',sequence1:{tracks:[]}},tracks:[],content:{}};
  let config = fallback, playing = false, index = 0, audio = null, audioContext, analyser, analyserData, vuFrame;
  const $ = id => document.getElementById(id);
  async function loadConfig(){
    try {
      config = await fetch(API_URL+'?ts='+Date.now(), {cache:'no-store'}).then(r=>r.json());
    } catch {
      try { config = {...fallback,...JSON.parse(localStorage.getItem('radiosimplificada-config') || '{}')}; }
      catch { config = fallback; }
    }
    const radio = config.radio || fallback.radio;
    document.documentElement.style.setProperty('--accent', radio.accentColor || fallback.radio.accentColor);
    $('radio-name').textContent=radio.name||fallback.radio.name; $('footer-name').textContent=radio.name||fallback.radio.name; $('radio-description').textContent=radio.description||fallback.radio.description; if(radio.favicon) $('radio-favicon').href=radio.favicon;
    const c=config.content||{}; for(const key of ['message','notices','sponsors']) { const el=$(key); if(el) el.textContent=c[key]||''; }
    if(radio.banner) $('hero-image').style.backgroundImage=`url(${radio.banner})`;
    if(radio.maintenance){ document.body.classList.add('maintenance'); $('track').textContent='Rádio em manutenção'; }
  }
  function audioUrl(value){ const raw=String(value||'').trim(); if(!raw) return ''; if(/^https?:\/\//i.test(raw)||raw.startsWith('/')||raw.startsWith('audio/')) return raw.split('/').map((part,i)=>i?encodeURIComponent(part):part).join('/'); return 'audio/'+encodeURIComponent(raw); }
  function tracks(){ const byId=Object.fromEntries((config.tracks||[]).map(t=>[String(t.id),t])); const sequences=config.sequences||{}; const active=sequences[sequences.active]||sequences.sequence1||{tracks:[]}; return (active.tracks||[]).map(id=>byId[String(id)]).filter(t=>t&&t.active!==false&&t.url).map(t=>({...t,url:audioUrl(t.url)})); }
  function setupAudio(){ if(audioContext) return; audioContext=new (window.AudioContext||window.webkitAudioContext)(); analyser=audioContext.createAnalyser(); analyser.fftSize=128; analyser.smoothingTimeConstant=.82; analyserData=new Uint8Array(analyser.frequencyBinCount); audio=new Audio(); audio.crossOrigin='anonymous'; audio.addEventListener('ended',next); const source=audioContext.createMediaElementSource(audio); source.connect(analyser).connect(audioContext.destination); }
  function drawVu(){ if(!playing||!analyser){cancelAnimationFrame(vuFrame); vuFrame=0; document.querySelectorAll('.vu-bar').forEach(b=>b.style.transform='scaleY(.28)'); return;} analyser.getByteFrequencyData(analyserData); [4,8,18].forEach((band,i)=>{const level=Math.max(.18,Math.min(1,(analyserData[band]||0)/255*1.55));document.querySelectorAll('.vu-bar')[i].style.transform=`scaleY(${level})`;}); vuFrame=requestAnimationFrame(drawVu); }
  async function next(){const list=tracks(); if(!list.length){$('track').textContent='Adicione faixas no admin'; return;} const item=list[index%list.length]; index=(index+1)%list.length; audio.src=item.url; $('track').textContent=item.title||item.id; try{await audio.play();}catch(e){playing=false;state();}}
  async function toggle(){setupAudio(); if(audioContext.state==='suspended') await audioContext.resume(); if(playing){audio.pause();playing=false;state();return;} playing=true;state();await next();}
  function state(){ $('play-glyph').innerHTML=playing?'<svg viewBox="0 0 64 64"><rect x="17" y="14" width="11" height="36" rx="2"/><rect x="36" y="14" width="11" height="36" rx="2"/></svg>':'▶'; $('play').setAttribute('aria-pressed',String(playing));$('play').setAttribute('aria-label',playing?'Pausar rádio':'Iniciar rádio');$('vu-meter').classList.toggle('is-active',playing);if(playing){cancelAnimationFrame(vuFrame);vuFrame=requestAnimationFrame(drawVu);}else{cancelAnimationFrame(vuFrame);drawVu();}}
  document.querySelectorAll('.quick-nav button').forEach(button=>button.addEventListener('click',()=>{const panel=document.querySelector(`[data-content="${button.dataset.panel}"]`);const open=panel.classList.contains('is-open');document.querySelectorAll('.panel').forEach(p=>p.classList.remove('is-open'));document.querySelectorAll('.quick-nav button').forEach(b=>b.removeAttribute('aria-expanded'));if(!open){panel.classList.add('is-open');button.setAttribute('aria-expanded','true');}}));
  $('play').addEventListener('click',toggle);
  $('contact-form').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;const status=$('contact-status');const button=form.querySelector('button');button.disabled=true;status.textContent='Enviando...';const values=Object.fromEntries(new FormData(form).entries());if(values.website){return;}delete values.website;try{const response=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'contact',contact:{...values,createdAt:new Date().toISOString()}})});const result=await response.json();if(!result.ok)throw new Error(result.error||'Não foi possível enviar.');form.reset();status.textContent='Mensagem enviada. Obrigado pelo contato.';}catch(error){status.textContent='Não foi possível enviar agora. Tente novamente.';}finally{button.disabled=false;}});
  loadConfig();
})();
