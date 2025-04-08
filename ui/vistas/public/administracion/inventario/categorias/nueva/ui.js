casaVitini.view = {
    start: function () {

        const main = document.querySelector("main")
        const botonCrear = main.querySelector("[boton=crear]")
        botonCrear.addEventListener("click", () => { this.crearNuevaCategoria() })

    },
    crearNuevaCategoria: async function (data) {
        const main = document.querySelector("main")
        const categoriaUI = main.querySelector("[campo=categoriaUI]").value
        const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
        const contenedor = ui.querySelector("[componente=contenedor]")
        main.appendChild(ui)

        const spinner = casaVitini.ui.componentes.spinnerSimple()
        contenedor.appendChild(spinner)

        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/inventario/categorias/crearCategoria",
            categoriaUI
        })
        main.classList.remove("flextJustificacion_center")

        if (respuestaServidor.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
        }
        if (respuestaServidor.ok) {
            const categoriaUID = respuestaServidor.categoriaUID
            casaVitini.shell.navegacion.controladorVista({
                vista: `/administracion/inventario/categorias/categoria:${categoriaUID}`,
                tipoOrigen: "menuNavegador"
            })
        }

    },
}