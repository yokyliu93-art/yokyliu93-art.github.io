const params=new URLSearchParams(location.search),view=params.get('view'),token=localStorage.getItem('our-island-owner-token');
let session=null;
if(token){try{const headers={Authorization:`Bearer ${token}`},response=await fetch('/api/session',{headers});if(response.ok)session=await response.json();else{const legacy=await fetch('/api/me',{headers});if(legacy.ok){const data=await legacy.json();window.__legacyIsland={token,name:data.user.name};}else localStorage.removeItem('our-island-owner-token');}}catch{}}
window.__islandSession=session;
const isHome=!view||view==='universe';
if(isHome){await import('./cosmos.js');if(session){const {mountSessionBadge}=await import('./session-ui.js');mountSessionBadge(session);}}
else if(view==='visit'&&params.has('demo'))await import('./visit.js');
else if(view==='animals')await import('./animal-library.js');
else if(view==='brand')await import('./brand-board.js');
else if(view==='auth'||!session)await import('./auth.js');
else if(view==='connect')await import('./connect.js');
else if((!session.onboardingComplete||view==='onboarding')&&!session.agent?.connected)location.replace('/?view=connect');
else if(!session.onboardingComplete&&view!=='onboarding')location.replace('/?view=onboarding');
else{
 if(view==='reflection')await import('./mailbox.js');
 else if(view==='visit')await import('./visit.js');
 else if(view==='tools')await import('./technical-studio.js');
 else if(view==='studio')await import('./studio.js');
 else if(view==='island'){await import('./main.js');const a=document.createElement('a');a.href='/';a.textContent='← 返回虚空大陆';a.style.cssText='position:fixed;left:46px;bottom:100px;color:#416758;font:11px system-ui;z-index:5';document.body.append(a);}
 else if(view==='onboarding')await import('./onboarding.js');
 else await import('./cosmos.js');
 const {mountSessionBadge}=await import('./session-ui.js');mountSessionBadge(session);
}
