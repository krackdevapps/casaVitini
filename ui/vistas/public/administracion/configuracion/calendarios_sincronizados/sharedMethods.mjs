
export const sharedMethods = {
    formularioCalendario: async function (data) {

        const modo = data.modo

        const formularioUI = document.createElement("div")
        formularioUI.classList.add("formularioUI")
        formularioUI.setAttribute("componente", "formularioUI")
        let definicion = document.createElement("p")
        definicion.classList.add("plataforma")
        definicion.textContent = "Plataforma Airbnb"

        definicion = document.createElement("p")
        definicion.classList.add("definicion")
        definicion.textContent = "Define un nombre para el calendario.Utiliza este nombre en el futuro para poder recordar algo descriptivo de este calendario.Pon el nombre que creas más recordativo."
        formularioUI.appendChild(definicion)
        const nombreCalendario = document.createElement("input")
        nombreCalendario.classList.add("botonV1BlancoIzquierda_campo")
        nombreCalendario.setAttribute("campo", "nombre")
        nombreCalendario.placeholder = "Escribe un nombre para este calendario"
        formularioUI.appendChild(nombreCalendario)
        definicion = document.createElement("p")
        definicion.classList.add("definicion")
        definicion.textContent = "Selecciona el apartamento con el que vas a enlazar este calendario.Los calendarios de Airbnb se enlazan por apartamento.Cada calendario de airbnb es un apartamento"
        formularioUI.appendChild(definicion)
        const tipoApartamentoUI = document.createElement("select")
        tipoApartamentoUI.classList.add("botonV1BlancoIzquierda_campo")
        tipoApartamentoUI.setAttribute("campo", "apartamentoIDV")
        tipoApartamentoUI.addEventListener("change", casaVitini.view.__sharedMethods__.sharedMethodsTemporalLocks.controladorSelectorRangoTemporalUI)
        const tipoApartamentoInicio = document.createElement("option");
        tipoApartamentoInicio.value = "";
        tipoApartamentoInicio.selected = true;
        tipoApartamentoInicio.disabled = true;
        tipoApartamentoInicio.text = "Seleccionar el apartamento a enlazar";
        tipoApartamentoUI.add(tipoApartamentoInicio);
        const apartamentosArray = await casaVitini.view.__sharedMethods__.componentes.obtenerApartamentos()
        if (apartamentosArray.length === 0) {
            const opcion = document.createElement("option");
            opcion.value = "";
            opcion.disabled = true;
            opcion.text = "No hay ningun apartamento disponible";
            tipoApartamentoUI.add(opcion);
        }
        if (apartamentosArray.length > 0) {
            apartamentosArray.forEach((detallesApartamento) => {
                const apartamentoIDV = detallesApartamento.apartamentoIDV
                const aparatmentoUI = detallesApartamento.apartamentoUI
                const opcion = document.createElement("option");
                opcion.value = apartamentoIDV;
                opcion.text = aparatmentoUI;
                tipoApartamentoUI.add(opcion);
            })
        }
        formularioUI.appendChild(tipoApartamentoUI)

        if (modo === "editar") {

            const contenedorURL = document.createElement("div")
            contenedorURL.classList.add(
                "padding10",
                "flexVertical",
                "gap6"
            )
            formularioUI.appendChild(contenedorURL)

            definicion = document.createElement("p")
            definicion.textContent = "Url del calendario de Casa Vitini para exportar. Copia esta url en el otro sistema para sincronziar el calenedario de Casa Vitini con la plataforma de terceros compatible con ICS"
            contenedorURL.appendChild(definicion)

            const icsv2ui = document.createElement("p")
            icsv2ui.textContent = "Formato: ICS V2"
            icsv2ui.classList.add(
                "negrita"
            )
            contenedorURL.appendChild(icsv2ui)

            const urlCalendarioExport = document.createElement("p")
            urlCalendarioExport.classList.add(
                "breakWordkAll"
            )
            urlCalendarioExport.setAttribute("data", "urlExportacion")
            contenedorURL.appendChild(urlCalendarioExport)

            const icsv2uiAirbnb = document.createElement("p")
            icsv2uiAirbnb.textContent = "Formato: ICS V2 Airbnb"
            icsv2uiAirbnb.classList.add(
                "negrita"
            )
            contenedorURL.appendChild(icsv2uiAirbnb)

            const urlCalendarioExport_airbnb = document.createElement("p")
            urlCalendarioExport_airbnb.classList.add(
                "breakWordkAll"
            )
            urlCalendarioExport_airbnb.setAttribute("data", "urlExportacionAirbnbn")
            contenedorURL.appendChild(urlCalendarioExport_airbnb)


            definicion = document.createElement("p")
            definicion.classList.add("definicion")
            definicion.textContent = "Copia aquí la url del calendario de Airbnb, la url debe de ser la que comparte Airbnb para sincronizar calendarios en formato iCal, la url debe de estar en https"
            formularioUI.appendChild(definicion)
            const urlCalendario = document.createElement("input")
            urlCalendario.classList.add("botonV1BlancoIzquierda_campo")
            urlCalendario.setAttribute("campo", "url")
            urlCalendario.placeholder = "Escribe la url del calendario"
            formularioUI.appendChild(urlCalendario)
        }

        return formularioUI
    }

}