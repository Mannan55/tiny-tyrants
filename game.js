const $ = id => document.getElementById(id);
const paths={
 crest:'<path fill="#eac476" d="M20 1 37 7 35 25 20 39 5 25 3 7z"/><path fill="#263f40" d="m20 5 13 5-2 13-11 11-11-11-2-13z"/><path fill="#f4dba0" d="m9 13 9 5 2-9 2 9 9-5-8 11-3 5-3-5z"/>',
 gold:'<path fill="#ae7739" d="M3 23 16 18l13 5v8l-13 5-13-5z"/><path fill="#ffcb63" d="m3 23 13-5 13 5-13 5z"/><path fill="#e6a34e" d="M12 12 25 7l12 5v10l-12 5-13-5z"/><path fill="#ffdf91" d="M12 12 25 7l12 5-12 5z"/><path fill="#bf8436" d="m25 17 12-5v10l-12 5z"/>',
 grain:'<path stroke="#d4b96d" stroke-width="3" d="M10 35 29 5"/><path fill="#e6c580" d="M21 21Q10 20 12 10q9 1 9 11m4-7Q16 11 20 4q7 1 5 10m-9 15Q6 29 6 20q8 0 10 9m3-6q2-11 14-9-1 8-14 9m6-10Q25 4 35 3q0 8-10 10m-13 19q5-11 16-8-4 8-16 8"/>',
 hall:'<path fill="#cba672" d="M7 19h26v15H7z"/><path fill="#a4764e" d="M22 19h11v15H22z"/><path fill="#345d68" d="m3 20 9-12h14l11 12z"/><path fill="#7ebdb6" d="M3 19 13 7h10l-6 12z"/><path fill="#574c3b" d="M15 34v-9q4-6 8 0v9"/><path fill="#e8bd65" d="M20 2h10l-3 3 3 2H20z"/>',
 mine:'<path fill="#717978" d="m2 30 6-15 10-8 12 5 8 18z"/><path fill="#eac674" d="m8 20 6-8 4 4-5 8zm13-7 4-3 4 6-5 4z"/><path fill="#292c2b" d="M14 31V21q5-9 12 0v10z"/>',
 farm:'<path fill="#d5ae6d" d="M5 21h22v13H5z"/><path fill="#c5784d" d="M2 22 14 9l16 13z"/><path fill="#f0dca4" d="m26 7 2-6 2 6-1 8 8-3 2 2-7 5-5-1-2 12-3-1 1-12-8 1-1-3 10-2z"/>',
 barracks:'<path fill="#d2af70" d="M3 29 16 8h8l13 21z"/><path fill="#639188" d="M3 29 16 8l6 21z"/><path fill="#263d3b" d="m12 29 5-12 4 12z"/>',
 tower:'<path fill="#a8b9a9" d="M10 12h20l-3 7 3 14H10l3-14z"/><path fill="#d4cba0" d="M8 6h5v5h4V6h6v5h4V6h5v10H8z"/><path fill="#3f5551" d="M17 26v-5q3-5 6 0v5z"/>',
 empty:'<path stroke="#ecce91" stroke-width="4" d="M20 8v24M8 20h24"/>',
 army:'<path fill="#ecd394" d="m7 2 9 5 15 22-4 3L10 12zm25 0-9 5L8 29l4 3 17-20z"/><path stroke="#bd9764" stroke-width="4" d="m24 29 9-7M7 22l9 7M9 30l-4 6m25-6 5 6"/>',
 map:'<path fill="#d2bc86" d="m2 9 12-5 12 4 12-5v28l-12 5-12-5-12 5z"/><path fill="#ad9163" d="m14 4 12 4v28l-12-5z"/><path fill="none" stroke="#4b685c" stroke-width="2" stroke-dasharray="3 2" d="m7 25 12-10 10 6 4-10"/>',
 sound:'<path fill="currentColor" d="M4 15h7l9-8v26l-9-8H4z"/><path fill="none" stroke="currentColor" stroke-width="3" d="M25 12q9 8 0 16m6-21q14 13 0 26"/>',
 mute:'<path fill="currentColor" d="M4 15h7l9-8v26l-9-8H4z"/><path stroke="currentColor" stroke-width="3" d="m26 15 9 10m0-10-9 10"/>',
 expand:'<path fill="none" stroke="currentColor" stroke-width="3" d="M6 15V6h9m10 0h9v9m0 10v9h-9m-10 0H6v-9"/>'};
function icon(name){return '<svg aria-hidden="true" viewBox="0 0 40 40">'+paths[name]+'</svg>';}
for(const [id,key] of Object.entries({crest:'crest',goldIcon:'gold',grainIcon:'grain',armyIcon:'army',campaignIcon:'map',expand:'expand'}))$(id).innerHTML=icon(key);

const structures={
 hall:['Town Hall',1,0,'Sets your settlement age and unlocks new buildings and troops.'],
 mine:['Gold Mine',1,95,'Produces gold for buildings and upgrades.'],
 farm:['Elixir Collector',1,90,'Produces elixir for training your army.'],
 barracks:['Army Camp',1,120,'Each Army Camp level adds four troop spaces.'],
 tower:['Field Hospital',1,100,'Brings one fallen soldier home per hospital level after each raid.'],
 cannon:['Cannon',1,85,'Fires heavy single-target shots during settlement defenses.'],
 archery:['Archer Tower',2,125,'A fast-firing watchtower for picking off approaching raiders.'],
 mortar:['Mortar',3,170,'Lobs explosive rounds into clustered attackers.'],
 forge:['Workshop',4,210,'Each forge level reduces the elixir cost of every new recruit.'],
 arc:['Tesla Tower',5,270,'Chains lightning between enemies during a settlement defense.'],
 empty:['Empty Plot',1,0,'Choose a structure to build. Locked plans show the Town Hall age they require.']};
const troops={
 vanguard:['Warrior',1,12,'Frontline infantry • balanced health and damage'],
 ranger:['Archer',1,15,'Ranged support • fires from behind the front line'],
 bulwark:['Giant',2,23,'Heavy infantry • absorbs defensive fire'],
 sapper:['Wall Breaker',3,22,'Siege specialist • breaks gates and fortifications'],
 weaver:['Healer',4,29,'Support caster • heals nearby wounded allies']};
