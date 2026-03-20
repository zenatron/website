import{j as i}from"./framer-motion.DLOvmwL-.js";import{r as s}from"./react-icons.DIxCDwRZ.js";function d({htmlContent:n,title:r}){const o=s.useRef(null),a=`
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: auto;
        overflow: visible !important;
      }
    </style>
    <script>
      // Make all links open in a new tab
      document.addEventListener('DOMContentLoaded', function() {
        const links = document.getElementsByTagName('a');
        for (let i = 0; i < links.length; i++) {
          links[i].setAttribute('target', '_blank');
          links[i].setAttribute('rel', 'noopener noreferrer');
        }
      });

      // Also intercept clicks to ensure they open in a new tab
      document.addEventListener('click', function(e) {
        const target = e.target;
        if (target.tagName === 'A' && !target.hasAttribute('target')) {
          e.preventDefault();
          window.open(target.href, '_blank', 'noopener,noreferrer');
        }
      }, true);
    <\/script>
    ${n}
  `;return i.jsx("iframe",{ref:o,title:r||"HTML Content",className:"w-full border-0",style:{width:"100%",border:"none"},srcDoc:a,scrolling:"no",sandbox:"allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox",onLoad:t=>{try{const e=t.currentTarget;e.contentWindow&&(e.style.height=e.contentWindow.document.body.scrollHeight+"px")}catch(e){console.error("Could not access iframe height, using fallback",e),t.currentTarget.style.height="1200px"}}})}export{d as default};
