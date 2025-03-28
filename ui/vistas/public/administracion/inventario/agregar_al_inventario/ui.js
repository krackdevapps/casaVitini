casaVitini.view = {
    start: function () {
        const main = document.querySelector("main")

        const campoTipoLimite = main.querySelector("[campo=tipoLimite]")
        campoTipoLimite.addEventListener("click", (e) => {
            this.controladorTipoLimte(e)
        })

        const botonCrear = main.querySelector("[boton=crear]")
        botonCrear.addEventListener("click", () => {
            this.crearElemento()
        })
    },
    controladorTipoLimte: function (e) {
        const elemento = e.target
        const opcionSel = elemento.value
        const selectorContendorLimiteMinimo = elemento.closest("main").querySelector("[contenedor=limiteMinimo]")

        if (opcionSel === "sinLimite") {
            selectorContendorLimiteMinimo.classList.add("ocultoInicial")

        } else if (opcionSel === "conLimite") {
            selectorContendorLimiteMinimo.classList.remove("ocultoInicial")
        }
    },
    crearElemento: async function () {

        const main = document.querySelector("main")
        const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
        const contenedor = ui.querySelector("[componente=contenedor]")
        main.appendChild(ui)

        const spinner = casaVitini.ui.componentes.spinnerSimple()
        contenedor.appendChild(spinner)

        const o = this.crearObjeto()
        const transaccion = {
            zona: "administracion/inventario/crearNuevoElemento",
            ...o
        }

        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        if (respuestaServidor.error) {
            contenedor.innerHTML = null
            const errorUI = casaVitini.ui.componentes.errorUI_respuestaInmersiva({
                errorUI: respuestaServidor.error
            })
            contenedor.appendChild(errorUI)
        }
        if (respuestaServidor.ok) {
            const elementoUID = respuestaServidor.elementoUID
            casaVitini.shell.navegacion.controladorVista({
                vista: `/administracion/inventario/ver_todo_el_inventario/elemento:${elementoUID}`,
                tipoOrigen: "menuNavegador"
            })


        }
    },
    crearObjeto: function () {
        const main = document.querySelector("main")
        const selectorCampos = main.querySelectorAll("[campo]")

        const c = {}

        selectorCampos.forEach(sC => {
            const campo = sC.getAttribute("campo")
            const valor = sC.value

            c[campo] = valor
        })
        return c
    }
}