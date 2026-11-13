const $=s=>document.querySelector(s);
const descriptions=['1–4 · Dobbelsteenpatronen','1–4 · Twee groepjes in dobbelsteenpatroon','1–6 · Dobbelsteenpatronen','1–6 · Grootste groep in dobbelsteenpatroon, doortellen','1–6 · Twee vrije groepjes, zonder dobbelsteenpatroon','1–10 · Eerste groep in dobbelsteenpatroon, doortellen','1–10 · Twee vrije groepjes zonder dobbelsteenpatroon'];
const dice={1:[[50,50]],2:[[25,25],[75,75]],3:[[25,25],[50,50],[75,75]],4:[[25,25],[75,25],[25,75],[75,75]],5:[[25,25],[75,25],[50,50],[25,75],[75,75]],6:[[25,22],[75,22],[25,50],[75,50],[25,78],[75,78]]};
// Compact dice positions; keep each group square so patterns never stretch.
Object.keys(dice).forEach(n=>{dice[n]=dice[n].map(([x,y])=>[50+(x-50)*.72,50+(y-50)*.78])});
let level=1,duration=2000,bag=[],current=null,state='ready',timeout;
const rand=n=>Math.floor(Math.random()*n);
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function loose(n){let pts=[];for(let i=0;i<n;i++){let p,ok=false;for(let t=0;t<300&&!ok;t++){p=[17+Math.random()*66,17+Math.random()*66];ok=pts.every(q=>Math.hypot(q[0]-p[0],q[1]-p[1])>27)}if(!ok)return loose(n);pts.push(p)}return pts}
function counting(n){return Array.from({length:n},(_,i)=>[n===1?50:25+(i%2)*50, n<=2?50:25+Math.floor(i/2)*25])}
const freePatterns={
  1:[[[50,50]]],2:[[[35,39],[66,62]]],3:[[[23,30],[72,43],[43,78]]],
  4:[
    [[22,25],[68,20],[42,55],[76,80]],
    [[18,42],[46,20],[78,45],[49,81]],
    [[25,18],[62,35],[20,65],[65,81]],
    [[18,22],[53,32],[79,68],[30,78]]
  ],
  5:[
    [[20,20],[53,25],[81,49],[30,57],[53,83]],
    [[17,43],[42,18],[77,27],[45,62],[77,82]],
    [[20,18],[75,20],[45,42],[18,77],[68,76]],
    [[42,17],[78,43],[18,45],[43,72],[79,83]]
  ]
};
const lastFreeVariant={};
function logical(n){const variants=freePatterns[n];const choices=variants.map((_,i)=>i).filter(i=>variants.length===1||i!==lastFreeVariant[n]);const selected=choices[rand(choices.length)];lastFreeVariant[n]=selected;let flip=rand(2),turn=rand(4);return variants[selected].map(([x,y])=>{if(flip)x=100-x;for(let i=0;i<turn;i++)[x,y]=[100-y,x];return[x+rand(5)-2,y+rand(5)-2]})}
function makeRound(l,n){let counts,patterns=[];if(l===1||l===3){counts=[n];patterns=[dice[n]]}else if(l===7){counts=n===1?[1]:[Math.ceil(n/2),Math.floor(n/2)];patterns=counts.map(logical)}else if(n===1){counts=[1];patterns=[dice[1]]}else{let a;if(l===6){let min=Math.max(Math.ceil(n/2),n-5);a=min+rand(Math.min(6,n-1)-min+1)}else a=Math.ceil(n/2)+rand(n-Math.ceil(n/2));counts=[a,n-a];if(l===2){if(rand(2))counts.reverse();patterns=counts.map(x=>dice[x])}else if(l===5)patterns=counts.map(loose);else patterns=[dice[a],counting(n-a)]}return{n,counts,patterns}}
function newRound(){let max=level<=2?4:level<=5?6:10;if(!bag.length){bag=shuffle(Array.from({length:max},(_,i)=>i+1));if(current&&bag.at(-1)===current.n)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]]}current=makeRound(level,bag.pop());render();show()}
function render(){ $('#food').replaceChildren();$('#food').dataset.groups=current.counts.length;current.patterns.forEach(pts=>{let group=document.createElement('div');group.className='group'+(current.counts.length===1?' solo':'');pts.forEach(([x,y])=>{let img=document.createElement('img');img.src='pepernoot.png';img.alt='';img.className='nut';img.style.cssText=`left:${x}%;top:${y}%;--r:${rand(70)-35}deg`;group.append(img)});$('#food').append(group)});$('#answer').textContent=current.n}
function resetTimer(){clearTimeout(timeout);$('#timer i').style.transition='none';$('#timer i').style.transform='scaleX(1)'}
function show(){if(!current)return;resetTimer();state='showing';$('#food').style.visibility='visible';$('#cover').style.display='none';$('#answer').hidden=true;$('#start').hidden=true;$('#replay').disabled=false;$('#reveal').disabled=false;$('#next').disabled=false;if(duration){requestAnimationFrame(()=>requestAnimationFrame(()=>{if(state!=='showing')return;$('#timer i').style.transition=`transform ${duration}ms linear`;$('#timer i').style.transform='scaleX(0)'}));timeout=setTimeout(()=>{state='hidden';$('#food').style.visibility='hidden';$('#cover').style.display='block'},duration)}}
function reveal(){if(!current)return;resetTimer();state='answer';$('#food').style.visibility='visible';$('#cover').style.display='none';$('#answer').hidden=false}
function ready(){resetTimer();current=null;bag=[];state='ready';$('#food').style.visibility='hidden';$('#cover').style.display='none';$('#answer').hidden=true;$('#start').hidden=false;$('#replay').disabled=true;$('#reveal').disabled=true;$('#next').disabled=true;$('#steps').replaceChildren();for(let i=1;i<=7;i++){let b=document.createElement('button');b.type='button';b.className='level-dot'+(i===level?' active':'');b.setAttribute('aria-label','Level '+i);b.setAttribute('aria-pressed',i===level);b.title='Level '+i;b.onclick=()=>{level=i;update();ready()};b.append(document.createElement('i'));$('#steps').append(b)}}
descriptions.forEach((s,i)=>{let b=document.createElement('button');b.innerHTML=`<b>${i+1}</b><span>${s}</span>`;b.onclick=()=>{level=i+1;update();ready()};$('#levels').append(b)});
[1000,2000,3000,5000,0].forEach(t=>{let b=document.createElement('button');b.textContent=t?t/1000+' sec':'∞';b.setAttribute('aria-label',t?t/1000+' seconden':'Onbeperkt');b.onclick=()=>{duration=t;update()};$('#times').append(b)});
function update(){[...$('#levels').children].forEach((b,i)=>{b.classList.toggle('selected',i+1===level);b.setAttribute('aria-pressed',i+1===level)});[...$('#times').children].forEach((b,i)=>{b.classList.toggle('selected',[1000,2000,3000,5000,0][i]===duration)})}
$('#start').onclick=newRound;$('#next').onclick=newRound;$('#replay').onclick=show;$('#reveal').onclick=reveal;$('#settings').onclick=()=>{if(state==='showing'){resetTimer();state='hidden';$('#food').style.visibility='hidden';$('#cover').style.display='block'}$('#panel').showModal()};$('#go').onclick=()=>{$('#panel').close();ready()};$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{}};
document.addEventListener('keydown',e=>{if($('#panel').open)return;if(e.code==='Space'){e.preventDefault();newRound()}else if(e.key.toLowerCase()==='r')show();else if(e.key.toLowerCase()==='a')reveal()});
update();ready();let preload=new Image();preload.onload=()=>$('#panel').showModal();preload.src='pepernoot.png';preload.onerror=()=>{alert('De afbeelding kon niet worden geladen. Open het spel opnieuw.')};



