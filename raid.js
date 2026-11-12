(() => {
  'use strict';
  let currentRaid = null;
  const unitsByType={
    vanguard:{name:'Warrior',role:'Fast melee',color:'#edbe72',hp:65,speed:41,range:26,damage:8,delay:.65,glyph:'◆'},
    ranger:{name:'Archer',role:'Long range',color:'#97dba2',hp:43,speed:36,range:85,damage:8,delay:1,glyph:'➶'},
    bulwark:{name:'Giant',role:'Draws fire',color:'#8dc9e7',hp:148,speed:26,range:28,damage:6,delay:1,glyph:'⬟'},
    sapper:{name:'Wall Breaker',role:'Breaks gates',color:'#f8a477',hp:52,speed:33,range:36,damage:12,delay:1.1,glyph:'✹'},
    weaver:{name:'Healer',role:'Heals allies',color:'#dabaef',hp:49,speed:33,range:57,damage:5,delay:.85,glyph:'✧'}
  };
  const defenses={
    cannon:{range:105,hit:11,delay:2.1,hp:40,color:'#ffae79'},
    archer:{range:125,hit:4,delay:.72,hp:27,color:'#efd38a'},
    mortar:{range:153,hit:14,delay:3.9,hp:34,color:'#ffc287'},
    arc:{range:90,hit:9,delay:1.85,hp:36,color:'#ceafff'},
    core:{range:82,hit:5,delay:1.8,hp:80,color:'#92ebe7'}
  };
  // Three lanes on each island converge on the keep via different gates and defenses.
  const maps=[
    {name:'Glasswake Reach',biome:'Cloud forest',sky:['#24485f','#426c81','#92b3b3'],ground:'#81aa85',edge:'#bdcfa4',core:[458,175],lanes:[[[245,356],[268,291],[333,241],[408,208]],[[493,397],[508,315],[477,259],[466,204]],[[698,291],[625,284],[581,224],[514,185]]],sites:[['archer',355,253],['cannon',557,222]],gates:[[1,2]]},
    {name:'Emberwind Shelf',biome:'Cinder badlands',sky:['#4e344f','#90665e','#dba778'],ground:'#bb896d',edge:'#ebbe86',core:[580,206],lanes:[[[204,312],[279,312],[350,249],[427,224]],[[444,387],[468,345],[496,287],[537,239]],[[708,279],[661,286],[628,249],[606,227]]],sites:[['mortar',440,254],['archer',560,255],['cannon',604,181]],gates:[[0,2],[2,2]]},
    {name:'The Opal Gate',biome:'Glacial fjord',sky:['#344968','#688daa','#c3dbe5'],ground:'#b7cfd2',edge:'#e8f2e7',core:[386,159],lanes:[[[215,306],[256,260],[282,204],[338,168]],[[441,391],[435,320],[410,269],[388,201]],[[690,283],[586,295],[512,246],[435,210]]],sites:[['arc',300,218],['archer',436,212],['mortar',501,285]],gates:[[0,2],[1,2],[2,2]]},
    {name:'Duskwatch Rise',biome:'Amethyst moor',sky:['#322e52','#65567e','#a28aaa'],ground:'#9186a3',edge:'#c6b6ca',core:[499,287],lanes:[[[219,251],[279,238],[347,246],[409,272]],[[389,379],[385,336],[421,312],[457,299]],[[675,196],[645,235],[592,260],[540,285]]],sites:[['arc',452,253],['arc',588,243],['cannon',403,320],['archer',506,200]],gates:[[0,2],[2,2]]},
    {name:'Crown of Cirrus',biome:'Golden highlands',sky:['#3a5369','#71867f','#c3bc95'],ground:'#a7a979',edge:'#dbc98c',core:[485,143],lanes:[[[215,326],[271,282],[326,230],[417,185]],[[474,397],[506,337],[467,273],[474,195]],[[712,271],[638,249],[600,206],[536,169]]],sites:[['cannon',373,239],['mortar',504,261],['arc',539,169],['archer',591,229]],gates:[[0,2],[1,2],[2,2]]}
  ];

  // Later chapters use alternate approaches, core placements and defense mixes.
  const variants=maps.map(m=>structuredClone(m));
  for(let n=5;n<15;n++){
    const original=variants[n%5],flip=n>=10,shift=n>=10?17:-19;
    const point=([x,y])=>[flip?900-x:x+shift,y+(n%2?9:-9)];
    const m=structuredClone(original);m.core=point(m.core);m.lanes=m.lanes.map(l=>l.map(point));
    m.sites=m.sites.map(([kind,x,y])=>[kind,...point([x,y])]);
    const [x,y]=m.lanes[(n+1)%3][2];m.sites.push([n<10?'cannon':'arc',x+(flip?-34:34),y-24]);
    if(n>=10){const [xx,yy]=m.lanes[n%3][1];m.sites.push(['mortar',xx+30,yy-28]);}
    if(m.gates.length<3)m.gates.push([(n+2)%3,1]);
    maps.push(m);
  }
  const laneStyles=[{name:'Mist path',note:'Sheltered',color:'#a5eee3'},{name:'High bridge',note:'Direct',color:'#ffcc76'},{name:'East ridge',note:'Fast',color:'#dfb5ff'}];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function random(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
  function polygon(g,points,fill,stroke,width=1){
    g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=fill;g.fill();
    if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}
  }
  function ellipse(g,x,y,rx,ry,fill){
    g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=fill;g.fill();
  }
  function box(g,x,y,w,d,h,top,left,right){
    polygon(g,[[x-w,y],[x,y-d],[x+w,y],[x,y+d]],top);
    polygon(g,[[x-w,y],[x,y+d],[x,y+d+h],[x-w,y+h]],left);
    polygon(g,[[x+w,y],[x,y+d],[x,y+d+h],[x+w,y+h]],right);
  }
  function crystal(g,x,y,size,tint,glow){
    g.save();g.shadowColor=tint;g.shadowBlur=glow?12:0;
    polygon(g,[[x,y-size],[x+size*.42,y-size*.39],[x,y+size*.13],[x-size*.43,y-size*.35]],tint);g.restore();
    polygon(g,[[x,y-size],[x-size*.43,y-size*.35],[x,y-size*.22]],'#e1fcff');
    polygon(g,[[x,y-size*.22],[x+size*.42,y-size*.39],[x,y+size*.13]],'#567cb7');
  }
  function pine(g,x,y,h){
    ellipse(g,x+3,y+1,h*.23,3,'#234b4d70');
    g.fillStyle='#62594f';g.fillRect(x-1,y-h*.35,3,h*.35);
    for(let n=0;n<3;n++){const bottom=y-3-n*h*.21,wide=h*(.32-n*.063);
      polygon(g,[[x,bottom-h*.46],[x+wide,bottom-1],[x+1,bottom+3],[x-wide,bottom]],['#2f645e','#3b7a67','#569475'][n]);
      polygon(g,[[x,bottom-h*.46],[x+wide,bottom-1],[x+1,bottom+3]],'#326763');}
  }
  function terrain(stage,map,routes){
    const layer=document.createElement('canvas');layer.width=900;layer.height=495;const g=layer.getContext('2d'),rand=random(1459+stage);
    let grad=g.createLinearGradient(0,0,900,495);grad.addColorStop(0,'#648443');grad.addColorStop(1,'#91a65d');g.fillStyle=grad;g.fillRect(0,0,900,495);
    for(let x=-500;x<1200;x+=28)for(let y=-50;y<550;y+=14){const k=(Math.floor(y/14)%2)*14;polygon(g,[[x+k,y],[x+k+14,y-7],[x+k+28,y],[x+k+14,y+7]],((x+y)%3)?'#87a45422':'#bdc57322');}
    for(let i=0;i<58;i++){let x=rand()*1000,y=rand()*500;ellipse(g,x,y,15+rand()*110,4+rand()*14,'rgba(208,231,228,.048)');}
    function plot(outline,depth){
      for(let i=0;i<outline.length;i++){const [x,y]=outline[i],[xx,yy]=outline[(i+1)%outline.length],tip=6+rand()*5;
        polygon(g,[[x,y],[xx,yy],[(xx+x)/2+8,(yy+y)/2+tip],[x+6,y+depth*.48]],['#405968','#526975','#354e61','#637b7d'][i%4]);
        polygon(g,[[x,y],[xx,yy],[xx-2,yy+7],[x+1,y+9]],'#809077');}
      polygon(g,outline,map.ground,map.edge,2);
    }
    plot([[18,118],[65,99],[106,108],[142,124],[103,141],[58,144]],47);
    [47,62,82,103].forEach((x,i)=>pine(g,x,122+i%2*4,16+i*2));
    plot([[759,102],[812,85],[851,92],[875,105],[852,122],[794,127]],40);
    const forestOutline=[[130,286],[165,252],[148,228],[209,209],[243,170],[313,154],[325,124],[387,104],[436,86],[479,109],[534,99],[583,129],[626,143],[639,166],[693,180],[703,207],[747,226],[729,245],[775,265],[743,291],[703,311],[686,341],[615,351],[582,377],[534,377],[498,406],[452,394],[394,406],[352,383],[310,389],[276,371],[226,376],[205,351],[164,340],[174,317],[140,306]];
    const edgeShapes=[forestOutline,
      [[141,296],[162,241],[213,226],[250,174],[311,150],[328,114],[392,100],[429,124],[489,122],[540,103],[598,119],[605,146],[669,144],[681,175],[726,188],[739,228],[765,253],[741,293],[680,322],[643,349],[552,345],[505,375],[453,403],[403,389],[365,360],[295,369],[280,348],[219,349],[190,326]],
      [[146,275],[180,219],[205,215],[235,173],[277,159],[303,128],[362,107],[404,90],[443,108],[454,136],[498,118],[558,124],[600,146],[632,174],[680,184],[709,214],[750,250],[730,283],[700,311],[656,329],[608,321],[563,351],[508,356],[467,391],[434,403],[386,377],[357,391],[318,361],[264,363],[227,338],[204,327],[168,317]],
      [[153,252],[180,211],[221,192],[252,156],[310,147],[344,121],[402,116],[451,134],[477,112],[519,123],[548,114],[595,139],[641,143],[672,156],[713,171],[741,205],[722,236],[752,255],[733,292],[684,311],[647,345],[577,342],[546,373],[489,365],[439,395],[374,399],[343,367],[306,376],[260,349],[232,350],[204,320],[165,313]],
      [[146,302],[169,255],[153,234],[188,211],[237,198],[258,154],[320,151],[337,112],[394,118],[438,96],[494,79],[524,108],[558,101],[602,130],[631,147],[663,153],[684,177],[730,190],[737,221],[769,248],[745,281],[709,300],[668,302],[641,343],[582,348],[547,378],[496,376],[474,410],[432,389],[388,398],[354,372],[309,383],[277,357],[222,365],[197,344],[156,329]]
    ];
    plot(edgeShapes[(stage-1)%5],stage%5===3?95:75);
    for(let i=0;i<650;i++){let x=180+rand()*544,y=124+rand()*257;if(((x-455)/264)**2+((y-254)/129)**2>1)continue;
      ellipse(g,x,y,rand()*4+.3,rand()*1.5+.4,[map.edge,'#f4e5b3','#425866','#fff2bf'][i%4]+'55');}
    for(const [lane,step] of map.gates){const [x,y]=routes[lane].points[step];for(let i=-3;i<=3;i++)if(i){box(g,x+i*11,y+i*3-9,7,4,10,'#bcc5b6','#788c91','#546c74');box(g,x+i*11,y+i*3-12,4,2,4,'#d2d2bf','#a3aba4','#879a99');}}
    for(const route of routes){g.lineCap='round';g.lineJoin='round';
      for(const [width,color] of [[18,'#73947a'],[13,'#c3bd94'],[7,'#cfc6a0']]){g.lineWidth=width;g.strokeStyle=color;g.beginPath();route.points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();}
    }
    for(const {points:[[x,y]]} of routes){box(g,x,y-3,25,12,7,'#bda37e','#826e60','#716256');for(let i=-2;i<=2;i++){g.strokeStyle='#8c785e';g.beginPath();g.moveTo(x+i*6-8,y-8);g.lineTo(x+i*6+8,y);g.stroke();}}
    for(const [x,y,w] of [[207,277,46],[215,304,36],[273,218,42],[305,195,55],[354,156,38],[513,132,40],[538,142,37],[624,186,48],[679,221,43],[704,239,32],[617,326,32],[572,350,35],[367,359,32],[332,344,29],[180,286,35],[409,126,25]]){if(stage%5===1||stage%5===0)pine(g,x,y,w);else if(stage%5===2){box(g,x,y-w*.22,11,5,w*.22,'#cf9e78','#936752','#7d5953');crystal(g,x,y-w*.18,12,'#ffb689',false);}else crystal(g,x,y,w*.65,stage%5===3?'#a8edff':'#d5abf4',false); }
    for(const [x,y] of [[198,258],[202,264],[651,278],[653,272],[399,366],[390,362],[559,155]])crystal(g,x,y,8+rand()*12,'#a1e6ea',false);

    // Resource huts and wall compartments give every route a fortified-village context.
    for(let i=0;i<15;i++){const x=210+rand()*480,y=155+rand()*170;if(routes.some(r=>r.points.some(p=>Math.hypot(p[0]-x,p[1]-y)<32))||map.sites.some(p=>Math.hypot(p[1]-x,p[2]-y)<36))continue;box(g,x,y,15,8,16,'#dec28b','#b49968','#887950');polygon(g,[[x-20,y-17],[x,y-36],[x+20,y-17],[x,y-7]],i%3?'#b06d42':'#87558c');if(i%3===0){ellipse(g,x,y-26,9,7,'#c45bd0');}else{g.fillStyle='#302f28';g.fillRect(x-3,y-9,6,10);}}
    for(const [lane,step]of map.gates){const [x,y]=routes[lane].points[step];for(const dir of [-1,1])for(let j=2;j<7;j++){const xx=x+dir*j*10,yy=y+dir*j*3;box(g,xx,yy,6,4,10,'#bfc3a0','#8a9279','#647660');box(g,xx,yy-10,7,4,2,'#d7d8b6','#aaa98c','#7d8a70');}}
    for(let i=0;i<45;i++){const x=rand()*900,y=rand()*495;if(x<100||x>800||y<70||y>435)pine(g,x,y,24+rand()*32);}
    return layer;
  }
  const style=`
  .ah-raid{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:rgba(8,19,31,.86);backdrop-filter:blur(9px);font:15px/1.4 "DM Sans","Segoe UI",sans-serif;color:#f5f0dd;overflow:auto;padding:12px;box-sizing:border-box}
  .ah-raid *{box-sizing:border-box}.ah-raid button{cursor:pointer;font:inherit;color:inherit}.ah-raid button:focus-visible{outline:3px solid #ffe096;outline-offset:2px}
  .ah-raid .ar-panel{max-width:990px;width:100%;background:#172b32;border:1px solid #61736b;border-radius:20px;overflow:hidden;box-shadow:0 20px 90px #03131baa}
  .ar-head,.ar-controls,.ar-meter{display:flex;align-items:center;gap:12px}.ar-head{justify-content:space-between;padding:17px 22px;background:#192d33}.ar-head small,.ar-result small{font:700 10px Consolas,monospace;letter-spacing:2px;color:#edc779}.ar-head h2,.ar-result h2{margin:3px 0 0;font:600 clamp(23px,3vw,34px)/1.1 Georgia,serif;color:#f5ebcf}.ar-exit{background:#243b40;border:1px solid #4d6463;border-radius:9px;padding:8px 13px;font-size:13px!important}
  .ar-view{position:relative;background:#3f6374}.ar-view canvas{width:100%;display:block;height:min(51vh,475px);touch-action:manipulation;cursor:crosshair}.ar-float{position:absolute;left:14px;top:12px;pointer-events:none;background:#142932eb;border:1px solid #627878;border-radius:9px;padding:7px 11px;font-size:12px;color:#f2e8d2}.ar-meter{margin-top:4px;gap:7px}.ar-meter i{height:4px;background:#54636b;border-radius:9px;flex:1;min-width:78px;overflow:hidden}.ar-meter b{height:100%;display:block;background:#9bdcd5}
  .ar-tray{padding:12px 19px 17px}.ar-info{margin:0 0 10px;font-size:14px;min-height:20px;color:#d7e4dd}.ar-controls{align-items:stretch;flex-wrap:wrap;gap:7px}.ar-control{flex:1;min-width:88px;border-radius:10px;text-align:left;padding:9px 11px;background:#294347;border:1px solid #516b68;font-size:13px!important}.ar-control strong,.ar-control span{display:block}.ar-control span{color:#c4d4cb;font-size:11px}.ar-control em{font-style:normal;color:#edc779}.ar-pulse{background:#4b4764;border-color:#8076a4}.ar-control:disabled{opacity:.5;cursor:default}.ar-result{position:absolute;inset:0;display:grid;place-content:center;text-align:center;align-items:center;padding:15px;background:#132632e8}.ar-result[hidden]{display:none}.ar-result h2{font-size:clamp(32px,5vw,50px)}.ar-result p{margin:9px 0 18px;color:#d6e1d7}.ar-return{justify-self:center;padding:10px 22px;background:#f1cc79;border:0;border-radius:8px;color:#273334!important;font-weight:700!important}
  @media(max-width:600px){.ah-raid{padding:4px}.ar-head{padding:10px 14px}.ar-tray{padding:10px}.ar-view canvas{height:43vh;min-height:210px}.ar-control{min-width:41%;padding:6px 10px}.ar-float{left:6px;top:6px;font-size:10px}.ar-info{font-size:12px}}
  `;
  window.startRaid=function({stage=1,troops=1,army,name,onEnd}={}){
    if(currentRaid)return;
    stage=Math.max(1,Math.floor(Number(stage)||1));troops=Math.max(1,Math.floor(Number(troops)||1));
    const map=maps[(stage-1)%maps.length],routes=map.lanes.map((points,i)=>({...laneStyles[i],points:[...points,map.core]}));
    const stock=Object.fromEntries(Object.keys(unitsByType).map(k=>[k,army?Math.max(0,Math.floor(Number(army[k])||0)):k==='vanguard'?troops:0]));
    const losses=Object.fromEntries(Object.keys(stock).map(k=>[k,0]));troops=Object.values(stock).reduce((sum,n)=>sum+n,0);
    let selected=Object.keys(stock).find(k=>stock[k])||'vanguard',reserve=troops,fallen=0,elapsed=0,nextPulse=0,frame,last=0,ended=false,closed=false,result=false,stars=0,active=false,stun=0,serial=0,inspected=null;
    const units=[],bolts=[],bursts=[],targets=[],warnings=[];
    const beaconsHealth=68+Math.min(stage,25)*13;
    targets.push({x:map.core[0],y:map.core[1],kind:'core',hp:beaconsHealth,max:beaconsHealth,core:true,shot:2.5});
    map.sites.forEach(([kind,x,y],i)=>{const hp=defenses[kind].hp+Math.min(28,stage)*2;targets.push({kind,x,y,hp,max:hp,shot:1.3+i*.25});});
    for(const [lane,step] of map.gates){const [x,y]=routes[lane].points[step],hp=27+Math.min(stage,30)*3;targets.push({kind:'gate',lane,step,x,y,hp,max:hp});}
    const layer=terrain(stage,map,routes), overlay=document.createElement('div');
    overlay.className='ah-raid';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Sky island raid');
    overlay.innerHTML='<style>'+style+'.ar-choice svg{width:48px;height:48px;display:block;margin:auto}.ar-choice{min-width:78px;text-align:center!important}.ar-roster{justify-content:center}.ah-raid{padding:0;background:#132c22}.ah-raid .ar-panel{max-width:none;width:100%;height:100dvh;border:0;border-radius:0;display:flex;flex-direction:column}.ar-head{padding:10px 20px;flex-shrink:0}.ar-view{flex:1;min-height:180px}.ar-view canvas{height:100%;min-height:180px}.ar-tray{flex-shrink:0;background:linear-gradient(#293b31,#1b3027)}.ar-roster{display:flex;gap:6px;overflow-x:auto;margin-bottom:9px;padding:2px}.ar-choice{flex:1;background:#20383f;padding:5px 8px;border:1px solid #49615d;border-radius:7px;white-space:nowrap;font-size:12px!important}.ar-choice[aria-pressed=true]{background:#48594c;border-color:#e3c781;color:#ffdf9a}.ar-choice:disabled{opacity:.48}.ar-choice span{font-size:10px;display:block;color:#c4d1cb}.ar-panel{max-height:97dvh;overflow:auto!important}</style><div class="ar-panel"><div class="ar-head"><div><small>SKY EXPEDITION · '+String(stage).padStart(2,'0')+' / '+map.biome.toUpperCase()+'</small><h2></h2></div><button class="ar-exit">Retreat</button></div><div class="ar-view"><canvas aria-label="Battlefield with three numbered landing zones"></canvas><div class="ar-float">Enemy Town Hall<div class="ar-meter"><i><b></b></i><strong>100%</strong></div></div><section class="ar-result" hidden><small></small><h2></h2><p></p><button class="ar-return">Return to village</button></section></div><div class="ar-tray"><p class="ar-info" aria-live="polite">Select a troop, then choose an entry point. Tap a tower to scout its range.</p><div class="ar-roster">'+Object.entries(unitsByType).filter(([k])=>stock[k]).map(([k,v])=>'<button class="ar-choice" data-unit="'+k+'">'+(window.troopSvg?.(k)||v.glyph)+' '+v.name+' <b></b><span>'+v.role+'</span></button>').join('')+'</div><div class="ar-controls">'+routes.map((r,i)=>'<button class="ar-control ar-land"><strong><em>'+String(i+1).padStart(2,'0')+'</em> '+r.name+'</strong><span>'+r.note+'</span></button>').join('')+'<button class="ar-control ar-pulse"><strong>✧ Freeze spell</strong><span>Stun defenders</span></button></div></div></div>';
    overlay.querySelector('.ar-head h2').textContent=name||map.name;
    const prevFocus=document.activeElement,prevOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';document.body.append(overlay);currentRaid=overlay;
    const q=s=>overlay.querySelector(s),canvas=q('canvas'),g=canvas.getContext('2d'),info=q('.ar-info'),buttons=[...overlay.querySelectorAll('.ar-land')],pulseButton=q('.ar-pulse'),exit=q('.ar-exit'),resultBox=q('.ar-result');
    let scale=1,ox=0,oy=0,dpr=1,viewW=1,viewH=1;
    function resize(){const rect=canvas.getBoundingClientRect();viewW=rect.width;viewH=rect.height;dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(viewW*dpr));canvas.height=Math.max(1,Math.round(viewH*dpr));scale=Math.min(viewW/695,viewH/418);ox=(viewW-900*scale)/2;oy=(viewH-495*scale)/2;}
    function updateHud(){const chunk=partySize();for(const b of overlay.querySelectorAll('.ar-choice')){const k=b.dataset.unit;b.disabled=!stock[k]||ended;b.setAttribute('aria-pressed',selected===k);b.querySelector('b').textContent='×'+stock[k];}buttons.forEach((b,i)=>{b.disabled=!reserve||ended;b.lastElementChild.textContent=reserve?routes[i].note+' · '+chunk+' troops':'All troopss landed';});pulseButton.disabled=ended||!active||elapsed<nextPulse;pulseButton.lastElementChild.textContent=!active?'Available after landing':elapsed<nextPulse?'Ready in '+Math.ceil(nextPulse-elapsed)+'s':'Stun towers for 3s';const health=Math.max(0,Math.ceil(targets[0].hp/beaconsHealth*100));q('.ar-meter b').style.width=health+'%';q('.ar-meter strong').textContent=health+'%';}
    function partySize(){return Math.min(stock[selected],Math.max(1,Math.ceil(troops/5)));}
    for(const button of overlay.querySelectorAll('.ar-choice'))button.onclick=()=>{selected=button.dataset.unit;updateHud();};
    function deploy(routeIndex){
      if(!reserve||ended)return;
      const type=selected,spec=unitsByType[type],count=partySize();if(!count)return;
      reserve-=count;stock[type]-=count;active=true;
      for(let n=0;n<count;n++){const [x,y]=routes[routeIndex].points[0],id=serial++;units.push({type,id,x:x+(id%3-1)*8,y:y+Math.sin(id*10)*6,route:routeIndex,step:1,hp:spec.hp,max:spec.hp,charge:.2+(n%4)*.08,walk:id*2.1});}
      if(!stock[selected]&&reserve)selected=Object.keys(stock).find(k=>stock[k]);
      info.textContent=reserve?reserve+' troops in reserve. Choose a troops and landing zone.':'All troopss deployed. Use Freeze spell to silence towers for 3 seconds.';burst(...routes[routeIndex].points[0],spec.color,11);updateHud();
    }
    function burst(x,y,color,count){for(let i=0;i<count;i++){let a=Math.random()*Math.PI*2,r=12+Math.random()*37;bursts.push({x,y,vx:Math.cos(a)*r,vy:Math.sin(a)*r-15,life:.5+Math.random()*.28,color});}}
    function pulse(){if(ended||!active||elapsed<nextPulse)return;stun=3;nextPulse=elapsed+10;for(const t of targets.slice(1))if(t.hp>0)burst(t.x,t.y-15,'#cdb7ff',17);info.textContent='Freeze spell landed. The towers are silenced for 3 seconds.';updateHud();}
    function end(win){if(ended)return;ended=true;result=win;stars=win?1+Number(targets.filter(t=>!t.core&&t.kind!=='gate').every(t=>t.hp<=0))+Number(fallen<=Math.floor(troops*.25)):0;resultBox.hidden=false;exit.hidden=true;resultBox.querySelector('small').textContent=win?'★'.repeat(stars)+'☆'.repeat(3-stars)+' · TOWN HALL DESTROYED':'EXPEDITION ENDED';resultBox.querySelector('h2').textContent=win?'Island secured':'Troops recalled';resultBox.querySelector('p').textContent=(troops-fallen)+' of '+troops+' troops return to your village.';if(win)resultBox.querySelector('p').textContent+=' Stars reward capturing the beacon, clearing every tower, and losing at most a quarter of your troops.';q('.ar-return').focus();updateHud();}
    function close(){if(closed)return;closed=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',key);document.body.style.overflow=prevOverflow;overlay.remove();currentRaid=null;if(prevFocus?.isConnected)prevFocus.focus();onEnd?.({win:result,lost:fallen,losses:{...losses},stars});}
    function key(e){if(e.repeat||e.altKey||e.ctrlKey||e.metaKey)return;
      if(e.key==='Tab'){const list=[...overlay.querySelectorAll('button')].filter(b=>!b.disabled&&b.offsetParent!==null);if(!list.length)return;if(e.shiftKey&&document.activeElement===list[0]){e.preventDefault();list.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===list.at(-1)){e.preventDefault();list[0].focus();}return;}
      if(e.key==='Escape'){e.preventDefault();ended?close():end(false);return;}if(ended)return;
      if(['1','2','3'].includes(e.key)){e.preventDefault();deploy(Number(e.key)-1);}if(e.key.toLowerCase()==='q'){e.preventDefault();pulse();}
    }
    buttons.forEach((b,i)=>{b.onclick=()=>deploy(i);b.title='Deploy via '+routes[i].name+' ('+(i+1)+')';});pulseButton.onclick=pulse;pulseButton.title='Freeze spell (Q)';exit.onclick=()=>end(false);q('.ar-return').onclick=close;
    const descriptions={archer:'Archer tower · Rapid single-target shots',cannon:'Cannon · Heavy single-target fire',mortar:'Mortar · Delayed area damage',arc:'Tesla Tower · Chains between nearby troopss',core:'Town Hall · Capture to secure this island',gate:'Gate · Wall Breakers deal triple damage'};
    canvas.onpointerdown=e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left-ox)/scale,y=(e.clientY-r.top-oy)/scale;const lane=routes.findIndex(route=>Math.hypot(x-route.points[0][0],y-route.points[0][1])<29);if(lane>=0){inspected=null;deploy(lane);return;}
      inspected=targets.filter(t=>t.hp>0&&Math.abs(x-t.x)<24&&y<t.y+12&&y>t.y-(t.core?98:t.kind==='gate'?23:70)).sort((a,b)=>b.y-a.y)[0]||null;
      if(inspected)info.textContent=descriptions[inspected.kind]+' · '+Math.ceil(inspected.hp)+' HP';};
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();window.addEventListener('keydown',key);buttons[0].focus();updateHud();
    function damageUnit(unit,amount){if(unit.hp<=0)return;unit.hp-=amount*(unit.route===0?.78:1)*(unit.type==='bulwark'?.82:1);if(unit.hp<=0){fallen++;losses[unit.type]++;burst(unit.x,unit.y-6,unitsByType[unit.type].color,8);}}
    function bolt(a,b,color){bolts.push({x:a.x,y:a.y-12,tx:b.x,ty:b.y-12,p:0,color});}
    function simulate(dt){
      for(const u of units){
        if(u.hp<=0)continue;u.charge-=dt;const spec=unitsByType[u.type];
        if(u.type==='weaver'&&u.charge<=0){const ally=units.filter(v=>v!==u&&v.hp>0&&v.hp<v.max-5&&dist(v,u)<76).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0];if(ally){ally.hp=Math.min(ally.max,ally.hp+10);bolt(u,ally,'#a5ffd7');u.charge=spec.delay;}}
        const gate=targets.find(t=>t.kind==='gate'&&t.lane===u.route&&t.hp>0&&u.step<=t.step);
        const nearby=targets.filter(t=>t.hp>0&&dist(t,u)<=spec.range&&(t.kind!=='gate'||t===gate)&&!(gate&&t.core)).sort((a,b)=>{if(u.type==='sapper'&&(a===gate||b===gate))return a===gate?-1:1;return dist(a,u)-dist(b,u);})[0];
        if(nearby){if(u.charge<=0){bolt(u,nearby,spec.color);nearby.hp-=spec.damage*(window.researchBonus?.(u.type)||1)*(u.type==='sapper'&&nearby.kind==='gate'?3:1);u.charge=spec.delay;if(nearby.hp<=0)burst(nearby.x,nearby.y-8,spec.color,16);}continue;}
        const road=routes[u.route].points,point=road[Math.min(u.step,road.length-1)],dx=point[0]+(u.id%3-1)*7-u.x,dy=point[1]+Math.sin(u.id*8)*5-u.y,d=Math.hypot(dx,dy),speed=spec.speed*[.92,1,1.13][u.route];
        u.walk+=dt*8;if(d<=speed*dt+1)u.step=Math.min(u.step+1,road.length-1);else{u.x+=dx/d*speed*dt;u.y+=dy/d*speed*dt;}
      }
      if(targets[0].hp<=0){end(true);return;}
      stun=Math.max(0,stun-dt);
      for(const t of targets){
        if(t.hp<=0||t.kind==='gate'||stun>0||(t.core&&stage<3))continue;
        t.shot-=dt;if(t.shot>0)continue;const spec=defenses[t.kind];
        const near=units.filter(u=>u.hp>0&&dist(t,u)<spec.range).sort((a,b)=>(a.type!=='bulwark')-(b.type!=='bulwark')||dist(a,t)-dist(b,t));if(!near.length)continue;
        const hit=spec.hit*(1+Math.min(30,stage-1)*.055),first=near[0];t.shot=spec.delay;t.aim=Math.atan2(first.y-t.y,first.x-t.x);
        if(t.kind==='mortar'){warnings.push({x:first.x,y:first.y,wait:.95,hit});bolt(t,first,spec.color);continue;}
        damageUnit(first,hit);bolt(t,first,spec.color);
        if(t.kind==='arc'){const secondary=near.find(u=>u!==first&&dist(u,first)<30);if(secondary){damageUnit(secondary,hit*.55);bolt(first,secondary,spec.color);}}
      }
      for(let i=warnings.length-1;i>=0;i--){const w=warnings[i];w.wait-=dt;if(w.wait<=0){units.filter(u=>u.hp>0&&dist(u,w)<28).forEach(u=>damageUnit(u,w.hit));burst(w.x,w.y,'#ffac69',18);warnings.splice(i,1);}}
      if(!reserve&&units.every(u=>u.hp<=0))end(false);
      for(const bolt of bolts)bolt.p+=dt*3.8;for(const b of bursts){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;b.vy+=50*dt;}
      for(let i=bolts.length-1;i>=0;i--)if(bolts[i].p>=1)bolts.splice(i,1);
      for(let i=bursts.length-1;i>=0;i--)if(bursts[i].life<=0)bursts.splice(i,1);
    }
    function drawTarget(t){const {x,y}=t;if(t.hp<=0){for(let i=0;i<5;i++)box(g,x+Math.cos(i*3.5)*12,y+Math.sin(i*3.5)*5,5,3,4,'#828789','#66757a','#4b6066');return;}
      if(t.kind==='gate'){box(g,x,y-9,13,5,10,'#c29e71','#976c53','#775a4f');for(let i=-2;i<=2;i++){polygon(g,[[x+i*4-1,y-10],[x+i*4,y-17],[x+i*4+2,y-9]],'#e3c18c');}return;}
      if(t.core){ellipse(g,x,y,35,13,'#344b3555');box(g,x,y,30,16,30,'#d5bc8d','#b29b75','#867b61');polygon(g,[[x-37,y-30],[x,y-61],[x+37,y-30],[x,y-13]],stage>=10?'#4a486c':'#9b593b');g.fillStyle='#342e28';g.fillRect(x-6,y-13,12,16);box(g,x+29,y-5,9,6,36,'#c5c7ac','#929c86','#6f7e6e');g.fillStyle='#e5bc5c';g.fillRect(x+28,y-64,2,20);polygon(g,[[x+30,y-64],[x+44,y-60],[x+30,y-56]],'#b34e49');return;}
      const s=t.core?1.42:t.kind==='mortar'?.86:t.kind==='archer'?1.09:1;g.save();g.translate(x,y);g.scale(s,s);ellipse(g,4,2,23,9,'#29494f63');
      box(g,0,-5,23,10,6,'#bcc5b6','#818c89','#697c7b');box(g,0,-12,18,8,8,'#b5b9ad','#7f8b8d','#687b80');box(g,0,-36,13,7,24,'#ced0ba','#89999a','#728790');
      for(let i=0;i<2;i++){box(g,0,-18-i*12,14,7,2,'#bcc8bb','#9ba49b','#768889');}
      box(g,0,-39,18,9,5,'#e1c586','#b19769','#947951');box(g,0,-42,13,6,3,'#646c80','#6e6676','#555269');
      if(t.kind==='core'||t.kind==='arc')crystal(g,0,-45+Math.sin(elapsed*2+x)*1.7,t.core?24:17,stun?'#cebaff':t.core?'#ffcf8a':'#c3a7ff',true);
      else if(t.kind==='archer'){polygon(g,[[-16,-42],[0,-63],[16,-42],[0,-35]],'#a66e52');g.fillStyle='#e7c599';g.fillRect(-2,-49,4,8);}
      else{const a=t.aim??.8,r=t.kind==='mortar'?6:4;g.lineCap='round';g.strokeStyle='#3f5360';g.lineWidth=r*2;g.beginPath();g.moveTo(0,-43);g.lineTo(Math.cos(a)*13,-46+Math.sin(a)*7-(t.kind==='mortar'?6:0));g.stroke();ellipse(g,Math.cos(a)*13,-46+Math.sin(a)*7-(t.kind==='mortar'?6:0),r,r*.75,'#263c49');}
      if(stun>0&&!t.core){g.fillStyle='#e4d8ff';g.font='bold 10px monospace';g.fillText('✧',8,-62);}

      if(t.hp<t.max){g.fillStyle='#344651';g.fillRect(-15,8,30,3);g.fillStyle='#edba8d';g.fillRect(-15,8,30*t.hp/t.max,3);}g.restore();
    }
    function drawUnit(u){
      const {x,y}=u,sway=Math.sin(u.walk)*1.5;ellipse(g,x+1,y+1,6,2.4,'#2f494b80');
      g.lineWidth=2;g.strokeStyle='#3a474a';g.beginPath();g.moveTo(x-1,y-4);g.lineTo(x-2+sway,y);g.moveTo(x+1,y-4);g.lineTo(x+2-sway,y);g.stroke();
      polygon(g,[[x-3,y-10],[x+2,y-11],[x+5,y-5],[x-4,y-4]],unitsByType[u.type].color);
      ellipse(g,x,y-12,3.2,3.4,'#e4bd95');polygon(g,[[x-4,y-13],[x-2,y-17],[x+2,y-18],[x+4,y-13]],'#536a77');g.fillStyle='#f2cd8b';g.fillRect(x-3,y-14,7,1.5);if(u.type==='bulwark')box(g,x+4,y-8,3,2,5,'#c1dce4','#7098b1','#5f7893');else if(u.type==='weaver')crystal(g,x+5,y-9,6,'#dfadff',false);else if(u.type==='ranger'){g.strokeStyle='#82613b';g.beginPath();g.arc(x+3,y-7,4,-1.5,1.5);g.stroke();}else if(u.type==='sapper')ellipse(g,x+4,y-5,3,3,'#f19c65');else crystal(g,x+5,y-6,4,'#b4f4ef',false);
      if(u.hp<u.max){g.fillStyle='#354b49';g.fillRect(x-5,y+4,10,1.5);g.fillStyle='#c1ead0';g.fillRect(x-5,y+4,10*u.hp/u.max,1.5);}
    }
    function render(){
      g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#365a70';g.fillRect(0,0,viewW,viewH);g.translate(ox,oy);g.scale(scale,scale);g.drawImage(layer,0,0);
      for(const [i,r] of routes.entries()){const [x,y]=r.points[0],wave=(elapsed*.55+i*.2)%1;
        ellipse(g,x,y,23,11,'#243d48bd');g.strokeStyle=r.color;g.lineWidth=2;g.beginPath();g.ellipse(x,y,21+wave*4,10+wave*2,0,0,2*Math.PI);g.stroke();g.fillStyle=r.color;g.font='bold 13px sans-serif';g.textAlign='center';g.fillText(String(i+1),x,y+4);}
      if(inspected&&inspected.hp>0&&defenses[inspected.kind]&&!(inspected.core&&stage<3)){const t=inspected,r=defenses[t.kind].range;ellipse(g,t.x,t.y,r,r,'#f6d99818');g.lineWidth=1;g.strokeStyle='#ffda93bd';g.beginPath();g.arc(t.x,t.y,r,0,Math.PI*2);g.stroke();}
      for(const w of warnings){g.strokeStyle='#ff9370';g.lineWidth=2;g.beginPath();g.ellipse(w.x,w.y,28,15,0,0,Math.PI*2);g.stroke();ellipse(g,w.x,w.y,(1-w.wait)*27+1,(1-w.wait)*14+1,'#f78b704d');}
      const entities=[...targets.map(t=>({y:t.y,draw:()=>drawTarget(t)})),...units.filter(u=>u.hp>0).map(u=>({y:u.y,draw:()=>drawUnit(u)}))];entities.sort((a,b)=>a.y-b.y);entities.forEach(e=>e.draw());
      for(const bolt of bolts){let p=bolt.p,headX=bolt.x+(bolt.tx-bolt.x)*p,headY=bolt.y+(bolt.ty-bolt.y)*p-Math.sin(p*Math.PI)*9;g.strokeStyle=bolt.color;g.lineWidth=2;g.beginPath();g.moveTo(headX-(bolt.tx-bolt.x)*.08,headY-(bolt.ty-bolt.y)*.08);g.lineTo(headX,headY);g.stroke();ellipse(g,headX,headY,2.2,2.2,'#fff6ce');}
      for(const b of bursts){g.globalAlpha=Math.min(1,b.life*2);ellipse(g,b.x,b.y,2,1.8,b.color);}g.globalAlpha=1;
    }
    let hudTime=0;function loop(now){if(closed)return;const dt=document.hidden?0:clamp((now-(last||now))/1000,0,.06);last=now;if(!ended){elapsed+=dt;if(active)simulate(dt);render();if(elapsed-hudTime>.15){updateHud();hudTime=elapsed;}}frame=requestAnimationFrame(loop);}
    frame=requestAnimationFrame(loop);
  };
})();