const ages=['Timber Village','Stone Village','Fortified Village','Royal Village','Citadel'];
const atlas=[['Bramblewatch','A forest outpost on the edge of the Kingdom.'],['Copperwind Reach','An exposed mining hold above a copper gorge.'],['The Hollow Spire','A bastion among the cold highlands.'],['Mossgate Citadel','An arc battery troops the core of this amethyst moor.'],['Stormglass Crown','Three fortified gates defend the golden highlands.']];
const structureIcon={cannon:'army',archery:'tower',mortar:'mine',arc:'crest',forge:'hall'};
const initial=window.TinyTyrantsStorage ? window.TinyTyrantsStorage.createInitialState() : {gold:350,grain:60,stage:1,wave:1,stars:{},last:Date.now(),sound:false,army:{vanguard:0,ranger:0,bulwark:0,sapper:0,weaver:0},buildings:['hall','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty','empty'].map(type=>({type,level:type==='empty'?0:1}))};
const saveKey='tiny-tyrants-v1';
let s = window.TinyTyrantsStorage ? window.TinyTyrantsStorage.loadSavedGame().state : structuredClone(initial);
if(!window.TinyTyrantsStorage){
 try{
  const old=JSON.parse(localStorage.getItem(saveKey)||'null');
  if(old?.buildings?.length>=8&&old.buildings.every(b=>structures[b.type])){
    Object.assign(s,old);s.buildings=old.buildings.slice(0,12);while(s.buildings.length<12)s.buildings.push({type:'empty',level:0});
    if(!old.army){s.army={...initial.army,vanguard:Math.max(0,old.troops-Math.min(old.troops,2)),ranger:Math.min(old.troops,2)};const i=s.buildings.findIndex(b=>b.type==='empty');if(i>=0)s.buildings[i]={type:'cannon',level:1};}
  }
 }catch{}
}
const sum=type=>s.buildings.reduce((n,b)=>n+(b.type===type?b.level:0),0);
const th=()=>Math.min(5,s.buildings[0].level), troopCount=()=>Object.values(s.army).reduce((a,b)=>a+b,0), capacity=()=>sum('barracks')?6+sum('barracks')*4:0;
const save=()=>{
  if(window.TinyTyrantsStorage)window.TinyTyrantsStorage.saveGame(s);
  else{try{localStorage.setItem(saveKey,JSON.stringify(s));}catch{}}
};
let selected=0,mission=Math.max(1,s.stage),battle=false,toastTimer,audioCtx,lastPaint=0,lastFocusedElement=null;
function notice(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3200);}
function chime(hz=470){if(!s.sound)return;try{audioCtx ||= new AudioContext();audioCtx.resume();const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.frequency.value=hz;gain.gain.setValueAtTime(.045,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.2);osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+.2);}catch{}}
function produce(){
  const now=Date.now();
  if(now<s.last)s.last=now;
  const elapsed=now-s.last;
  const ticks=Math.min(7200,Math.floor(elapsed/5000));
  if(ticks<=0)return;
  s.gold+=sum('mine')*ticks*3;
  s.grain+=sum('farm')*ticks*2;
  s.last=now-(elapsed%5000);
  save();
}
const ageLoot=()=>105+mission*38;
const target=()=>atlas[(mission-1)%atlas.length][0];
const hireCost=k=>Math.max(5,troops[k][2]-sum('forge')*2);
const upgradeCost=b=>b.type==='hall'?[0,160,280,440,650][th()]||0:65*b.level;
function unlocks(t){return [...Object.entries(structures).filter(([k,v])=>k!=='empty'&&v[1]===t).map(([,v])=>v[0]),...Object.values(troops).filter(v=>v[1]===t).map(v=>v[0])].join(' · ');}
function modal(html){
  lastFocusedElement=document.activeElement;
  $('dialogBody').innerHTML=html;
  if(!$('dialog').open)$('dialog').showModal();
  const focusable=$('dialog').querySelector('button:not(:disabled), input:not(:disabled), [tabindex="0"]');
  if(focusable)focusable.focus();
}
function row(label,desc,action,disabled=false){const b=document.createElement('button');b.className='actionCard';b.innerHTML=label+'<small>'+desc+'</small>';b.disabled=disabled;b.onclick=action;$('dialogBody').append(b);}
function updateAdvisor(){
  const el=$('advisorText');if(!el)return;
  const nf=nextFoundation();
  if(nf==='mine')el.textContent='Advisor: Build a Gold Mine on an open plot to produce construction gold.';
  else if(nf==='farm')el.textContent='Advisor: Build an Elixir Collector to gather elixir for army recruitment.';
  else if(nf==='barracks')el.textContent='Advisor: Build an Army Camp to expand army capacity and unlock recruitment.';
  else if(troopCount()<1)el.textContent='Advisor: Open Army to recruit soldiers for campaign raids.';
  else if(s.stage===1&&!s.stars[1])el.textContent='Advisor: Launch your first raid on Bramblewatch for victory spoils.';
  else if(th()<2&&s.gold>=upgradeCost(s.buildings[0]))el.textContent='Advisor: Advance Town Hall to Age II to unlock Laboratory & Giants.';
  else if(s.buildings.filter(b=>b.type==='cannon'||b.type==='archery').length===0)el.textContent='Advisor: Build defensive towers to protect your village.';
  else if(s.wave===1)el.textContent='Advisor: Test your home defense perimeter in Defend Base.';
  else el.textContent='Advisor: Upgrade buildings toward Town Hall 5 and level 6 plots.';
}
function refresh(){
 const b=s.buildings[selected],type=b.type,empty=type==='empty',limit=type==='hall'?5:th()+1,def=structures[type];
 $('gold').textContent=s.gold.toLocaleString();$('grain').textContent=s.grain.toLocaleString();$('rank').textContent='Town Hall '+th()+' · '+ages[th()-1];
 updateAdvisor();
 $('selection').textContent=def[0];$('buildingBadge').innerHTML=icon(structureIcon[type]||type);$('buildingName').textContent=def[0];$('level').textContent=empty?'AVAILABLE SITE':'LEVEL '+b.level+(type==='hall'?'  /  '+ages[th()-1].toUpperCase():'');
 $('description').textContent=type==='hall'&&th()<5?'Next age: '+ages[th()]+'. Unlocks '+unlocks(th()+1)+'.':def[3];
 const stats={hall:['Settlement age',th()+' / 5'],mine:['Production',36*b.level+' gold/min'],farm:['Production',24*b.level+' elixir/min'],barracks:['Army spaces','+'+b.level*4],tower:['Rescue capacity',b.level+' / raid'],forge:['Recruitment discount',2*b.level],empty:['Construction plans','Choose below']};
 [$('metricLabel').textContent,$('metric').textContent]=stats[type]||['Defense level',b.level];
 $('upgrade').hidden=empty;$('upgrade').disabled=b.level>=limit||s.gold<upgradeCost(b);$('upgrade').textContent=b.level>=limit?(type==='hall'?'Final age reached':'Requires a higher Town Hall'):(type==='hall'?'Advance age':'Upgrade')+' · '+upgradeCost(b)+' gold';
 $('move').hidden=empty||type==='hall';
 [...$('ageTrack').children].forEach((el,i)=>el.classList.toggle('active',i+1===th()));
 $('choices').replaceChildren();if(empty)for(const [k,[name,age,price]] of Object.entries(structures)){if(!price)continue;const btn=document.createElement('button');btn.disabled=age>th()||s.gold<price||!canConstruct(k);btn.textContent=name+' · '+(!canConstruct(k)?'Build '+structures[nextFoundation()][0]+' first':age>th()?'Town Hall '+age:price+' gold');btn.onclick=()=>{if(s.buildings[selected].type!=='empty'||th()<age||s.gold<price)return;queueBuild(selected,k,price);};$('choices').append(btn);}
 $('troopCount').textContent=troopCount()+' / '+capacity()+' MUSTERED';$('armyList').innerHTML=Object.entries(s.army).filter(([,n])=>n).map(([k,n])=>'<span class="unitChip">'+troops[k][0]+' ×'+n+'</span>').join('');
 $('chapter').textContent='RAID '+String(mission).padStart(2,'0')+'   /   '+(s.stars[mission]?'★'.repeat(s.stars[mission]):'UNCONQUERED');$('target').textContent=target();$('spoils').textContent='Victory spoils · '+ageLoot()+' gold + '+(40+mission*8)+' elixir';
 $('raid').disabled=battle||troopCount()<1;$('wave').textContent='Repel wave '+s.wave+' ↗';$('audio').innerHTML=icon(s.sound?'sound':'mute');$('audio').setAttribute('aria-label',s.sound?'Mute sound':'Enable sound');
}
function select(i){selected=i;chime(330);refresh();}
$('upgrade').onclick=()=>{if($('upgrade').disabled)return;const b=s.buildings[selected];s.gold-=upgradeCost(b);b.level++;save();refresh();chime();if(b.type==='hall'){modal('<div class="cap">NEW SETTLEMENT AGE</div><h2>'+ages[th()-1]+'</h2><p>Town Hall '+th()+' unlocks '+unlocks(th())+'.</p>');row('Explore construction sites','Choose an open plot to place a newly unlocked building.',directory);}else notice(structures[b.type][0]+' reached level '+b.level);};
function directory(){modal('<div class="cap">BUILD DIRECTORY</div><h2>Settlement plots</h2>');s.buildings.forEach((b,i)=>row(structures[b.type][0]+' <b>'+(b.level?'Lv. '+b.level:'Build +')+'</b>','Plot '+(i+1),()=>{select(i);$('dialog').close();}));}
$('buildings').onclick=directory;
function training(){modal('<div class="cap">ARMY CAMP</div><h2>Train your army</h2><p>'+(capacity()?troopCount()+' of '+capacity()+' spaces occupied. Choose a troop to recruit one soldier.':'Build and finish your Army Camp to unlock troop training.')+'</p>');for(const [k,[name,age,,role]] of Object.entries(troops)){const lock=th()<age;row(name+' <b>'+(lock?'Town Hall '+age:hireCost(k)+' elixir')+'</b>',role+' · '+s.army[k]+' ready',()=>{if(troopCount()>=capacity()||s.grain<hireCost(k)||th()<age)return;s.army[k]++;s.grain-=hireCost(k);save();refresh();training();chime();},lock||troopCount()>=capacity()||s.grain<hireCost(k));}}
$('train').onclick=training;
$('roadmap').onclick=()=>{modal('<div class="cap">SETTLEMENT PROGRESSION</div><h2>Town Hall chronicle</h2>'+ages.map((name,i)=>'<section class="age '+(i+1===th()?'current':'')+'"><small>TOWN HALL '+(i+1)+(i+1===th()?' · CURRENT AGE':'')+'</small><h3>'+name+'</h3><p>'+unlocks(i+1)+'</p></section>').join(''));};
$('atlas').onclick=()=>{modal('<div class="cap">CAMPAIGN ATLAS</div><h2>The Kingdom</h2><p>Capture each fortress to open the next. Cleared fortresses can be raided again. After the fifth, a harder circuit begins.</p>');const circuit=Math.floor((s.stage-1)/5);for(let n=Math.max(1,circuit*5-4);n<=circuit*5+5;n++){let data=atlas[(n-1)%5];row(n+'. '+data[0]+' <b>'+(n>s.stage?'Locked':s.stars[n]?'★'.repeat(s.stars[n]):'Scout →')+'</b>',data[1],()=>{mission=n;refresh();$('dialog').close();notice('Raid target: '+data[0]);},n>s.stage);}};
$('close').onclick=()=>$('dialog').close();
$('help').onclick=()=>modal('<div class="cap">FIELD GUIDE</div><h2>Rule the Kingdom</h2><p>Upgrade the Town Hall through five ages. Open the chronicle to see what each age unlocks. Select an empty plot under Buildings to place a defense or an economic building.</p><p>Quarries and mills produce supplies every five seconds, including up to one hour away. Train a mixed force in the army camp. Launch a raid to choose your troop type and approach.</p><p>Use Defend the settlement to challenge your own layout against a wave. Defensive buildings fight automatically. Successful campaigns and defenses both fund expansion.</p>');
$('audio').onclick=()=>{s.sound=!s.sound;chime();save();refresh();};
function expand(){const expanded=document.querySelector('.mapPanel').classList.toggle('expanded');$('expand').setAttribute('aria-label',expanded?'Close expanded view':'Expand island view');}
$('expand').onclick=expand;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('.mapPanel.expanded'))expand();});
function hit(e){const rect=$('world').getBoundingClientRect();return (window.islandHits||[]).map(h=>({...h,d:Math.hypot(h.x-(e.clientX-rect.left),h.y-(e.clientY-rect.top))})).filter(h=>h.d<=h.r).sort((a,b)=>a.d-b.d)[0];}
$('world').onclick=e=>{const h=hit(e);if(h)select(h.index);};$('world').onpointermove=e=>{$('world').style.cursor=hit(e)?'pointer':'default';};
$('raid').onclick=()=>{if(battle||!troopCount())return;battle=true;refresh();const stage=mission,name=target(),gold=ageLoot(),grain=40+stage*8;
 window.startRaid({stage,name,troops:troopCount(),army:{...s.army},onEnd:({win,lost,losses,stars})=>{
 if(!battle)return;battle=false;let rescue=sum('tower'),dead=0,rescued=0;
 for(const k of Object.keys(troops)){const n=Math.min(s.army[k],losses?.[k]||0),saved=Math.min(rescue,n);rescue-=saved;rescued+=saved;dead+=n-saved;s.army[k]-=n-saved;}
 if(win){s.gold+=gold;s.grain+=grain;s.stars[stage]=Math.max(s.stars[stage]||0,stars||1);if(stage===s.stage)s.stage++;mission=s.stage;}
 save();refresh();modal('<div class="cap">CAMPAIGN REPORT</div><h2>'+(win?name+' captured':'Fleet regrouped')+'</h2><p>'+(win?'Earned '+gold+' gold and '+grain+' elixir.':'Scout the defenses and try a different approach.')+'</p><p>'+dead+' soldiers lost · '+rescued+' rescued by the Field Hospital.</p>');}});};
