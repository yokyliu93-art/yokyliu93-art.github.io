export async function signIn(page,{onboarded=true}={}){
 const email=`test-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`,password='test-island-password';
 const response=await page.request.post('/api/auth/register',{data:{name:'测试岛民',email,password}}),account=await response.json();
 if(!response.ok())throw new Error(account.error||'test account failed');
 if(onboarded){const headers={Authorization:`Bearer ${account.token}`};const me=await(await page.request.get('/api/me',{headers})).json();await page.request.post('/api/preferences',{headers,data:{preferences:{growing:true,water:'none',animals:'none',light:'balanced',home:'open',landscape:'none'},revision:me.island.revision,remember:false}});}
 await page.addInitScript(token=>{try{localStorage.setItem('our-island-owner-token',token);}catch{}},account.token);return account;
}
