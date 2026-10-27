// @ts-nocheck
/**
 * Studio engine: canvas drawing, text, layers, nails, strings, build steps.
 * Carried over from the original single-file build and wrapped in one function so React can start it
 * once the markup in components/studioMarkup.ts is in the page.
 * The pure algorithms also exist as typed, tested modules in lib/ and services/.
 */
let started = false;
export function startStudio(): void {
  if (started) return;
  started = true;

const $=s=>document.querySelector(s),cv=$('#cv'),cx=cv.getContext('2d');
const COLS=['#ffffff','#111111','#e53935','#ffb300','#43a047','#1e88e5','#d81b60','#9c6bff'];
const CN={'#111111':'black','#ffffff':'white','#e53935':'red','#ffb300':'gold','#43a047':'green','#1e88e5':'blue','#d81b60':'pink','#9c6bff':'violet'};
const STEPS=[['draw','1 Draw'],['nails','2 Nails'],['strings','3 Strings'],['build','4 Build']];
const DT=[['select','Select'],['pengrp','Pen'],['lasso','Lasso'],['line','Line'],['rect','Square'],['circle','Circle'],['tri','Triangle'],['star','Star'],['heart','Heart'],['text','Text'],['erase','Eraser']];
const NT=[['add','Add nail'],['move','Move nail'],['remove','Remove nail']];
const STL=[['pick','Pick shape'],['hand','By hand'],['cut','Cut thread']];
const HINT={text:'Tap where the text should go, then type it and pick a font.',select:'Tap a shape to select it. Drag it to move, drag a corner to resize, drag the round handle to rotate. The bar above it has more options.',lasso:'Pick a lasso mode below, then outline the shape you want. It becomes a closed shape of nails.',curve:'Tap to place points. After tapping, drag to pull a smooth curve. Tap the first point to close. Use symmetry for mandalas.',edit:'Tap a curve to select it. Drag its white points or blue handles. Colors change the selected curve.',
 pen:'Draw with your finger. Close the shape by ending near where you started.',line:'Drag from one point to another.',rect:'Drag from one corner to the opposite corner.',circle:'Drag from one corner to the opposite corner of the circle.',tri:'Drag across the area the triangle should fill.',star:'Drag across the area the star should fill.',heart:'Drag across the area the heart should fill.',erase:'Tap a line or shape to delete it. Undo brings it back.',
 add:'Tap an empty spot to add a nail.',move:'Drag a nail to a new place.',remove:'Tap a nail to remove it.',
 pick:'Tap a nail to choose its shape. The shape lights up.',hand:'Tap nails one after another to string a thread.',cut:'Tap a thread to remove it.'};
const U={
 rect:[[-1,-1],[1,-1],[1,1],[-1,1]],tri:[[0,-1],[1,1],[-1,1]],
 star:Array.from({length:10},(_,i)=>{const r=i%2?.4:1,t=i*Math.PI/5;return[Math.sin(t)*r,-Math.cos(t)*r]}),
 circle:Array.from({length:96},(_,i)=>{const t=i*Math.PI/48;return[Math.sin(t),-Math.cos(t)]}),
 heart:Array.from({length:120},(_,i)=>{const t=i*Math.PI/60;return[16*Math.pow(Math.sin(t),3)/17,-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t)+2.5)/17]})
};
const CURVE={circle:1,heart:1};
let S={W:40,H:40,strokes:[],nails:[],groups:[],threads:[],nid:1,dirty:false,
 step:'draw',dt:'pen',nt:'add',stl:'pick',dc:'#ffffff',tc:'#ffffff',sp:8,jk:7,snap:true,grid:true,nums:true,guide:true,uo:40,sel:null,last:null,bs:0,sym:1,mir:false,esel:null,asel:null,cm:'board',prot:false,pn:180,pl:1200,lm:'free',ls:2,pm:'move',fromPhoto:false,hc:[],hg:[],bg:'#0c0b0a',tf:0,tsz:5,tbd:false,tsc:'dev'};
