casaVitini.view = {
    start: () => {
        document.body.style.backgroundImage = 'url("/componentes/imagenes/contacto.jpg")';
        document.querySelector("#uiLogo").style.filter = "invert(1)"
        document.querySelector("[componente=botonMenuResponsivo]").style.filter = "invert(1)"
    }
}