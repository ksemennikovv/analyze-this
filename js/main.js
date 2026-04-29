function initCarousel(slidesId, prevId, nextId){
  const slidesContainer = document.getElementById(slidesId);
  if(!slidesContainer) return;
  const slides = Array.from(slidesContainer.children);
  const total = slides.length;
  let idx = 0;
  slides[0].classList.add('active');
  function go(newIdx){
    slides[idx].classList.remove('active');
    idx = (newIdx + total) % total;
    slides[idx].classList.add('active');
  }
  document.getElementById(prevId).addEventListener('click', () => go(idx - 1));
  document.getElementById(nextId).addEventListener('click', () => go(idx + 1));
}
initCarousel('rvSlides','rvPrev','rvNext');
initCarousel('vidSlides','vidPrev','vidNext');

(function(){
  const el = document.getElementById('socialCount');
  if(!el) return;
  let count = 23432;
  function format(n){
    return n.toLocaleString('ru-RU').replace(/\u00A0/g,' ') + '+ уже попробовали';
  }
  el.textContent = format(count);
  function tick(){
    count += 1;
    el.textContent = format(count);
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 500);
    const next = (5 + Math.random() * 25) * 1000;
    setTimeout(tick, next);
  }
  setTimeout(tick, (5 + Math.random() * 25) * 1000);
})();

(function(){
  var orb=document.getElementById('logoOrb');
  if(!orb)return;
  orb.addEventListener('click',function(){
    orb.classList.add('is-active');
    if(navigator.vibrate)try{navigator.vibrate(12)}catch(e){}
    setTimeout(function(){orb.classList.remove('is-active')},900);
  });
})();
