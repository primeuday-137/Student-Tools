const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const toast = (message) => { const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>el.classList.remove('show'),2300); };

const toolNames = {
  age:'Age Calculator', percentage:'Percentage Calculator', unit:'Unit Converter', text:'Text Tools',
  notes:'Notes Maker', timetable:'Study Planner', calculator:'Quick Calculator', password:'Password Generator',
  qr:'QR Code Maker', resume:'Resume Starter', focus:'Focus Timer', pdf:'PDF Help'
};
const modal=$('#toolModal'), modalTitle=$('#modalTitle'), modalBody=$('#modalBody');
function openTool(name){
  modalTitle.textContent=toolNames[name]||'Student Tool';
  modalBody.innerHTML=toolTemplates[name]||'<p>This tool is being prepared.</p>';
  modal.classList.remove('hidden');
  modalBody.querySelectorAll('form').forEach(form=>form.addEventListener('submit',e=>e.preventDefault()));
  if(name==='notes') { $('#modalNote').value=localStorage.getItem('st-notes')||''; }
  if(name==='focus') { setupTimer(); }
  if(name==='qr') { $('#qrGenerate').addEventListener('click',makeQR); }
}
function closeTool(){modal.classList.add('hidden');}
$('#closeModal').addEventListener('click',closeTool);
modal.addEventListener('click',e=>{if(e.target===modal)closeTool();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeTool();});
$$('[data-tool]').forEach(card=>card.addEventListener('click',()=>openTool(card.dataset.tool)));

const toolTemplates = {
  age:`<form class="tool-form" id="ageForm"><label>Date of birth<input class="tool-field" type="date" id="birthDate" required max="${new Date().toISOString().slice(0,10)}"></label><button>Calculate age</button></form><div id="ageResult"></div>`,
  percentage:`<form class="tool-form" id="percentForm"><div class="tool-row"><label>Marks obtained<input class="tool-field" type="number" id="marks" min="0" step="any" required placeholder="e.g. 425"></label><label>Total marks<input class="tool-field" type="number" id="totalMarks" min="0.000001" step="any" required placeholder="e.g. 500"></label></div><button>Calculate percentage</button></form><div id="percentResult"></div>`,
  unit:`<form class="tool-form" id="unitForm"><label>Conversion type<select class="tool-select" id="unitType"><option value="length">Length (m ↔ km)</option><option value="weight">Weight (g ↔ kg)</option><option value="temp">Temperature (°C ↔ °F)</option></select></label><div class="tool-row"><label>Value<input class="tool-field" id="unitValue" type="number" step="any" value="1"></label><label>Direction<select class="tool-select" id="unitDirection"><option value="forward">First → second</option><option value="reverse">Second → first</option></select></label></div><button>Convert</button></form><div id="unitResult"></div>`,
  text:`<form class="tool-form"><label>Enter or paste text<textarea class="tool-field" id="textInput" rows="5" placeholder="Type your text here..."></textarea></label><div class="tool-row"><button type="button" data-case="upper">UPPERCASE</button><button type="button" data-case="lower">lowercase</button><button type="button" data-case="title">Title Case</button></div><div class="tool-result" id="textStats">Words: 0 · Characters: 0 · Characters (no spaces): 0</div><button type="button" id="copyText">Copy text</button></form>`,
  notes:`<form class="tool-form"><label>Note title<input class="tool-field" id="modalNoteTitle" placeholder="e.g. Physics formulas"></label><label>Your note<textarea class="tool-field" id="modalNote" rows="6" placeholder="Write your note..."></textarea></label><button type="button" id="saveModalNote">Save note on this device</button><p class="small-help">Notes are stored in this browser on this device. They are not synced or backed up online.</p></form>`,
  timetable:`<form class="tool-form" id="planForm"><label>Subject or task<input class="tool-field" id="planSubject" required placeholder="e.g. Mathematics revision"></label><div class="tool-row"><label>Date<input class="tool-field" type="date" id="planDate" required></label><label>Time<input class="tool-field" type="time" id="planTime" required></label></div><button>Add to study plan</button></form><div id="planList"></div>`,
  calculator:`<form class="tool-form" id="calcForm"><label>Expression<input class="tool-field" id="calcExpression" placeholder="e.g. (25 + 15) / 2" required></label><p class="small-help">Supports numbers, + − × ÷, parentheses, decimals and %.</p><button>Calculate</button></form><div id="calcResult"></div>`,
  password:`<form class="tool-form"><label>Password length <input class="tool-field" id="passLength" type="number" min="8" max="64" value="16"></label><label><span><input type="checkbox" id="passSymbols" checked> Include symbols</span></label><button type="button" id="makePassword">Generate password</button><div class="tool-result" id="passResult">Your password will appear here.</div><button type="button" id="copyPassword">Copy password</button><p class="small-help">Use a unique password for each account. Do not share it with anyone.</p></form>`,
  qr:`<form class="tool-form"><label>Text or website URL<input class="tool-field" id="qrText" placeholder="https://example.com"></label><button type="button" id="qrGenerate">Generate QR code</button><div id="qrResult" class="tool-result">QR preview will appear here. An internet connection is required for this demo.</div></form>`,
  resume:`<form class="tool-form" id="resumeForm"><label>Full name<input class="tool-field" id="resumeName" required placeholder="Your name"></label><label>Email or contact<input class="tool-field" id="resumeContact" placeholder="Email address"></label><label>Education<input class="tool-field" id="resumeEducation" placeholder="Degree, college, year"></label><label>Skills<input class="tool-field" id="resumeSkills" placeholder="e.g. Communication, Python"></label><label>Career objective<textarea class="tool-field" id="resumeObjective" rows="3" placeholder="A short introduction about your goals"></textarea></label><button>Generate resume draft</button></form><div id="resumeResult"></div>`,
  focus:`<div class="timer-display" id="timerDisplay">25:00</div><p class="small-help" style="text-align:center">Try 25 minutes of focus followed by a short break.</p><div class="tool-row"><button type="button" id="timerStart">Start</button><button type="button" id="timerPause">Pause</button><button type="button" id="timerReset">Reset</button></div>`,
  pdf:`<p>PDF features like merging, splitting and compressing need a dedicated PDF library or trusted service. This starter site does not upload your files.</p><div class="tool-result"><b>Privacy tip</b><br>Do not upload confidential documents to websites you do not trust.</div><p><a class="primary-btn" href="https://www.adobe.com/acrobat/online.html" target="_blank" rel="noopener">Open Adobe online tools ↗</a></p>`
};