const DOC=['W','H','strokes','nails','groups','threads','nid','dirty','sel','step','fromPhoto'];
const PERSIST=DOC.concat(['dc','tc','sp','jk','snap','grid','nums','guide','uo','dt','nt','stl','sym','mir','cm','prot','pn','pl','lm','ls','pm','hc','hg','bg','tf','tsz','tbd','tsc']);
let hist=[],fut=[],sc=1,dpr=1,CW=300,CH=300,cur=null,drag=null,under=null,timer=null,armed=false;
const pick=(o,k)=>k.reduce((r,x)=>(r[x]=o[x],r),{});
const snapDoc=()=>JSON.stringify(pick(S,DOC));
function restore(j){Object.assign(S,JSON.parse(j));S.last=null;S.tsel=null;S.esel=null;S.asel=null;bz=null;cur=null;sizeCanvas();after()}
function push(){hist.push(snapDoc());if(hist.length>60)hist.shift();fut=[]}
function save(){try{localStorage.setItem('ssd3',JSON.stringify(pick(S,PERSIST)))}catch(e){}}
function after(){save();ui();draw()}
function mut(fn){push();fn();after()}
const s5=v=>S.snap?Math.round(v/5)*5:v, r1=v=>Math.round(v*10)/10;
function pt(e){const r=cv.getBoundingClientRect();return{x:((e.clientX-r.left-VX)/VZ)/sc,y:((e.clientY-r.top-VY)/VZ)/sc}}
function segD(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;let t=l?((p.x-a[0])*dx+(p.y-a[1])*dy)/l:0;t=Math.max(0,Math.min(1,t));return Math.hypot(p.x-a[0]-t*dx,p.y-a[1]-t*dy)}
function hitN(p,px){let b=null,bd=(px||28)/(sc*VZ);S.nails.forEach(n=>{const d=Math.hypot(n.x-p.x,n.y-p.y);if(d<bd){bd=d;b=n}});return b}
function resample(poly,N,closed){
 const cum=[0];for(let i=1;i<poly.length;i++)cum.push(cum[i-1]+Math.hypot(poly[i][0]-poly[i-1][0],poly[i][1]-poly[i-1][1]));
 const tot=cum[cum.length-1],out=[],st=tot/(closed?N:Math.max(N-1,1));let j=1;
 for(let k=0;k<N;k++){const t=k*st;while(j<cum.length-1&&cum[j]<t)j++;const f=(t-cum[j-1])/((cum[j]-cum[j-1])||1),a=poly[j-1],b=poly[j];out.push([a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f])}
 return out;
}
function mk(t,a,b){
 if(t==='line')return Math.hypot(a.x-b.x,a.y-b.y)<3?null:{type:'line',pts:[[a.x,a.y],[b.x,b.y]],closed:false,curve:false};
 const x=(a.x+b.x)/2,y=(a.y+b.y)/2,hw=Math.abs(a.x-b.x)/2,hh=Math.abs(a.y-b.y)/2;
 if(hw<2||hh<2)return null;
 return{type:t,pts:U[t].map(u=>[x+u[0]*hw,y+u[1]*hh]),closed:true,curve:!!CURVE[t]};
}
function penStroke(P){
 let len=0;for(let i=1;i<P.length;i++)len+=Math.hypot(P[i].x-P[i-1].x,P[i].y-P[i-1].y);
 if(len<6)return null;
 let pts=P.map(p=>[p.x,p.y]);
 for(let k=0;k<2;k++){const q=pts;pts=q.map((p,i)=>i&&i<q.length-1?[(q[i-1][0]+p[0]+q[i+1][0])/3,(q[i-1][1]+p[1]+q[i+1][1])/3]:p)}
 const f=pts[0],l=pts[pts.length-1],cl=len>40&&Math.hypot(f[0]-l[0],f[1]-l[1])<8;
 if(cl)pts.pop();
 return{type:'pen',pts,closed:cl,curve:true};
}
function gen(){
 const sp=S.sp,N=[],G=[];S.nid=1;
 const near=(x,y)=>N.find(n=>Math.hypot(n.x-x,n.y-y)<sp*.45);
 strokes().forEach(s=>{
  const pts=s.pts,cl=s.closed;let out=[];
  if(s.curve){
   const poly=cl?pts.concat([pts[0]]):pts;let len=0;for(let i=1;i<poly.length;i++)len+=Math.hypot(poly[i][0]-poly[i-1][0],poly[i][1]-poly[i-1][1]);
   out=resample(poly,cl?Math.max(3,Math.round(len/sp)):Math.max(2,Math.round(len/sp)+1),cl);
  }else{
   const m=pts.length,segs=cl?m:m-1;
   for(let i=0;i<segs;i++){const a=pts[i],b=pts[(i+1)%m],L=Math.hypot(b[0]-a[0],b[1]-a[1]),k=Math.max(1,Math.round(L/sp));for(let j=0;j<k;j++)out.push([a[0]+(b[0]-a[0])*j/k,a[1]+(b[1]-a[1])*j/k])}
   if(!cl)out.push(pts[m-1]);
  }
  const ids=[];
  out.forEach(p=>{let n=near(p[0],p[1]);if(!n){n={id:S.nid++,x:r1(p[0]),y:r1(p[1])};N.push(n)}if(ids[ids.length-1]!==n.id)ids.push(n.id)});
  if(cl&&ids.length>1&&ids[0]===ids[ids.length-1])ids.pop();
  if(ids.length>1)G.push({id:G.length+1,ids,closed:cl&&ids.length>2,c:s.c,n:s.name||LBL[s.type]||'Shape'});
 });
 S.nails=N;S.groups=G;S.hg=[];S.threads=[];S.sel=G.length?G[G.length-1].id:null;S.dirty=false;
}
let CG=0;const gsel=()=>{const g=S.groups.find(h=>h.id===S.sel);CG=g?g.id:0;return g};
const TV=()=>S.threads.filter(t=>!(S.hc||[]).includes(t.c)&&!(S.hg||[]).includes(t.g));
const LBL={pen:'Freeform',line:'Line',rect:'Square',circle:'Circle',tri:'Triangle',star:'Star',heart:'Heart',lasso:'Lasso',bez:'Pen path',text:'Text'};
function addT(a,b,c){if(a!==b)S.threads.push({a,b,c,g:CG})}
function outline(g,c){const n=g.ids.length;for(let i=0;i<n-1;i++)addT(g.ids[i],g.ids[i+1],c);if(g.closed&&n>2)addT(g.ids[n-1],g.ids[0],c)}
const ixm=()=>new Map(S.nails.map((n,i)=>[n.id,i]));
function sizeCanvas(){const wide=innerWidth>=820,aw=wide?innerWidth-400:innerWidth-24,ah=wide?innerHeight-140:1e4;CW=Math.max(200,Math.min(aw,ah*S.W/S.H,wide?900:560));CH=CW*S.H/S.W;sc=CW/(S.W*10);dpr=window.devicePixelRatio||1;cv.style.width=CW+'px';cv.style.height=CH+'px';cv.width=Math.round(CW*dpr);cv.height=Math.round(CH*dpr)}
function strokePath(pts,cl){cx.beginPath();pts.forEach((p,i)=>i?cx.lineTo(p[0]*sc,p[1]*sc):cx.moveTo(p[0]*sc,p[1]*sc));if(cl)cx.closePath();cx.stroke()}
function draw(){
 barPos();
 cx.setTransform(dpr,0,0,dpr,0,0);cx.fillStyle='#26262a';cx.fillRect(0,0,CW,CH);cx.setTransform(dpr*VZ,0,0,dpr*VZ,dpr*VX,dpr*VY);cx.fillStyle=S.bg||'#0c0b0a';cx.fillRect(0,0,CW,CH);
 if(S.grid&&sc*10>=6){cx.strokeStyle=LB()?'rgba(0,0,0,.12)':'rgba(255,255,255,.08)';cx.lineWidth=1;cx.beginPath();for(let x=0;x<=S.W*10;x+=10){cx.moveTo(x*sc,0);cx.lineTo(x*sc,CH)}for(let y=0;y<=S.H*10;y+=10){cx.moveTo(0,y*sc);cx.lineTo(CW,y*sc)}cx.stroke()}
 const st=S.step;
 if(st==='draw'||S.guide){cx.lineWidth=st==='draw'?3:1.5;cx.lineJoin=cx.lineCap='round';cx.globalAlpha=st==='draw'?1:.4;strokes().forEach(s=>{cx.strokeStyle=s.c;strokePath(s.pts,s.closed)});cx.globalAlpha=1}
 if(cur){cx.strokeStyle=S.dc;cx.lineWidth=3;cx.setLineDash([6,4]);if(cur.pts)strokePath(cur.pts.map(p=>[p.x,p.y]),false);else{const m=mk(S.dt,cur.a,cur.b);if(m)strokePath(m.pts,m.closed)}cx.setLineDash([])}
 if(st==='draw'){overlay();if(!S.strokes.length&&!S.nails.length&&!cur&&!bz&&!lp.length){cx.fillStyle=LB()?'rgba(0,0,0,.4)':'rgba(255,255,255,.35)';cx.font='15px -apple-system,sans-serif';cx.textAlign='center';cx.fillText('Pick a tool below and draw here',CW/2,CH/2)}return}
 if(S.prot&&st==='nails')prot();
 const ix=ixm(),TT=TV(),lim=st==='build'?S.bs:TT.length;
 cx.lineWidth=.8;cx.globalAlpha=.9;
 for(let i=0;i<lim;i++){const t=TT[i],a=S.nails[ix.get(t.a)],b=S.nails[ix.get(t.b)];if(!a||!b)continue;cx.strokeStyle=t.c;cx.beginPath();cx.moveTo(a.x*sc,a.y*sc);cx.lineTo(b.x*sc,b.y*sc);cx.stroke()}
 cx.globalAlpha=1;const hi=new Set(),sg=new Set();
 if(st==='build'&&lim>0){const t=TT[lim-1],a=S.nails[ix.get(t.a)],b=S.nails[ix.get(t.b)];if(a&&b){hi.add(t.a);hi.add(t.b);cx.strokeStyle='#ffe14d';cx.lineWidth=2.4;cx.beginPath();cx.moveTo(a.x*sc,a.y*sc);cx.lineTo(b.x*sc,b.y*sc);cx.stroke()}}
 if(S.last!==null)hi.add(S.last);
 if(st==='strings'){const g=gsel();if(g)g.ids.forEach(i=>sg.add(i))}
 cx.font='8px -apple-system,sans-serif';cx.textAlign='center';cx.textBaseline='middle';
 const lab=S.nums&&S.nails.length<=160;
 S.nails.forEach((n,i)=>{const h=hi.has(n.id),s=sg.has(n.id);cx.fillStyle=h?'#ffe14d':s?'#7fe3ff':(LB()?'#5c554c':'#b7b1a6');cx.beginPath();cx.arc(n.x*sc,n.y*sc,h?3.6:s?3:2,0,7);cx.fill();if(lab||h){cx.fillStyle=h?'#ffe14d':(LB()?'#4b463f':'#8f8a80');cx.fillText(i+1,n.x*sc+7,n.y*sc-7)}});
}
function ui(){
 const st=S.step;
 document.querySelectorAll('#steps4 .b').forEach(b=>b.classList.toggle('on',b.dataset.s===st));
 ['draw','nails','strings','build'].forEach(k=>$('#p-'+k).hidden=k!==st);
 $('#edit').hidden=st==='build';$('#lift').hidden=!(st==='strings'&&S.stl==='hand');
 const tl={draw:'dt',nails:'nt',strings:'stl'};
 document.querySelectorAll('#dt .b,#nt .b,#stl .b').forEach(b=>b.classList.toggle('on',b.dataset.t===S[tl[st]]));
 document.querySelectorAll('#cols .sw').forEach(b=>b.classList.toggle('on',b.dataset.c===(st==='draw'?S.dc:S.tc)));
 $('#cols').hidden=st==='nails';
 let h=st==='build'?'Step through the threads in order and copy them onto your board.':HINT[S[tl[st]]];
 if(st==='draw'&&S.threads.length)h+=' Changing the drawing places new nails and removes your threads.';
 if(st==='nails'&&!S.nails.length)h='Draw something first, then come back here.';
 if(st==='nails'&&S.nails.length)h+=' Moving the spacing slider places all nails again.';
 $('#hint').textContent=h;
 $('#ncount').textContent=S.nails.length;$('#spv').textContent=S.sp;$('#sp').value=S.sp;$('#jkv').textContent=S.jk;$('#jk').value=S.jk;
 $('#bw').value=S.W;$('#bh').value=S.H;
 ['snap','grid','nums','guide'].forEach(k=>$('#'+k).classList.toggle('on',S[k]));
 $('#undo').disabled=S.step==='build'||!(hist.length||bz);$('#redo').disabled=S.step==='build'||!fut.length;
 const i=STEPS.findIndex(x=>x[0]===st);
 $('#back').disabled=i===0;$('#next2').disabled=i===3;$('#next2').textContent=i<3?'Next: '+STEPS[i+1][1].slice(2):'Done';
 $('#bs').max=TV().length;if(S.bs>TV().length)S.bs=TV().length;$('#bs').value=S.bs;
 buildText();ui2();
}
function buildText(){
 const T=TV(),k=Math.min(S.bs,T.length),ix=ixm();
 $('#cur').textContent=!T.length?'No threads yet. Go back to step 3.':k===0?'Step 0 of '+T.length+'. Nothing strung yet.':'Step '+k+' of '+T.length+': nail '+(ix.get(T[k-1].a)+1)+' to nail '+(ix.get(T[k-1].b)+1)+' ('+(CN[T[k-1].c]||'custom')+')';
 let t='Board '+S.W+' x '+S.H+' cm, '+S.nails.length+' nails\n\nNails (cm from bottom-left; angle clockwise from the top, radius from the '+(S.cm==='shape'?'selected shape':'board')+' centre)\n'+S.nails.map((n,i)=>{const q=polar(n);return (i+1)+': x '+(n.x/10).toFixed(1)+', y '+((S.H*10-n.y)/10).toFixed(1)+' | angle '+q.a.toFixed(1)+' deg, radius '+q.r.toFixed(1)+' cm'}).join('\n')+'\n\nThreads in order\n';
 let c=null,line=[];
 T.forEach(h=>{if(h.c!==c){if(line.length)t+=line.join('  ')+'\n';c=h.c;line=[];t+='\nColor '+(CN[h.c]||h.c)+'\n'}line.push((ix.get(h.a)+1)+'>'+(ix.get(h.b)+1))});
 if(line.length)t+=line.join('  ')+'\n';
 $('#list').value=t;
}
function setStep(s){
 stop();S.last=null;cur=null;bz=null;
 if(s==='nails'&&S.strokes.length&&(S.dirty||!S.nails.length)){push();gen()}
 S.step=s;if(s==='build')S.bs=0;after();
}
function stop(){clearInterval(timer);timer=null;$('#play').textContent='Play'}
function go(n){S.bs=Math.max(0,Math.min(TV().length,n));$('#bs').value=S.bs;buildText();draw()}
const IC={pen:'<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',curve:'<path d="M12 3l6 7-3 8-3 3-3-3-3-8z"/><circle cx="12" cy="12" r="1.6"/><path d="M12 13.6V18"/>',edit:'<path d="M6 3l12 8-6 1.5L9 19z"/>',lasso:'<ellipse cx="12" cy="9" rx="9" ry="5"/><path d="M8 13c-1 3 0 6 4 6 2 0 3-1 2-3"/>',line:'<path d="M5 19L19 5"/>',rect:'<rect x="5" y="5" width="14" height="14" rx="1"/>',circle:'<circle cx="12" cy="12" r="8"/>',tri:'<path d="M12 4l9 16H3z"/>',star:'<path d="M12 3l2.6 6 6.4.6-4.8 4.3 1.4 6.3L12 17l-5.6 3.2 1.4-6.3L3 9.6 9.4 9z"/>',heart:'<path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z"/>',erase:'<path d="M4 16l8-9 8 7-5 5H9z"/><path d="M9 21h11"/>',add:'<circle cx="12" cy="12" r="3"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3"/>',move:'<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>',remove:'<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',pick:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/>',hand:'<path d="M4 18c4-10 6 4 10-6s5-4 6-6"/>',cut:'<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8 8.5L20 18M8 15.5L20 6"/>',undo:'<path d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3"/>',redo:'<path d="M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3"/>',conv:'<path d="M5 17L12 6l7 11"/><path d="M8 17h8"/>',poly:'<path d="M5 8l7-4 7 5-3 9H8z"/>',folder:'<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',text:'<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',eyeoff:'<path d="M3 3l18 18M10.5 6.2A9 9 0 0112 6c6 0 10 6 10 6a17 17 0 01-3.2 3.8M6.5 7.4A17 17 0 002 12s4 7 10 7a9 9 0 004.2-1.1"/>',select:'<rect x="4" y="4" width="11" height="11" rx="1" stroke-dasharray="2.5 2"/><path d="M12 12l8 3-3.4 1.4L15 20z"/>',dup:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2h3"/>',flh:'<path d="M12 3v18M8 7L3 12l5 5zM16 7l5 5-5 5z"/>',flv:'<path d="M3 12h18M7 8l5-5 5 5zM7 16l5 5 5-5z"/>',rotm:'<path d="M4 12a8 8 0 0113.5-5.8M20 12a8 8 0 01-13.5 5.8"/><path d="M18 3v4h-4M6 21v-4h4"/>',r90:'<path d="M20 12a8 8 0 11-3-6.2M20 4v5h-5"/>',trash:'<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>'};
function ico(k){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[k]+'</svg>'}
function mkBtns(box,list,key){list.forEach(([k,n])=>{const b=document.createElement('button');b.className='b tb';b.dataset.t=k;b.innerHTML=ico(IC[k]?k:'curve')+'<span>'+n+'</span>';b.onclick=()=>{if(key==='dt'&&(k==='pengrp'||k==='lasso')){openMenu(k);return}S[key]=k;S.last=null;cur=null;lp=[];after()};$(box).appendChild(b)})}
STEPS.forEach(([k,n])=>{const b=document.createElement('button');b.className='b';b.dataset.s=k;b.textContent=n;b.onclick=()=>setStep(k);$('#steps4').appendChild(b)});
mkBtns('#dt',DT,'dt');mkBtns('#nt',NT,'nt');mkBtns('#stl',STL,'stl');
COLS.forEach(c=>{const b=document.createElement('button');b.className='b sw';b.dataset.c=c;b.style.background=c;b.setAttribute('aria-label',CN[c]);b.onclick=()=>{if(S.step==='draw'){S.dc=c;const s=S.strokes[S.dt==='select'?S.tsel:S.esel];if((S.dt==='edit'||S.dt==='select')&&s){push();s.c=c;S.dirty=true}}else S.tc=c;after()};$('#cols').appendChild(b)});
$('#back').onclick=()=>setStep(STEPS[Math.max(0,STEPS.findIndex(x=>x[0]===S.step)-1)][0]);
$('#next2').onclick=()=>setStep(STEPS[Math.min(3,STEPS.findIndex(x=>x[0]===S.step)+1)][0]);
$('#undo').onclick=undoAct;
$('#redo').onclick=redoAct;
$('#clear').onclick=()=>{if(!armed){armed=true;toast('Tap the bin again to clear everything');setTimeout(()=>armed=false,3000);return}armed=false;mut(()=>{S.strokes=[];S.nails=[];S.groups=[];S.threads=[];S.nid=1;S.sel=null;S.dirty=false});toast('Cleared. Undo brings it back.')};
$('#lift').onclick=()=>{S.last=null;draw()};
$('#sp').oninput=e=>{S.sp=+e.target.value;$('#spv').textContent=S.sp};
$('#sp').onchange=()=>{if(S.strokes.length)mut(gen);else after()};
$('#regen').onclick=()=>{if(S.strokes.length)mut(gen)};
$('#jk').oninput=e=>{S.jk=+e.target.value;$('#jkv').textContent=S.jk};
$('#oall').onclick=()=>mut(()=>S.groups.forEach(g=>{CG=g.id;outline(g,g.c)}));
$('#gloop').onclick=()=>{const g=gsel();if(g)mut(()=>outline(g,S.tc))};
$('#gjump').onclick=()=>{const g=gsel();if(!g)return;mut(()=>{const n=g.ids.length,v=S.jk%n||1,seen=new Set();for(let s0=0;s0<n;s0++){if(seen.has(s0))continue;let i=s0;do{seen.add(i);const j=(i+v)%n;addT(g.ids[i],g.ids[j],S.tc);i=j}while(i!==s0)}})};
$('#gmult').onclick=()=>{const g=gsel();if(g)mut(()=>{const n=g.ids.length;for(let i=0;i<n;i++)addT(g.ids[i],g.ids[(i*S.jk)%n],S.tc)})};
$('#grem').onclick=()=>{const g=gsel();if(g)mut(()=>{const s=new Set(g.ids);S.threads=S.threads.filter(t=>!(s.has(t.a)&&s.has(t.b)))})};
$('#bw').onchange=e=>mut(()=>{S.W=Math.max(10,Math.min(100,+e.target.value||40));sizeCanvas()});
$('#bh').onchange=e=>mut(()=>{S.H=Math.max(10,Math.min(100,+e.target.value||40));sizeCanvas()});
['snap','grid','nums','guide'].forEach(k=>$('#'+k).onclick=()=>{S[k]=!S[k];after()});
$('#shot').onclick=()=>{try{const i=$('#img');i.src=cv.toDataURL('image/png');i.style.display='block'}catch(e){}};
$('#bs').oninput=e=>go(+e.target.value);
$('#first').onclick=()=>go(0);$('#last').onclick=()=>go(1e9);$('#prev').onclick=()=>go(S.bs-1);$('#next').onclick=()=>go(S.bs+1);
$('#play').onclick=()=>{if(timer)return stop();$('#play').textContent='Pause';if(S.bs>=TV().length)go(0);timer=setInterval(()=>{if(S.bs>=TV().length)stop();else go(S.bs+1)},70)};
$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText($('#list').value);$('#copy').textContent='Copied'}catch(e){$('#list').select();$('#copy').textContent='Select and copy'}setTimeout(()=>$('#copy').textContent='Copy list',1500)};
function removeNail(n){S.nails=S.nails.filter(x=>x.id!==n.id);S.threads=S.threads.filter(h=>h.a!==n.id&&h.b!==n.id);S.groups.forEach(g=>g.ids=g.ids.filter(i=>i!==n.id));S.groups=S.groups.filter(g=>g.ids.length>1);if(!gsel())S.sel=S.groups.length?S.groups[S.groups.length-1].id:null}
cv.addEventListener('pointerdown',e=>{
 ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});try{cv.setPointerCapture(e.pointerId)}catch(x){}
 if(ptrs.size>=2){e.preventDefault();startGest();return}
 const st=S.step;if(st==='build')return;e.preventDefault();cv.setPointerCapture(e.pointerId);const p=pt(e);
 if(st==='draw'){
  if(S.dt==='curve'||S.dt==='edit'){curveDown(p);return}
  if(S.dt==='lasso'){lassoDown(p);return}
  if(S.dt==='select'){selDown(p);return}
  if(S.dt==='text'){tpos=p;openText();return}
  if(S.dt==='erase'){let bi=-1,bd=26/(sc*VZ);strokes().forEach(s=>{const i=s.src;const P=s.closed?s.pts.concat([s.pts[0]]):s.pts;for(let k=1;k<P.length;k++){const d=segD(p,P[k-1],P[k]);if(d<bd){bd=d;bi=i}}});if(bi>=0){mut(()=>{delGrp(bi);S.esel=null;S.tsel=null;S.asel=null;S.dirty=true});toast('Deleted. Undo brings it back.')}else toast('Nothing there. Tap right on a line.')}
  else if(S.dt==='pen')cur={pts:[p]};else cur={a:p,b:p};
  draw();
 }else if(st==='nails'){
  const n=hitN(p);if(n)readout(n);
  if(S.nt==='add'){const q={x:s5(p.x),y:s5(p.y)};if(!hitN(q,10))mut(()=>{S.nails.push({id:S.nid++,x:r1(q.x),y:r1(q.y)})})}
  else if(S.nt==='move'){if(n)drag={n,moved:false}}
  else if(n)mut(()=>removeNail(n));
 }else{
  if(S.stl==='pick'){const n=hitN(p);if(n){const g=S.groups.find(g=>g.ids.includes(n.id));if(g){S.sel=g.id;after()}}}
  else if(S.stl==='hand'){const n=hitN(p);if(!n)return;if(S.last===null)S.last=n.id;else if(S.last===n.id)S.last=null;else{const a=S.last;mut(()=>{CG=0;addT(a,n.id,S.tc);S.last=n.id})}draw()}
  else{const ix=ixm();let bi=-1,bd=14/(sc*VZ);S.threads.forEach((t,i)=>{const a=S.nails[ix.get(t.a)],b=S.nails[ix.get(t.b)];if(!a||!b)return;const d=segD(p,[a.x,a.y],[b.x,b.y]);if(d<bd){bd=d;bi=i}});if(bi>=0)mut(()=>S.threads.splice(bi,1))}
 }
});
cv.addEventListener('pointermove',e=>{
 if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(gest){moveGest();return}
 const p=pt(e);
 if(xd){selMove(p);return}if(bdrag||edr){curveMove(p);return}
 if(drag){if(!drag.moved){push();drag.moved=true}drag.n.x=r1(s5(p.x));drag.n.y=r1(s5(p.y));draw()}
 else if(cur){if(cur.pts){const l=cur.pts[cur.pts.length-1];if(Math.hypot(p.x-l.x,p.y-l.y)>1.5){cur.pts.push(p);draw()}}else{cur.b=p;draw()}}
});
function up(e){
 if(e&&e.pointerId!==undefined)ptrs.delete(e.pointerId);
 if(gest){if(ptrs.size<2){const g=gest;gest=null;if(g.moved)after();else ui()}return}
 if(xd){if(xd.moved){S.dirty=true;after()}xd=null}
 bdrag=null;if(edr){if(edr.moved)after();edr=null}
 if(drag){if(drag.moved)after();drag=null}
 if(cur){const c=cur;cur=null;const s=c.lasso?lassoStroke(c.pts):c.pts?penStroke(c.pts):mk(S.dt,c.a,c.b);if(s){s.c=S.dc;mut(()=>{S.strokes.push(s);S.tsel=S.strokes.length-1;S.dirty=true})}else draw()}
}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);

