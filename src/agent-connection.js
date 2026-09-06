import './agent-connection.css';

export function mountAgentConnection({api,ensureOwner,getMe,refresh}) {
  const dialog=document.createElement('dialog');
  dialog.className='agent-dialog';
  dialog.setAttribute('aria-labelledby','connection-title');
  dialog.innerHTML=`<header><div><small>一起照料这座岛</small><h2 id="connection-title">连接你的 Agent</h2></div><button type="button" data-close aria-label="关闭连接面板">×</button></header>
    <p>你负责想象，让创作伙伴把它慢慢实现。</p>
    <section><label><input type="radio" name="agent-route" value="local"> 使用本机 Codex 写代码</label><h3>在这里，直接描述</h3><strong data-status>正在检查本机服务…</strong><p>创作框使用这台电脑上的 Codex 登录身份。服务开启不代表登录和网络已经验证；实际创作失败时会显示原因。</p></section>
    <section><label><input type="radio" name="agent-route" value="external"> 使用我连接的 Agent 写代码</label><h3>交给自己的 Codex / Claude Code</h3><p>给你的 Agent 一把只属于这座岛的钥匙。复制连接说明到自己的编程工具，它会接收创作框里的描述，编写 JavaScript，再把代码交回岛屿运行。</p>
    <label>授权期限 <select data-days><option value="1">1 天</option><option value="7" selected>7 天</option><option value="30">30 天</option></select></label>
    <p class="agent-boundary">可修改岛上生态与内部空间；不能操作社交关系或读取个人记忆。服务器会检查每次修改。</p>
    <button type="button" data-issue>生成岛屿连接钥匙</button>
    <div data-secret hidden><p>钥匙只在这里显示一次，关闭后不再展示。它是岛屿授权，不是模型 API Key。</p><textarea aria-label="Agent 连接说明" readonly spellcheck="false"></textarea><button type="button" data-copy>复制连接说明</button></div>
    <div data-keys></div></section>
    <p data-feedback role="status"></p><footer><button type="button" data-refresh>同步 Agent 对岛的修改</button></footer>`;
  document.body.append(dialog);
  dialog.querySelectorAll('[name="agent-route"]').forEach(input=>{input.checked=input.value===(localStorage.getItem('island-agent-route')||'local');input.onchange=()=>{localStorage.setItem('island-agent-route',input.value);window.dispatchEvent(new Event('island-agent-route'));};});
  const q=s=>dialog.querySelector(s);
  const feedback=s=>q('[data-feedback]').textContent=s;
  function clearSecret(){q('textarea').value='';q('[data-secret]').hidden=true;}
  dialog.addEventListener('close',clearSecret);
  q('[data-close]').onclick=()=>dialog.close();
  function renderKeys(){
    const list=q('[data-keys]');list.replaceChildren();
    const keys=getMe().agents.filter(k=>!k.revoked_at&&Date.parse(k.expires_at)>Date.now());
    for(const key of keys){
      const row=document.createElement('div');row.className='agent-key';
      const label=document.createElement('span');label.textContent=`授权 ${key.id.slice(0,8)} · ${new Date(key.expires_at).toLocaleDateString('zh-CN')} 到期`;
      const button=document.createElement('button');button.textContent='撤销';button.type='button';
      button.onclick=async()=>{button.disabled=true;try{await api(`/agents/${key.id}`,'DELETE');clearSecret();await refresh();renderKeys();feedback('这份授权已撤销。');}catch(e){feedback(e.message);button.disabled=false;}};
      row.append(label,button);list.append(row);
    }
  }
  document.querySelector('#connect-agent').onclick=async()=>{
    dialog.showModal();clearSecret();feedback('');q('[data-issue]').disabled=true;q('[data-status]').textContent='正在检查本机服务…';
    try{await ensureOwner();await refresh();renderKeys();q('[data-issue]').disabled=false;const status=await api('/creator');q('[data-status]').textContent=status.available?'本机 Codex · 创作服务已开启':'本机 Codex · 创作服务未开启';}catch(e){q('[data-status]').textContent='暂时无法检查连接';feedback(e.message);}
  };
  q('[data-issue]').onclick=async()=>{
    q('[data-issue]').disabled=true;feedback('');
    try{
      const id=getMe().island.id;
      const key=await api(`/islands/${id}/agents`,'POST',{scopes:['scene:write','interior:write'],days:Number(q('[data-days]').value)});
      const base=location.origin+'/api';
      q('textarea').value=`你是我的岛屿编程 Agent。请持续等待我的创作请求，收到后真正编写 JavaScript。\n服务地址：${base}\n岛屿 ID：${id}\n岛屿授权钥匙：${key.token}\n每个请求使用 Authorization: Bearer <岛屿授权钥匙>。不要把钥匙写入项目或日志。\n1. GET ${base}/rules 读取 programSDK 和运行边界。\n2. 每 5 秒 GET ${base}/islands/${id}/coding-task。task 为 null 时继续等待；我会在网页创作框发送描述。\n3. 收到 task 后，读取 task.prompt、scene.program 和 sdk，在本地编写 island.js。用函数、循环、自定义几何、动画和点击处理实现要求。保留未要求修改的代码行为。使用返回的 island SDK，不能访问账号、网络或系统。\n4. PUT ${base}/islands/${id}/program，JSON 为 {"jobId":task.id,"source":完整 JavaScript 源码,"summary":"实际实现的中文说明"}。source 不含 Markdown 围栏。失败时读取错误并修正；409 表示版本变化，重新读取，不能覆盖。\n5. 网页会自动加载代码。继续轮询下一条请求，直到我要求停止。使用我自己的模型登录或 API 配置。\n授权有效期 ${key.expiresInDays} 天。如果服务地址是 localhost，需要在同一台电脑运行 Agent；公网地址可以由你的电脑连接。`;
      q('[data-secret]').hidden=false;feedback('授权已生成，尚未验证外部 Agent 是否连接。');
      await refresh();renderKeys();
    }catch(e){feedback(e.message);}finally{q('[data-issue]').disabled=false;}
  };
  q('[data-copy]').onclick=async()=>{try{await navigator.clipboard.writeText(q('textarea').value);feedback('已复制。在你的 Codex 或 Claude Code 中粘贴这份说明。');}catch{feedback('复制未成功，请选中说明手动复制。');}};
  q('[data-refresh]').onclick=async()=>{try{await refresh();renderKeys();feedback('已同步岛屿的最新版本。');}catch(e){feedback(e.message);}};
}
