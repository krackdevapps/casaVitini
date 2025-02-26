
export const sharedMethods_resumen = {
    servicioUI: function (data) {

        const servicioUID = data.servicioUID
        const contenedor = data.contenedor
        const gruposDeOpciones = contenedor.gruposDeOpciones
        const definicion = contenedor.definicion
        const fechaFinal = contenedor.fechaFinal
        const duracionIDV = contenedor.duracionIDV
        const fechaInicio = contenedor.fechaInicio
        const tituloPublico = contenedor.tituloPublico
        const disponibilidadIDV = contenedor.disponibilidadIDV

        const diccionario = {
            disponibilidad: {
                constante: "Disponible",
                variable: "Disponibilidad variable"
            }
        }

        const servicioUI = document.createElement("details")
        servicioUI.setAttribute("servicioUID", servicioUID)
        servicioUI.classList.add(
            "flexVertical",
            "padding6",
            "backgroundGrey1",
            "sobreControlAnimacionGlobal",
            "borderRadius18",

        )

        const contenedorGlobal = document.createElement("summary")
        contenedorGlobal.classList.add(
            "contenedorGlobal",
            "margin0",
            "borderRadius14",
            "padding6",
        )
        servicioUI.appendChild(contenedorGlobal)

        const iconoDetails = document.createElement("div")
        iconoDetails.style.display = "list-item"
        iconoDetails.style.padding = "0px"
        iconoDetails.style.marginTop = "0px"
        iconoDetails.style.marginBottom = "0px"
        iconoDetails.style.marginLeft = "6px"
        iconoDetails.style.marginRight = "0px"
        iconoDetails.textContent = ""
        iconoDetails.classList.add(
            "padding6",
        )
        contenedorGlobal.appendChild(iconoDetails)

        const esferaSeleccionable = document.createElement("div")
        esferaSeleccionable.classList.add(
            "esferaSeleccionable"
        )
        contenedorGlobal.appendChild(esferaSeleccionable)

        const indicadorDeSeleccion = document.createElement("div")
        indicadorDeSeleccion.setAttribute("componente", "indicadorSelecion")
        indicadorDeSeleccion.setAttribute("indicador", "global")
        indicadorDeSeleccion.classList.add(
            "indicadorDeSeleccion"
        )
        esferaSeleccionable.appendChild(indicadorDeSeleccion)

        const titulo = document.createElement("p")
        titulo.setAttribute("data", "servicioUI")
        titulo.classList.add(
            "padding6",
            "negrita"
        )
        titulo.textContent = tituloPublico
        contenedorGlobal.appendChild(titulo)

        const disponibilidadUI = document.createElement("p")
        disponibilidadUI.classList.add(
            "padding6"
        )
        disponibilidadUI.textContent = diccionario.disponibilidad[disponibilidadIDV]
        servicioUI.appendChild(disponibilidadUI)

        if (disponibilidadIDV === "variable") {

            const info = document.createElement("p")
            info.classList.add(
                "padding6"
            )
            info.textContent = `Este servicio tiene una disponibilidad limitada. Es por eso que si selecciona este servicio, nos pondremos en contacto con el titular de la reserva en las próximas horas para confirmarle la disponibilidad del servicio para su reserva.`
            servicioUI.appendChild(info)
        }

        if (duracionIDV === "rango") {
            const contenedorDuracion = document.createElement("div")
            contenedorDuracion.classList.add(
                "flexVertical",
                "padding6"

            )
            servicioUI.appendChild(contenedorDuracion)

            const info = document.createElement("p")
            info.classList.add("negrita")
            info.textContent = `Servicio disponible solo desde ${fechaInicio} hata ${fechaFinal}. Ambas fechas incluidas.`
            contenedorDuracion.appendChild(info)

        }
        const definicionUI = document.createElement("pre")
        definicionUI.classList.add(
            "padding6",
            "whiteSpace"
        )
        definicionUI.textContent = definicion
        servicioUI.appendChild(definicionUI)

        const componentesUI = casaVitini.view.__sharedMethods__.serviciosUI
        const cgdoUI = componentesUI.contenedor_gruposDeOpciones()
        servicioUI.appendChild(cgdoUI)

        Object.entries(gruposDeOpciones).forEach(([grupoIDV, go]) => {
            const nombreGrupo = go.nombreGrupo


            const configuracionGrupo = go.configuracionGrupo
            const grupoDeOpciones = componentesUI.grupoDeOpciones()
            grupoDeOpciones.querySelector("[data=titulo]").textContent = nombreGrupo
            grupoDeOpciones.setAttribute("grupoIDV", grupoIDV)
            grupoDeOpciones.setAttribute("conf", JSON.stringify(configuracionGrupo))
            cgdoUI.appendChild(grupoDeOpciones)

            const opcionesGrupo = go.opcionesGrupo
            opcionesGrupo.forEach((og) => {
                const nombreOpcion = og.nombreOpcion
                const precioOpcion = og.precioOpcion
                const opcionIDV = og.opcionIDV


                const opcionUI = componentesUI.opcionUI()
                opcionUI.addEventListener("click", (e) => {
                    componentesUI.controladorSeleccion(e)
                })
                opcionUI.setAttribute("opcionIDV", opcionIDV)
                opcionUI.querySelector("[data=opcionUI]").textContent = nombreOpcion
                grupoDeOpciones.appendChild(opcionUI)
            })
        })
        return servicioUI
    },
}