let bz=null,bdrag=null,edr=null,pimg=null,lp=[],emap=null;
function flat(s){const a=s.pts,m=a.length,o=[],n=s.closed?m:m-1;for(let i=0;i<n;i++){const p=a[i],q=a[(i+1)%m];for(let t=0;t<16;t++){const u=t/16,v=1-u,A=v*v*v,B=3*v*v*u,C=3*v*u*u,D=u*u*u;o.push([A*p.x+B*(p.x+p.ox)+C*(q.x+q.ix)+D*q.x,A*p.y+B*(p.y+p.oy)+C*(q.y+q.iy)+D*q.y])}}if(!s.closed)o.push([a[m-1].x,a[m-1].y]);return o}
function expand(s,i){
 if(s.h)return[];
 if(s.type!=='bez')return[Object.assign({},s,{src:i})];
 const base=flat(s),x0=S.W*5,y0=S.H*5,n=s.sym||1,out=[];
 for(let k=0;k<n;k++){const a=2*Math.PI*k/n,c=Math.cos(a),d=Math.sin(a);
  for(const m of(s.mir?[1,-1]:[1]))out.push({pts:base.map(p=>{const x=(p[0]-x0)*m,y=p[1]-y0;return[x0+x*c-y*d,y0+x*d+y*c]}),closed:s.closed,curve:true,c:s.c,src:i,type:'bez',name:s.name})}
 return out}
