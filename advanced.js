(function(){
  'use strict';
  var search=document.getElementById('moduleSearch'),nav=document.getElementById('side'),only=false,favorites=[];
  try{var saved=JSON.parse(localStorage.getItem('sor_favorites')||'[]');if(Array.isArray(saved))favorites=saved.filter(function(s){return typeof s==='string';});}catch(e){}
  document.title='Asystent lekarza SOR — narzędzie pomocnicze, niecertyfikowane';
  document.getElementById('ver').textContent='v5.1';
  var pin=document.createElement('button');pin.id='pinModule';pin.className='tg';pin.title='Dodaj lub usuń bieżący moduł z ulubionych';document.getElementById('top').appendChild(pin);
  var menu=document.createElement('button');menu.id='mobileMenu';menu.className='tg';menu.textContent='☰ Moduły';menu.setAttribute('aria-expanded','false');document.getElementById('top').prepend(menu);
  menu.onclick=function(){var open=document.body.classList.toggle('nav-open');menu.setAttribute('aria-expanded',String(open));};
  function current(){return nav.querySelector('button.on')?.dataset.id||'dashboard';}
  function norm(s){return s.toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l');}
  function filter(){var query=norm(search.value),count=0;nav.querySelectorAll('button').forEach(function(b){var fav=favorites.includes(b.dataset.id);b.hidden=!(norm(b.textContent).includes(query)&&(!only||fav));if(!b.hidden)count++;b.classList.toggle('is-favorite',fav);});nav.querySelectorAll('hr').forEach(function(h){h.hidden=!!query||only;});document.getElementById('navEmpty').hidden=count>0;var on=favorites.includes(current());pin.textContent=on?'★ Ulubiony':'☆ Zapisz moduł';pin.setAttribute('aria-pressed',String(on));}
  pin.onclick=function(){var id=current(),i=favorites.indexOf(id);if(i<0)favorites.push(id);else favorites.splice(i,1);try{localStorage.setItem('sor_favorites',JSON.stringify(favorites));}catch(e){}filter();};
  search.oninput=filter;
  document.getElementById('favoritesOnly').onclick=function(){only=!only;this.setAttribute('aria-pressed',String(only));filter();};
  nav.addEventListener('click',function(e){if(e.target.closest('button')){document.body.classList.remove('nav-open');menu.setAttribute('aria-expanded','false');}});
  new MutationObserver(filter).observe(nav,{childList:true});
  document.addEventListener('keydown',function(e){if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();document.body.classList.add('nav-open');menu.setAttribute('aria-expanded','true');search.focus();}if(e.key==='Escape'&&document.activeElement===search){search.value='';filter();search.blur();}});
  var status=document.createElement('div');status.className='connection-state';status.setAttribute('role','status');document.getElementById('top').appendChild(status);
  function online(){status.textContent=navigator.onLine?'● Lokalna praca w przeglądarce':'● Offline';}window.addEventListener('online',online);window.addEventListener('offline',online);online();
  var about=SKM.list.find(function(m){return m.id==='about';}),original=about.render;about.render=function(el){original(el);var note=document.createElement('div');note.className='notice';note.textContent='Rozszerzenia 4.0–5.0: pulpit, wyszukiwanie, ulubione, dokumentacja z zatwierdzaniem i importem/eksportem, trendy wyników. Oryginalne algorytmy kliniczne pozostają materiałem roboczym. Nie wykonano walidacji klinicznej całego produktu. Materiał dokumentacji nie trafia do localStorage. Dotychczasowe kalkulatory zapisują parametry lokalnie w przeglądarce; użyj „Następny pacjent”, aby je usunąć.';el.appendChild(note);};
  filter();
})();
