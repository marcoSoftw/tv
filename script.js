let ytPlayer = null, m3uPlayer = null, listaVideos = [], apiYoutubeLista = false;

const iconos = {
    youtube: `<svg viewBox="0 0 24 24"><path d="M23.5 6.2c-.3-1.1-1.1-1.9-2.2-2.2C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.3.5c-1.1.3-1.9 1.1-2.2 2.2C0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1.1 1.1 1.9 2.2 2.2 1.9.5 9.3.5 9.3.5s7.4 0 9.3-.5c1.1-.3 1.9-1.1 2.2-2.2.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.5V8.5l6.5 3.5-6.5 3.5z"/></svg>`,
    m3u: `<svg viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.9-.9 1.9-2l.1-12c0-1.1-.9-2-2-2zm0 14H3V5h18v12zm-9-9l-4 4h8l-4-4z"/></svg>`
};

async function inicializarApp() {
    const contenedor = document.getElementById('lista-botones');
    try {
        const res = await fetch('fuentes.json');
        if (!res.ok) throw new Error();
        listaVideos = await res.json();
        
        renderizarBotones();
        configurarBuscador();
        verificarYTodoListo();
    } catch (e) {
        contenedor.innerHTML = `<p style="text-align:center;color:#777;">Error al cargar canales.</p>`;
    }
}

function renderizarBotones() {
    const contenedor = document.getElementById('lista-botones');
    const fragmento = document.createDocumentFragment();

    listaVideos.forEach((video) => {
        const btn = document.createElement('button');
        btn.className = 'btn-video'; // Eliminamos clases de animación individual
        btn.innerHTML = `<span>${video.titulo}</span>${video.tipo === 'youtube' ? iconos.youtube : iconos.m3u}`;
        btn.onclick = () => seleccionarFuente(video, btn);
        fragmento.appendChild(btn);
    });

    contenedor.innerHTML = '';
    contenedor.appendChild(fragmento);
    contenedor.classList.add('lista-cargada'); // Aparece toda la lista de un solo golpe
}

function seleccionarFuente(video, btn = null) {
    const inputBuscador = document.getElementById('buscador');
    const contenedor = document.getElementById('lista-botones');

    // Reset de buscador sin barrido
    if (inputBuscador.value !== "") {
        inputBuscador.value = "";
        contenedor.classList.remove('buscando');
    }

    if (ytPlayer?.stopVideo) try { ytPlayer.stopVideo(); } catch(e){}
    if (m3uPlayer) { m3uPlayer.pause(); m3uPlayer.src(""); }

    if (video.tipo === 'youtube') {
        document.getElementById('m3u-wrapper').classList.remove('active-player');
        document.getElementById('player').classList.add('active-player');
        if (window.YT?.Player) {
            if (!ytPlayer) {
                ytPlayer = new YT.Player('player', {
                    height: '100%', width: '100%', videoId: video.id,
                    playerVars: { 'autoplay': 0, 'mute': 0, 'playsinline': 1, 'rel': 0 },
                    events: { 'onReady': (e) => e.target.playVideo() }
                });
            } else ytPlayer.loadVideoById(video.id);
        }
    } else {
        document.getElementById('player').classList.remove('active-player');
        document.getElementById('m3u-wrapper').classList.add('active-player');
        if (!m3uPlayer) m3uPlayer = videojs('m3u-player', { fill: true, autoplay: true, preload: 'none' });
        m3uPlayer.src({ type: 'application/x-mpegURL', src: video.id });
        m3uPlayer.play();
    }
    if (btn) resaltarBoton(btn);
}

function configurarBuscador() {
    const input = document.getElementById('buscador'), contenedor = document.getElementById('lista-botones');
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (term.length > 0) {
            contenedor.classList.add('buscando');
            document.querySelectorAll('.btn-video').forEach(btn => {
                const text = btn.querySelector('span').innerText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                btn.classList.toggle('hidden', !text.includes(term));
            });
        } else {
            contenedor.classList.remove('buscando');
        }
    });
}

function resaltarBoton(btnActivo) {
    document.querySelectorAll('.btn-video').forEach(b => b.classList.remove('active'));
    btnActivo.classList.add('active');
}

function verificarYTodoListo() {
    if (window.YT?.Player && listaVideos.length > 0) {
        seleccionarFuente(listaVideos[0], document.querySelector('.btn-video'));
    } else setTimeout(verificarYTodoListo, 200);
}

function onYouTubeIframeAPIReady() { apiYoutubeLista = true; }

window.onload = inicializarApp;