function strokes(){return S.strokes.flatMap(expand)}
function finishCurve(cl){
 if(!bz||bz.pts.length<2){bz=null;draw();return}
 const s={type:'bez',pts:bz.pts,closed:cl&&bz.pts.length>2,sym:S.sym,mir:S.mir,c:S.dc};bz=null;
 mut(()=>{S.strokes.push(s);S.dirty=true;S.esel=S.tsel=S.strokes.length-1;S.asel=null})}
function curveDown(p){
 if(S.dt==='edit'&&S.pm!=='move'&&penEdit(p))return;
 if(S.dt==='curve'){
  if(bz&&bz.pts.length>2&&Math.hypot(p.x-bz.pts[0].x,p.y-bz.pts[0].y)<14/(sc*VZ)){finishCurve(true);return}
  if(!bz)bz={pts:[]};
  const a={x:p.x,y:p.y,ix:0,iy:0,ox:0,oy:0};bz.pts.push(a);bdrag=a;ui();draw();return}
 const s=S.strokes[S.esel];
 if(s&&s.type==='bez'){const r=16/(sc*VZ);
  for(let i=0;i<s.pts.length;i++){const a=s.pts[i];
   for(const h of[['o',a.x+a.ox,a.y+a.oy],['i',a.x+a.ix,a.y+a.iy],['a',a.x,a.y]])
    if((h[0]==='a'||h[1]!==a.x||h[2]!==a.y)&&Math.hypot(p.x-h[1],p.y-h[2])<r){edr={k:h[0],i,moved:false};S.asel=i;draw();return}}}
 let bi=-1,bd=18/(sc*VZ);
 S.strokes.forEach((t,i)=>{if(t.type!=='bez')return;const P=flat(t);for(let k=1;k<P.length;k++){const d=segD(p,P[k-1],P[k]);if(d<bd){bd=d;bi=i}}});
 S.esel=bi>=0?bi:null;S.asel=null;ui();draw()}
function curveMove(p){
 if(bdrag){bdrag.ox=p.x-bdrag.x;bdrag.oy=p.y-bdrag.y;bdrag.ix=-bdrag.ox;bdrag.iy=-bdrag.oy;draw();return}
 const s=S.strokes[S.esel];if(!s||!edr)return;const a=s.pts[edr.i];
 if(!edr.moved){push();edr.moved=true}
 if(edr.k==='a'){a.x=p.x;a.y=p.y}else if(edr.k==='o'){a.ox=p.x-a.x;a.oy=p.y-a.y;a.ix=-a.ox;a.iy=-a.oy}else{a.ix=p.x-a.x;a.iy=p.y-a.y;a.ox=-a.ix;a.oy=-a.iy}
 S.dirty=true;draw()}
function overlay(){
 const ts=S.dt==='select'?S.strokes[S.tsel]:null;
 if(ts){const b=bb(ts),ry=b.y0*sc-48/VZ,h=8/VZ;cx.save();cx.strokeStyle='#4da3ff';cx.fillStyle='#fff';cx.lineWidth=1.6/VZ;cx.setLineDash([5,4]);cx.strokeRect(b.x0*sc,b.y0*sc,(b.x1-b.x0)*sc,(b.y1-b.y0)*sc);cx.setLineDash([]);
  [[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]].forEach(q=>{cx.fillRect(q[0]*sc-h,q[1]*sc-h,2*h,2*h);cx.strokeRect(q[0]*sc-h,q[1]*sc-h,2*h,2*h)});
  cx.beginPath();cx.moveTo(b.cx*sc,b.y0*sc);cx.lineTo(b.cx*sc,ry);cx.stroke();cx.beginPath();cx.arc(b.cx*sc,ry,12/VZ,0,7);cx.fill();cx.stroke();cx.beginPath();cx.arc(b.cx*sc,ry,5/VZ,.6,5.2);cx.stroke();cx.restore()}
 if(lp.length){cx.strokeStyle=S.dc;cx.lineWidth=2;cx.setLineDash([6,4]);strokePath(lp.map(q=>[q.x,q.y]),false);cx.setLineDash([]);lp.forEach((a,i)=>{cx.fillStyle=i?'#fff':'#ffe14d';cx.fillRect(a.x*sc-4,a.y*sc-4,8,8)})}
 const e=S.dt==='edit'?S.strokes[S.esel]:null,q=bz||(e&&e.type==='bez'?e:null);if(!q)return;
 const pts=q.pts;
 if(bz&&pts.length>1){cx.setLineDash([6,4]);cx.strokeStyle=S.dc;cx.lineWidth=2;strokePath(flat({pts,closed:false}),false);cx.setLineDash([])}
 cx.lineWidth=1;
 pts.forEach((a,i)=>{cx.strokeStyle=cx.fillStyle='#4da3ff';
  [[a.x+a.ox,a.y+a.oy],[a.x+a.ix,a.y+a.iy]].forEach(h=>{if(h[0]!==a.x||h[1]!==a.y){cx.beginPath();cx.moveTo(a.x*sc,a.y*sc);cx.lineTo(h[0]*sc,h[1]*sc);cx.stroke();cx.beginPath();cx.arc(h[0]*sc,h[1]*sc,5,0,7);cx.fill()}});
  cx.fillStyle=i===S.asel&&!bz?'#ffe14d':'#fff';cx.fillRect(a.x*sc-5,a.y*sc-5,10,10);cx.strokeRect(a.x*sc-5,a.y*sc-5,10,10)})}
function cen(){const g=S.cm==='shape'&&gsel();if(g){const N=g.ids.map(i=>S.nails.find(n=>n.id===i)).filter(Boolean);if(N.length)return{x:N.reduce((s,n)=>s+n.x,0)/N.length,y:N.reduce((s,n)=>s+n.y,0)/N.length}}return{x:S.W*5,y:S.H*5}}
function polar(n){const c=cen(),dx=n.x-c.x,dy=n.y-c.y;return{a:(Math.atan2(dx,-dy)*180/Math.PI+360)%360,r:Math.hypot(dx,dy)/10}}
function readout(n){const q=polar(n);$('#ro').textContent='Nail '+(S.nails.indexOf(n)+1)+': '+q.a.toFixed(1)+'° from top, '+q.r.toFixed(1)+' cm from centre'}
function prot(){
 const c=cen(),R=Math.hypot(S.W,S.H)*10,rr=Math.min(S.W,S.H)*5*.97;
 cx.save();cx.strokeStyle='#78c8ff';cx.fillStyle='#a0d7ff';cx.lineWidth=1;cx.font='9px -apple-system,sans-serif';cx.textAlign='center';cx.textBaseline='middle';
 for(let a=0;a<360;a+=10){const t=a*Math.PI/180,s=Math.sin(t),k=-Math.cos(t);cx.globalAlpha=a%30?.2:.5;cx.beginPath();cx.moveTo(c.x*sc,c.y*sc);cx.lineTo((c.x+s*R)*sc,(c.y+k*R)*sc);cx.stroke();cx.globalAlpha=1;if(a%30===0)cx.fillText(a+'°',(c.x+s*rr)*sc,(c.y+k*rr)*sc)}
 cx.globalAlpha=.3;[.25,.5,.75,1].forEach(f=>{cx.beginPath();cx.arc(c.x*sc,c.y*sc,rr*f*sc,0,7);cx.stroke()});cx.restore()}
