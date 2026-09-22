/* Restore 9/8 photo choreography inside the 690px content column.
   The stage uses a fixed viewport position while pinned, with no scroll-follow transform.
   Static HTML remains readable without JS or with reduced motion. */
(function () {
  var root = document.querySelector('.nt-about.nt-reference');
  if (!root || !window.requestAnimationFrame) return;
  var scene = root.querySelector('.nt-scene'), stage = root.querySelector('.nt-scene__stage');
  var frames = scene && scene.querySelectorAll('.nt-scene__frame');
  var hasScene = !!(stage && frames && frames.length === 2);
  frames = hasScene ? frames : [];
  var pictures = hasScene ? scene.querySelectorAll('.nt-scene__pic') : [], messages = hasScene ? scene.querySelectorAll('.nt-scene__msg') : [];
  var gallery = root.querySelector('.nt-cv'), cards = gallery ? gallery.querySelectorAll('.nt-cv__item') : [];
  var images = gallery ? gallery.querySelectorAll('.nt-cv__pic img') : [];
  var preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  var enabled = false, raf = 0, sceneProgress = 0, galleryProgress = 0, height = 0, offset = 0;
  var dirs = [-1,1,-1,1], dys = [-120,160,220,-80], rotations = [-6,5,-4,6];
  function clamp(v) { return Math.max(0,Math.min(1,v)); }
  function mix(a,b,p,start,end) { return a+(b-a)*clamp((p-start)/(end-start)); }
  function restore() {
    enabled = false; cancelAnimationFrame(raf); raf = 0;
    root.classList.remove('nt-photo-motion');
    [scene,stage].concat(Array.from(frames),Array.from(pictures),Array.from(messages),Array.from(cards),Array.from(images)).filter(Boolean).forEach(function(e){e.removeAttribute('style');});
  }
  function layout() {
    if (!enabled) return;
    if (!hasScene) { queue(); return; }
    var header = document.querySelector('.site-header');
    var headerHeight = header ? header.getBoundingClientRect().height : 0;
    height = Math.round(Math.max(180,Math.min(innerHeight-headerHeight-32,scene.clientWidth*.75+140)));
    offset = Math.round(headerHeight+Math.max(0,(innerHeight-headerHeight-height)/2));
    stage.style.height = height+'px';
    scene.style.height = (height+Math.round(innerHeight*2.6))+'px';
    pin(); queue();
  }
  function pin() {
    if(!enabled || !hasScene)return;
    var rect=scene.getBoundingClientRect(), travel=scene.offsetHeight-height;
    // Fixed top is constant throughout this interval. Do not lerp or translate the frame.
    if(rect.top<=offset && rect.bottom>=offset+height) {
      stage.style.position='fixed'; stage.style.top=offset+'px';
      stage.style.left=rect.left+'px'; stage.style.width=rect.width+'px';
    } else {
      stage.style.position='absolute'; stage.style.left='0px'; stage.style.width='100%';
      stage.style.top=(rect.top>offset?0:travel)+'px';
    }
    stage.style.transform='none';
  }
  function paint(p) {
    frames[0].style.opacity=mix(1,0,p,.40,.50);
    pictures[0].style.transform='translateY('+mix(0,-8,p,.40,.50)+'%) scale('+mix(1.18,1,p,.08,.30)+')';
    pictures[1].style.transform='scale('+mix(1.12,1,p,.40,.66)+')';
    messages[0].style.opacity=p<.33?mix(0,1,p,.16,.26):mix(1,0,p,.40,.50);
    messages[0].style.transform='translateY('+(p<.33?mix(20,0,p,.16,.26):mix(0,-20,p,.40,.50))+'%)';
    messages[1].style.opacity=mix(0,1,p,.56,.66);
    messages[1].style.transform='translateY('+mix(20,0,p,.56,.66)+'%)';
  }
  function tick() {
    raf=0;if(!enabled)return;
    var top=hasScene ? scene.getBoundingClientRect().top : 0;
    var target=hasScene ? clamp((offset-top)/Math.max(1,scene.offsetHeight-height)) : 0;
    sceneProgress+=(target-sceneProgress)*.2;
    if(Math.abs(target-sceneProgress)<.0005)sceneProgress=target;
    if(hasScene)paint(sceneProgress);
    var galTarget=gallery?clamp((innerHeight*.9-gallery.getBoundingClientRect().top)/(innerHeight*.82)):1;
    galleryProgress+=(galTarget-galleryProgress)*.16;
    if(Math.abs(galTarget-galleryProgress)<.0005)galleryProgress=galTarget;
    var k=Math.pow(1-galleryProgress,3),width=gallery?gallery.clientWidth:0;
    cards.forEach(function(card,i){card.style.transform='translate3d('+(dirs[i%4]*width*.95*k)+'px,'+(dys[i%4]*k)+'px,0) rotate('+(rotations[i%4]*k)+'deg)';});
    images.forEach(function(img){var rect=img.parentElement.getBoundingClientRect();var t=clamp((innerHeight-rect.top)/(innerHeight+rect.height));img.style.transform='translate3d(0,'+(-14*t)+'%,0)';});
    if(sceneProgress!==target||galleryProgress!==galTarget)queue();
  }
  function queue(){if(enabled&&!raf)raf=requestAnimationFrame(tick);}
  function configure(){restore();if(preference.matches)return;enabled=true;root.classList.add('nt-photo-motion');layout();}
  window.addEventListener('scroll',function(){pin();queue();},{passive:true});window.addEventListener('resize',layout);
  if(preference.addEventListener)preference.addEventListener('change',configure);
  window.addEventListener('beforeprint',restore);window.addEventListener('afterprint',configure);
  configure();if(document.fonts)document.fonts.ready.then(layout);
})();

