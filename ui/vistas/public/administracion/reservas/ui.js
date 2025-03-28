casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladoURL.parametros
        main.setAttribute("zonaCSS", "/administracion/reservas")

        const botones = document.querySelectorAll("[componente=botonAdministracion]")
        botones.forEach((boton) => {
            boton.addEventListener("click", (boton) => {
                boton.preventDefault()
                const vista = boton.target.getAttribute("vista")
                const navegacion = {
                    vista: vista,
                    tipoOrigen: "menuNavegador"
                }
                casaVitini.shell.navegacion.controladorVista(navegacion)
            })
        })

        if (parametros.reserva) {
            main.innerHTML = null
            main.setAttribute("zonaCSS", "administracion/reservas/detallesReserva")

            const marcoElastico = document.createElement("div")
            marcoElastico.classList.add(
                "marcoElasticoRelativo"
            )
            main.appendChild(marcoElastico)


            const reservaUID = parametros.reserva
            const reservaUI = await this.__sharedMethods__.detallesReservaUI.reservaUI.despliege({
                reservaUID,
                configuracionVista: "administrativa",
                destino: marcoElastico
            })

            if (reservaUI === "ok") {
                const zonaURL = parametros.zona

                if (zonaURL) {
                    const categoriaGlobalIDV = casaVitini.utilidades.cadenas.snakeToCamel(zonaURL)
                    this.__sharedMethods__.detallesReservaUI.reservaUI.ui.componentesUI.categoriasGlobalesUI.controladorCategorias({
                        origen: "url",
                        categoria: categoriaGlobalIDV
                    })
                }
        
            }
            


        }
    }
}
