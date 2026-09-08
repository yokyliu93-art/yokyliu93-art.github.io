// Original procedural score plus the accompaniment supplied by the island owner.
function createScore(){
  let context,master,timer,next=0,bar=0;
  const chords=[[50,57,60,64],[46,53,57,60],[53,60,64,67],[48,55,62,65]];
  function tone(midi,at,length,gain,bell=false){
    const oscillator=context.createOscillator(),envelope=context.createGain();
    oscillator.type='sine';oscillator.frequency.value=440*2**((midi-69)/12);
    envelope.gain.setValueAtTime(0,at);envelope.gain.linearRampToValueAtTime(gain,at+(bell?.025:1.8));
    envelope.gain.exponentialRampToValueAtTime(.0001,at+length);
    oscillator.connect(envelope);envelope.connect(master);oscillator.start(at);oscillator.stop(at+length+.1);
    oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect();};
  }
  function schedule(){while(next<context.currentTime+.4){const chord=chords[bar%4];chord.forEach(n=>tone(n,next,11,.055));
    // A recurring upward question, with space left for its answer.
    const melody=bar%2?[chord[2]+12,chord[1]+12]:[chord[1]+12,chord[3]+12,chord[2]+12];
    melody.forEach((n,i)=>tone(n,next+1+i*2.15,4.8,.08,true));bar++;next+=8.5;}}
  return {async play(volume){context??=new AudioContext();if(!master){master=context.createGain();master.connect(context.destination);}master.gain.value=volume;await context.resume();next=context.currentTime+.1;bar=0;schedule();timer=setInterval(schedule,200);},volume(v){if(master)master.gain.setTargetAtTime(v,context.currentTime,.15);},stop(){clearInterval(timer);if(context){context.close();context=null;master=null;}}};
}
export function mountIslandMusic(root){
  const panel=document.createElement('section');panel.className='island-music';panel.setAttribute('aria-label','岛屿音乐');
  panel.innerHTML=`<button class="music-toggle" aria-expanded="false" aria-controls="island-player"><i class="ph ph-music-notes" aria-hidden="true"></i><span class="music-title">蝉鸣 <small>你的伴奏</small></span><i class="ph ph-waveform" aria-hidden="true"></i></button><div id="island-player" hidden><div class="music-art" aria-hidden="true">✧<span>有些回响，正在来时的路上。</span></div><label class="sr-only" for="music-track">选择音乐</label><select id="music-track"><option value="/music/chan-ming.mp3">蝉鸣 · 你的伴奏</option><option value="original">星海来信 · 原创音景</option></select><div class="music-controls"><button class="music-play" aria-label="播放音乐">播放</button><label>音量 <input class="music-volume" type="range" min="0" max="100" value="25" aria-label="音乐音量"></label></div><p class="music-status" role="status">已为你的岛收好这首伴奏，点击播放。</p><label class="music-import">添加本地歌单<input type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac" multiple hidden></label><button class="music-stop">停止并收起</button><p class="music-local-note">《蝉鸣》已保存在此项目；临时添加的歌曲不上传，刷新后需重新添加。</p></div>`;
  root.append(panel);
  const score=createScore(),audio=new Audio(),urls=[],toggle=panel.querySelector('.music-toggle'),body=panel.querySelector('#island-player'),play=panel.querySelector('.music-play'),select=panel.querySelector('select'),status=panel.querySelector('.music-status');
  let playing=false,operation=0,selectionChanged=false,saveChain=Promise.resolve();
  const accountToken=localStorage.getItem('our-island-owner-token');
  async function saveTrack(track){if(!accountToken)return;const r=await fetch('/api/island/listening',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:'Bearer '+accountToken},body:JSON.stringify({track})});if(!r.ok)throw Error('音乐仍可播放，但这次选择未能保存，请重新选择。');}
  if(accountToken)fetch('/api/island/listening',{headers:{Authorization:'Bearer '+accountToken}}).then(r=>r.ok?r.json():null).then(data=>{if(data&&!selectionChanged&&data.track==='original'){select.value='original';panel.querySelector('.music-title').textContent='星海来信 · 原创音景';}}).catch(()=>{});
  const volume=()=>Number(panel.querySelector('.music-volume').value)/100;
  function stop(){operation++;playing=false;score.stop();audio.pause();play.textContent='播放';play.setAttribute('aria-label','播放音乐');panel.classList.remove('music-playing');}
  async function start(){const request=++operation;try{if(select.value==='original')await score.play(volume());else{if(audio.getAttribute('src')!==select.value)audio.src=select.value;audio.volume=volume();audio.loop=true;await audio.play();}if(request!==operation)return;playing=true;play.textContent='暂停';play.setAttribute('aria-label','暂停音乐');status.textContent='正在播放 · '+select.selectedOptions[0].textContent;panel.classList.add('music-playing');}catch{if(request!==operation)return;stop();status.textContent='暂时无法播放，请重试或换一个音频文件。';}}
  toggle.onclick=()=>{body.hidden=!body.hidden;toggle.setAttribute('aria-expanded',String(!body.hidden));};
  play.onclick=()=>{if(playing){stop();status.textContent='音乐已暂停。';}else start();};
  panel.querySelector('.music-volume').oninput=()=>{score.volume(volume());audio.volume=volume();};
  select.onchange=()=>{selectionChanged=true;const track=select.value==='original'?'original':select.value==='/music/chan-ming.mp3'?'chan-ming':'local';saveChain=saveChain.then(()=>saveTrack(track)).catch(e=>{status.textContent=e.message;});const resume=playing;stop();const title=panel.querySelector('.music-title');title.replaceChildren(document.createTextNode(select.value==='original'?'星海来信':select.selectedOptions[0].textContent));const subtitle=document.createElement('small');subtitle.textContent=select.value==='original'?'岛屿原创音景':select.value==='/music/chan-ming.mp3'?'你的伴奏':'我的本地歌单';title.append(subtitle);status.textContent='已选择 · '+select.selectedOptions[0].textContent;if(resume)start();};
  panel.querySelector('input[type=file]').onchange=e=>{for(const file of e.target.files){const url=URL.createObjectURL(file);urls.push(url);const option=new Option(file.name,url);select.add(option);}status.textContent='歌单已加入，可在上方选择播放。';e.target.value='';};
  panel.querySelector('.music-stop').onclick=()=>{stop();body.hidden=true;toggle.setAttribute('aria-expanded','false');status.textContent='音乐已停止。';};
  audio.onerror=()=>{stop();status.textContent='这个文件无法播放，请换一个音频文件。';};
  addEventListener('pagehide',()=>{stop();urls.forEach(url=>URL.revokeObjectURL(url));});
}