/* Original 9/8 counters: run once on entry, with the original 2.4s ease-out. */
(function () {
  var root = document.querySelector('.nt-about--embedded');
  var list = root && root.querySelector('.nt-stats ul');
  if (!list || !window.IntersectionObserver || !window.requestAnimationFrame) return;
  var els = Array.from(list.querySelectorAll('.nt-count'));
  var targets = els.map(function(el) { return Number(el.getAttribute('data-count')); });
  var preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  var started = false, raf = 0, observer;
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function finish() {
    cancelAnimationFrame(raf);
    els.forEach(function(el,i) { el.textContent = fmt(targets[i]); });
  }
  if (preference.matches) return;
  els.forEach(function(el,i) {
    // Keep the final value available to assistive technology while digits animate.
    el.setAttribute('aria-label', fmt(targets[i]));
    el.textContent = '0';
  });
  observer = new IntersectionObserver(function(entries) {
    if (started || !entries.some(function(entry) { return entry.isIntersecting; })) return;
    started = true; observer.disconnect();
    if (preference.matches) { finish(); return; }
    var start = null;
    function step(now) {
      if (start === null) start = now;
      var progress = Math.min(1,(now-start)/2400);
      var eased = 1-Math.pow(1-progress,4);
      els.forEach(function(el,i) { el.textContent = fmt(targets[i]*eased); });
      if (progress < 1) raf = requestAnimationFrame(step);
      else finish();
    }
    raf = requestAnimationFrame(step);
  }, {threshold:0.15});
  observer.observe(list);
  function stop() { started = true; observer.disconnect(); finish(); }
  if (preference.addEventListener) preference.addEventListener('change',function(e) { if(e.matches) stop(); });
  window.addEventListener('beforeprint',stop);
})();

/* Optional, progressive decoration only: content stays visible without JavaScript. */
(function () {
  var root = document.querySelector('.nt-about--embedded');
  if (!root || !window.IntersectionObserver || !Element.prototype.animate) return;
  var preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches) return;
  var animations = [];
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (preference.matches) return;
      animations.push(entry.target.animate([{opacity:.7, transform:'translateY(12px)'},{opacity:1, transform:'none'}], {duration:450,easing:'ease-out'}));
    });
  }, {threshold:0.08});
  root.querySelectorAll('.nt-reveal').forEach(function (el) { observer.observe(el); });
  function stop(e) { if(e.matches) {observer.disconnect(); animations.forEach(function(a){a.cancel();});} }
  if(preference.addEventListener) preference.addEventListener('change',stop);
})();