$('defend').onclick=()=>{if(battle)return;battle=true;const wave=s.wave;window.startDefense({buildings:s.buildings.map(b=>({...b})),wave,onEnd:({win})=>{if(!battle)return;battle=false;const reward=65+wave*35;if(win){s.gold+=reward;s.wave++;}save();refresh();notice(win?'Wave repelled · +'+reward+' gold':'Defense ended · strengthen your perimeter and retry');}});};
function frame(t){if(!document.hidden&&!battle&&t-lastPaint>32){window.drawIsland?.($('world'),t/1000,s.buildings,selected);lastPaint=t;}requestAnimationFrame(frame);}
for(const [i,name] of ages.entries()){const btn=document.createElement('button');btn.className='ageStep';btn.innerHTML='<i>'+['I','II','III','IV','V'][i]+'</i>'+name;btn.setAttribute('aria-label','Explore Town Hall '+(i+1)+': '+name);btn.onclick=()=>$('roadmap').click();$('ageTrack').append(btn);}
$('move').onclick=()=>{const from=selected;if(!from||s.buildings[from].type==='empty')return;modal('<div class="cap">LAYOUT EDITOR</div><h2>Move '+structures[s.buildings[from].type][0]+'</h2><p>Choose a plot. Occupied plots swap buildings. The new layout applies to your next defense.</p>');if(['cannon','archery','mortar','arc','forge'].includes(s.buildings[from].type)||s.buildings.filter(b=>b.type===s.buildings[from].type).length>1)row('Clear this plot','Remove this building to make room for a new plan.',()=>{modal('<div class="cap">REBUILD TERRACE</div><h2>Remove '+structures[s.buildings[from].type][0]+'?</h2><p>This frees the plot. Its levels and construction gold are spent.</p>');row('Remove building','Return this plot to the construction menu.',()=>{s.buildings[from]={type:'empty',level:0};save();select(from);$('dialog').close();});});s.buildings.forEach((b,i)=>{if(!i||i===from)return;row('Plot '+(i+1)+' · '+structures[b.type][0],b.type==='empty'?'Move here':'Swap positions',()=>{[s.buildings[i],s.buildings[from]]=[s.buildings[from],s.buildings[i]];select(i);save();$('dialog').close();notice('Settlement layout updated');});});};
processConstruction(false);produce();save();refresh();setInterval(()=>{if(!document.hidden){produce();if(!$('choices').contains(document.activeElement))refresh();}},5000);document.addEventListener('visibilitychange',()=>{if(!document.hidden){produce();refresh();}});requestAnimationFrame(frame);


