casaVitini.view = {
    start: async () => {
        const main = document.querySelector("main")

        const mmssASegundos = (tiempo) => {
            const [minutos, segundos] = tiempo.split(':').map(Number);
            return (minutos * 60) + segundos;
        }

        const video = main.querySelector("[componente=video]")
        video.addEventListener('loadeddata', () => {
            const tiempos = [
                "00:00",
                "00:36",
                "00:51",
                // "01:07",
                // "01:20",
                "01:51",
                // "02:07",
                "02:41",
                "02:49",
                "02:58",
                // "03:09",
                // "03:35",
                "03:46",
                "04:03",
                "04:13",
                // "04:28",
                "04:50",
                "05:33",
                "06:03",
                // "07:03",
                // "07:48",
                // "08:05"
            ];
            const posicionAleatoria = Math.floor(Math.random() * tiempos.length)
            const tiempoAleatorio = tiempos[posicionAleatoria];

            video.currentTime = mmssASegundos(tiempoAleatorio);

        })
        video.addEventListener('canplaythrough', () => {
            const playProm = video.play();
            if (playProm !== undefined) {
                playProm.then(_ => {
                    setTimeout(() => {
                        if (video) {
                            video.style.opacity = "1"
                            video.style.transition = "opacity 500ms linear"
                        }
                    }, 1000);
                    console.log("se reproducee+")
                })
                    .catch(error => {
                    });
            }
        })


        document.querySelector("[componente=botonCambiaVistaEnSection]")
            .addEventListener("click", casaVitini.shell.navegacion.cambiarVista)

        const instanciaUID = document.querySelector("main[instanciaUID]").getAttribute("instanciaUID")
        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "plaza/portada/obtenerMensajes"
        })
        const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
        if (!seccionRenderizada) { return }

        if (respuestaServidor?.ok) {
            const mensajes = respuestaServidor.ok
            const titulo = seccionRenderizada.querySelector("[componente=titulo]")
            for (const detallesDelMensaje of mensajes) {
                const mensaje = detallesDelMensaje.mensaje
                const tituloUI = document.createElement("pre")
                tituloUI.classList.add("tituloUI")
                tituloUI.textContent = mensaje
                titulo.insertAdjacentElement("afterend", tituloUI);
            }
        }
    },
}