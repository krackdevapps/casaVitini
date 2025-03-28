casaVitini.view = {
    start: function () {
        // document.body.style.backgroundImage = 'url("activos/imagenes/contacto.jpg")';
        // document.querySelector("#uiLogo").style.filter = "invert(1)"
        // document.querySelector("[componente=botonMenuResponsivo]").style.filter = "invert(1)"

        // const hs = document.createElement("script")
        // hs.src = "/componentes/reservacom"
        // document.querySelector("main").appendChild(hs)


        // Escuchar el evento 'load' para asegurarse de que el script se cargue por completo
        // hs.addEventListener('load', () => {

        //     // Aquí puedes llamar a la función del script cargado
        //     const myComponent = document.querySelector('[com=reserva-ui]');

        //     myComponent.entrada()

        // });
        this.controlRenderizadoMapa()

    },
    controlRenderizadoMapa: function () {

        const main = document.querySelector("main")
        const cookies = casaVitini.componentes.privacidad.obtenerCookies()
        const contenedor = main.querySelector("[contenedor=mapa]")
        contenedor.textContent = null
        if (cookies.privacidad === "consentimientoAceptado") {
            console.log("test")
            const mapaGooble = this.mapaGoogle()
            contenedor.appendChild(mapaGooble)
        } else if (cookies.privacidad === "consentimientoRechazado") {
            const mapaGooble = this.mapaImagen()
            contenedor.appendChild(mapaGooble)
        } else {
            const mapaGooble = this.mapaImagen()
            contenedor.appendChild(mapaGooble)
        }

    },
    mapaGoogle: function () {

        const iframe = document.createElement("iframe")
        iframe.src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3910.1149306281377!2d-86.12578416153767!3d11.471629428276767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f742fa1828b5613%3A0xf2a68cacdeabc68f!2sCasa%20Vitini%20%7C%20Apartments!5e0!3m2!1ses!2ses!4v1705767697284!5m2!1ses!2ses"
        iframe.style.border = "0"
        iframe.setAttribute("allowfullscreen", "")
        iframe.setAttribute("loading", "lazy")
        iframe.classList.add("frameGoogleMaps")
        iframe.setAttribute("frameborder", "0")
        iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade")
        iframe.defer = true
        return iframe
    },
    mapaImagen: function () {

        const mapa = document.createElement("div")
        mapa.classList.add("frameGoogleMaps", "fondoMapa")
        return mapa

    }
}