function ui2(){
 const cv_=S.step==='draw'&&(S.dt==='curve'||S.dt==='edit');
 $('#pcurve').hidden=!cv_;$('#pdel').hidden=$('#pdelc').hidden=S.dt!=='edit';$('#bdone').hidden=$('#bclose').hidden=S.dt!=='curve';
 $('#symv').textContent=S.sym===1?'off':S.sym+'-fold';$('#sym').value=S.sym;$('#mir').classList.toggle('on',S.mir);
 $('#ro').hidden=S.step!=='nails';
 $('#cmb').textContent='Angles from: '+(S.cm==='shape'?'selected shape':'board centre');$('#protb').classList.toggle('on',S.prot);
 
 const dr=S.step==='draw';$('#plasso').hidden=!(dr&&S.dt==='lasso');$('#lfin').hidden=S.lm!=='poly';
 document.querySelectorAll('#bgs .sw').forEach(b=>b.classList.toggle('on',b.dataset.bg===S.bg));const bgi=document.querySelector('#bgc');if(bgi&&/^#[0-9a-f]{6}$/i.test(S.bg))bgi.value=S.bg;
 $('#lsv').textContent=S.ls;$('#lsm').hidden=$('#lsv').parentElement.hidden=S.lm!=='free';
 document.querySelectorAll('#dt .b').forEach(b=>{const k=b.dataset.t;let on=false;if(k==='pengrp'){on=['curve','pen','edit'].includes(S.dt);const q=PL[S.dt==='edit'?'edit:'+S.pm:S.dt]||PL.curve;b.innerHTML=ico(q[0])+'<span>'+q[1]+'</span>'}else if(k==='lasso'){on=S.dt==='lasso';b.innerHTML=ico(S.lm==='poly'?'poly':'lasso')+'<span>'+(LL[S.lm]||'Lasso')+'</span>'}else on=k===S.dt;b.classList.toggle('on',on)});
 if(dr&&S.dt==='lasso')$('#hint').textContent={free:'Draw around the shape you want. It closes itself when you lift your finger.',smooth:'Draw loosely around a shape. The outline is rounded for you.',poly:'Tap each corner. Tap the first corner, or press Close shape, to finish.'}[S.lm]||'';$('#lsm').value=S.ls;
 document.querySelectorAll('#lm .b').forEach(b=>b.classList.toggle('on',b.dataset.l===S.lm));
 document.querySelectorAll('#pm .b').forEach(b=>b.classList.toggle('on',b.dataset.p===S.pm));
 if(dr&&S.dt==='edit')$('#hint').textContent={move:'Tap a curve to select it, then drag its white points or blue handles.',add:'Select a curve, then tap on its line to add a point.',del:'Select a curve, then tap a point to delete it.',conv:'Select a curve, then tap a point to switch it between sharp corner and smooth.'}[S.pm];
}
$('#sym').oninput=e=>{S.sym=+e.target.value;const s=S.strokes[S.esel];if(S.dt==='edit'&&s&&s.type==='bez'){s.sym=S.sym;S.dirty=true}after()};
$('#mir').onclick=()=>{S.mir=!S.mir;const s=S.strokes[S.esel];if(S.dt==='edit'&&s&&s.type==='bez'){s.mir=S.mir;S.dirty=true}after()};
$('#bdone').onclick=()=>finishCurve(false);$('#bclose').onclick=()=>finishCurve(true);
$('#pdel').onclick=()=>{const s=S.strokes[S.esel];if(s&&s.type==='bez'&&S.asel!==null&&s.pts.length>2)mut(()=>{s.pts.splice(S.asel,1);S.asel=null;S.dirty=true})};
$('#cmb').onclick=()=>{S.cm=S.cm==='shape'?'board':'shape';after()};$('#protb').onclick=()=>{S.prot=!S.prot;after()};

let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),1900)}
function undoAct(){
 if(S.step==='build')return;
 if(bz){bz.pts.pop();if(!bz.pts.length)bz=null;ui();draw();toast('Removed last point');return}
 if(!hist.length)return;fut.push(snapDoc());restore(hist.pop());toast('Undone')}
function redoAct(){if(S.step==='build'||!fut.length)return;hist.push(snapDoc());restore(fut.pop());toast('Redone')}
$('#delt').onclick=()=>{if(!S.threads.length)return toast('No threads to remove');mut(()=>{S.threads=[]});toast('All threads removed. Undo brings them back.')};
$('#deln').onclick=()=>{if(!S.nails.length)return toast('No nails to remove');mut(()=>{S.nails=[];S.groups=[];S.threads=[];S.sel=null;S.nid=1});toast('All nails removed. Undo brings them back.')};
$('#pdelc').onclick=()=>{const c=S.strokes[S.esel];if(!c)return toast('Select a curve first');mut(()=>{S.strokes.splice(S.esel,1);S.esel=null;S.asel=null;S.dirty=true});toast('Curve deleted')};
$('#psave').onclick=async()=>{try{const txt=JSON.stringify(pick(S,PERSIST)),f=new File([txt],'string-art-project.json',{type:'application/json'});
 if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});return}
 const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();a.remove();toast('Project saved to your downloads')}catch(e){if(e&&e.name!=='AbortError')toast('Saving is not available here')}};
$('#popen').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!Array.isArray(o.nails)||!Array.isArray(o.threads))throw 0;push();Object.assign(S,o);S.last=null;S.esel=null;bz=null;sizeCanvas();after();toast('Project opened')}catch(x){toast('That file is not a project')}};r.readAsText(f)};

function smooth(pts,n){for(let k=0;k<n;k++){const q=pts;pts=q.map((p,i)=>i&&i<q.length-1?[(q[i-1][0]+p[0]+q[i+1][0])/3,(q[i-1][1]+p[1]+q[i+1][1])/3]:p)}return pts}
function lassoDown(p){
 if(S.lm==='poly'){if(lp.length>2&&Math.hypot(p.x-lp[0].x,p.y-lp[0].y)<14/(sc*VZ)){lassoFinish();return}lp.push(p);draw();return}
  cur={pts:[p],lasso:true};draw()}
function lassoFinish(){
 if(lp.length<3){lp=[];draw();return}
 const s={type:'lasso',pts:lp.map(q=>[q.x,q.y]),closed:true,curve:false,c:S.dc};lp=[];
 mut(()=>{S.strokes.push(s);S.dirty=true});toast('Shape added')}
function lassoStroke(P){
 let len=0;for(let i=1;i<P.length;i++)len+=Math.hypot(P[i].x-P[i-1].x,P[i].y-P[i-1].y);
 if(len<20){toast('Draw a bigger loop');return null}
 const pts=smooth(P.map(p=>[p.x,p.y]),S.lm==='smooth'?6:S.ls),f=pts[0],l=pts[pts.length-1];
 if(Math.hypot(f[0]-l[0],f[1]-l[1])<2)pts.pop();
 return{type:'lasso',pts,closed:true,curve:true}}
function split(s,i,u){
 const a=s.pts,m=a.length,p=a[i],q=a[(i+1)%m],L=(x,y)=>x+(y-x)*u,X1=p.x+p.ox,Y1=p.y+p.oy,X2=q.x+q.ix,Y2=q.y+q.iy;
 const ax=L(p.x,X1),ay=L(p.y,Y1),bx=L(X1,X2),by=L(Y1,Y2),cx_=L(X2,q.x),cy_=L(Y2,q.y),dx=L(ax,bx),dy=L(ay,by),ex=L(bx,cx_),ey=L(by,cy_),sx=L(dx,ex),sy=L(dy,ey);
 p.ox=ax-p.x;p.oy=ay-p.y;q.ix=cx_-q.x;q.iy=cy_-q.y;
 a.splice(i+1,0,{x:sx,y:sy,ix:dx-sx,iy:dy-sy,ox:ex-sx,oy:ey-sy});S.dirty=true;S.asel=i+1}
function penEdit(p){
 const s=S.strokes[S.esel];if(!s||s.type!=='bez')return false;
 const a=s.pts,r=16/(sc*VZ);let hi=-1;a.forEach((q,i)=>{if(Math.hypot(p.x-q.x,p.y-q.y)<r)hi=i});
 if(S.pm==='del'){if(hi<0)return false;if(a.length<=2){toast('A curve needs at least 2 points');return true}mut(()=>{a.splice(hi,1);S.asel=null;S.dirty=true});return true}
 if(S.pm==='conv'){if(hi<0)return false;mut(()=>{const q=a[hi];if(q.ox||q.oy||q.ix||q.iy){q.ox=q.oy=q.ix=q.iy=0}else{const m=a.length,pv=a[(hi+m-1)%m],nx=a[(hi+1)%m],tx=(nx.x-pv.x)/5,ty=(nx.y-pv.y)/5;q.ox=tx;q.oy=ty;q.ix=-tx;q.iy=-ty}S.dirty=true});return true}
 if(S.pm==='add'){
  const P=flat(s),m=a.length;let bi=-1,bd=18/(sc*VZ);
  for(let k=1;k<P.length;k++){const d=segD(p,P[k-1],P[k]);if(d<bd){bd=d;bi=k-1}}
  if(bi<0)return false;
  const i=Math.min(Math.floor(bi/16),(s.closed?m:m-1)-1),u=((bi%16)+.5)/16;mut(()=>split(s,i,u));return true}
 return false}
