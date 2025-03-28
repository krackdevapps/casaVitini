casaVitini.view = {
    start: function () {
        this.obtenerExistencias()
    },
    obtenerExistencias: async function () {
        const main = document.querySelector("main")
        main.classList.add("flextJustificacion_center")

        const spinner = casaVitini.ui.componentes.spinnerSimple()
        main.appendChild(spinner)

        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/inventario/situacionInventario",
        })

        main.classList.remove("flextJustificacion_center")
        spinner.remove()

        if (respuestaServidor.error) {
            const errorUI = casaVitini.ui.componentes.errorUI_respuestaInmersiva({
                errorUI: respuestaServidor.error
            })
            main.appendChild(errorUI)
        }
        if (respuestaServidor.ok) {

            const existencias = respuestaServidor.existencias
            const contenedorIcono = main.querySelector("[contenedor=icono")
            const situacion = main.querySelector("[data=situacion")
            const descripcion = main.querySelector("[data=descripcion")

            contenedorIcono.classList.remove("iconoOk")
            contenedorIcono.classList.remove("iconoWarning")

            if (existencias.length === 0) {
                contenedorIcono.classList.add("iconoOk")
                situacion.textContent = "Todo está en orden el inventario"
                descripcion.textContent = "En el inventario no hay alertas por falta de existencias mínimas y el resto de elementos tienes más de una unidad"


            } else {

                contenedorIcono.classList.add("iconoWarning")
                situacion.textContent = "Revisa el inventario, hay alertas!"
                descripcion.textContent = "Revisa el resumen de abajo para la situación del inventario."

                existencias.forEach(e => {
                    const elementoUID = e.UID
                    const tipoLimite = e.tipoLimite
                    const nombre = e.nombre
                    const cantidad = e.cantidad
                    const cantidadMinima = e.cantidadMinima

                    if (tipoLimite) {
                        const ui = document.createElement("a")
                        ui.classList.add("botonAlerta")
                        ui.href = `/administracion/inventario/ver_todo_el_inventario/elemento:${elementoUID}`
                        ui.vista = `/administracion/inventario/ver_todo_el_inventario/elemento:${elementoUID}`
                        ui.addEventListener("click", casaVitini.shell.navegacion.controladorVista)

                        const titulo = document.createElement("p")
                        titulo.classList.add("negrita")
                        titulo.textContent = nombre

                        ui.appendChild(titulo)
                        let mensaje
                        if (tipoLimite === "sinLimite") {
                            main.querySelector("[contenedor=alertasPorPocaCantidad]").appendChild(ui)

                            if (cantidad === "1") {
                                mensaje = `Solo queda uno`
                            } else if (cantidad === "0") {
                                mensaje = `No hay ninguno en el almacen`
                            }

                        } else if (tipoLimite === "conLimite") {
                            main.querySelector("[contenedor=alertasPorCantidaddMinima]").appendChild(ui)

                            if (cantidad === "0") {
                                mensaje = `No hay ninguno en el almacen`
                            } else {
                                mensaje = `Este elemento tiene una cantidad minima de ${cantidadMinima} y quedan ${cantidad}`
                            }
                        }

                        const mA = document.createElement("p")
                        mA.textContent = mensaje
                        ui.appendChild(mA)
                    }
                });
            }
        }
    },
}