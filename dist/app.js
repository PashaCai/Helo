const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),world=document.querySelector('#world');
const texture=new Image();texture.src='assets/canvas.png';
// Crops from the supplied composition; each object wraps independently so no tile seam is visible.
const pieces=[
 [310,176,74,127,650,450,'yellow'],[588,0,187,156,1130,195,'brown'],[1022,78,118,130,230,195,'yellow'],
 [37,300,85,144,230,720,'blue'],[718,327,132,92,650,15,'linen'],[474,508,94,138,1000,960,'linen'],
 [76,542,207,184,1360,740,'blue'],[1100,393,116,153,1380,360,'linen'],[824,671,149,127,80,1040,'green'],
 [1300,620,160,177,390,1160,'linen'],[502,772,141,154,1110,1260,'linen'],[0,781,128,190,1480,1020,'green']
];
let W=innerWidth,H=innerHeight,scale=1,x=0,y=0,vx=0,vy=0,drag=false,lastX=0,lastY=0,lastTime=0,frameTime=0,filter='all';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function resize(){W=innerWidth;H=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);scale=Math.max(.62,Math.min(W/1360,H/900));}
addEventListener('resize',resize);resize();
const mod=(n,m)=>((n%m)+m)%m;
function render(t){if(document.body.classList.contains("subpage")){frameTime=t;requestAnimationFrame(render);return;}const dt=Math.min((t-frameTime)/16.67||1,3);frameTime=t;if(!drag){x+=vx*dt;y+=vy*dt;vx*=Math.pow(.94,dt);vy*=Math.pow(.94,dt);if(Math.abs(vx)<.01)vx=0;if(Math.abs(vy)<.01)vy=0;}ctx.clearRect(0,0,W,H);window.heloHits=[];if(texture.complete&&texture.naturalWidth){const tw=1650*scale,th=1450*scale;for(const [index,piece]of pieces.entries()){const [sx,sy,sw,sh,px,py,tag]=piece;if(filter!=='all'&&tag!==filter)continue;const dw=sw*scale,dh=sh*scale;const bx=mod(px*scale+x+dw,tw)-dw,by=mod(py*scale+y+dh,th)-dh;for(let a=bx;a<W;a+=tw)for(let b=by;b<H;b+=th){ctx.drawImage(texture,sx,sy,sw,sh,a,b,dw,dh);window.heloHits.push({x:a,y:b,w:dw,h:dh,index});}}}requestAnimationFrame(render);}requestAnimationFrame(render);
world.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag=true;vx=vy=0;lastX=e.clientX;lastY=e.clientY;lastTime=performance.now();world.setPointerCapture(e.pointerId);world.classList.add('dragging');document.querySelector('.hint').style.opacity='.3';});
world.addEventListener('pointermove',e=>{const cursor=document.querySelector('#cursor');cursor.style.display=e.pointerType==='mouse'?'block':'none';cursor.style.transform=`translate(${e.clientX+16}px,${e.clientY+16}px)`;if(!drag)return;const now=performance.now(),dt=Math.max(now-lastTime,8),dx=e.clientX-lastX,dy=e.clientY-lastY;x+=dx;y+=dy;vx=reduced?0:dx/dt*16;vy=reduced?0:dy/dt*16;lastX=e.clientX;lastY=e.clientY;lastTime=now;});
function release(){drag=false;world.classList.remove('dragging');if(performance.now()-lastTime>90)vx=vy=0;}world.addEventListener('pointerup',release);world.addEventListener('pointercancel',release);world.addEventListener('lostpointercapture',release);world.addEventListener('pointerleave',()=>document.querySelector('#cursor').style.display='none');
world.addEventListener('wheel',e=>{e.preventDefault();const factor=e.deltaMode===1?16:e.deltaMode===2?H:1;x-=e.deltaX*factor;y-=e.deltaY*factor;vx=vy=0;},{passive:false});
world.addEventListener('keydown',e=>{const steps={ArrowLeft:[90,0],ArrowRight:[-90,0],ArrowUp:[0,90],ArrowDown:[0,-90]};if(steps[e.key]){e.preventDefault();x+=steps[e.key][0];y+=steps[e.key][1];}});
function reset(){x=y=vx=vy=0;filter='all';document.querySelector('#query').value='';}document.querySelector('#home').onclick=reset;document.querySelector('#reset').onclick=reset;
const dialog=document.querySelector('dialog'),query=document.querySelector('#query'),result=document.querySelector('#result');document.querySelector('#search').onclick=()=>{dialog.showModal();query.focus();};
function search(value){const q=value.trim().toLowerCase();const map={'黄色':'yellow','蓝色':'blue','亚麻':'linen','绿色':'green','棕色':'brown'};const key=map[q]||q;filter=!q||q==='all'?'all':['yellow','blue','linen','green','brown'].find(k=>k.includes(key))||'none';result.textContent=filter==='none'?'No matching texture. Try yellow, blue, linen, green or brown.':filter==='all'?'Explore every colour and texture.':`Explore ${filter} textures.`;document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter));}
query.addEventListener('input',()=>search(query.value));document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{query.value=b.dataset.filter==='all'?'':b.dataset.filter;search(query.value);});document.querySelector('#explore').onclick=()=>{if(filter!=='none'){dialog.close();world.focus();}};dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
const began=performance.now();Promise.all([texture.decode().catch(()=>{}),document.fonts.ready]).then(()=>setTimeout(()=>{document.body.classList.remove('loading');document.body.classList.add('ready');},Math.max(0,(reduced?150:2200)-(performance.now()-began))));