$('#lsm').oninput=e=>{S.ls=+e.target.value;ui2()};$('#lfin').onclick=lassoFinish;
$('#undo').innerHTML=ico('undo');$('#redo').innerHTML=ico('redo');$('#clear').innerHTML=ico('trash');
(function(){const n=24,P=[];for(let i=0;i<n;i++){const a=2*Math.PI*i/n;P.push([12+9*Math.sin(a),12-9*Math.cos(a)])}let d='';for(let i=0;i<n;i++){const q=P[(i*5)%n];d+='M'+P[i][0].toFixed(1)+' '+P[i][1].toFixed(1)+'L'+q[0].toFixed(1)+' '+q[1].toFixed(1)}$('#logo').innerHTML='<path d="'+d+'" stroke="#ffb300" stroke-width=".7" fill="none"/><circle cx="12" cy="12" r="9.3" stroke="#fff" stroke-width=".6" fill="none"/>'})();

const PL={curve:['curve','Pen'],pen:['pen','Freeform'],'edit:move':['edit','Select'],'edit:add':['add','Add point'],'edit:del':['remove','Delete pt'],'edit:conv':['conv','Convert']},LL={free:'Lasso',smooth:'Smooth',poly:'Polygon'};
const MENU={pengrp:{t:'Pen tools',items:[['curve','curve','Pen Tool','Tap for corners, drag for smooth curves'],['pen','pen','Freeform Pen','Draw freely with your finger'],['edit:move','edit','Direct Selection','Move points and handles'],['edit:add','add','Add Anchor Point','Tap a selected curve to add a point'],['edit:del','remove','Delete Anchor Point','Tap a point to remove it'],['edit:conv','conv','Convert Point','Switch a point between corner and smooth']]},
 lasso:{t:'Lasso tools',items:[['free','lasso','Freehand Lasso','Draw around a shape'],['smooth','lasso','Smooth Lasso','Draw loosely, edges are rounded'],['poly','poly','Polygonal Lasso','Tap corners, tap the first to close']]}};
function isCur(g,v){if(g==='lasso')return S.dt==='lasso'&&S.lm===v;if(v==='curve'||v==='pen')return S.dt===v;return S.dt==='edit'&&S.pm===v.slice(5)}
function openMenu(g){const m=MENU[g],box=$('#sit');$('#stt').textContent=m.t;box.innerHTML='';
 m.items.forEach(it=>{const b=document.createElement('button');b.className='mi';b.innerHTML=ico(it[1])+'<span><b>'+it[2]+'</b><small>'+it[3]+'</small></span>'+(isCur(g,it[0])?'<i>✓</i>':'');b.onclick=()=>pickMenu(g,it[0]);box.appendChild(b)});
 $('#sheet').hidden=false}
function pickMenu(g,v){$('#sheet').hidden=true;if(bz)finishCurve(false);lp=[];cur=null;S.last=null;
 if(g==='lasso'){S.dt='lasso';S.lm=v}else if(v.indexOf('edit:')===0){S.dt='edit';S.pm=v.slice(5)}else S.dt=v;after()}
$('#sbk').onclick=$('#scn').onclick=()=>{$('#sheet').hidden=true};

let xd=null;
function bb1(s){const P=s.type==='bez'?flat(s):s.pts;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;P.forEach(q=>{x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])});return{x0,y0,x1,y1,cx:(x0+x1)/2,cy:(y0+y1)/2}}
function xf1(s,fn,lin){
 if(s.type==='bez')s.pts.forEach(a=>{const p=fn(a.x,a.y);a.x=p[0];a.y=p[1];let v=lin(a.ox,a.oy);a.ox=v[0];a.oy=v[1];v=lin(a.ix,a.iy);a.ix=v[0];a.iy=v[1]});
 else s.pts=s.pts.map(q=>fn(q[0],q[1]))}
function aff(s,T){const co=Math.cos(T.a),si=Math.sin(T.a),c=T.c;xf(s,(x,y)=>{const dx=x-c.x,dy=y-c.y;return[c.x+T.f*(dx*co-dy*si)+T.tx,c.y+T.f*(dx*si+dy*co)+T.ty]},(x,y)=>[T.f*(x*co-y*si),T.f*(x*si+y*co)])}
function selDown(p){
 const s=S.strokes[S.tsel],r=22/(sc*VZ);
 if(s){const b=bb(s);
  if(Math.hypot(p.x-b.cx,p.y-(b.y0-48/(sc*VZ)))<r){xd={m:'rot',c:{x:b.cx,y:b.cy},a:Math.atan2(p.y-b.cy,p.x-b.cx)};return}
  if([[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]].some(q=>Math.hypot(p.x-q[0],p.y-q[1])<r)){xd={m:'sc',c:{x:b.cx,y:b.cy},d:Math.hypot(p.x-b.cx,p.y-b.cy)||1};return}}
 let bi=-1,bd=20/(sc*VZ);
 strokes().forEach(e=>{const P=e.closed?e.pts.concat([e.pts[0]]):e.pts;for(let k=1;k<P.length;k++){const d=segD(p,P[k-1],P[k]);if(d<bd){bd=d;bi=e.src}}});
 if(bi>=0&&bi!==S.tsel){S.tsel=bi;S.esel=null;xd={m:'mv',l:p};ui();draw();return}
 if(s){const b=bb(s),m=8/(sc*VZ);if(p.x>=b.x0-m&&p.x<=b.x1+m&&p.y>=b.y0-m&&p.y<=b.y1+m){xd=S.rotm?{m:'rot',c:{x:b.cx,y:b.cy},a:Math.atan2(p.y-b.cy,p.x-b.cx)}:{m:'mv',l:p};return}}
 S.tsel=null;ui();draw()}
function selMove(p){
 const s=S.strokes[S.tsel];if(!s)return;
 if(!xd.moved){push();xd.moved=true}
 let T;
 if(xd.m==='mv'){T={a:0,f:1,tx:p.x-xd.l.x,ty:p.y-xd.l.y,c:{x:0,y:0}};xd.l=p}
 else if(xd.m==='rot'){const a=Math.atan2(p.y-xd.c.y,p.x-xd.c.x);let da=a-xd.a;if(da>Math.PI)da-=2*Math.PI;if(da<-Math.PI)da+=2*Math.PI;T={a:da,f:1,tx:0,ty:0,c:xd.c};xd.a=a;xd.tot=(xd.tot||0)+da;toast(Math.round(xd.tot*180/Math.PI)+'°')}
 else{const d=Math.hypot(p.x-xd.c.x,p.y-xd.c.y)||1;T={a:0,f:Math.max(.2,Math.min(5,d/xd.d)),tx:0,ty:0,c:xd.c};xd.d=d}
 aff(s,T);draw()}
function barPos(){
 const el=$('#sbar'),s=S.step==='draw'&&S.dt==='select'?S.strokes[S.tsel]:null;
 if(!s||(xd&&xd.moved)){el.hidden=true;return}
 const b=bb(s),r=cv.getBoundingClientRect();el.hidden=false;
 const w=el.offsetWidth||280,y=r.top+VY+b.y0*sc*VZ-120;
 el.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+VX+b.cx*sc*VZ-w/2))+'px';
 el.style.top=(y<56?r.top+VY+b.y1*sc*VZ+18:y)+'px'}
const SB=[['dup','dup','Duplicate'],['flh','flh','Flip ↔'],['flv','flv','Flip ↕'],['rotm','rotm','Free rotate'],['r90','r90','Rotate 90°'],['del','trash','Delete']];
SB.forEach(([k,ic,n])=>{const b=document.createElement('button');b.innerHTML=ico(ic)+'<span>'+n+'</span>';b.onclick=()=>{
 const s=S.strokes[S.tsel];if(!s)return;
 if(k==='rotm'){b.classList.toggle('on',S.rotm=!S.rotm);toast(S.rotm?'Free rotate on. Drag around the shape.':'Free rotate off');return}
 if(k==='dup')mut(()=>{const L=grp_(s),nl=s.lid?'t'+Date.now():undefined,f=S.strokes.length;L.forEach(t=>{const c=JSON.parse(JSON.stringify(t));if(nl)c.lid=nl;xf1(c,(x,y)=>[x+12,y+12],(x,y)=>[x,y]);S.strokes.push(c)});S.tsel=f;S.dirty=true});
 else if(k==='del'){mut(()=>{delGrp(S.tsel);S.tsel=null;S.esel=null;S.dirty=true});toast('Deleted. Undo brings it back.')}
 else mut(()=>{const b=bb(s);if(k==='flh')xf(s,(x,y)=>[2*b.cx-x,y],(x,y)=>[-x,y]);else if(k==='flv')xf(s,(x,y)=>[x,2*b.cy-y],(x,y)=>[x,-y]);else aff(s,{a:Math.PI/2,f:1,tx:0,ty:0,c:{x:b.cx,y:b.cy}});S.dirty=true})};$('#sbar').appendChild(b)});
addEventListener('scroll',barPos,true);

let VZ=1,VX=0,VY=0,ptrs=new Map(),gest=null;
function clampView(){const m=.7;VX=Math.max(-VZ*CW*m,Math.min(CW*m,VX));VY=Math.max(-VZ*CH*m,Math.min(CH*m,VY));if(Math.abs(VZ-1)<.001){VZ=1;VX=VY=0}}
function zl(){$('#zl').textContent=Math.round(VZ*100)+'%'}
function startGest(){
 cur=null;xd=null;bdrag=null;edr=null;drag=null;lp=lp;
 const a=[...ptrs.values()],r=cv.getBoundingClientRect();
 gest={d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1,a:Math.atan2(a[1].y-a[0].y,a[1].x-a[0].x),x:(a[0].x+a[1].x)/2-r.left,y:(a[0].y+a[1].y)/2-r.top,moved:false,shape:S.step==='draw'&&S.dt==='select'&&!!S.strokes[S.tsel]};
 draw()}
