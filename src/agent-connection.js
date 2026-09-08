import './agent-connection.css';

export function mountAgentConnection({api,ensureOwner,getMe,refresh}) {
 const dialog=document.createElement('dialog');dialog.className='agent-dialog';
 dialog.innerHTML=`<header><div><small>让想象有一个同行者</small><h2>连接你的 Agent</h2></div><button data-close aria-label="关闭">×</button></header><p>在你自己的 Codex、Claude Code 或其他编程 Agent 中打开连接文件。它会向你问好，然后接收你为这座岛写下的想法。</p><section><h3>给创作伙伴一把岛屿钥匙</h3><p>可编写地形、生态、动画和互动，修改房屋、家具与自己的角色。授权范围始终是你的岛。</p><label>有效期 <select data-days><option value="1">1 天</option><option value="7" selected>7 天</option><option value="30">30 天</option></select></label><label><input type="checkbox" data-memory checked> 让我的 Agent 读取、记录我的创作记忆</label><button data-issue>生成连接文件</button><div data-secret hidden><p>文件包含这座岛的私密钥匙，请只交给自己的 Agent。模型 API Key 在你的编程工具中配置。</p><textarea aria-label="连接说明" readonly></textarea><button data-copy>复制说明</button><button data-download>下载连接文件 .md</button></div></section><p data-feedback role="status"></p><section data-presence></section><div data-keys></div>`;
 document.body.append(dialog);const q=s=>dialog.querySelector(s);let timer;
 const feedback=t=>q('[data-feedback]').textContent=t;
 async function status(){try{const s=await api('/agent/status');q('[data-presence]').textContent=s.connected?`${s.name}：${s.hello}${s.online?' · 在线':' · 已问好，等待再次上线'}`:'还没有收到 Agent 的 hello。把连接文件交给它后，在这里等它回来。';window.dispatchEvent(new CustomEvent('island-agent-status',{detail:s}));}catch(e){feedback(e.message);}}
 function keys(){const list=q('[data-keys]');list.replaceChildren();for(const key of (getMe()?.agents||[]).filter(k=>!k.revoked_at&&Date.parse(k.expires_at)>Date.now())){const row=document.createElement('p'),button=document.createElement('button');row.textContent=`授权 ${key.id.slice(0,8)} · ${new Date(key.expires_at).toLocaleDateString()} 到期 `;button.textContent='撤销';button.onclick=async()=>{try{await api(`/agents/${key.id}`,'DELETE');await refresh();keys();await status();}catch(e){feedback(e.message);}};row.append(button);list.append(row);}}
 q('[data-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{clearInterval(timer);q('textarea').value='';q('[data-secret]').hidden=true;});
 document.querySelector('#connect-agent').onclick=async()=>{dialog.showModal();q('[data-issue]').disabled=true;try{await ensureOwner();await refresh();keys();q('[data-issue]').disabled=false;await status();timer=setInterval(status,3000);}catch(e){feedback(e.message);}};
 q('[data-issue]').onclick=async()=>{const button=q('[data-issue]');button.disabled=true;try{const id=getMe().island.id,base=location.origin+'/api';const key=await api(`/islands/${id}/agents`,'POST',{days:Number(q('[data-days]').value),scopes:['scene:write','interior:write','avatar:write',...(q('[data-memory]').checked?['memory:read','memory:write']:[])]});
 q('textarea').value=`# 我的岛屿 · Agent 连接

你是我的编程伙伴。用我自己的模型编写 JavaScript，持续接收我的网页创作请求。
服务地址：${base}
岛屿 ID：${id}
岛屿私密钥匙：${key.token}
所有请求使用 Authorization: Bearer <岛屿私密钥匙>。JSON 请求使用 Content-Type: application/json。不要将钥匙写入代码、仓库、记忆或日志。

1. 先 GET ${base}/rules 读取完整 SDK 和边界。
2. 立即 POST ${base}/islands/${id}/hello，JSON {"name":"我的编程伙伴","message":"Hello，我已经来到你的岛。我们开始吧。"}。必须真正调用成功，不要只在聊天里问好。
3. 每 5 秒 GET ${base}/islands/${id}/coding-task。task=null 时继续等待；用户将在 onboarding 和创作框发需求。
4. 收到任务后读取 task.prompt、preferences、scene、sdk。真正编写完整 JavaScript：使用 island.mesh、island.asset、island.onFrame、island.onClick、island.move；保留用户未要求改变的世界。可自由重写地形、海洋、球体、生态、动画和互动；可读取已获授权的 GET ${base}/memory。岛屿 SDK 在隔离环境运行，无网络或系统访问权限。
5. PUT ${base}/islands/${id}/program，JSON {"jobId":task.id,"source":"完整 JavaScript 源码，无 Markdown 围栏","summary":"实际完成的变化","scenePatch":{...需要变更的场景字段}}。scenePatch 可改 weather,time,music,daylight,objects,rooms,ecosystem,worldTemplate,worldVariant,growing。objects/rooms 为完整数组；房屋入口和家具需遵守 rules。daylight 为 day/night/balanced，请保留用户的光偏好。自定义地形可用 growing:false 和 ocean 或 planet 模式隐藏默认浮岛底座。失败时修正后重试；409 表示世界版本变化，不得覆盖。
6. 角色可 GET/PUT ${base}/avatar，PUT 为 {"revision":当前版本,"source":"角色网格代码"}，使用 rules.avatarSDK。猫、狗、鸟、兔子、熊、狐狸、独角兽可使用 SDK 的 island.asset。
7. 提交成功后继续轮询，等待下一个请求，直到我让你停止。使用我自己的模型登录或 API 配置。

钥匙有效期 ${key.expiresInDays} 天。localhost/127.0.0.1 地址需要你与网站在同一台电脑；远程体验请使用公网网站上生成的连接文件。`;
 q('[data-secret]').hidden=false;feedback('文件准备好了。收到 Agent 的真实问候后，就可以开始构想世界。');await refresh();keys();
 }catch(e){feedback(e.message);}finally{button.disabled=false;}};
 q('[data-copy]').onclick=async()=>{try{await navigator.clipboard.writeText(q('textarea').value);feedback('已复制，粘贴到你自己的 Agent 中即可。');}catch{feedback('请选中上方说明手动复制。');}};
 q('[data-download]').onclick=()=>{const url=URL.createObjectURL(new Blob([q('textarea').value],{type:'text/markdown'})),a=document.createElement('a');a.href=url;a.download='我的岛-Agent连接.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
}
