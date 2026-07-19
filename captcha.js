/* ─────────────────────────────────────
   iCreate · CAPTCHA widget
   Self-contained canvas CAPTCHA used on
   the Log In and Sign Up forms.
   Usage:
     const captcha = icCreateCaptcha('mount-div-id');
     if (!captcha.verify()) return;  // blocks submit until solved
───────────────────────────────────── */
(function () {
  'use strict';

  // No look-alike characters (0/O, 1/l/I, 5/S…)
  const CHARS = 'ABCDEFGHJKMNPQRTUVWXY34679';
  const CODE_LEN = 5;

  const CSS = `
  .captcha-wrap { display:flex; flex-direction:column; gap:6px; margin-bottom:18px; }
  .captcha-label { font-size:.85rem; font-weight:600; color:var(--gray-dark,#3d4455); }
  .captcha-box {
    display:flex; align-items:center; gap:10px;
  }
  .captcha-box canvas {
    border-radius:9px; border:1.5px solid var(--gray-light,#eaeef6);
    background:#fff; flex-shrink:0;
  }
  .captcha-refresh {
    width:38px; height:38px; border-radius:9px; flex-shrink:0;
    border:1.5px solid var(--gray-light,#eaeef6); background:#fafbfd;
    color:var(--blue-mid,#004a9f); font-size:1.15rem; line-height:1; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all .2s; font-family:'DM Sans',sans-serif;
  }
  .captcha-refresh:hover { background:var(--blue-pale,#e8f0fb); border-color:var(--blue-mid,#004a9f); }
  .captcha-input {
    padding:11px 14px; border-radius:9px;
    border:1.5px solid var(--gray-light,#eaeef6);
    font-family:'DM Sans',sans-serif; font-size:.9rem; color:var(--text,#1c2033);
    background:#fafbfd; outline:none; transition:all .2s;
    letter-spacing:2px; text-transform:uppercase;
  }
  .captcha-input:focus {
    border-color:var(--blue-mid,#004a9f); background:#fff;
    box-shadow:0 0 0 3px rgba(0,74,159,.08);
  }
  .captcha-wrap.error .captcha-input { border-color:#e5484d; }
  .captcha-msg { font-size:.78rem; color:#e5484d; display:none; }
  .captcha-wrap.error .captcha-msg { display:block; }
  @keyframes captcha-shake {
    0%,100% { transform:translateX(0); }
    25% { transform:translateX(-5px); }
    75% { transform:translateX(5px); }
  }
  .captcha-wrap.error { animation:captcha-shake .3s ease; }`;

  let cssInjected = false;
  function injectCss() {
    if (cssInjected) return;
    cssInjected = true;
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function randomCode() {
    let code = '';
    for (let i = 0; i < CODE_LEN; i++) {
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return code;
  }

  function drawCode(canvas, code) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    // background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#f5f7fc');
    grad.addColorStop(1, '#e8f0fb');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(0,74,159,${0.06 + Math.random() * 0.12})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // characters
    const colors = ['#003a8c', '#004a9f', '#1a6fd4', '#3d4455'];
    const step = (w - 30) / code.length;
    for (let i = 0; i < code.length; i++) {
      ctx.save();
      const x = 22 + i * step + (Math.random() * 6 - 3);
      const y = h / 2 + (Math.random() * 10 - 5);
      ctx.translate(x, y);
      ctx.rotate((Math.random() * 0.5 - 0.25));
      ctx.font = `700 ${26 + Math.floor(Math.random() * 6)}px 'DM Sans', sans-serif`;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }

    // interference lines
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(0,74,159,${0.15 + Math.random() * 0.15})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 30, Math.random() * h);
      ctx.bezierCurveTo(w * 0.3, Math.random() * h, w * 0.7, Math.random() * h, w - Math.random() * 30, Math.random() * h);
      ctx.stroke();
    }
  }

  window.icCreateCaptcha = function (mountId) {
    injectCss();
    const mount = document.getElementById(mountId);
    if (!mount) return { verify: () => true, reset: () => {} };

    mount.innerHTML = `
      <div class="captcha-wrap">
        <label class="captcha-label">Security Check</label>
        <div class="captcha-box">
          <canvas width="190" height="52" aria-label="CAPTCHA code"></canvas>
          <button type="button" class="captcha-refresh" title="Get a new code" aria-label="New code">↻</button>
        </div>
        <input type="text" class="captcha-input" placeholder="Type the code shown above"
               autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="${CODE_LEN}" />
        <div class="captcha-msg">Incorrect code — please try the new one.</div>
      </div>`;

    const wrap = mount.querySelector('.captcha-wrap');
    const canvas = mount.querySelector('canvas');
    const input = mount.querySelector('.captcha-input');
    const refreshBtn = mount.querySelector('.captcha-refresh');

    let code = randomCode();
    drawCode(canvas, code);

    function reset() {
      code = randomCode();
      drawCode(canvas, code);
      input.value = '';
    }

    refreshBtn.addEventListener('click', () => {
      wrap.classList.remove('error');
      reset();
      input.focus();
    });
    input.addEventListener('input', () => wrap.classList.remove('error'));

    return {
      verify() {
        const ok = input.value.trim().toUpperCase() === code;
        if (!ok) {
          wrap.classList.remove('error');
          void wrap.offsetWidth; // restart the shake animation
          wrap.classList.add('error');
          reset();
          input.focus();
        }
        return ok;
      },
      reset() {
        wrap.classList.remove('error');
        reset();
      }
    };
  };
})();
