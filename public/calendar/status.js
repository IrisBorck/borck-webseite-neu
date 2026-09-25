const content = document.querySelector('.calendarContent');
new MutationObserver(() => {
 if (!content.querySelector('table')) return;
 document.querySelector('#calendar-loading').hidden = true;
 content.querySelectorAll('.btn-prev').forEach(a => a.setAttribute('aria-label', 'Vorheriger Monat'));
 content.querySelectorAll('.btn-next').forEach(a => a.setAttribute('aria-label', 'Nächster Monat'));
 window.parent.postMessage({type:'saphir-calendar-ready'}, '*');
}).observe(content, {childList:true,subtree:true});
