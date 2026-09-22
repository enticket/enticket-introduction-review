(() => {
  const menu = document.querySelector('.menu-toggle');
  const panel = document.getElementById('mobile-menu');
  const header = document.querySelector('.site-header');
  if(header) {
    let previousY = Math.max(0, window.scrollY), frame = 0;
    const updateHeader = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY), delta = y - previousY;
      const keepVisible = y < header.offsetHeight || (panel && !panel.hidden) || header.querySelector(':focus-visible');
      if(keepVisible) header.classList.remove('is-scroll-hidden');
      else if(Math.abs(delta) >= 8) header.classList.toggle('is-scroll-hidden',delta > 0);
      if(keepVisible || Math.abs(delta) >= 8) previousY = y;
    };
    window.addEventListener('scroll', () => { if(!frame) frame = requestAnimationFrame(updateHeader); }, {passive:true});
    header.addEventListener('focusin', () => header.classList.remove('is-scroll-hidden'));
  }
  const close = () => { panel.hidden = true; menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','메뉴 열기'); };
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    panel.hidden = !open; menu.setAttribute('aria-expanded',String(open));
    menu.setAttribute('aria-label',open ? '메뉴 닫기' : '메뉴 열기');
  });
  panel?.addEventListener('click',e => { if(e.target.closest('a')) close(); });
  document.addEventListener('keydown',e => { if(e.key === 'Escape' && panel && !panel.hidden) { close(); menu.focus(); } });
  const wide = matchMedia('(min-width:821px)');
  wide.addEventListener('change',e => { if(e.matches && panel) close(); });
  const form = document.getElementById('contact-form');
  const service = form?.elements.service;
  if(service && location.pathname.endsWith('design.html')) service.value = '디자인·홈페이지 제작';
  if(service && location.pathname.endsWith('media.html')) service.value = '영상제작·행사중계';
  form?.addEventListener('submit',e => {
    e.preventDefault();
    const data = new FormData(form);
    const subject = `[${data.get('service')}] ${data.get('company')} 문의`;
    const body = `담당자: ${data.get('person')}\n기관/기업: ${data.get('company')}\n연락처: ${data.get('phone')}\n이메일: ${data.get('email')}\n문의 분야: ${data.get('service')}\n\n${data.get('message')}`;
    location.href = `mailto:enticket@daum.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    document.getElementById('contact-status').textContent = '메일 앱에서 전송을 완료해 주세요. 앱이 열리지 않으면 enticket@daum.net으로 직접 문의해 주세요.';
  });
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if(!preference.matches && 'IntersectionObserver' in window && Element.prototype.animate) {
    const animations = [];
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting) {
        observer.unobserve(entry.target);
        if(!preference.matches) animations.push(entry.target.animate([{opacity:.65,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:450,easing:'ease-out'}));
      }
    }),{threshold:.08});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
    preference.addEventListener('change', e=> { if(e.matches) {observer.disconnect();animations.forEach(a=>a.cancel());} });
  }
})();
