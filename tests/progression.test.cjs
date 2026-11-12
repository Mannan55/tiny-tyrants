const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let clock=1000,stored=null;
const nodes=new Map();
class El{
 constructor(){this.children=[];this.classList={add(){},remove(){}};this.textContent='';this.open=false;this.q=new Map();}
 setAttribute(){}addEventListener(){}append(...items){for(const item of items){this.children.push(item);if(item.id)nodes.set(item.id,item);}}replaceChildren(){this.children=[];}
 set innerHTML(value){this.html=value;for(const match of value.matchAll(/id="([^"]+)"/g))nodes.set(match[1],new El());}
 get innerHTML(){return this.html||'';}querySelector(selector){if(!this.q.has(selector))this.q.set(selector,new El());return this.q.get(selector);}focus(){}close(){this.open=false;}
}
for(const id of ['close','dialog','dialogBody','help'])nodes.set(id,new El());
const $=id=>nodes.get(id)||null;$('close').onclick=()=>$('dialog').close();
const types=['hall','mine','farm','barracks','tower','cannon','archery','mortar','forge','arc','empty'];
const structures=Object.fromEntries(types.map(t=>[t,[t]]));
const initial={gold:350,grain:60,last:1000,stage:1,army:{vanguard:0},buildings:Array.from({length:12},(_,i)=>({type:i?'empty':'hall',level:i?0:1}))};
const ctx={paths:{crest:""},window:{setInterval(){}},document:{createElement:()=>new El(),body:new El()},$,s:structuredClone(initial),initial,structures,saveKey:'tiny-tyrants-v1',selected:0,mission:1,battle:false,layoutEditing:false,portraits:{clear(){}},save(){stored=JSON.stringify(ctx.s)},refresh(){},chime(){},icon:()=>'<svg/>',row(){},structuredClone,Date:{now:()=>clock},localStorage:{setItem(){}},assert};
ctx.modal=html=>{$('dialogBody').innerHTML=html;$('dialog').open=true;};
let code=fs.readFileSync(require('node:path').join(__dirname,'..','progression.js'),'utf8');
code=code.replace(/\}\)\(\);\s*$/, 'window.__test={submitPlayerName,checkCompletion,showVictory,resetVillage,elapsed};})();');
vm.runInNewContext(code,ctx);
const api=ctx.window.__test,pure=ctx.window.TinyTyrantsProgress;
assert.equal(pure.validName('x'),null);assert.equal(pure.validName('<img>'),null);assert.equal(pure.validName('  Mannan   Shah '),'Mannan Shah');
assert.equal(pure.formatElapsed(0),'00:00:00');assert.equal(pure.formatElapsed(90061000),'1d 01:01:01');assert.equal(pure.formatElapsed(-10),'00:00:00');
assert.equal(api.submitPlayerName('Mannan'),true);assert.equal(ctx.s.playthrough.startedAt,1000);
clock=61000;assert.equal(api.elapsed(),60000);
const maxed=['hall','mine','farm','barracks','tower','cannon','archery','mortar','forge','arc','mine','farm'].map(type=>({type,level:type==='hall'?5:6}));
assert.equal(pure.completionFacts(maxed).complete,true);
for(const change of [b=>b[0].level=4,b=>b[1].level=5,b=>b[2].job={finish:9},b=>b[3].type='empty',b=>b[9].type='mine']){
 const buildings=structuredClone(maxed);change(buildings);assert.equal(pure.completionFacts(buildings).complete,false);
}
ctx.s.buildings=structuredClone(maxed);ctx.s.lastConstructionFinishedAt=51000;api.checkCompletion();assert.equal(ctx.s.playthrough.completedAt,51000);
clock=1000000;assert.equal(api.elapsed(),50000);api.showVictory();assert.equal(ctx.s.playthrough.resultShown,true);assert.equal($('dialogBody').querySelector('.victoryName').textContent,'Mannan');
const restored=JSON.parse(stored);assert.equal(restored.playthrough.completedAt,51000);
api.resetVillage();assert.equal(ctx.s.gold,350);assert.equal(ctx.s.grain,60);assert.equal(ctx.s.playthrough,undefined);assert.equal(ctx.s.buildings.filter(b=>b.type!=='empty').length,1);
console.log('v1.1 tests passed: safe usernames, elapsed/offline time, all finish conditions, exact finish timestamp, frozen result, named victory, persistence, and fresh restart.');

