/* Tiny Tyrants's miniature world, rendered in logical map coordinates. */
(() => {
  const iso=(u,v)=>[505+(u-v)*69,298+(u+v)*33];
  const plots=[[0,0],[-2,0],[0,-2],[1,1],[2,0],[-1,2],[2,2],[1,2],[-2,-1],[-1,-2],[2,-2],[0,2]];
  const defaultSlots=plots.map(([u,v])=>iso(u,v));
  const TAU = Math.PI * 2;
  const noise = n => { const v = Math.sin(n*127.1 + 311.7)*43758.5453; return v-Math.floor(v); };
  const groundCache=new WeakMap();
  const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  function drawIsland(canvas,time,buildings,selected){
    if (prefersReducedMotion()) time = 0;
    const slots=buildings?.map((b,i)=>b.pos?iso(b.pos.u,b.pos.v):defaultSlots[i])||defaultSlots;
    const g=canvas.getContext('2d'), w=canvas.clientWidth||900,h=canvas.clientHeight||520;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    const z=Math.min(w/920,h/525), ox=(w-1000*z)/2,oy=(h-560*z)/2;
    g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);
    g.fillStyle='#769b46';g.fillRect(0,0,w,h);
    g.translate(ox,oy);g.scale(z,z);g.lineJoin='round';g.lineCap='round';
    function poly(p,c){g.fillStyle=c;g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}
    function line(p,c,b=1){g.strokeStyle=c;g.lineWidth=b;g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();}
    function ellipse(x,y,rx,ry,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fill();}
    function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h);}
    function block(x,y,a,b,height,colors){
      const t=y-height,q=.43;
      poly([[x-a,t],[x,t-b*q],[x+a,t],[x,t+b*q]],colors[0]);
      poly([[x-a,t],[x,t+b*q],[x,y+b*q],[x-a,y]],colors[1]);
      poly([[x,t+b*q],[x+a,t],[x+a,y],[x,y+b*q]],colors[2]);
    }
    function peak(x,y,rx,ry,height,base,light,dark){
      poly([[x-rx,y],[x,y+ry],[x,y-height]],light);
      poly([[x,y-height],[x+rx,y],[x,y+ry]],dark);
      line([[x-rx,y],[x,y+ry],[x+rx,y]],base,2.1);
      line([[x-rx,y-1],[x,y-height]],'#bbd7bf',1.2);
    }
    function pennant(x,y,scale=1){
      line([[x,y+1],[x,y-23*scale]],'#594c38',2*scale);
      const v=Math.sin(time*2.4+x)*2*scale;
      poly([[x,y-22*scale],[x+10*scale,y-23*scale+v],[x+20*scale,y-18*scale+v],[x+12*scale,y-16*scale],[x,y-15*scale]],'#bf563d');
      line([[x,y-22*scale],[x+10*scale,y-23*scale+v]],'#ffba78',1.5);
      ellipse(x,y-24*scale,2*scale,2.5*scale,'#e9bc67');
    }
    function pine(x,y,s,seed=0){
      g.save();g.translate(x,y);g.scale(s,s);ellipse(7,0,14,5,'#294d4434');rect(-2,-13,4,15,'#725937');
      g.transform(1,0,Math.sin(time*.8+seed)*.016,1,0,0);
      for(let n=0;n<3;n++){const k=1-n*.24,cy=-5-n*11;
        poly([[-14*k,cy],[0,cy-26*k],[11*k,cy],[3*k,cy+3]],['#31685a','#38755d','#538269'][n]);
        poly([[0,cy-26*k],[11*k,cy],[3*k,cy+3]],'#285948');
        line([[-13*k,cy],[0,cy-26*k]],'#78956a',1);}
      g.restore();
    }
    function crystal(x,y,s){
      g.save();g.translate(x,y);g.scale(s,s);
      poly([[-5,-5],[-4,-17],[1,-25],[5,-17],[6,-5],[0,0]],'#58aaa0');
      poly([[1,-25],[1,-6],[0,0],[6,-5],[5,-17]],'#2e7e80');
      line([[-4,-17],[1,-25],[1,-6]],'#c5f4d6',1.3);g.restore();
    }
    const roads=[];
    for(let j=-2;j<2;j++){roads.push([iso(-2.6,j+.5),iso(2.65,j+.5)]);roads.push([iso(j+.5,-2.6),iso(j+.5,2.65)]);}
    const cacheKey=w+','+h+','+dpr;
    let cached=groundCache.get(canvas);
    if(cached?.key===cacheKey){
      g.save();g.setTransform(1,0,0,1,0,0);g.drawImage(cached.image,0,0);g.restore();
    }else{
      const left=-ox/z,right=(w-ox)/z,top=-oy/z,bottom=(h-oy)/z;
      const turf=g.createLinearGradient(left,top,right,bottom);
      turf.addColorStop(0,'#658640');turf.addColorStop(.32,'#a9ba65');turf.addColorStop(.65,'#9db956');turf.addColorStop(1,'#597f41');
      rect(left,top,right-left,bottom-top,turf);
      // Gently irregular diamond tiles reveal the village grid without obscuring troop movement.
      for(let u=-22;u<=22;u++)for(let v=-22;v<=22;v++){
        const [x,y]=iso(u*.38,v*.38);if(x<left-40||x>right+40||y<top-20||y>bottom+20)continue;
        const k=noise(u*43+v);poly([[x-26.4,y],[x,y-12.7],[x+26.4,y],[x,y+12.7]],k>.53?'rgba(234,236,139,'+(.03+k*.085)+')':'rgba(54,100,47,'+(.02+k*.12)+')');
        for(let n=0;n<4;n++){const tx=x+(noise(u*43+v*2+n)*2-1)*14,ty=y+(noise(u*47+v-n)*2-1)*5;
          line([[tx-1,ty-2],[tx,ty],[tx+2,ty-3]],k>.6?'#c2cf78':'#839e54',.8);}
      }
      for(const road of roads){line(road,'#829d51',8);line(road,'#b4bb76',6);}
      for(let j=0;j<460;j++){
        const x=left+noise(j+32)*(right-left),y=top+noise(j+900)*(bottom-top);
        const edge=Math.abs(x-505)/455+Math.abs(y-298)/240;
        if(edge<1.06)continue;
        if(j%5===0){ellipse(x,y,6,2,'#54763f55');poly([[x-4,y],[x-2,y-5],[x+2,y-6],[x+5,y-2],[x+2,y+1]],'#94a17b');}
        else if(edge>1.2){pine(x,y,.65+noise(j+77)*.95,j);}
        else{ellipse(x,y,3.5,1.8,'#77934c');ellipse(x-1,y-.8,1.9,1.4,'#c9c77c');}
      }
      const image=canvas.ownerDocument?.createElement('canvas');
      if(image){image.width=canvas.width;image.height=canvas.height;image.getContext('2d').drawImage(canvas,0,0);groundCache.set(canvas,{key:cacheKey,image});}
    }    function house(x,y,s,roof='#1b696c',shade='#174e5a',stone=false){
      g.save();g.translate(x,y);g.scale(s,s);
      const wall=stone?['#d6c8a7','#d5c3a5','#a89b89']:['#eee0aa','#e6cf98','#b19470'];
      block(0,0,28,31,23,wall);block(0,1,29,32,3,['#d2c4a6','#938a70','#786e5b']);
      for(let i=0;i<3;i++){const xx=-25+i*10,yy=xx*.43+12;
        line([[xx,yy-3],[xx,yy-21]],stone?'#c3b29a':'#836748',2);}
      poly([[-16,-17],[-7,-13],[-7,7],[-16,3]],'#72533d');poly([[-14,-14],[-10,-12],[-10,5],[-14,3]],'#493d31');
      poly([[8,-11],[17,-15],[17,-7],[8,-3]],'#467779');line([[12,-13],[12,-5]],'#d8b575',1.3);
      peak(0,-23,34,15,24,'#594e3c',roof,shade);
      for(let i=1;i<=3;i++){const f=i/4;line([[-34*f,-47+24*f],[0,-47+39*f],[34*f,-47+24*f]],'#91ada065',1.1);}
      g.restore();
    }
    function tower(x,y,s){
      g.save();g.translate(x,y);g.scale(s,s);
      block(0,1,17,21,41,['#efe0b7','#ddcbb0','#a29189']);
      for(let i=0;i<5;i++){let yy=-i*8;line([[-16,yy],[0,yy+7],[16,yy]],'#a69d8990',1);}
      for(let i=0;i<4;i++){line([[-12+i%2*5,-i*8-3],[-12+i%2*5,-i*8+1]],'#a69d89',1);}
      poly([[-9,-30],[-5,-28],[-5,-19],[-9,-20]],'#435956');
      block(0,-39,20,22,6,['#e5d6b5','#ad9e88','#786e69']);
      peak(0,-46,23,10,25,'#63543f','#387c7c','#24555e');
      line([[0,-71],[0,-76]],'#d7bb74',2);
      g.restore();
    }
    function building(x,y,type,level,index){
      const active=selected===index;
      if(active){ellipse(x,y+2,48,20,'#ffdf8d55');g.strokeStyle='#fff1a8';g.lineWidth=2;g.beginPath();g.ellipse(x,y+2,47,19,0,0,TAU);g.stroke();}
      if(type==='empty'){
        g.save();g.setLineDash([5,5]);g.strokeStyle=active?'#fff6b7':'#698348';g.lineWidth=1.8;
        g.beginPath();g.moveTo(x-31,y);g.lineTo(x,y-13);g.lineTo(x+31,y);g.lineTo(x,y+13);g.closePath();g.stroke();g.restore();
        line([[x-5,y],[x+5,y]],'#627747',2);line([[x,y-4],[x,y+4]],'#627747',2);return;
      }
      ellipse(x+8,y+5,36,12,'#35503654');block(x,y+1,31,32,2,['#b8b688','#9da476','#7d9266']);

      const tier=Math.min(5,level),wood=['#c9a76c','#ad854c','#82613f'],stone=['#cbd0c2','#919d97','#657c78'],metal=['#81959c','#50696f','#344c55'];
      if(type==='hall'){
        const roofs=['#b87842','#a25936','#954c38','#6a4d8e','#243e52'];
        block(x,y,35+tier*2,36+tier*2,5,wood);
        if(tier===1){house(x,y,1.1,roofs[0],'#805038');pennant(x+25,y-10,.7);}
        if(tier===2){house(x,y,1.17,roofs[1],'#783b2d',true);block(x+24,y-10,11,13,28,stone);pennant(x+24,y-48,.8);}
        if(tier===3){house(x,y,1.22,roofs[2],'#632e29',true);tower(x-25,y,.68);tower(x+26,y,.68);line([[x-27,y-26],[x,y-15],[x+27,y-26]],'#d9b770',4);}
        if(tier===4){tower(x-25,y-6,.82);tower(x+25,y-6,.82);house(x,y,1.23,roofs[3],'#443651',true);for(const xx of [-17,17])poly([[x+xx,y-34],[x+xx+5,y-32],[x+xx+5,y-12],[x+xx,y-16]],'#d3a75b');pennant(x,y-69,1);}
        if(tier===5){block(x,y,35,39,36,metal);block(x,y-36,38,41,5,['#dfb95f','#9b793c','#746337']);for(const xx of [-25,25]){tower(x+xx,y-13,.88);crystal(x+xx,y-74,.55);}block(x,y-42,22,26,21,metal);poly([[x-30,y-62],[x,y-85],[x+30,y-62],[x,y-48]],'#dfad47');crystal(x,y-68,.9);}
        for(let j=0;j<3;j++)block(x,y+12+j*2,10-j,8,2,stone);
        poly([[x-5,y],[x-5,y-15],[x,y-19],[x+5,y-15],[x+5,y+4]],'#302c27');
      }else if(type==='barracks'){
        // Open training ground and campfire, unmistakably different from a Town Hall.
        block(x,y,30,33,3,['#bcad7b','#8d825e','#6b7255']);
        for(const [xx,yy,scale]of [[-19,-8,.8],[18,-6,.67]]){poly([[x+xx-17*scale,y+yy],[x+xx,y+yy-30*scale],[x+xx+19*scale,y+yy],[x+xx,y+yy+7*scale]],'#c97b44');poly([[x+xx,y+yy-30*scale],[x+xx+19*scale,y+yy],[x+xx+4*scale,y+yy+2]],'#8b4c32');poly([[x+xx-4,y+yy+3],[x+xx,y+yy-14],[x+xx+5,y+yy+4]],'#342d28');}
        for(let i=0;i<7;i++){const angle=i*TAU/7;ellipse(x+Math.cos(angle)*9,y+5+Math.sin(angle)*4,3,2,'#bbb7a0');}
        line([[x-6,y+7],[x+5,y+2]],'#78513b',4);poly([[x-5,y+4],[x-2,y-8-Math.sin(time*9)*3],[x+1,y-2],[x+5,y-13],[x+6,y+5]],'#ffb746');ellipse(x+1,y+2,3,4,'#fff0a2');
        pennant(x+29,y-2,.6+tier*.07);
      }else if(type==='farm'){
        block(x,y,27,29,6,metal);block(x-20,y-9,7,9,20,wood);
        ellipse(x+4,y-12,18,10,'#5a426d');rect(x-14,y-34,36,23,'#a64bba');ellipse(x+4,y-34,18,9,'#f4b3f4');ellipse(x+4,y-12,18,9,'#8e3fa7');
        for(const xx of [-12,20])line([[x+xx,y-15],[x+xx,y-37]],'#d6bb71',3);
        ellipse(x+3,y-34,14,6,'#dd62e5');ellipse(x-2,y-36,4,2,'#ffdcff');
        line([[x-20,y-30],[x-20,y-46],[x+4,y-46],[x+4,y-39]],'#b7bbaa',4);
        for(let j=0;j<3;j++)ellipse(x-7+j*8,y-32+Math.sin(time*2+j)*2,1.3,1.3,'#ffbcfa');
      }else if(type==='mine'){
        for(const [xx,yy,ss]of [[-13,-9,25],[11,-5,28],[0,-17,29]]){poly([[x+xx-ss,y+yy],[x+xx-ss/2,y+yy-ss],[x+xx+ss/2,y+yy-ss-4],[x+xx+ss,y+yy]],'#7f8780');poly([[x+xx,y+yy-ss],[x+xx+ss/2,y+yy-ss-4],[x+xx+ss,y+yy],[x+xx,y+yy]],'#586961');}
        poly([[x-13,y+4],[x-13,y-15],[x,y-23],[x+13,y-15],[x+13,y+4]],'#2c302b');line([[x-14,y+4],[x-14,y-17],[x,y-25],[x+14,y-17],[x+14,y+4]],'#c39753',5);
        for(const xx of [-7,7])line([[x+xx,y],[x+xx-11,y+15]],'#a4a394',2);
        block(x-18,y+10,9,10,8,wood);for(let j=0;j<6;j++)ellipse(x-21+j%3*4,y+5-Math.floor(j/3)*3,3,2,'#f6ca4d');
        if(tier>=2){line([[x+23,y-5],[x+23,y-45],[x+4,y-43]],'#b9ac79',4);ellipse(x+19,y-38,7,7,'#606c64');}
      }else if(type==='cannon'){
        block(x,y,27,29,6,tier>=3?metal:stone);ellipse(x,y-8,18,9,'#927447');
        const endX=x+24+Math.sin(time*.6)*2,endY=y-24;
        line([[x-9,y-17],[endX,endY]],tier>=3?'#3e4d5a':'#586c73',14+tier);line([[x-8,y-21],[endX-1,endY-5]],'#9cabb0',3);
        ellipse(endX,endY,5+tier*.3,8+tier*.3,'#c5aa64');ellipse(endX+1,endY,3.5,5.4,'#1e3039');
        if(tier>=3)line([[x-6,y-13],[x+9,y-17]],'#d5af58',4);
      }else if(type==='archery'){
        for(const xx of [-14,14]){line([[x+xx,y],[x+xx,y-43-tier*2]],tier>=3?'#8a9892':'#94734d',5);line([[x+xx,y-5],[x-xx,y-31]],'#be9d62',3);}
        block(x,y-37-tier*2,23,26,7,tier>=3?stone:wood);
        for(let i=-2;i<=2;i++)block(x+i*7,y-43-tier*2+i*1.7,3,4,5,wood);
        for(const xx of [-7,7]){ellipse(x+xx,y-50-tier*2,3,4,'#f1c1a2');poly([[x+xx-4,y-49-tier*2],[x+xx+4,y-49-tier*2],[x+xx+4,y-39-tier*2],[x+xx-4,y-39-tier*2]],'#7e57a7');line([[x+xx+5,y-52-tier*2],[x+xx+9,y-46-tier*2],[x+xx+5,y-39-tier*2]],'#c6ab73',2);}
      }else if(type==='mortar'){
        block(x,y,26,28,5,stone);ellipse(x,y-5,19,10,'#927a54');
        poly([[x-13,y-7],[x-16,y-38],[x+13,y-38],[x+16,y-7]],tier>=3?'#354b57':'#556d70');ellipse(x,y-38,16,9,'#d2b16b');ellipse(x,y-38,11,6,'#172c34');line([[x-14,y-18],[x+14,y-18]],'#d0ad59',4);
        ellipse(x-22,y+2,5,5,'#394b50');ellipse(x-27,y+6,4,4,'#394b50');
      }else if(type==='tower'){
        block(x,y,29,31,6,stone);block(x,y-6,22,24,24,['#e0d8bb','#c7bca1','#a79f8c']);
        poly([[x-27,y-29],[x,y-50],[x+27,y-29],[x,y-16]],'#a74d47');poly([[x-6,y-20],[x+6,y-17],[x+6,y-7],[x-6,y-10]],'#f7ecd2');line([[x,y-17],[x,y-8]],'#bb4b4b',3);line([[x-4,y-13],[x+4,y-11]],'#bb4b4b',3);
      }else if(type==='forge'){
        block(x,y,28,30,18,stone);block(x+15,y-15,7,9,33,metal);poly([[x-31,y-17],[x-8,y-39],[x+23,y-23],[x,y-9]],'#813e35');
        poly([[x-14,y],[x-14,y-14],[x-5,y-20],[x+5,y-15],[x+5,y+4]],'#3f352e');ellipse(x-4,y-7,7,8,'#f7a446');
        for(let j=0;j<3;j++){const f=(time*.35+j/3)%1;ellipse(x+15+f*7,y-51-f*20,3+f*5,2+f*4,'rgba(215,217,194,'+(1-f)*.5+')');}
      }else if(type==='arc'){
        block(x,y,25,28,7,metal);block(x,y-7,11,13,37,wood);
        for(let j=0;j<4;j++)ellipse(x,y-28-j*5,15-j,5,'#d1b56c');
        ellipse(x,y-55,13,10,'#94d5e1');ellipse(x-4,y-58,4,3,'#dbffff');
        const flash=Math.sin(time*5);if(flash>.3)line([[x,y-56],[x+8,y-69],[x-5,y-65],[x+5,y-78]],'#bbf9ff',2);
      }
      if(type!=='hall'&&tier>=2){line([[x-27,y+1],[x,y+12],[x+27,y+1]],tier>=4?'#e6ba53':'#a8a7a0',tier>=4?4:2);if(tier>=3)for(const xx of [-24,24])block(x+xx,y+2,4,5,13,metal);if(tier>=5){crystal(x-24,y-12,.3);crystal(x+24,y-12,.3);}}
      if(buildings?.[index]?.job){
        const f=(Date.now()-buildings[index].job.started)/(buildings[index].job.finish-buildings[index].job.started);
        for(const xx of [-30,30])line([[x+xx,y+5],[x+xx,y-47]],'#b1945c',3);line([[x-30,y-38],[x+30,y-14]],'#ccb07a',3);
        rect(x-24,y-66,48,6,'#273b2b');rect(x-23,y-65,46*Math.max(0,Math.min(1,f)),4,'#f7ce68');
      }
      if(level>1){for(let i=0;i<Math.min(4,level-1);i++)ellipse(x+4+i*4,y+11,1.8,1.7,'#fcd781');}
    }
    window.worldTransform={z,ox,oy};
    const entities=[];
    function actor(y,draw){entities.push({y,draw});}
    function curtain(u0,v0,u1,v1,gate){
      const [x0,y0]=iso(u0,v0),[x1,y1]=iso(u1,v1), steps=Math.round(Math.hypot(x1-x0,y1-y0)/10);
      for(let n=0;n<=steps;n++){
        if(gate&&Math.abs(n/steps-.5)<.095)continue;
        const f=n/steps,x=x0+(x1-x0)*f,y=y0+(y1-y0)*f;
        const corner=n===0||n===steps,cap=corner||n%4===0,high=cap?13:9;
        actor(y,()=>{
          ellipse(x+3,y+1,8,3.2,'#31542d40');
          block(x,y,cap?7.9:7,cap?9:7.7,high,['#c0c3a1','#868e76','#647662']);
          block(x,y-high,cap?8.2:7.2,cap?9:7.5,2.3,['#d5d3ad','#a3aa8a','#7f8a71']);
          if(cap){line([[x-5,y-3],[x-1,y-1.4]],'#a8ae8c',.8);line([[x+1,y-7],[x+5,y-8.8]],'#a0a88a',.9);}
        });
      }
    }
    const layout=buildings?.[0]?.layout;
    if(layout?.walls){for(const w of layout.walls)curtain(w.u,w.v,w.u+(w.axis==='v'?0:.5),w.v+(w.axis==='v'?.5:0),false);}else{
    for(const edge of [[-2.55,-2.55,2.55,-2.55],[2.55,-2.55,2.55,2.55],[2.55,2.55,-2.55,2.55],[-2.55,2.55,-2.55,-2.55]])curtain(...edge,true);
    for(const n of [-1.5,.55]){curtain(n,-2.55,n,-.55,true);curtain(n,-.55,n,2.55,true);}
    curtain(-2.55,-.55,.55,-.55,true);curtain(.55,-.55,2.55,-.55,true);
    curtain(-.55,1.5,2.55,1.5,true);
    }
    for(const t of layout?.traps||[]){const [x,y]=iso(t.u,t.v);actor(y,()=>{ellipse(x,y,9,4,'#473b2d');ellipse(x,y-3,6,5,'#292d31');line([[x+3,y-6],[x+6,y-10]],'#c2ab6b',2);ellipse(x+6,y-10,2,2,'#ffb84d');});}
    function accessory(x,y,kind){
      ellipse(x+4,y+2,20,7,'#425c3938');
      if(kind===0){
        house(x-7,y,.48,'#b77e49','#895d35');house(x+10,y+4,.38,'#c8844c','#995f38');
        block(x+9,y+10,4,4,4,['#ccad70','#ae874c','#836640']);
      }else if(kind===1){
        block(x,y,19,19,4,['#adb08d','#8c9577','#788469']);
        for(const [dx,dy] of [[-8,-2],[7,-3],[1,4]]){
          rect(x+dx-4,y+dy-10,8,9,'#a47c43');ellipse(x+dx,y+dy-10,4,2,'#e0b965');
          line([[x+dx-3,y+dy-5],[x+dx+3,y+dy-5]],'#695b44',1.4);
        }
      }else if(kind===2){
        poly([[x-22,y+4],[x-10,y-15],[x+10,y-19],[x+22,y],[x+3,y+8]],'#d6b374');
        poly([[x-10,y-15],[x+10,y-19],[x+22,y],[x+3,y+8]],'#927953');
        poly([[x-19,y+3],[x-10,y-11],[x-6,y+5]],'#635c46');
        for(let j=0;j<3;j++)line([[x+13+j*3,y+8],[x+16+j*3,y-5]],'#725f44',1.5);
        ellipse(x-12,y+9,4,2,'#876843');ellipse(x-12,y+7,2,3+Math.sin(time*4)*1.2,'#f2ac5a');
      }else{
        block(x,y,14,15,3,['#ad9d74','#8c815f','#6c7155']);
        for(let j=0;j<4;j++){const xx=x-8+j*5;poly([[xx-2,y],[xx+1,y-9-j%2*4],[xx+3,y]],'#7d8580');}
      }
    }
    let decor=0;
    for(let u=-2;u<=2;u++)for(let v=-2;v<=2;v++){
      if(plots.some(([a,b])=>a===u&&b===v))continue;
      const [x,y]=iso(u,v),kind=decor++%4;actor(y,()=>accessory(x,y,kind));
    }
    for(const [u,v,k] of [[-3,1,0],[-3,0,0],[1,-3,2],[0,-3,2],[2,-3,2],[3,1,1],[3,0,1],[-1,3,0],[0,3,1]]){
      const [x,y]=iso(u,v);actor(y,()=>accessory(x,y,k));
    }    slots.forEach(([x,y],i)=>actor(y,()=>building(x,y,buildings?.[i]?.type||'empty',buildings?.[i]?.level||1,i)));
    function worker(x,y,step,i,direction){
      const bob=Math.abs(Math.sin(step))*.8,leg=Math.sin(step)*1.6;
      g.save();g.translate(x,y);g.scale(direction,1);
      ellipse(1,1,4.5,1.8,'#35514454');line([[-1,-3],[-1+leg,.1]],'#51433a',1.8);line([[1,-3],[1-leg,.3]],'#655141',1.8);
      g.translate(0,-bob);poly([[-2.7,-8],[2,-8],[3,-3],[-2.8,-3]],['#b75a45','#407b87','#c28e41','#697d55'][i%4]);
      ellipse(.1,-10,2.2,2.4,'#ebba89');ellipse(-.1,-11.8,2.4,1.1,'#6e513e');
      if(i%3===0){ellipse(.2,-12,3.7,1.15,'#d7b575');ellipse(.1,-12.8,2.1,1.45,'#e7c98b');}
      line([[1.5,-7],[3+leg*.5,-5]],'#e1b085',1.5);if(i%4===1)rect(-4,-6,3,3,'#ba8a4f');g.restore();
    }
    for(let i=0;i<13;i++){
      const road=roads[i%roads.length],span=road.length-1;
      const progress=(time*(.06+noise(i)*.038)+noise(i+40)*8)%(span*2+.8);
      const u=Math.max(0,Math.min(span,progress<=span+.4?progress:span*2+.4-progress)),k=Math.min(span-1,Math.floor(u)),f=u-k;
      const a=road[k],b=road[k+1],x=a[0]+(b[0]-a[0])*f,y=a[1]+(b[1]-a[1])*f+i%3*2;
      actor(y,()=>worker(x,y,time*6+i,i,(b[0]>a[0]?1:-1)*(progress>span+.4?-1:1)));
    }
    entities.sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
    window.islandHits=slots.map(([x,y],index)=>({index,x:ox+x*z,y:oy+(y-(buildings?.[index]?.type==='empty'?0:17))*z,r:Math.max(18,39*z)}));
  }
  window.drawIsland=drawIsland;
})();