function moveGest(){
 const a=[...ptrs.values()];if(a.length<2||!gest)return;const r=cv.getBoundingClientRect();
 const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1,an=Math.atan2(a[1].y-a[0].y,a[1].x-a[0].x),x=(a[0].x+a[1].x)/2-r.left,y=(a[0].y+a[1].y)/2-r.top,f=d/gest.d;
 let da=an-gest.a;if(da>Math.PI)da-=2*Math.PI;if(da<-Math.PI)da+=2*Math.PI;
 if(gest.shape){
  const s=S.strokes[S.tsel];if(!s){gest=null;return}
  if(!gest.moved){push();gest.moved=true}
  const b=bb(s),k=sc*VZ;aff(s,{a:da,f:Math.max(.5,Math.min(2,f)),tx:(x-gest.x)/k,ty:(y-gest.y)/k,c:{x:b.cx,y:b.cy}});S.dirty=true;gest.tot=(gest.tot||0)+da;toast(Math.round(gest.tot*180/Math.PI)+'°')}
 else{const nz=Math.max(.5,Math.min(8,VZ*f));VX=x-(gest.x-VX)/VZ*nz;VY=y-(gest.y-VY)/VZ*nz;VZ=nz;clampView();zl()}
 gest.d=d;gest.a=an;gest.x=x;gest.y=y;draw()}
function zoomBy(f){const k=Math.max(.5,Math.min(8,VZ*f)),x=CW/2,y=CH/2;VX=x-(x-VX)/VZ*k;VY=y-(y-VY)/VZ*k;VZ=k;clampView();zl();draw()}
$('#zin').onclick=()=>zoomBy(1.25);$('#zout').onclick=()=>zoomBy(.8);$('#zfit').onclick=()=>{VZ=1;VX=VY=0;zl();draw()};
document.addEventListener('gesturestart',e=>e.preventDefault());

let tpos={x:200,y:200};
const FONTS=[
{k:'dev',n:'Kohinoor Devanagari',f:'"Kohinoor Devanagari","Noto Sans Devanagari","Nirmala UI",sans-serif'},
{k:'dev',n:'Devanagari Sangam',f:'"Devanagari Sangam MN","Noto Sans Devanagari","Mangal",sans-serif'},
{k:'dev',n:'ITF Devanagari',f:'"ITF Devanagari","Kohinoor Devanagari","Noto Sans Devanagari",sans-serif'},
{k:'dev',n:'Serif (Sanskrit style)',f:'"Noto Serif Devanagari","Devanagari Sangam MN","Kohinoor Devanagari",serif'},
{k:'guj',n:'Kohinoor Gujarati',f:'"Kohinoor Gujarati","Noto Sans Gujarati","Nirmala UI",sans-serif'},
{k:'guj',n:'Gujarati Sangam',f:'"Gujarati Sangam MN","Noto Sans Gujarati","Shruti",sans-serif'},
{k:'en',n:'Helvetica Neue',f:'"Helvetica Neue",Arial,sans-serif'},{k:'en',n:'Georgia',f:'Georgia,serif'},{k:'en',n:'Times',f:'"Times New Roman",serif'},
{k:'en',n:'Snell Roundhand (script)',f:'"Snell Roundhand","Brush Script MT",cursive'},{k:'en',n:'Marker Felt',f:'"Marker Felt","Comic Sans MS",fantasy'},
{k:'en',n:'American Typewriter',f:'"American Typewriter","Courier New",monospace'},{k:'en',n:'Zapfino',f:'Zapfino,"Brush Script MT",cursive'}];
const SCR={dev:['Hindi / Sanskrit','ॐ नमः शिवाय'],guj:['Gujarati','જય શ્રી કૃષ્ણ'],en:['English','Aa String Art']};
const grp_=s=>s.lid?S.strokes.filter(t=>t.lid===s.lid):[s];
function bb(s){const L=grp_(s).map(bb1);const x0=Math.min(...L.map(b=>b.x0)),y0=Math.min(...L.map(b=>b.y0)),x1=Math.max(...L.map(b=>b.x1)),y1=Math.max(...L.map(b=>b.y1));return{x0,y0,x1,y1,cx:(x0+x1)/2,cy:(y0+y1)/2}}
function xf(s,fn,lin){grp_(s).forEach(t=>xf1(t,fn,lin))}
function delGrp(i){const s=S.strokes[i];if(!s)return;if(s.lid)S.strokes=S.strokes.filter(t=>t.lid!==s.lid);else S.strokes.splice(i,1)}
function marching(m,W,H){
 const E=[],ends=new Map(),key=(X,Y)=>X*65536+Y;
 const add=(p,q)=>{const i=E.length;E.push([p,q]);[p,q].forEach(k=>{if(!ends.has(k))ends.set(k,[]);ends.get(k).push(i)})};
 for(let y=0;y<H-1;y++)for(let x=0;x<W-1;x++){
  const idx=m[y*W+x]*8+m[y*W+x+1]*4+m[(y+1)*W+x+1]*2+m[(y+1)*W+x];if(idx===0||idx===15)continue;
  const T=key(2*x+1,2*y),R=key(2*x+2,2*y+1),B=key(2*x+1,2*y+2),L=key(2*x,2*y+1);
  switch(idx){case 1:case 14:add(L,B);break;case 2:case 13:add(B,R);break;case 3:case 12:add(L,R);break;case 4:case 11:add(T,R);break;case 5:add(T,L);add(B,R);break;case 6:case 9:add(T,B);break;case 7:case 8:add(T,L);break;case 10:add(T,R);add(L,B)}}
 const used=new Uint8Array(E.length),loops=[];
 for(let i=0;i<E.length;i++){if(used[i])continue;used[i]=1;const P=[E[i][0],E[i][1]],st=E[i][0];let c=E[i][1];
  while(c!==st){const nx=(ends.get(c)||[]).find(j=>!used[j]);if(nx===undefined)break;used[nx]=1;c=E[nx][0]===c?E[nx][1]:E[nx][0];if(c!==st)P.push(c)}
  loops.push(P.map(k=>[Math.floor(k/65536)/2,(k%65536)/2]))}
 return loops}
function rdp(P,e){
 if(P.length<3)return P;const keep=new Uint8Array(P.length);keep[0]=keep[P.length-1]=1;const st=[[0,P.length-1]];
 while(st.length){const[a,b]=st.pop(),A=P[a],B=P[b],dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy)||1e-9;let md=0,mi=-1;
  for(let i=a+1;i<b;i++){const d=Math.abs((P[i][0]-A[0])*dy-(P[i][1]-A[1])*dx)/l;if(d>md){md=d;mi=i}}
  if(md>e&&mi>0){keep[mi]=1;st.push([a,mi],[mi,b])}}
 return P.filter((_,i)=>keep[i])}
function rdpClosed(L,e){const n=L.length;let f=0,md=-1;for(let i=1;i<n;i++){const d=Math.hypot(L[i][0]-L[0][0],L[i][1]-L[0][1]);if(d>md){md=d;f=i}}
 return rdp(L.slice(0,f+1),e).concat(rdp(L.slice(f).concat([L[0]]),e).slice(1,-1))}
function textContours(txt,fam,bold,hcm){
 const lines=txt.split('\n'),c=document.createElement('canvas'),g=c.getContext('2d'),wt=bold?'700 ':'400 ';
 let px=120;g.font=wt+px+'px '+fam;let mw=Math.max(...lines.map(l=>g.measureText(l).width));
 if(mw>2600){px=Math.floor(px*2600/mw);g.font=wt+px+'px '+fam;mw=Math.max(...lines.map(l=>g.measureText(l).width))}
 const lh=px*1.5,W=Math.ceil(mw+px),H=Math.ceil(lines.length*lh+px*.6);
 c.width=W;c.height=H;g.fillStyle='#fff';g.fillRect(0,0,W,H);g.fillStyle='#000';g.font=wt+px+'px '+fam;g.textAlign='center';g.textBaseline='middle';
 lines.forEach((l,i)=>g.fillText(l,W/2,px*.3+lh*(i+.5)));
 const d=g.getImageData(0,0,W,H).data,m=new Uint8Array(W*H);for(let i=0;i<W*H;i++)m[i]=d[4*i]<140?1:0;
 const k=hcm*10/px,out=[];
 marching(m,W,H).forEach(L=>{if(L.length<4)return;const Q=rdpClosed(L,1.1);if(Q.length<3)return;let ar=0;for(let i=0;i<Q.length;i++){const a=Q[i],b=Q[(i+1)%Q.length];ar+=a[0]*b[1]-b[0]*a[1]}if(Math.abs(ar/2)<px*px*.0012)return;out.push(Q.map(p=>[(p[0]-W/2)*k,(p[1]-H/2)*k]))});
 return out}
function fontList(){return FONTS.filter(f=>f.k===S.tsc)}
function renderText(){
 const t=$('#ttx'),fl=fontList(),f=fl[Math.min(S.tf,fl.length-1)];
 document.querySelectorAll('#tsc .b').forEach(b=>b.classList.toggle('on',b.dataset.k===S.tsc));
 t.style.fontFamily=f.f;t.style.fontWeight=S.tbd?'700':'400';t.placeholder=SCR[S.tsc][1];
 const box=$('#tfonts');box.innerHTML='';
 fl.forEach((x,i)=>{const b=document.createElement('button');b.className='b fb'+(i===S.tf?' on':'');b.style.fontFamily=x.f;b.style.fontWeight=S.tbd?'700':'400';b.innerHTML=SCR[S.tsc][1]+'<small>'+x.n+'</small>';b.onclick=()=>{S.tf=i;save();renderText()};box.appendChild(b)});
 $('#tszv').textContent=S.tsz;$('#tsz').value=S.tsz;$('#tbd').classList.toggle('on',S.tbd)}