/* Home sieges use the same settlement renderer and building locations as the village. */
(() => {
  const weapons = {
    cannon:{name:'Cannon',range:205,damage:22,delay:1.32,color:'#ffc27a'},
    archery:{name:'Archery',range:238,damage:9,delay:.49,color:'#d9ffb4'},
    mortar:{name:'Mortar',range:255,damage:28,delay:2.4,splash:43,color:'#ff945d'},
    arc:{name:'Arc',range:190,damage:17,delay:.94,chain:true,color:'#a9eaff'}
  };
  const css = `
  .vf-siege{position:fixed;inset:0;z-index:9999;background:#09181deb;display:grid;place-items:center;padding:10px;color:#f8efd8;font:14px/1.4 "Segoe UI",sans-serif;overflow:auto}
  .vf-siege *{box-sizing:border-box}.vf-frame{background:#172d30;border:1px solid #7a826c;border-radius:18px;overflow:hidden;width:min(960px,100%);box-shadow:0 25px 85px #050f17a0}
  .vf-head,.vf-foot,.vf-tools,.vf-health,.vf-weaponlist{display:flex;align-items:center;gap:10px}.vf-head,.vf-foot{padding:14px 18px;justify-content:space-between}.vf-head h2{font:normal clamp(24px,3vw,36px)/1.08 Georgia,serif;margin:3px 0;color:#fff3d6}.vf-head small,.vf-end small{font-weight:bold;font-size:9px;letter-spacing:2px;color:#f0c57c}.vf-siege button{font:inherit;font-weight:650;border-radius:8px;padding:8px 12px;background:#324d4b;border:1px solid #708277;color:#f2ebd8;cursor:pointer}.vf-siege button:focus-visible{outline:3px solid #ffdda4;outline-offset:2px}.vf-siege button:disabled{opacity:.55;cursor:default}
  .vf-map{position:relative;background:#8ab2ae}.vf-map canvas{display:block;width:100%;height:clamp(240px,51vh,480px);touch-action:manipulation;cursor:crosshair}.vf-stats{position:absolute;top:9px;left:10px;padding:6px 10px;border-radius:6px;background:#172e32e8;font-size:11px;pointer-events:none}.vf-health{margin-top:3px;gap:6px}.vf-health i{width:72px;height:5px;background:#56655e;border-radius:8px;overflow:hidden}.vf-health b{height:100%;display:block;background:#a9d591}
  .vf-foot{flex-wrap:wrap}.vf-foot p,.vf-end p{margin:3px 0;color:#cfddd2}.vf-foot strong{color:#f7d9a4}.vf-tools{flex-wrap:wrap}.vf-tools .vf-fire,.vf-end button{background:#e7bc70;border-color:#f2d390;color:#302b21}.vf-weaponlist{padding:0 18px 12px;color:#b8d2c4;font-size:12px;flex-wrap:wrap}.vf-end{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;text-align:center;background:#13282de8;padding:20px}.vf-end[hidden]{display:none}.vf-end h2{font:normal clamp(30px,6vw,50px) Georgia,serif;color:#ffebbf;margin:5px}.vf-end button{margin-top:13px}.vf-end p{max-width:440px}
  @media(max-width:560px){.vf-siege{padding:3px}.vf-head,.vf-foot{padding:9px 11px}.vf-head h2{font-size:23px}.vf-map canvas{height:clamp(215px,40vh,325px)}.vf-tools button{font-size:12px;padding:7px}.vf-weaponlist{padding:0 11px 9px}.vf-stats{font-size:10px}.vf-foot p{font-size:12px}}
  `;
  let running=false;
  window.startDefense=function({buildings,wave=1,onEnd}){
    if(running)return;
    running=true;
    const all=buildings.map(b=>({...b}));
    const level=all[0]?.level||1;
    wave=Math.max(1,Math.floor(wave)||1);
    const total=Math.min(35,5+wave*2);
    const overlay=document.createElement('div');
    overlay.className='vf-siege';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Defend the Town Hall');
    overlay.innerHTML='<style>'+css+'</style><div class="vf-frame"><div class="vf-head"><div><small>HOME FRONT · WAVE '+String(wave).padStart(2,'0')+'</small><h2>Hold the town hall</h2></div><div class="vf-head-actions" style="display:flex;gap:6px;"><button class="vf-speed">1x Speed</button><button class="vf-pause">Pause</button><button class="vf-leave">Withdraw</button></div></div><div class="vf-map"><canvas aria-label="Your village under siege. Tap an attacker or use Mark next."></canvas><div class="vf-stats"><strong>Town Hall</strong><div class="vf-health"><i><b></b></i><span></span></div></div><section class="vf-end" hidden><small>DEFENSE REPORT</small><h2></h2><p></p><button>Return to village</button></section></div><div class="vf-foot"><div><strong class="vf-counter"></strong><p>Mark a raider to focus your defenses. Fire a flare to strike nearby attackers.</p></div><div class="vf-tools"><button class="vf-mark">Mark next</button><button class="vf-fire">Fire flare</button></div></div><div class="vf-weaponlist"></div></div>';
    const prevFocus=document.activeElement,prevOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';document.body.append(overlay);
    const q=s=>overlay.querySelector(s);
    const canvas=q('canvas'),g=canvas.getContext('2d'),background=document.createElement('canvas');
    let points;
    function paintVillage(t){
      const previous=window.islandHits;
      window.drawIsland(background,t,all,-1);
      points=window.islandHits.map(p=>({x:p.x,y:p.y+9}));
      window.islandHits=previous;
    }
    paintVillage(0);
    const hall=points[0],turrets=all.flatMap((b,i)=>weapons[b.type]&&points[i]?[{...weapons[b.type],...points[i],level:b.level,next:.6}]:[]);
    turrets.push({...hall,name:'Town guard',level,range:136,damage:8,delay:.97,color:'#ffeab3',next:0});
    const waves=[[-290,48],[-195,120],[220,105],[270,26]];
    const lanes=waves.map(([x,y])=>({x:hall.x+x,y:hall.y+y}));
    const walls=(all[0]?.layout?.walls||createDefaultWalls()).map(w=>({x:450+(5+(w.u-w.v)*69)*Math.min(900/920,520/525),y:(520-560*Math.min(900/920,520/525))/2+(298+(w.u+w.v)*33)*Math.min(900/920,520/525),hp:32}));
    const bombs=(all[0]?.layout?.traps||[]).map(t=>({x:450+(5+(t.u-t.v)*69)*Math.min(900/920,520/525),y:(520-560*Math.min(900/920,520/525))/2+(298+(t.u+t.v)*33)*Math.min(900/920,520/525),used:false}));
    const units=[],effects=[];let serial=0,kills=0,breaches=0,clock=0,untilSpawn=.45,last=0,backgroundAt=0;
    let hp=100+level*18,max=hp,mark=null,ready=0,frame,done=false,closed=false,won=false,paused=false,speed=1;
    const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const counts={};all.forEach(b=>{if(weapons[b.type])counts[b.type]=(counts[b.type]||0)+1;});
    q('.vf-weaponlist').textContent=['Town guard',...Object.keys(counts).map(k=>counts[k]+' × '+weapons[k].name)].join('   ·   ');
    function ring(x,y,color,r){effects.push({x,y,color,r,life:.45,total:.45});}
    function aim(){
      const alive=units.filter(u=>u.hp>0).sort((a,b)=>distance(a,hall)-distance(b,hall));
      mark=alive[(alive.findIndex(u=>u.id===mark)+1)%alive.length]?.id??null;
    }
    function flare(){
      if(done||paused||clock<ready||!units.some(u=>u.hp>0))return;
      let target=units.find(u=>u.id===mark&&u.hp>0)||units.filter(u=>u.hp>0).sort((a,b)=>distance(a,hall)-distance(b,hall))[0];
      ring(target.x,target.y,'#fff4a1',72);for(const u of units)if(distance(target,u)<72)u.hp-=29+level*3;
      ready=clock+5;
    }
    function togglePauseDefense(){if(done)return;paused=!paused;q('.vf-pause').textContent=paused?'Resume':'Pause';}
    function toggleSpeedDefense(){speed=speed===1?2:1;q('.vf-speed').textContent=speed+'x Speed';}
    q('.vf-mark').onclick=aim;q('.vf-fire').onclick=flare;
    q('.vf-pause').onclick=togglePauseDefense;q('.vf-speed').onclick=toggleSpeedDefense;
    function status(){
      q('.vf-health b').style.width=Math.max(0,100*hp/max)+'%';q('.vf-health span').textContent=Math.ceil(Math.max(0,hp))+' / '+max;
      q('.vf-counter').textContent=kills+' repelled · '+breaches+' breached · '+Math.max(0,total-serial)+' approaching';
      q('.vf-fire').disabled=done||paused||clock<ready||!units.some(u=>u.hp>0);
      q('.vf-fire').textContent=clock<ready?'Flare · '+Math.ceil(ready-clock)+'s':'Fire flare';
      q('.vf-mark').disabled=done||paused||!units.some(u=>u.hp>0);
    }
    function finish(win){
      if(done)return;done=true;won=win;
      const result=q('.vf-end');result.hidden=false;q('.vf-end h2').textContent=win?'The hall stands':'The line broke';q('.vf-end p').textContent=kills+' of '+total+' attackers repelled. '+Math.max(0,Math.round(100*hp/max))+'% hall integrity remaining.';q('.vf-end button').textContent='Return to village';q('.vf-end button').onclick=close;q('.vf-leave').hidden=true;q('.vf-end button').focus();status();
    }
    function close(){
      if(closed)return;closed=true;running=false;cancelAnimationFrame(frame);document.removeEventListener('keydown',keys);overlay.remove();document.body.style.overflow=prevOverflow;prevFocus?.focus?.();onEnd?.({win:won});
    }
    function withdraw(){if(done)return close();if(paused){paused=false;q('.vf-end').hidden=true;q('.vf-leave').textContent='Withdraw';return;}paused=true;q('.vf-end').hidden=false;q('.vf-end h2').textContent='Withdraw from defense?';q('.vf-end p').textContent='Withdrawing ends this wave in defeat.';q('.vf-end button').textContent='Confirm withdrawal';q('.vf-end button').onclick=()=>{won=false;close();};q('.vf-leave').textContent='Resume defense';}
    q('.vf-leave').onclick=withdraw;
    function keys(e){
      if(e.key==='Tab'){const buttons=[...overlay.querySelectorAll('button')].filter(b=>!b.disabled&&b.offsetParent!==null);if(!buttons.length)return;const end=e.shiftKey?buttons[0]:buttons[buttons.length-1];if(document.activeElement===end){e.preventDefault();(e.shiftKey?buttons[buttons.length-1]:buttons[0]).focus();}return;}
      if(e.key==='Escape'){e.preventDefault();withdraw();}
      if(e.key===' '){e.preventDefault();togglePauseDefense();return;}
      if(e.key.toLowerCase()==='s'){e.preventDefault();toggleSpeedDefense();return;}
      if(done||paused)return;
      if(e.key.toLowerCase()==='f')flare();
      if(e.key.toLowerCase()==='m')aim();
    }
    document.addEventListener('keydown',keys);q('.vf-leave').focus();
    function size(){
      const w=canvas.clientWidth,h=canvas.clientHeight,d=Math.min(devicePixelRatio||1,2);
      if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}
      const scale=Math.min(w/775,h/435);
      return {w,h,d,scale,ox:(w-900*scale)/2,oy:(h-520*scale)/2};
    }
    canvas.onpointerdown=e=>{if(done||paused)return;const {scale,ox,oy}=size(),r=canvas.getBoundingClientRect(),p={x:(e.clientX-r.left-ox)/scale,y:(e.clientY-r.top-oy)/scale};const hit=units.filter(u=>u.hp>0&&distance(u,p)<37).sort((a,b)=>distance(a,p)-distance(b,p))[0];if(hit)mark=hit.id;};
    function simulate(rawDt){
      if(paused)return;
      const dt=rawDt*speed;
      for(const bomb of bombs){if(!bomb.used&&units.some(u=>u.hp>0&&Math.hypot(u.x-bomb.x,u.y-bomb.y)<27)){bomb.used=true;units.filter(u=>Math.hypot(u.x-bomb.x,u.y-bomb.y)<47).forEach(u=>u.hp-=65);ring(bomb.x,bomb.y,'#ffac50',49);}}

      clock+=dt;untilSpawn-=dt;
      if(serial<total&&untilSpawn<=0){const id=serial++,lane=lanes[(id+Math.floor(id/3)+wave)%lanes.length],heavy=id%5===4;
        const health=(heavy?44:23)+wave*3;
        units.push({id,x:lane.x+(id%3-1)*8,y:lane.y,hp:health,max:health,heavy,speed:(heavy?12:19)+Math.min(wave,9)*.5});untilSpawn=1.05;}
      for(const u of units){if(u.hp<=0)continue;const wall=walls.find(w=>w.hp>0&&distance(u,w)<10);if(wall){wall.hp-=dt*(u.heavy?19:13);if(wall.hp<=0)ring(wall.x,wall.y,'#d8c59b',15);continue;}const d=distance(u,hall);
        if(d<=13){hp-=u.heavy?28:17;u.hp=0;u.breached=true;breaches++;ring(hall.x,hall.y,'#ff9871',40);continue;}
        u.x+=(hall.x-u.x)/d*u.speed*dt;u.y+=(hall.y-u.y)/d*u.speed*dt;}
      for(const t of turrets){if(t.next>clock)continue;
        const targets=units.filter(u=>u.hp>0&&distance(t,u)<t.range+6*t.level).sort((a,b)=>(b.id===mark)-(a.id===mark)||distance(a,hall)-distance(b,hall));if(!targets.length)continue;
        const target=targets[0],damage=t.damage*(1+.28*(t.level-1));target.hp-=damage;t.next=clock+t.delay;
        function beam(a,b){effects.push({x:a.x,y:a.y-8,tx:b.x,ty:b.y-4,color:t.color,life:.24,total:.24});}
        beam(t,target);if(t.splash){ring(target.x,target.y,t.color,t.splash);for(const u of units)if(u!==target&&distance(u,target)<t.splash)u.hp-=damage*.77;}
        if(t.chain){const near=units.filter(u=>u!==target&&u.hp>0&&distance(u,target)<68).sort((a,b)=>distance(a,target)-distance(b,target))[0];if(near){beam(target,near);near.hp-=damage*.72;}}
      }
      for(let i=units.length-1;i>=0;i--){const u=units[i];if(u.hp<=0){if(!u.breached){kills++;ring(u.x,u.y,'#f5d7a3',14);}units.splice(i,1);}}
      for(let i=effects.length-1;i>=0;i--)if((effects[i].life-=dt)<=0)effects.splice(i,1);
      if(hp<=0)finish(false);else if(serial===total&&!units.length)finish(true);
    }
    function draw(){
      const {w,h,d,scale,ox,oy}=size();g.setTransform(d,0,0,d,0,0);g.fillStyle='#9ebcb6';g.fillRect(0,0,w,h);g.translate(ox,oy);g.scale(scale,scale);g.drawImage(background,0,0,900,520);
      for(const p of lanes){g.strokeStyle='#9d402b';g.lineWidth=2;g.beginPath();g.arc(p.x,p.y,8,0,6.29);g.stroke();}
      for(const u of units){
        const stride=Math.sin(clock*8+u.id),y=u.y-Math.abs(stride)*1.5;
        g.fillStyle='#27333466';g.beginPath();g.ellipse(u.x,u.y+1,7,2.7,0,0,6.29);g.fill();
        g.strokeStyle='#473e39';g.lineWidth=2;g.beginPath();g.moveTo(u.x-2,y-3);g.lineTo(u.x-2+stride*2,u.y);g.moveTo(u.x+2,y-3);g.lineTo(u.x+2-stride*2,u.y);g.stroke();
        g.fillStyle=u.heavy?'#663a47':'#ad4743';g.fillRect(u.x-(u.heavy?5:3),y-10,u.heavy?10:7,8);
        g.fillStyle='#cfad90';g.beginPath();g.arc(u.x,y-12,3.3,0,6.29);g.fill();g.fillStyle='#514555';g.fillRect(u.x-4,y-15,8,3);
        g.fillStyle='#4f3031';g.fillRect(u.x-7,y-20,14,2.4);g.fillStyle='#ff9d74';g.fillRect(u.x-7,y-20,14*u.hp/u.max,2.4);
        if(u.id===mark){g.strokeStyle='#fff4a6';g.lineWidth=2;g.beginPath();g.ellipse(u.x,u.y+1,12,5,0,0,6.29);g.stroke();g.fillStyle='#ffee99';g.fillText('▼',u.x-4,y-24);}
      }
      for(const fx of effects){g.globalAlpha=fx.life/fx.total;g.strokeStyle=fx.color;g.lineWidth=3;g.beginPath();if(fx.r)g.arc(fx.x,fx.y,Math.max(1,fx.r*(1-fx.life/fx.total)),0,6.29);else{g.moveTo(fx.x,fx.y);g.lineTo(fx.tx,fx.ty);}g.stroke();}g.globalAlpha=1;
    }
    function loop(t){if(closed)return;const dt=last?Math.min(.075,(t-last)/1000):0;last=t;if(!document.hidden&&!done&&!paused){simulate(dt);if(clock-backgroundAt>.3){paintVillage(clock);backgroundAt=clock;}draw();status();}frame=requestAnimationFrame(loop);}
    draw();status();frame=requestAnimationFrame(loop);
  };
})();