$('#searchForm').addEventListener('submit',e=>{e.preventDefault();filterTools($('#searchInput').value);$('#tools').scrollIntoView({behavior:'smooth'});});
function filterTools(value){
  const q=value.trim().toLowerCase(); let shown=0;
  $$('.tool-card').forEach(card=>{const match=!q || (toolNames[card.dataset.tool]+' '+card.textContent).toLowerCase().includes(q);card.classList.toggle('hidden',!match);if(match)shown++;});
  $('#toolCount').textContent=`${shown} tool${shown===1?'':'s'}`;$('#emptyState').classList.toggle('hidden',shown!==0);
}
$('#searchInput').addEventListener('input',e=>filterTools(e.target.value));
$$('[data-search]').forEach(btn=>btn.addEventListener('click',()=>{ $('#searchInput').value=btn.dataset.search;filterTools(btn.dataset.search);$('#tools').scrollIntoView({behavior:'smooth'}); }));
$('#menuToggle').addEventListener('click',()=>$('#mainNav').classList.toggle('open'));
$$('#mainNav a').forEach(a=>a.addEventListener('click',()=>$('#mainNav').classList.remove('open')));

const savedNote=localStorage.getItem('st-quick-note')||'';$('#quickNote').value=savedNote;
$('#saveNote').addEventListener('click',()=>{localStorage.setItem('st-quick-note',$('#quickNote').value);$('#noteStatus').textContent='Saved on this device ✓';toast('Note saved on this device');});

