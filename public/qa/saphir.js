const width = document.querySelector('#qa-width');
const frame = document.querySelector('#qa-frame');
width.addEventListener('change', () => { frame.style.width = `${Number(width.value)}px`; });

frame.src = `../apartments/saphir/?qa=${Date.now()}`;
