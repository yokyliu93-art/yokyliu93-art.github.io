import './session-ui.css';
export function mountSessionBadge(session){
 const box=document.createElement('div');box.className='session-badge';const name=document.createElement('span');name.textContent=session.user.name;const button=document.createElement('button');button.type='button';button.textContent='退出';button.onclick=async()=>{button.disabled=true;const token=localStorage.getItem('our-island-owner-token');try{await fetch('/api/auth/logout',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:'{}'});}finally{localStorage.removeItem('our-island-owner-token');localStorage.removeItem('island-onboarding-complete');sessionStorage.clear();location.href='/';}};box.append(name,button);document.body.append(box);
}