modalBody.addEventListener('submit',e=>{
  if(e.target.id==='ageForm'){const birth=new Date($('#birthDate').value+'T00:00:00');if(Number.isNaN(birth.getTime()))return;const today=new Date();if(birth>today){showResult('ageResult','Birth date cannot be in the future.');return;}let years=today.getFullYear()-birth.getFullYear(),months=today.getMonth()-birth.getMonth(),days=today.getDate()-birth.getDate();if(days<0){months--;days+=new Date(today.getFullYear(),today.getMonth(),0).getDate();}if(months<0){years--;months+=12;}showResult('ageResult',`<b>${years} years, ${months} months, ${days} days</b>`);}
  if(e.target.id==='percentForm'){const m=Number($('#marks').value),t=Number($('#totalMarks').value);if(t<=0||m<0||m>t){showResult('percentResult','Please enter valid marks (obtained marks must not exceed total marks).');return;}showResult('percentResult',`<b>${(m/t*100).toFixed(2)}%</b>`);}
  if(e.target.id==='unitForm'){const v=Number($('#unitValue').value),type=$('#unitType').value,dir=$('#unitDirection').value;let out,label;if(type==='length'){out=dir==='forward'?v/1000:v*1000;label=dir==='forward'?'km':'m';}else if(type==='weight'){out=dir==='forward'?v/1000:v*1000;label=dir==='forward'?'kg':'g';}else{out=dir==='forward'?(v*9/5+32):(v-32)*5/9;label=dir==='forward'?'°F':'°C';}showResult('unitResult',`<b>${Number(out.toFixed(6))} ${label}</b>`);}
  if(e.target.id==='calcForm'){const expr=$('#calcExpression').value.trim();if(!/^[0-9+\-*/().%\s]+$/.test(expr)||!expr||/[\/*+\-.%]\s*$/.test(expr)){showResult('calcResult','Enter a valid arithmetic expression.');return;}try{const safe=expr.replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');const result=Function('"use strict";return ('+safe+')')();showResult('calcResult',Number.isFinite(result)?`<b>${result}</b>`:'Expression is not a finite number.');}catch{showResult('calcResult','Could not calculate that expression.');}}
  if(e.target.id==='planForm'){const item={subject:$('#planSubject').value,date:$('#planDate').value,time:$('#planTime').value};const list=JSON.parse(localStorage.getItem('st-plan')||'[]');list.push(item);localStorage.setItem('st-plan',JSON.stringify(list));renderPlan();toast('Study session added');}
  if(e.target.id==='resumeForm'){const val=id=>$('#'+id).value.trim();const draft=`${val('resumeName')}\\n${val('resumeContact')}\\n\\nCAREER OBJECTIVE\\n${val('resumeObjective')}\\n\\nEDUCATION\\n${val('resumeEducation')}\\n\\nSKILLS\\n${val('resumeSkills')}`;showResult('resumeResult',`<div class="tool-result resume-preview">${escapeHTML(draft)}</div><button type="button" id="copyResume">Copy draft</button>`);$('#copyResume').addEventListener('click',()=>copyText(draft));}
});
function showResult(id,html){const el=$('#'+id);if(el)el.innerHTML=`<div class="tool-result">${html}</div>`;}
function escapeHTML(str){return str.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderPlan(){const list=JSON.parse(localStorage.getItem('st-plan')||'[]');const el=$('#planList');if(!el)return;el.innerHTML=list.length?'<div class="tool-result"><b>Your study plan</b><ul>'+list.map((x,i)=>`<li>${escapeHTML(x.date)} · ${escapeHTML(x.time)} — ${escapeHTML(x.subject)} <button type="button" data-remove-plan="${i}">×</button></li>`).join('')+'</ul></div>':'<p class="small-help">Your planned sessions will appear here.</p>';el.querySelectorAll('[data-remove-plan]').forEach(b=>b.addEventListener('click',()=>{const a=JSON.parse(localStorage.getItem('st-plan')||'[]');a.splice(Number(b.dataset.removePlan),1);localStorage.setItem('st-plan',JSON.stringify(a));renderPlan();}));}
modalBody.addEventListener('click',e=>{
  if(e.target.matches('[data-case]')){const el=$('#textInput'),mode=e.target.dataset.case;if(mode==='upper')el.value=el.value.toUpperCase();if(mode==='lower')el.value=el.value.toLowerCase();if(mode==='title')el.value=el.value.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());updateTextStats();}
  if(e.target.id==='copyText')copyText($('#textInput').value);
  if(e.target.id==='saveModalNote'){localStorage.setItem('st-notes',$('#modalNote').value);toast('Note saved on this device');}
  if(e.target.id==='makePassword'){const n=Math.max(8,Math.min(64,Number($('#passLength').value)||16));const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'+($('#passSymbols').checked?'!@#$%^&*()-_=+?':'');let p='';const arr=new Uint32Array(n);if(window.crypto?.getRandomValues)crypto.getRandomValues(arr);else for(let i=0;i<n;i++)arr[i]=Math.random()*100000;for(let i=0;i<n;i++)p+=chars[arr[i]%chars.length];$('#passResult').textContent=p;}
  if(e.target.id==='copyPassword')copyText($('#passResult').textContent);
});
modalBody.addEventListener('input',e=>{if(e.target.id==='textInput')updateTextStats();});
function updateTextStats(){const t=$('#textInput')?.value||'';const words=t.trim()?t.trim().split(/\s+/).length:0;$('#textStats').textContent=`Words: ${words} · Characters: ${t.length} · Characters (no spaces): ${t.replace(/\s/g,'').length}`;}
async function copyText(value){try{await navigator.clipboard.writeText(value);toast('Copied to clipboard');}catch{toast('Copy not supported here; select and copy manually');}}
function makeQR(){const text=$('#qrText').value.trim();if(!text){$('#qrResult').textContent='Please enter text or a URL first.';return;}const img=document.createElement('img');img.alt='Generated QR code';img.width=210;img.height=210;img.style.display='block';img.style.margin='12px auto';img.src='https://api.qrserver.com/v1/create-qr-code/?size=210x210&data='+encodeURIComponent(text);const out=$('#qrResult');out.innerHTML='';out.append('QR code preview');out.appendChild(img);const a=document.createElement('a');a.href=img.src;a.target='_blank';a.rel='noopener';a.textContent='Open image to save';out.appendChild(document.createElement('br'));out.appendChild(a);}
let timerSeconds=1500,timerInterval=null;
function setupTimer(){clearInterval(timerInterval);timerSeconds=1500;updateTimer();}
function updateTimer(){const el=$('#timerDisplay');if(el)el.textContent=`${String(Math.floor(timerSeconds/60)).padStart(2,'0')}:${String(timerSeconds%60).padStart(2,'0')}`;}
modalBody.addEventListener('click',e=>{
 if(e.target.id==='timerStart'&&!timerInterval){timerInterval=setInterval(()=>{timerSeconds--;updateTimer();if(timerSeconds<=0){clearInterval(timerInterval);timerInterval=null;toast('Focus session complete! Take a short break.');}},1000);}
 if(e.target.id==='timerPause'){clearInterval(timerInterval);timerInterval=null;}
 if(e.target.id==='timerReset'){clearInterval(timerInterval);timerInterval=null;timerSeconds=1500;updateTimer();}
});