function showInspection(){document.body.classList.add('inspecting');}
const previousSelect=select;
select=function(index){previousSelect(index);showInspection();};
$('dismissInspector').onclick=()=>document.body.classList.remove('inspecting');
$('battleHud').onclick=()=>{modal('<div class="cap">SINGLE PLAYER CAMPAIGN</div><h2>'+target()+'</h2><p>'+atlas[(mission-1)%5][1]+'</p><p>Army: '+troopCount()+' troops · Victory bounty: '+ageLoot()+' gold.</p>');row('Attack fortress','Scout defenses, choose a troop and deploy.',()=>{$('dialog').close();$('raid').click();},!troopCount());row('Campaign map','Inspect all five enemy strongholds.',()=>$('atlas').click());};
$('buildHud').onclick=directory;$('armyHud').onclick=training;$('agesHud').onclick=()=>$('roadmap').click();
$('guardHud').onclick=()=>$('defend').click();$('ordersHud').onclick=()=>window.openGoals();$('labHud').onclick=()=>window.openLab();$('shopHud').onclick=()=>window.openDepot();
document.querySelector('.brand').onclick=e=>{e.preventDefault();select(0);};

/* All quartermaster transactions share the village save. */
(() => {
  const offers=[
    {pay:'gold',take:60,get:'grain',give:40},
    {pay:'grain',take:60,get:'gold',give:42}
  ];
  const currency={gold:'gold',grain:'elixir'};
  const defenses=['cannon','archery','mortar','arc'];
  const orders=[
    {id:'garrison',name:'Fill the training yard',goal:10,count:()=>troopCount(),what:'troops in camp',gold:60,grain:30},
    {id:'first-raid',name:'Take the first outpost',goal:1,count:()=>s.stage-1,what:'campaign victories',gold:90,grain:45},
    {id:'hall-two',name:'Raise the slate hall',goal:2,count:()=>th(),what:'Town Hall level',gold:100,grain:60},
    {id:'crossfire',name:'Establish crossfire',goal:2,count:()=>s.buildings.filter(b=>defenses.includes(b.type)).length,what:'defensive buildings',gold:100,grain:45},
    {id:'home-front',name:'Hold the perimeter',goal:2,count:()=>s.wave-1,what:'waves repelled',gold:125,grain:65},
    {id:'specialists',name:'Train three troops',goal:3,count:()=>Object.values(s.army).filter(n=>n>0).length,what:'troop types in camp',gold:140,grain:85},
    {id:'fieldwork',name:'Record a field doctrine',goal:1,count:()=>Object.values(s.research||{}).filter(n=>n>0).length,what:'troops researched',gold:120,grain:90},
    {id:'isles',name:'Capture the five strongholds',goal:5,count:()=>s.stage-1,what:'campaign victories',gold:300,grain:130},
    {id:'crown',name:'Raise the Citadel',goal:5,count:()=>th(),what:'Town Hall level',gold:320,grain:180}
  ];
  const balance=()=>'<p>Treasury · '+s.gold.toLocaleString()+' gold · '+s.grain.toLocaleString()+' elixir</p>';
  function commit(message,render){save();refresh();chime();render();notice(message);}
  window.openDepot=function(){
    modal('<div class="cap">RESOURCE SHOP</div><h2>Resource Shop</h2>'+balance());
    for(const offer of offers){
      const {pay,take,get,give}=offer;
      const reserve=['mine','farm','barracks'].filter(k=>!s.buildings.some(b=>b.type===k)).reduce((n,k)=>n+structures[k][2],0);
      row('Receive '+give+' '+currency[get],'Trade '+take+' '+currency[pay]+(pay==='gold'&&s.gold-take<reserve?' · Reserve gold for your first buildings':''),()=>{
        if(s[pay]<take||(pay==='gold'&&s.gold-take<reserve))return;
        s[pay]-=take;s[get]+=give;
        commit('Received '+give+' '+currency[get],window.openDepot);
      },s[pay]<take||(pay==='gold'&&s.gold-take<reserve));
    }
  };
  window.openGoals=function(){
    s.claims??={};
    const ordered=[...orders].sort((a,b)=>Number(Boolean(s.claims[a.id]))-Number(Boolean(s.claims[b.id]))||Number(b.count()>=b.goal)-Number(a.count()>=a.goal));
    modal('<div class="cap">ACHIEVEMENTS</div><h2>Achievements</h2><p>'+orders.filter(q=>s.claims[q.id]).length+' of '+orders.length+' rewards claimed</p>');
    for(const order of ordered){
      const claimed=Boolean(s.claims[order.id]),n=Math.min(order.count(),order.goal),ready=n>=order.goal;
      const reward=order.gold+' gold + '+order.grain+' elixir';
      row(order.name+(claimed?' · Claimed':ready?' · Claim reward':''),n+' / '+order.goal+' '+order.what+' · '+reward,()=>{
        if(s.claims[order.id]||order.count()<order.goal)return;
        s.claims[order.id]=true;s.gold+=order.gold;s.grain+=order.grain;
        commit('Achievement reward · '+reward,window.openGoals);
      },claimed||!ready);
    }
  };
  const rank=k=>Math.max(0,Math.min(3,Math.floor(Number(s.research?.[k])||0)));
  window.researchBonus=k=>1+rank(k)*.12;
  window.openLab=function(){
    const hall=th(),cap=Math.min(3,hall-1);
    modal('<div class="cap">TROOP RESEARCH</div><h2>Laboratory</h2><p>'+(hall<2?'Town Hall 2 opens the laboratory.':'Each research rank permanently adds 12% to the troop’s attack power.')+'</p>'+balance());
    for(const [type,[name,tier]] of Object.entries(troops)){
      const current=rank(type),next=current+1,gold=75*next,grain=45*next;
      const locked=hall<Math.max(tier,next+1),max=current>=3;
      const detail=max?'Fully researched':locked?'Requires Town Hall '+Math.max(tier,next+1):'Research rank '+next+' · '+gold+' gold + '+grain+' elixir';
      row(name+' · Rank '+current,detail,()=>{
        if(rank(type)!==current||current>=cap||hall<tier||s.gold<gold||s.grain<grain)return;
        s.gold-=gold;s.grain-=grain;s.research??={};s.research[type]=next;
        commit(name+' research complete · rank '+next,window.openLab);
      },max||locked||s.gold<gold||s.grain<grain);
    }
  };
})();
/* Illustrated village menus and base editor. */
paths.gold='<ellipse cx="20" cy="22" rx="16" ry="16" fill="#b98013"/><ellipse cx="19" cy="19" rx="15" ry="16" fill="#ffd83f" stroke="#fff394" stroke-width="2"/><ellipse cx="19" cy="19" rx="10" ry="11" fill="#ffc523" stroke="#e3a516" stroke-width="2"/><path d="M13 8q5-4 10-1" fill="none" stroke="#fff9b1" stroke-width="3" stroke-linecap="round"/>';
paths.grain='<path d="M20 2C16 10 5 17 5 25a15 15 0 0 0 30 0C35 17 24 10 20 2" fill="#9f25c3" stroke="#e2a5f8" stroke-width="1.4"/><path d="M20 5C17 14 10 18 9 24c-2 8 12 11 15 4 3-7-1-17-4-23" fill="#df6af1"/><ellipse cx="14" cy="23" rx="3" ry="6" fill="#ffc9ff" transform="rotate(20 14 23)"/>';
paths.lab='<path d="M10 4h20v5H10z" fill="#d8e3dc"/><path d="M15 9v9L5 32q-2 5 5 5h20q7 0 5-5L25 18V9" fill="#bfd8d4" stroke="#586b63" stroke-width="2"/><path d="m12 24-5 9q-1 2 4 2h18q5 0 4-2l-5-9z" fill="#bb54e3"/><circle cx="21" cy="28" r="2" fill="#f1c5ff"/><circle cx="17" cy="19" r="2" fill="#d38ef3"/>';
paths.attack='<path d="m6 3 12 8 13 20-5 4L11 16z" fill="#eff2e5" stroke="#7a8a80" stroke-width="2"/><path d="m23 31 10-8 3 4-10 8zM24 34l-6 6-4-4 6-6z" fill="#d5ad52"/><path d="M32 3 20 11 7 31l5 4 15-19z" fill="#dae5de" stroke="#6f8176" stroke-width="2"/>';
$('goldIcon').innerHTML=icon('gold');$('grainIcon').innerHTML=icon('grain');$('labHud').innerHTML=icon('lab')+'Laboratory';
$('guardHud').title='Defend your village against enemy waves';
$('agesHud').title='Town Hall upgrades and unlocks';
const portraits=new Map();
function portrait(type,level=1){
 const key=type+level;if(portraits.has(key))return portraits.get(key);
 const source=document.createElement('canvas'),out=document.createElement('canvas');out.width=144;out.height=144;
 const oldHits=window.islandHits,oldTransform=window.worldTransform;
 const models=Array.from({length:12},()=>({type:'empty',level:0}));models[0]={type,level};
 window.drawIsland(source,0,models,-1);
 const p=window.islandHits[0],d=Math.min(window.devicePixelRatio||1,2);
 const ctx=out.getContext('2d');ctx.drawImage(source,(p.x-56)*d,(p.y-85)*d,112*d,112*d,0,0,144,144);
 window.islandHits=oldHits;window.worldTransform=oldTransform;
 const url=out.toDataURL();portraits.set(key,url);return url;
}
row=function(label,desc,action,disabled=false){
 const b=document.createElement('button');b.className='actionCard';
 const text=document.createElement('span');text.className='cardText';text.innerHTML='<strong>'+label+'</strong><small>'+desc+'</small>';
 const type=Object.entries(structures).find(([k,v])=>label.includes(v[0]))?.[0];
 if(type){const img=document.createElement('img');img.className='cardArt';img.alt='';img.src=portrait(type,type==='hall'?th():1);b.append(img);}
 else {const face=document.createElement('span');face.innerHTML=icon(label.match(/gold/i)?'gold':label.match(/elixir/i)?'grain':label.match(/attack/i)?'attack':'map');b.append(face);}
 b.append(text);b.disabled=disabled;b.onclick=action;$('dialogBody').append(b);return b;
};
const originalRefresh=refresh;
refresh=function(){originalRefresh();for(const b of $('choices').children){const type=Object.entries(structures).find(([,v])=>b.textContent.startsWith(v[0]))?.[0];if(!type)continue;const text=b.textContent;b.className='actionCard';b.replaceChildren();const image=document.createElement('img');image.className='cardArt';image.alt='';image.src=portrait(type);const span=document.createElement('span');span.textContent=text;b.append(image,span);}};
directory=function(){
 document.body.classList.remove('inspecting');modal('<div class="cap">VILLAGE BUILDINGS</div><h2>Build & upgrade</h2><p>Start with a Gold Mine, Elixir Collector, and Army Camp. Then use your remaining plots to expand.</p>');
 for(const [i,b] of s.buildings.entries())row(structures[b.type][0]+' <b>'+(b.level?'Level '+b.level:'Build here')+'</b>','Plot '+(i+1),()=>{select(i);$('dialog').close();});
};
$('buildings').onclick=directory;$('buildHud').onclick=directory;
const moreMissions=[
 ['Ashwood Camp','A timber garrison with overlapping cannon coverage.'],['Twin Bridges','Two guarded crossings into the inner ward.'],['Frostwall Keep','A glacier fortress defended by mortars and Tesla Towers.'],['Shadow Marsh','A sheltered outpost with a dangerous central battery.'],['King’s Redoubt','A royal keep with three reinforced gates.'],
 ['Goldrush Valley','A quarry stronghold with heavy cannon emplacements.'],['Ember Crossing','A narrow approach under artillery fire.'],['Crystal Bastion','A northern fortress with lightning defenses.'],['Ironwood Fortress','A dense garrison with strong crossfire.'],['The Last Citadel','The most heavily defended seat of the campaign.']
];
atlas.push(...moreMissions);
$('atlas').onclick=()=>{
 modal('<div class="cap">SINGLE PLAYER</div><h2>Campaign map</h2><p>15 strongholds. Win each attack to unlock the next. Cleared missions can be replayed.</p>');
 const grid=document.createElement('div');grid.className='campaignGrid';$('dialogBody').append(grid);
 for(let n=1;n<=atlas.length;n++){
   const b=document.createElement('button');b.className='actionCard';b.disabled=n>s.stage;
   b.innerHTML='<span class="stageNum">'+n+'</span><span class="cardText"><strong>'+atlas[n-1][0]+'</strong><small>'+atlas[n-1][1]+'</small><small>'+(n>s.stage?'Locked · Complete the previous mission':s.stars[n]?'★'.repeat(s.stars[n])+' · Replay available':'Ready to attack')+'</small></span>';
   b.onclick=()=>{mission=n;refresh();openBattleMenu();};grid.append(b);
 }
};
function openBattleMenu(){
 modal('<div class="cap">SINGLE PLAYER BATTLES</div><h2>'+target()+'</h2><p>'+atlas[(mission-1)%atlas.length][1]+'</p>');
 row('Attack base','Deploy '+troopCount()+' troops · Earn '+ageLoot()+' gold and '+(40+mission*8)+' elixir',()=>{$('dialog').close();document.body.classList.remove('inspecting');$('raid').click();},troopCount()<1);
 row('Campaign map','Choose from 15 enemy strongholds.',()=>$('atlas').click());
 row('Train army','Choose troops and fill your Army Camp.',training);
}
$('battleHud').onclick=openBattleMenu;
$('shopHud').onclick=()=>window.openDepot();
$('agesHud').innerHTML=icon('hall')+'Town Hall';
refresh();
function createDefaultWalls(){
 const list=[],edges=[[-2.55,-2.55,2.55,-2.55],[2.55,-2.55,2.55,2.55],[-2.55,2.55,2.55,2.55],[-2.55,-2.55,-2.55,2.55],[-1.5,-2.55,-1.5,2.55],[.55,-2.55,.55,2.55],[-2.55,-.55,2.55,-.55],[-.55,1.5,2.55,1.5]];
 for(const [a,b,c,d]of edges){const length=Math.hypot(c-a,d-b),steps=Math.ceil(length/.5);for(let i=0;i<steps;i++){if(Math.abs(i/steps-.5)<.09)continue;list.push({u:Math.round((a+(c-a)*i/steps)*2)/2,v:Math.round((b+(d-b)*i/steps)*2)/2,axis:a===c?'v':'u'});}}return list;
}
let layoutEditing=false,editMode='buildings',dragged=null,lastEditorObject=null,layoutBackup;
const oldMapClick=$('world').onclick;
$('world').onclick=e=>{if(!layoutEditing)oldMapClick(e);};
function gridPoint(e){const r=$('world').getBoundingClientRect(),t=window.worldTransform,x=((e.clientX-r.left-t.ox)/t.z-505)/69,y=((e.clientY-r.top-t.oy)/t.z-298)/33;return {u:Math.max(-3.5,Math.min(3.5,Math.round((x+y)*1)/2)),v:Math.max(-3.5,Math.min(3.5,Math.round((y-x)*1)/2))};}
const basePlots=[[0,0],[-2,0],[0,-2],[1,1],[2,0],[-1,2],[2,2],[1,2],[-2,-1],[-1,-2],[2,-2],[0,2]];
const getPosition=i=>s.buildings[i].pos||{u:basePlots[i][0],v:basePlots[i][1]};
function setEditorMode(mode){editMode='buildings';mode='buildings';lastEditorObject=null;document.querySelectorAll('.editorBar [data-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.mode===mode));$('editHint').textContent=mode==='buildings'?'Drag any building or empty plot to a new grid position.':mode==='walls'?'Drag a wall segment. Tap empty ground to place a new segment.':'Drag a bomb trap. Tap empty ground to place a new trap (maximum 12).';}
function openLayoutEditor(){
 if(battle||layoutEditing)return;layoutBackup=structuredClone(s.buildings);layoutEditing=true;

 document.body.classList.remove('inspecting');document.body.classList.add('editing');
 const bar=document.createElement('section');bar.className='editorBar';bar.id='layoutEditor';
 bar.innerHTML='<p id="editHint">Drag buildings to a free grid position. Walls and traps are fixed.</p><nav><button id="saveLayout">Save layout ✓</button><button id="cancelLayout">Cancel</button></nav>';
 document.body.append(bar);
 bar.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setEditorMode(b.dataset.mode));
 function finish(commit){if(!commit)s.buildings=layoutBackup;else save();layoutEditing=false;dragged=null;lastEditorObject=null;document.body.classList.remove('editing');bar.remove();refresh();notice(commit?'Base layout saved':'Layout changes cancelled');}
 $('saveLayout').onclick=()=>finish(true);$('cancelLayout').onclick=()=>finish(false);setEditorMode('buildings');
}
$('editHud').onclick=openLayoutEditor;
$('world').addEventListener('pointerdown',e=>{
 if(!layoutEditing)return;e.preventDefault();$('world').setPointerCapture(e.pointerId);const p=gridPoint(e);
 if(editMode==='buildings'){
   const h=hit(e);if(!h){dragged=null;return;}dragged={mode:editMode,index:h.index,start:{...getPosition(h.index)}};selected=h.index;
 }else{
   const list=s.buildings[0].layout[editMode],nearest=list.map((o,index)=>({index,d:Math.hypot(o.u-p.u,o.v-p.v)})).sort((a,b)=>a.d-b.d)[0];
   if(nearest&&nearest.d<.65)dragged={mode:editMode,index:nearest.index,start:{...list[nearest.index]}};
   else{if(editMode==='traps'&&list.length>=12){notice('Maximum 12 bomb traps');return;}if(editMode==='walls'&&list.length>=160){notice('Maximum 160 wall segments');return;}list.push({...p,...(editMode==='walls'?{axis:'u'}:{})});dragged={mode:editMode,index:list.length-1,start:{...p}};}
 }lastEditorObject=dragged;
});
$('world').addEventListener('pointermove',e=>{
 if(!layoutEditing||!dragged)return;const p=gridPoint(e);
 if(dragged.mode==='buildings')s.buildings[dragged.index].pos=p;else Object.assign(s.buildings[0].layout[dragged.mode][dragged.index],p);
});
function releaseEditor(){
 if(!dragged)return;if(dragged.mode==='buildings'){
 const p=getPosition(dragged.index),blocked=s.buildings.some((b,i)=>i!==dragged.index&&Math.hypot(getPosition(i).u-p.u,getPosition(i).v-p.v)<.85);
 if(blocked){s.buildings[dragged.index].pos=dragged.start;notice('That position is occupied. Choose a free grid square.');}
 }dragged=null;
}
$('world').addEventListener('pointerup',releaseEditor);$('world').addEventListener('pointercancel',releaseEditor);
function buildDuration(type,level){return Math.round(({hall:25,mine:7,farm:7,barracks:10,tower:9,cannon:8,archery:11,mortar:14,forge:17,arc:20}[type]||8)*Math.pow(level,1.45))*1000;}
function builderCount(){return s.buildings.filter(b=>b.job).length;}
function queueBuild(index,type,price){
 if(builderCount()>=2){notice('Both builders are working. Wait for one to finish.');return;}
 const b=s.buildings[index];if(b.type!=='empty'||b.job||s.gold<price||th()<structures[type][1]||!canConstruct(type))return;
 const now=Date.now();s.gold-=price;s.buildings[index]={...b,type,level:0,job:{level:1,started:now,finish:now+buildDuration(type,1)}};
 save();refresh();notice(structures[type][0]+' construction started');
}
function processConstruction(announce=true){
 let changed=false;for(const b of s.buildings){if(b.job&&Date.now()>=b.job.finish){s.lastConstructionFinishedAt=Math.max(s.lastConstructionFinishedAt||0,b.job.finish);b.level=b.job.level;delete b.job;changed=true;if(announce)notice(structures[b.type][0]+' level '+b.level+' ready');}}
 if(changed)save();return changed;
}
function timeLeft(ms){const n=Math.max(0,Math.ceil(ms/1000));return n>=60?Math.floor(n/60)+'m '+n%60+'s':n+'s';}
const timerRefresh=refresh;
refresh=function(){timerRefresh();const b=s.buildings[selected];if(b.job){$('upgrade').disabled=true;$('upgrade').hidden=false;$('upgrade').textContent=(b.level?'Upgrading':'Building')+' · '+timeLeft(b.job.finish-Date.now());$('move').hidden=true;$('choices').replaceChildren();}else if(b.type!=='empty'){$('upgrade').disabled||=builderCount()>=2;if(!$('upgrade').disabled)$('upgrade').textContent+=' · '+timeLeft(buildDuration(b.type,b.level+1));}const badge=$('builderHud');if(badge)badge.textContent='Builders '+(2-builderCount())+'/2';};
$('upgrade').onclick=()=>{
 const b=s.buildings[selected],max=b.type==='hall'?5:th()+1;if(b.job||b.type==='empty'||b.level>=max||s.gold<upgradeCost(b))return;
 if(builderCount()>=2){notice('Both builders are working.');return;}
 s.gold-=upgradeCost(b);const now=Date.now();b.job={level:b.level+1,started:now,finish:now+buildDuration(b.type,b.level+1)};save();refresh();chime();notice('Builder assigned to '+structures[b.type][0]);
};
setInterval(()=>{if(processConstruction()||s.buildings[selected].job)refresh();},500);
const builderButton=document.createElement('button');builderButton.id='builderHud';builderButton.className='builderHud';builderButton.onclick=()=>{modal('<div class="cap">BUILDERS</div><h2>Construction queue</h2><p>Two builders are available. Construction continues while the game is closed.</p>');const active=s.buildings.filter(b=>b.job);if(!active.length)row('Both builders are free','Build on an empty plot or select a building to upgrade.',directory);for(const b of active)row(structures[b.type][0]+' · Level '+b.job.level,'Ready in '+timeLeft(b.job.finish-Date.now()),()=>{$('dialog').close();select(s.buildings.indexOf(b));});};document.body.append(builderButton);
function troopSvg(type){
 const backdrop='<rect x="1" y="1" width="62" height="62" rx="10" fill="#263c32" stroke="#b8a46b" stroke-width="2"/><path d="M3 43 61 4v57H3z" fill="#3f5740"/>';
 const art={
 vanguard:'<path d="M8 63V48q2-12 24-12t24 12v15" fill="#934c39"/><path d="M19 19q0-13 13-13t13 13v17q-3 13-13 13T19 36" fill="#e8a775"/><path d="M16 23V10l8-6h17l7 7v12l-8-5-3-6-6 6-7-3z" fill="#e7b64b"/><path d="M22 26h7m6 0h7" stroke="#4b3329" stroke-width="3"/><path d="M22 34h20l-4 7H26z" fill="#81452d"/><path d="m30 37 3-2 3 2" stroke="#f0be78" stroke-width="3"/><path d="m10 58 7-28 5 1-3 29z" fill="#d6e2de" stroke="#728c83"/><path d="m9 46 17 4" stroke="#d5b14b" stroke-width="4"/><path d="m43 45 11 6-4 12H39z" fill="#af8148" stroke="#d3af65" stroke-width="2"/>',
 ranger:'<path d="M12 61V39Q7 6 32 5t20 34v22" fill="#436b50"/><path d="M22 22q0-11 10-11t10 11v13q-2 12-10 12T22 35" fill="#e8b18b"/><path d="M18 27q0-19 14-19t14 19L34 17l-5 6-7-1z" fill="#9b3e50"/><path d="M18 30v18l8-7-4-15m20 0 4 22 4-18" fill="#b34e68"/><path d="M25 28h5m5 0h5" stroke="#4e392f" stroke-width="2"/><path d="M29 38q3 3 6-1" fill="none" stroke="#a45b53" stroke-width="2"/><path d="M20 63V49l12-5 12 5v14" fill="#668750"/><path d="M49 16q22 20 0 42m0-42v42" fill="none" stroke="#dec286" stroke-width="3"/><path d="m42 38 18-3-3 4" fill="none" stroke="#e1e2d2" stroke-width="2"/>',
 bulwark:'<path d="M3 64V40Q4 27 19 25h26q15 2 16 15v24" fill="#a26b43"/><path d="M15 21Q15 6 32 6t17 15v16Q44 51 32 50T15 37" fill="#e7ac77"/><path d="M17 16q5-13 17-10 12 0 15 13l-11-6-8 1-7 8z" fill="#be7e43"/><path d="M18 25h11m7 0h11" stroke="#71452f" stroke-width="4"/><path d="M25 38h15" stroke="#794632" stroke-width="3"/><path d="M20 46v18m24-18v18" stroke="#6d4933" stroke-width="7"/><path d="M4 49q9-10 18 1l-1 11H4m56-12q-9-10-18 1l1 11h17" fill="#edb980"/><path d="M3 60h21m16 0h21" stroke="#a3a9a0" stroke-width="5"/>',
 sapper:'<path d="M12 64V46q2-10 20-10t20 10v18" fill="#896147"/><path d="M18 21q0-13 14-13t14 13v14Q43 47 32 47T18 35" fill="#e7e5d6"/><path d="M14 23q-1-18 18-18t18 18z" fill="#ba7441"/><path d="M13 23h38" stroke="#e7bb67" stroke-width="4"/><path d="m30 6 4 0v15h-4" fill="#efd092"/><ellipse cx="25" cy="29" rx="4" ry="5" fill="#29362f"/><ellipse cx="39" cy="29" rx="4" ry="5" fill="#29362f"/><path d="m28 37 4-5 4 5m-12 4h16" stroke="#4c5146" stroke-width="2"/><path d="M28 42v5m8-5v5" stroke="#969786" stroke-width="2"/><circle cx="43" cy="51" r="12" fill="#303d41" stroke="#84928b" stroke-width="2"/><path d="m45 39 3-7 5-3" fill="none" stroke="#d9bb72" stroke-width="3"/><path d="m52 26 5 5m-5-5 3-5m-3 5-4-4" stroke="#ffc75f" stroke-width="2"/>',
 weaver:'<path d="M16 58Q0 54 3 24l18 10m27 24q16-4 13-34L43 34" fill="#f5eed5" stroke="#c9c9b1" stroke-width="2"/><path d="m6 30 10 15m-8-6 9 13m41-22L48 45m8-6-9 13" stroke="#d6d6bf" stroke-width="2"/><path d="M15 64V49q5-11 17-11t17 11v15" fill="#e4e5ca"/><path d="M18 31Q12 5 32 5t14 26v20l-9-6-10 2-10 5z" fill="#ece4ad"/><path d="M23 25q0-10 9-10t9 10v10q-1 11-9 11t-9-11" fill="#f0c6a0"/><path d="M21 26q0-15 12-15l11 16-12-7-4 6z" fill="#f9f0c5"/><path d="M25 29q3-3 5 0m5 0q3-3 5 0" fill="none" stroke="#786049" stroke-width="2"/><path d="M29 37q4 3 7-1" fill="none" stroke="#bc7e68" stroke-width="2"/><ellipse cx="32" cy="7" rx="15" ry="4" fill="none" stroke="#ffe48b" stroke-width="3"/><path d="m29 50 3-4 3 4-3 4" fill="#aa86bd"/>'
 };
 return '<svg aria-hidden="true" viewBox="0 0 64 64">'+backdrop+(art[type]||art.vanguard)+'</svg>';
}
window.troopSvg=troopSvg;
const armySymbol=troopSvg('vanguard');$('armyHud').innerHTML=armySymbol+'Army';$('armyIcon').innerHTML=armySymbol;
paths.attack='<path d="M8 7h24v16L20 36 8 23z" fill="#976644" stroke="#efd28c" stroke-width="3"/><path d="m12 5 17 24 4-3L17 2z" fill="#e9ede5" stroke="#7b8d81"/><path d="m22 24 9-7" stroke="#f4cd62" stroke-width="4"/><path d="m30 4-18 25-4-3L25 1z" fill="#dde8e0" stroke="#7b8d81"/><path d="m18 24-9-7" stroke="#f4cd62" stroke-width="4"/>';
const illustratedRow=row;
row=function(label,description,action,disabled=false){
 const button=illustratedRow(label,description,action,disabled);const type=Object.entries(troops).find(([,v])=>label.startsWith(v[0]))?.[0];
 if(type||label==='Train army'){button.firstElementChild.innerHTML=troopSvg(type||'vanguard');}return button;
};
portraits.clear();refresh();

function nextFoundation(){return ['mine','farm','barracks'].find(type=>!s.buildings.some(b=>b.type===type))||null;}
function canConstruct(type){const next=nextFoundation();return !next||type===next;}

$('help').onclick=()=>{modal('<div class="cap">TINY TYRANTS</div><h2>Village handbook</h2><p>Build a Gold Mine, Elixir Collector, and Army Camp to establish your village. Gold builds and upgrades structures. Elixir trains troops.</p><p>Two builders work independently. Timers continue while you are away. Open Battle to select a campaign mission. Upgrade your Town Hall to unlock more troops and defenses.</p>');};

paths.crest="<defs><linearGradient id=\"ttGold\" x2=\".4\" y2=\"1\"><stop stop-color=\"#fff2a7\"/><stop offset=\".48\" stop-color=\"#ffc94e\"/><stop offset=\"1\" stop-color=\"#df8a25\"/></linearGradient><linearGradient id=\"ttPlum\" x2=\".7\" y2=\"1\"><stop stop-color=\"#7552a3\"/><stop offset=\"1\" stop-color=\"#322947\"/></linearGradient></defs><path d=\"M20 51 80 27l60 24v61q-2 46-60 68-58-22-60-68z\" fill=\"#272a36\" stroke=\"#1a2029\" stroke-width=\"7\"/><path d=\"m27 56 53-20 53 20v55q-2 37-53 59-51-22-53-59z\" fill=\"url(#ttPlum)\" stroke=\"#f1c365\" stroke-width=\"5\"/><path d=\"m29 54-7-35 30 18L80 7l28 30 30-18-7 35-51 13z\" fill=\"url(#ttGold)\" stroke=\"#302734\" stroke-width=\"5\" stroke-linejoin=\"round\"/><path d=\"m73 29 7-9 7 9-7 9z\" fill=\"#9970c7\"/><path d=\"m45 85 25 10-5 9-19-5m68-14-25 10 5 9 19-5\" fill=\"#f7e9c7\"/><path d=\"m53 86 13 7m41-7-13 7\" fill=\"none\" stroke=\"#332a3f\" stroke-width=\"5\" stroke-linecap=\"round\"/><path d=\"M52 119q28 23 56 0-5 31-28 31t-28-31\" fill=\"#1e2030\"/><path d=\"m57 122 8 3 4 12 7-9 8 0 8 9 4-12 7-3q-24 9-46 0\" fill=\"#fff1cc\"/><path d=\"m34 63 8-3m76 0 8 3\" stroke=\"#fff1ba\" stroke-width=\"4\" stroke-linecap=\"round\"/>";$('crest').innerHTML='<svg aria-hidden="true" viewBox="0 0 160 190">'+paths.crest+'</svg>';

const squadIcon='<svg class="armySquad" aria-hidden="true" viewBox="0 0 64 64"><path d="M2 62V40q2-9 12-9t13 9v22m10 0V40q2-9 13-9t12 9v22" fill="#6d8b68"/><circle cx="15" cy="24" r="10" fill="#e8b482"/><circle cx="49" cy="24" r="10" fill="#e8b482"/><path d="M5 23V15l10-7 10 7v8m14 0V15l10-7 10 7v8" fill="#879796"/><path d="M13 64V43q1-11 19-11t19 11v21" fill="#af6540" stroke="#e0bd73" stroke-width="2"/><path d="M20 19Q20 7 32 7t12 12v14q-3 12-12 12T20 33" fill="#efb77f"/><path d="M17 23V11L32 2l15 9v12l-10-5-5-7-5 7z" fill="#e5b64e"/><path d="M24 27h5m6 0h5" stroke="#5a3c2d" stroke-width="2.5"/><path d="m26 36 6 3 6-3" stroke="#8a5136" stroke-width="2" fill="none"/></svg>';
$('armyHud').innerHTML=squadIcon+'Army';$('armyIcon').innerHTML=squadIcon;
const finalIllustratedRow=row;
row=function(label,description,action,disabled=false){
 const b=finalIllustratedRow(label,description,action,disabled);
 const troop=Object.entries(troops).find(([,v])=>label.startsWith(v[0]))?.[0];
 if(label==='Train army'||troop){const art=document.createElement('span');art.className='troopPortrait';art.innerHTML=troop?troopSvg(troop):squadIcon;b.firstElementChild.replaceWith(art);}
 return b;
};

const foundationRefresh=refresh;
refresh=function(){foundationRefresh();if(s.buildings[selected].type==='hall'&&nextFoundation()&&!s.buildings[selected].job){$('upgrade').disabled=true;$('upgrade').textContent='Build your Mine, Collector & Army Camp first';}};
refresh();