function openText(){if(!['dev','guj','en'].includes(S.tsc))S.tsc='dev';renderText();$('#tsheet').hidden=false;setTimeout(()=>{try{$('#ttx').focus()}catch(e){}},50)}
Object.keys(SCR).forEach(k=>{const b=document.createElement('button');b.className='b';b.dataset.k=k;b.textContent=SCR[k][0];b.onclick=()=>{S.tsc=k;S.tf=0;save();renderText()};$('#tsc').appendChild(b)});
$('#tsz').oninput=e=>{S.tsz=+e.target.value;$('#tszv').textContent=S.tsz};
$('#tbd').onclick=()=>{S.tbd=!S.tbd;save();renderText()};
$('#tbk').onclick=$('#tcan').onclick=()=>{$('#tsheet').hidden=true};
$('#tadd').onclick=()=>{
 const txt=$('#ttx').value.trim();if(!txt){toast('Type some text first');return}
 const fl=fontList(),f=fl[Math.min(S.tf,fl.length-1)];let cs=[];
 try{cs=textContours(txt,f.f,S.tbd,S.tsz)}catch(e){}
 if(!cs.length){toast('Could not make that text. Try another font.');return}
 const lid='t'+Date.now(),nm='Text: '+txt.replace(/\n/g,' ').slice(0,14),c=S.dc;
 mut(()=>{cs.forEach(P=>S.strokes.push({type:'text',pts:P.map(q=>[q[0]+tpos.x,q[1]+tpos.y]),closed:true,curve:false,c,lid,name:nm}));S.tsel=S.strokes.length-cs.length;S.dirty=true});
 $('#tsheet').hidden=true;$('#ttx').value='';S.dt='select';after();toast('Text added. Drag it to move, or use the corner and round handles.')};
// ---- layers
function tog(k,v){const a=S[k]||(S[k]=[]),i=a.indexOf(v);if(i<0)a.push(v);else a.splice(i,1);save();ui();draw();renderLayers()}
function renderLayers(){
 const B=$('#lbody');B.innerHTML='';
 const sec=t=>{const d=document.createElement('div');d.className='ls';d.textContent=t;B.appendChild(d)};
 const row=(name,dot,hid,sel,eye,pick,del)=>{
  const r=document.createElement('div');r.className='lr'+(sel?' on':'');
  const e=document.createElement('button');e.className='ib';e.innerHTML=ico(hid?'eyeoff':'eye');e.setAttribute('aria-label',hid?'Show':'Hide');e.onclick=eye;
  const d=document.createElement('span');d.className='dot';d.style.background=dot;
  const n=document.createElement('button');n.className='nm';n.textContent=name;n.onclick=pick;
  r.appendChild(e);r.appendChild(d);r.appendChild(n);
  if(del){const x=document.createElement('button');x.className='ib';x.innerHTML=ico('trash');x.setAttribute('aria-label','Delete');x.onclick=del;r.appendChild(x)}
  B.appendChild(r)};
 sec('Drawing (top layer first)');
 const seen=new Set(),cnt={},items=[];
 S.strokes.forEach((s,i)=>{const k=s.lid||('i'+i);if(seen.has(k))return;seen.add(k);cnt[s.type]=(cnt[s.type]||0)+1;items.push({s,i,n:s.name||((LBL[s.type]||s.type)+' '+cnt[s.type])})});
 if(!items.length){const d=document.createElement('div');d.className='hint';d.textContent='Nothing drawn yet.';B.appendChild(d)}
 items.slice().reverse().forEach(it=>row(it.n,it.s.c,!!it.s.h,S.tsel===it.i,
  ()=>{mut(()=>{const h=!it.s.h;grp_(it.s).forEach(t=>t.h=h);if(S.tsel===it.i)S.tsel=null;S.dirty=true});renderLayers()},
  ()=>{$('#lsheet').hidden=true;S.dt='select';S.tsel=it.i;if(S.step!=='draw')setStep('draw');else after()},
  ()=>{mut(()=>{delGrp(it.i);S.tsel=null;S.esel=null;S.dirty=true});renderLayers()}));
 if(S.groups.length){sec('Shape patterns (strings)');
  S.groups.forEach(g=>{const n=S.threads.filter(t=>t.g===g.id).length;row(g.n+' '+g.id+' · '+n+' threads',g.c,(S.hg||[]).includes(g.id),S.sel===g.id&&S.step==='strings',()=>tog('hg',g.id),()=>{S.sel=g.id;S.stl='pick';$('#lsheet').hidden=true;if(S.step!=='strings')setStep('strings');else after()})})}
 const cols=[...new Set(S.threads.map(t=>t.c))];
 if(cols.length){sec('String colors');cols.forEach(c=>row((CN[c]||c)+' · '+S.threads.filter(t=>t.c===c).length+' threads',c,(S.hc||[]).includes(c),false,()=>tog('hc',c),()=>tog('hc',c)))}}
$('#lyr').innerHTML=ico('layers');$('#lyr').onclick=()=>{renderLayers();$('#lsheet').hidden=false};
$('#lbk').onclick=$('#lcl').onclick=()=>{$('#lsheet').hidden=true};
$('#lall').onclick=()=>{S.hc=[];S.hg=[];mut(()=>{S.strokes.forEach(t=>t.h=false);S.dirty=true});renderLayers()};

const BGS=[['#0c0b0a','Black'],['#2f2f33','Charcoal'],['#1c2438','Midnight'],['#14301f','Forest'],['#3a1218','Wine'],['#4a3220','Walnut'],['#e9dfcb','Cream'],['#f5f5f5','White']];
function LB(){const h=(S.bg||'#0c0b0a').replace('#','');return .299*parseInt(h.slice(0,2),16)+.587*parseInt(h.slice(2,4),16)+.114*parseInt(h.slice(4,6),16)>150}
function setBg(c){S.bg=c;if(LB()){if(S.dc==='#ffffff')S.dc='#111111';if(S.tc==='#ffffff')S.tc='#111111'}else{if(S.dc==='#111111')S.dc='#ffffff';if(S.tc==='#111111')S.tc='#ffffff'}after()}
BGS.forEach(([c,n])=>{const b=document.createElement('button');b.className='b sw';b.dataset.bg=c;b.style.background=c;b.setAttribute('aria-label',n);b.onclick=()=>setBg(c);$('#bgs').appendChild(b)});
{const i=document.createElement('input');i.type='color';i.id='bgc';i.setAttribute('aria-label','Custom board color');i.style.cssText='width:44px;height:34px;border:0;background:none;padding:0';i.onchange=e=>setBg(e.target.value);$('#bgs').appendChild(i)}
const PK='ssd-proj-';
function plist(){const a=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf(PK)===0){const p=JSON.parse(localStorage.getItem(k));a.push({k,n:p.n,t:p.t,th:p.th})}}}catch(e){}return a.sort((x,y)=>y.t-x.t)}
function thumb(){try{const c=document.createElement('canvas'),w=120,h=Math.round(120*CH/CW);c.width=w;c.height=h;c.getContext('2d').drawImage(cv,0,0,w,h);return c.toDataURL('image/jpeg',.6)}catch(e){return ''}}
function renderProjects(){
 const B=$('#plist');B.innerHTML='';const L=plist();
 if(!L.length){const d=document.createElement('div');d.className='hint';d.textContent='No saved designs yet. Your current work is also saved automatically on this device.';B.appendChild(d)}
 L.forEach(p=>{const r=document.createElement('div');r.className='pr';
  const im=document.createElement('img');im.alt='';if(p.th)im.src=p.th;
  const n=document.createElement('div');n.className='nm';n.innerHTML='<b></b><small></small>';n.firstChild.textContent=p.n;n.lastChild.textContent=new Date(p.t).toLocaleString();
  const o=document.createElement('button');o.className='b';o.textContent='Open';
  o.onclick=()=>{try{const d=JSON.parse(localStorage.getItem(p.k)).d;push();Object.assign(S,d);S.last=null;S.tsel=S.esel=null;bz=null;VZ=1;VX=VY=0;sizeCanvas();zl();after();$('#psheet').hidden=true;toast('Opened '+p.n)}catch(e){toast('Could not open that design')}};
  const x=document.createElement('button');x.className='b';x.textContent='Delete';let arm=false;
  x.onclick=()=>{if(!arm){arm=true;x.textContent='Sure?';setTimeout(()=>{arm=false;x.textContent='Delete'},2500);return}try{localStorage.removeItem(p.k)}catch(e){}renderProjects()};
  r.appendChild(im);r.appendChild(n);r.appendChild(o);r.appendChild(x);B.appendChild(r)})}
$('#prj').innerHTML=ico('folder');$('#prj').onclick=()=>{renderProjects();$('#psheet').hidden=false};
$('#pbk').onclick=$('#pcl').onclick=()=>{$('#psheet').hidden=true};
$('#psv').onclick=()=>{const nm=$('#pnm').value.trim()||('Design '+new Date().toLocaleDateString());
 try{localStorage.setItem(PK+Date.now(),JSON.stringify({n:nm,t:Date.now(),th:thumb(),d:pick(S,PERSIST)}));$('#pnm').value='';toast('Saved '+nm);renderProjects()}catch(e){toast('Not enough storage on this device')}};
$('#pnew').onclick=()=>{mut(()=>{S.strokes=[];S.nails=[];S.groups=[];S.threads=[];S.nid=1;S.sel=null;S.dirty=false;S.hc=[];S.hg=[]});S.step='draw';VZ=1;VX=VY=0;zl();after();$('#psheet').hidden=true;toast('New design. Undo brings the old one back.')};
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
addEventListener('resize',()=>{sizeCanvas();draw()});
try{const j=localStorage.getItem('ssd3');if(j)Object.assign(S,JSON.parse(j));S.last=null;if(S.step==='build')S.bs=0}catch(e){}
if(S.lm==='mag')S.lm='free';if(!['pen','curve','edit','lasso','line','rect','circle','tri','star','heart','erase'].includes(S.dt))S.dt='pen';
sizeCanvas();ui();draw();

}
