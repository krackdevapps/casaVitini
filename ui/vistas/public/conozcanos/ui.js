casaVitini.view = {
    start: function () {
      //  document.querySelector("main").style.paddingBottom = "20px"
        document.body.style.backgroundColor = "rgb(255 188 0 / 0.14)"

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
    },
    controladorIconoMouse: function () {
        const iconoRaton = document.querySelector("[icono=mouse]")
        if (!iconoRaton) {
            window.removeEventListener('scroll', () => {
                this.controladorIconoMouse()
            });
        }
        const alturaScroll = window.scrollY
        if (iconoRaton && alturaScroll > 10) {
            iconoRaton.addEventListener("transitionend", (e) => {

            })
            iconoRaton.style.opacity = "0"
        } else {
            iconoRaton.style.opacity = "1"
        }
    },
    scrollHandler: function () {
        let animationRunning = false;
        if (!animationRunning) {
            animationRunning = true;
            requestAnimationFrame(() => {
                this.controladorParalaje()
                animationRunning = false;
            });
        }
        const contenedorParalaje = document.querySelector("[contenedor=paralaje]")
        if (!contenedorParalaje) {
            window.removeEventListener('scroll', () => {
                this.scrollHandler()
            });
        }
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
}