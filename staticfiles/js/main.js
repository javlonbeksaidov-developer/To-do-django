/* UyBor — umumiy interaktivlik (kutubxonasiz) */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Mavzu (kunduzgi / tungi)
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-theme-toggle]');
    if (!t) return;
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (_) {}
  });

  // Mobil menyu
  document.addEventListener('click', (e) => {
    const app = $('#app');
    if (!app) return;
    if (e.target.closest('[data-nav-toggle]')) app.classList.toggle('nav-open');
    else if (app.classList.contains('nav-open') && !e.target.closest('#sidebar')) app.classList.remove('nav-open');
  });

  // Xabarlarni yopish va avtomatik yashirish
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-dismiss]');
    if (b) b.closest('.msg').remove();
  });
  setTimeout(() => $$('.msg.success').forEach((m) => m.remove()), 5000);

  // Orqaga va chop etish
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-back]')) { e.preventDefault(); history.back(); }
    if (e.target.closest('[data-print]')) window.print();
  });

  // Jadvalni brauzerda filtrlash
  document.addEventListener('input', (e) => {
    const inp = e.target.closest('[data-filter]');
    if (!inp) return;
    const q = inp.value.trim().toLowerCase();
    $$('tbody tr', $(inp.dataset.filter)).forEach((tr) => {
      tr.hidden = q && !tr.textContent.toLowerCase().includes(q);
    });
  });

  // O'chirish tugmalarida tasdiqlash (data-confirm="Matn")
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-confirm]');
    if (el && !confirm(el.dataset.confirm)) e.preventDefault();
  });

  // Rasm oldindan ko'rish
  document.addEventListener('change', (e) => {
    const f = e.target;
    if (f.type !== 'file' || !f.files[0] || !f.files[0].type.startsWith('image/')) return;
    let img = f.parentElement.querySelector('.img-preview');
    if (!img) { img = document.createElement('img'); img.className = 'img-preview'; img.alt = 'Tanlangan rasm'; f.after(img); }
    img.src = URL.createObjectURL(f.files[0]);
  });

  // AJAX formalar: sevimli va "o'qildi". Server JSON qaytarmasa, oddiy yuboriladi.
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('form[data-ajax]');
    if (!form) return;
    e.preventDefault();
    try {
      const res = await fetch(form.action, {
        method: 'POST', body: new FormData(form),
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error(res.status);
      const type = form.dataset.ajax;
      if (type === 'favorite') {
        let on = null;
        try { on = (await res.json()).favorited; } catch (_) {}
        const btn = form.querySelector('button');
        btn.classList.toggle('on', on === null ? !btn.classList.contains('on') : on);
      } else if (type === 'read') {
        const row = form.closest('.notif');
        row.classList.remove('unread');
        form.remove();
      }
    } catch (_) {
      form.removeAttribute('data-ajax');
      form.submit();
    }
  });

  // Dashboard diagrammasi: [{label, income, expense}, ...]
  const dataEl = $('#chart-data'), chart = $('#bar-chart');
  if (dataEl && chart) {
    const rows = JSON.parse(dataEl.textContent);
    const max = Math.max(1, ...rows.map((r) => Math.max(r.income || 0, r.expense || 0)));
    chart.innerHTML = rows.map((r) => `
      <div class="bar">
        <div class="bar-pair">
          <i style="height:0" data-h="${((r.income || 0) / max) * 100}" title="Daromad: ${r.income || 0}"></i>
          <i class="b2" style="height:0" data-h="${((r.expense || 0) / max) * 100}" title="Xarajat: ${r.expense || 0}"></i>
        </div><span>${r.label}</span>
      </div>`).join('');
    requestAnimationFrame(() => $$('i[data-h]', chart).forEach((i) => (i.style.height = i.dataset.h + '%')));
  }
})();
