import{j as s,A as k,m as C}from"./framer-motion.DLOvmwL-.js";import{r as i}from"./react-icons.DIxCDwRZ.js";import{X as b}from"./x.DorGDrav.js";import"./createLucideIcon.DDEo5TQN.js";const _=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"],x={pwd:{title:"Current Directory",message:"~/portfolio/you-found-an-easter-egg"},ls:{title:"Directory Contents",message:"secrets/  hidden/  easter-eggs/  .env.secrets"},whoami:{title:"User Identity",message:"A curious developer who reads source code 👀"},sudo:{title:"Permission Denied",message:"Nice try. You don't have root access here."},help:{title:"Available Commands",message:"Try: pwd, ls, whoami, sudo, vim, exit"},vim:{title:"Vim",message:"You're now stuck in vim. Good luck exiting."},exit:{title:"Exit",message:"There is no escape. You live here now."},cd:{title:"Change Directory",message:"You're already where you need to be ✨"},rm:{title:"rm -rf /",message:"Nice try. This isn't a real terminal... or is it? 😈"},cat:{title:"cat",message:"🐱 meow"},git:{title:"git",message:"fatal: not a git repository (or any of the parent directories)"}};let E=0;function D(){const[h,l]=i.useState([]),[d,r]=i.useState(0),[u,g]=i.useState(!1),a=i.useRef(""),p=i.useRef(0),m=i.useCallback((t,o,e)=>{const n=Date.now();if(n-p.current<100)return;p.current=n;const c=`toast-${n}-${++E}`;l(f=>[...f,{id:c,icon:t,title:o,message:e}]),setTimeout(()=>{l(f=>f.filter(v=>v.id!==c))},5e3)},[]),w=t=>{l(o=>o.filter(e=>e.id!==t))};i.useEffect(()=>{console.log(`
%c  ____  _     _ _  __     ___     _                          _          
%c |  _ | |__ (_) |     / (_)___| |__  _ __   _____   _____ | | ___   _ 
%c | |_) | '_ | | |    / /| / __| '_ | '_  / _   / / __|| |/ / | | |
%c |  __/| | | | | |    V / | __  | | | | | |  __/ V /__ |   <| |_| |
%c |_|   |_| |_|_|_|    _/  |_|___/_| |_|_| |_|___| _/ |___/|_|_\\__, |
%c                                                                   |___/ 
`,"color: #7c8aff","color: #8a7cff","color: #9c7cff","color: #7c9aff","color: #7cbfff","color: #7cdfff"),console.log("%c👋 Hey, fellow developer!","font-size: 16px; font-weight: bold;"),console.log("%c🔍 Curious about the code? Check it out: https://github.com/zenatron/portfolio","font-size: 12px;"),console.log("%c💼 Open to opportunities! Let's chat.","font-size: 12px; color: #7c8aff;"),console.log('%c🥚 Psst... try typing "help" anywhere on the site.',"font-size: 11px; color: #888;")},[]),i.useEffect(()=>{const t=o=>{if(!(document.activeElement?.tagName==="INPUT"||document.activeElement?.tagName==="TEXTAREA")){if(o.key===_[d]){const e=d+1;r(e),e===_.length&&!u&&(g(!0),m("🎮","Konami Code Activated!","You found the secret. Here's some confetti... 🎊"),y(),r(0))}else o.key===_[0]?r(1):r(0);if(o.key.length===1&&o.key.match(/[a-z]/i)){a.current=(a.current+o.key.toLowerCase()).slice(-10);for(const e of Object.keys(x))if(a.current.endsWith(e)){const{title:n,message:c}=x[e];m("💻",n,c),a.current="";break}}}};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[d,u,m]);const y=()=>{const t=["#7c8aff","#ff7c8a","#8aff7c","#ffff7c","#ff7cff"];for(let e=0;e<100;e++){const n=document.createElement("div");n.style.cssText=`
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${t[Math.floor(Math.random()*t.length)]};
        left: ${Math.random()*100}vw;
        top: -10px;
        border-radius: ${Math.random()>.5?"50%":"0"};
        pointer-events: none;
        z-index: 9999;
        animation: confetti-fall ${2+Math.random()*2}s linear forwards;
      `,document.body.appendChild(n),setTimeout(()=>n.remove(),4e3)}if(!document.getElementById("confetti-style")){const e=document.createElement("style");e.id="confetti-style",e.textContent=`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(${Math.random()*720}deg);
            opacity: 0;
          }
        }
      `,document.head.appendChild(e)}};return s.jsx("div",{className:"fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none",children:s.jsx(k,{children:h.map(t=>s.jsxs(C.div,{initial:{opacity:0,x:100,scale:.8},animate:{opacity:1,x:0,scale:1},exit:{opacity:0,x:100,scale:.8},transition:{type:"spring",stiffness:200,damping:20},className:"pointer-events-auto relative flex items-start gap-3 px-4 py-3 bg-primary-bg border border-accent/30 rounded-lg shadow-lg shadow-accent/10 min-w-[280px] max-w-[340px]",children:[s.jsx("span",{className:"text-2xl",children:t.icon}),s.jsxs("div",{className:"flex-1 min-w-0",children:[s.jsx("p",{className:"text-xs text-accent font-medium uppercase tracking-wider",children:"Easter Egg Found"}),s.jsx("p",{className:"text-sm text-primary-text font-semibold",children:t.title}),s.jsx("p",{className:"text-xs text-muted-text font-mono break-all",children:t.message})]}),s.jsx("button",{onClick:()=>w(t.id),className:"absolute top-2 right-2 text-muted-text hover:text-primary-text transition-colors",children:s.jsx(b,{size:14})})]},t.id))})})}export{D as default};
