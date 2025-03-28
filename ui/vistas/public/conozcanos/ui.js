casaVitini.view = {
    start: function () {
        const loadScript = async (url) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url;
                script.onload = () => resolve(script);
                script.onerror = () => reject(new Error(`Error al cargar el script ${url}`));
                document.querySelector('main').appendChild(script);
            });
        };
        const arranqueParallax = async () => {
            try {
                const scriptElement = await loadScript("/activos/javascript/simpleParallax.js");
                const grupoImagenesPalarax = document.querySelectorAll('[imagenParalaje=imagen]');

                this.volatilObservers.parallaxControlador = new simpleParallax(grupoImagenesPalarax, {
                    delay: 0,
                    orientation: 'down',
                    scale: 1.4,
                    overflow: false,

                });
            } catch (errorCapturado) {
                console.error(errorCapturado);
            }
        };
        arranqueParallax();

        // Define la función controlImagen y guarda el observer en __observers__.controlImagen
        this.__observers__.controlImagen = () => {
            const elementos = document.querySelectorAll('[urlImagen]');

            // Crear y almacenar el IntersectionObserver
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.intersectionRatio >= 0.1) { // Umbral del 50%
                        const div = entry.target;

                        // Añadir el fondo dinámicamente
                        const bgUrl = div.getAttribute('urlImagen');
                        div.style.backgroundImage = `url(${bgUrl})`;

                        // Dejar de observar el elemento
                        observer.unobserve(div);
                    }
                });
            }, {
                threshold: 0.1 // Umbral del 50%
            });

            // Observa cada elemento
            elementos.forEach(el => observer.observe(el));

            // Retorna el observer para almacenamiento
            return observer;
        };

        // Llamar a controlImagen para inicializar la observación
       this.__observers__.controlImagen();
    },
    controladorParalaje: () => {
        const contenedoresPalaraje = document.querySelectorAll("[contenedorParalaje]")
        contenedoresPalaraje.forEach((contenedorParalaje) => {
            const parallaxContainer2 = contenedorParalaje;
            const parallaxImage2 = contenedorParalaje.querySelector('[imagenParalaje]');
            const nombreImagen = parallaxImage2.getAttribute("nombre")
            const textoAnimado = contenedorParalaje.querySelector('[elemento=textoAnimado]');
            const containerRect2 = parallaxContainer2.getBoundingClientRect();
            const windowInnerHeight = window.innerHeight
            const containerBottom = containerRect2.bottom
            const containerTop = containerRect2.top
            requestAnimationFrame(() => {
                if ((containerTop < 0 && containerBottom < windowInnerHeight) ||
                    (containerTop < windowInnerHeight && containerBottom > 0)) {
                    const parallaxTop2 = parallaxContainer2.offsetTop;
                    const parallaxHeight2 = parallaxContainer2.offsetHeight;
                    const conCero = (windowInnerHeight < parallaxTop2 + parallaxHeight2 ?
                        windowInnerHeight : parallaxTop2 + parallaxHeight2) -
                        (containerTop + parallaxHeight2);
                    if (
                        (containerTop < 0 &&
                            containerBottom < windowInnerHeight)
                        ||
                        (containerTop > 0 &&
                            containerBottom > windowInnerHeight)
                    ) {

                        if (textoAnimado) {
                            textoAnimado.style.transform = 'translate3d(0 ,-' + (conCero) + 'px ,0)';
                        }
                    }
                }
            })
        })
    },
    volatilObservers: {
        parallaxControlador: null,
    },
    __observers__: {}
}