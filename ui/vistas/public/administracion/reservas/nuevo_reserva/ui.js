casaVitini.view = {
    start: function () {

        const main = document.querySelector("main")
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladoURL.parametros
        main.setAttribute("zonaCSS", "/administracion/reservas")
        const reservaUID = parametros.reserva

        const reservaUI = document.createElement("reserva-ui");
        reservaUI.setAttribute("com", "reserva-ui");
        main.appendChild(reservaUI);

        const comJS = document.createElement("script")
        comJS.src = "/componentes/reservacom"
        console.log("comJS", comJS)
        comJS.addEventListener('load', () => {

            const com = document.querySelector('[com=reserva-ui]');
            com.arranque()

            com.reserva.reservaUI.despliege({
                reservaUID,
                configuracionVista: "administrativa"
            })
            // const zonaURL = parametros.zona
            // if (zonaURL) {
            //     const categoriaGlobalIDV = casaVitini.utilidades.cadenas.snakeToCamel(zonaURL)
            //     com.reserva.reservaUI.ui.componentesUI.categoriasGlobalesUI.controladorCategorias({
            //         origen: "url",
            //         categoria: categoriaGlobalIDV
            //     })
            // }
        });
        document.querySelector("main").appendChild(comJS)









    }


}