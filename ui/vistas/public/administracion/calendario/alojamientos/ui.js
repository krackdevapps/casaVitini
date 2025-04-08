casaVitini.view = {
    start: function () {
        this.mostrarAlojamientos()

    },
    mostrarAlojamientos: async function () {


        const main = document.querySelector("main")
        main.classList.add("flextJustificacion_center")
        const instanciaUID = main.getAttribute("instanciaUID")

        const spinner = casaVitini.ui.componentes.spinnerSimple()
        main.appendChild(spinner)

        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/componentes/apartamentosDisponiblesConfigurados"
        })
        spinner.remove()
        main.classList.remove("flextJustificacion_center")
        main.classList.add("flexInteriorExprandido")


        const mER = casaVitini.ui.componentes.constructorElemento({
            tipoElemento: "div",
            classList: [
                "marcoElasticoRelativo",
            ],
            atributos: {
                contenedor: "marcoElasticoRelativo",
            },
        })
        main.appendChild(mER)
        const instanciaRenderizada = main.getAttribute("instanciaUID")

        if (instanciaRenderizada !== instanciaUID) { return }
        if (respuestaServidor?.error) {
            const infoUI = document.createElement("div")
            infoUI.classList.add("padding16")
            infoUI.textContent = respuestaServidor.error
            mER.appendChild(infoUI)

        }
        if (respuestaServidor.ok) {
            const infoUI = document.createElement("div")
            infoUI.classList.add("padding16", "titulo")
            infoUI.textContent = "Calendarios"
            mER.appendChild(infoUI)

            const apartamentosConfigurados = respuestaServidor.ok

            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("contenedorBotones")
            mER.appendChild(contenedorBotones)

            for (const a of apartamentosConfigurados) {

                const apartamentoIDV = a.apartamentoIDV
                const apartamentoUI = a.apartamentoUI

// /capa:reservas_por_apartamento/capa:precio_noche_por_apartamento/reservas_por_apartamento:apartamento5/precio_noche_por_apartamento:apartamento5

                const ui = document.createElement("a")
                ui.classList.add("tituloContextoAdministracion", "gap10")
                ui.setAttribute("apartamentoIDV", apartamentoIDV)
                ui.href = `/administracion/calendario/capa:reservas_por_apartamento/capa:precio_noche_por_apartamento/reservas_por_apartamento:${apartamentoIDV}/precio_noche_por_apartamento:${apartamentoIDV}`
                ui.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                contenedorBotones.appendChild(ui)

                const aUI = document.createElement("p")
                aUI.classList.add("negrita", "paddingLateral16")
                aUI.textContent = apartamentoUI
                ui.appendChild(aUI)

                const contenedorData = document.createElement("div")
                contenedorData.classList.add("flexVertical", "paddingLateral16", "gap6")
                ui.appendChild(contenedorData)


            };
        }
    },

}