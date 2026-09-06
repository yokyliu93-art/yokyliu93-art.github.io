import './brand-board.css';
import './brand-board-update.css';
import {brandMark} from './brand.js';

document.querySelector('#app').innerHTML=`<main class="brand-board">
 <header class="board-header"><a href="/">${brandMark()}<b>我们的岛</b></a><span>标志设计 · 已选方向</span></header>
 <section class="board-hero"><p>OUR ISLAND · SELECTED IDENTITY</p><h1>把自己，<br>打磨成一座岛。</h1><div class="board-thesis"><b>设计母题</b><span>一圈圈地认识自己，也一层层地长出自己的世界。中心的微光，是此刻的我，也是向宇宙发出的信号。</span></div></section>
 <section class="concepts" aria-label="四组标志设计方向">
  <article class="concept"><div class="mark mark-signal" aria-label="双岛之间传递信号的标志"><i class="land land-a"></i><i class="signal-dot"></i><i class="land land-b"></i></div><div class="concept-copy"><small>01 · SIGNAL</small><h2>信号抵达</h2><p>两座岛彼此完整，一颗信号在它们之间往返。适合强调相遇概率、发现与回应。</p><strong>关键词 · 勇敢表达 / 被看见</strong></div></article>
  <article class="concept recommended"><div class="recommend-label">正式选定</div><div class="mark mark-inner" aria-label="层层生长的内在地形标志"><i></i><i></i><i></i><b></b></div><div class="concept-copy"><small>02 · INNER TERRAIN</small><h2>内在地形</h2><p>从内心向外生长的等高线。适合强调自我探索、长期记忆与每个人不同的生态。</p><strong>关键词 · 自我 / 生长 / 记忆</strong></div></article>
  <article class="concept"><div class="mark mark-third" aria-label="两座个人岛共同生成第三座岛的标志"><i class="self self-a"></i><i class="shared"></i><i class="self self-b"></i><b></b></div><div class="concept-copy"><small>03 · THE THIRD ISLAND</small><h2>第三座岛</h2><p>你有你的岛，我有我的岛；相遇之后，中间长出属于两个人的共同世界。</p><strong>关键词 · 边界 / 亲密 / 共建</strong></div></article>
  <article class="concept embrace-concept"><div class="mark mark-embrace" aria-label="两个人相拥并组成一座岛的标志"><img src="/brand/embrace-island-v1.png" alt="两个相互依靠的人共同组成一座岛"></div><div class="concept-copy"><small>04 · TOGETHER AGAINST THE WORLD</small><h2>相拥成岛</h2><p>两个人等高相依，身体像两片互相托住的陆地，底部合成稳定的岛基；岛外的一点微光，是他们共同面对的世界。</p><strong>关键词 · 相拥 / 守护 / 一起面对</strong></div></article>
 </section>
 <section class="lockup"><div class="selected-lockup">${brandMark()}<div><span class="lockup-cn">我们的岛</span><small>OUR ISLAND · SOMEWHERE, TOGETHER</small></div></div><p>图形像一座岛的等高线，也像一个人的内心层次。中文字标保持安静，让中心的微光成为记忆点。</p></section>
 <section class="system"><div><small>PRIMARY INK</small><i style="--swatch:#355c4b"></i><b>深林绿</b><span>#355C4B</span></div><div><small>SECONDARY LAND</small><i style="--swatch:#a9bba2"></i><b>雾鼠尾草</b><span>#A9BBA2</span></div><div><small>SIGNAL</small><i style="--swatch:#c2a36b"></i><b>微光金</b><span>#C2A36B</span></div><p>颜色规则：绿色属于个人岛，金色只在信号发出、相遇发生或共同岛诞生时出现。</p></section>
 <footer><span>静态用于头像、印章与启动页</span><span>动态用于信号发射、匹配与合岛时刻</span><a href="/">返回群岛主页</a></footer>
</main>`;
