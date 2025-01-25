casaVitini.view = {
    start: function()  {
        this.UI()
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/gestion_de_bloqueos/bloqueoUI")
    },
    UI: async function ()  {
        const selectorEspacioBloqueos = document.querySelector("[componente=bloqueosTemporales]")
        const contenedorGlobal = document.createElement("div")
        contenedorGlobal.classList.add("detallesBloqueos_contenedorGlobal")
        contenedorGlobal.setAttribute("componente", "contenedorGlobal")

        const bloqueBloqueoUI = document.createElement("div")
        bloqueBloqueoUI.classList.add("detallesBloqueos_bloqueBloqueoUI")
        bloqueBloqueoUI.setAttribute("componente", "contenedorDelBloqueo")

        const contenedorOpcionesTroncales = document.createElement("div")
        contenedorOpcionesTroncales.classList.add("detallesloqueos_contenedorBloquesGlobales")
        const contenedorApartamentosV2 = document.createElement("div")
        contenedorApartamentosV2.classList.add("detallesBloqueo_contenedorTipoBloqueoV2")
        const tipoApartamentoTituloUI = document.createElement("div")
        tipoApartamentoTituloUI.classList.add("listaBloqueos_titulo")
        tipoApartamentoTituloUI.classList.add("negrita")
        tipoApartamentoTituloUI.textContent = "Apartamento: "
        contenedorApartamentosV2.appendChild(tipoApartamentoTituloUI)
        const tipoApartamentoUI = document.createElement("select")
        tipoApartamentoUI.classList.add("administracion_bloqueos_detallesBloqueo_listaSelec")
        tipoApartamentoUI.setAttribute("datoBloqueo", "apartamento")
        tipoApartamentoUI.addEventListener("change",() => { casaVitini.view.__sharedMethods__.controladorSelectorRangoTemporalUI()})
        const tipoApartamentoInicio = document.createElement("option");
        tipoApartamentoInicio.value = "";
        tipoApartamentoInicio.selected = true;
        tipoApartamentoInicio.disabled = true;
        tipoApartamentoInicio.text = "Seleccionar el apartamento";
        tipoApartamentoUI.add(tipoApartamentoInicio);
        const apartamentosArray = await this.obtenerApartamentos()
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
        contenedorApartamentosV2.appendChild(tipoApartamentoUI)
        contenedorOpcionesTroncales.appendChild(contenedorApartamentosV2)
        const contenedorTipoBloqueoV2 = document.createElement("div")
        contenedorTipoBloqueoV2.classList.add("detallesBloqueo_contenedorTipoBloqueoV2")
        const tipoBloqueoTituloUI = document.createElement("div")
        tipoBloqueoTituloUI.classList.add("listaBloqueos_titulo")
        tipoBloqueoTituloUI.classList.add("negrita")
        tipoBloqueoTituloUI.textContent = "Tipo bloqueo"
        contenedorTipoBloqueoV2.appendChild(tipoBloqueoTituloUI)
        const tipoBloqueoUI = document.createElement("select")
        tipoBloqueoUI.classList.add("administracion_bloqueos_detallesBloqueo_listaSelec")
        tipoBloqueoUI.setAttribute("datoBloqueo", "tipoBloqueoIDV")
        tipoBloqueoUI.addEventListener("change", () => { casaVitini.view.__sharedMethods__.controladorSelectorRangoTemporalUI()})
        const tipoBloqueoInicio = document.createElement("option");
        tipoBloqueoInicio.value = "";
        tipoBloqueoInicio.selected = true;
        tipoBloqueoInicio.disabled = true;
        tipoBloqueoInicio.text = "Seleccionar el tipo de bloqueo";
        tipoBloqueoUI.add(tipoBloqueoInicio);
        const opcion_permamente = document.createElement("option");
        opcion_permamente.value = "permanente";
        opcion_permamente.text = "Permanente";
        tipoBloqueoUI.add(opcion_permamente);
        const opcion_rangoTemporal = document.createElement("option");
        opcion_rangoTemporal.value = "rangoTemporal";
        opcion_rangoTemporal.text = "Rango temporal";
        tipoBloqueoUI.add(opcion_rangoTemporal);
        contenedorTipoBloqueoV2.appendChild(tipoBloqueoUI)
        contenedorOpcionesTroncales.appendChild(contenedorTipoBloqueoV2)
        const contenedorZonaUI = document.createElement("div")
        contenedorZonaUI.classList.add("detallesBloqueo_contenedorZonaUI")
        const tituloZonaUI = document.createElement("div")
        tituloZonaUI.classList.add("litaBloqueos_tituloZona")
        tituloZonaUI.classList.add("negrita")
        tituloZonaUI.textContent = "Contexto de aplicación"
        contenedorZonaUI.appendChild(tituloZonaUI)
        const zonaUI = document.createElement("select")
        zonaUI.classList.add("administracion_bloqueos_detallesBloqueo_listaSelec")
        zonaUI.setAttribute("datoBloqueo", "zonaIDV")
        const zonaInicio = document.createElement("option");
        zonaInicio.value = "";
        zonaInicio.selected = true;
        zonaInicio.disabled = true;
        zonaInicio.text = "Seleccionar en que zona se aplica en bloqueo";
        zonaUI.add(zonaInicio);
        const opcion_publico = document.createElement("option");
        opcion_publico.value = "publica";
        opcion_publico.text = "Público - Zona pública";
        zonaUI.add(opcion_publico);
        const opcion_privado = document.createElement("option");
        opcion_privado.value = "privado";
        opcion_privado.text = "Privado - Zona administrativa";
        zonaUI.add(opcion_privado);
        const opcion_global = document.createElement("option");
        opcion_global.value = "global";
        opcion_global.text = "Global - Zona pública y administrativa";
        zonaUI.add(opcion_global);
        contenedorZonaUI.appendChild(zonaUI)
        contenedorOpcionesTroncales.appendChild(contenedorZonaUI)
        bloqueBloqueoUI.appendChild(contenedorOpcionesTroncales)
        const metadatosconstructorRangoTemporalUI = {
            modo: "estadoInicial"
        }
        const selectorRangoUI = casaVitini.view.__sharedMethods__.selectorRangoTemporalUI(metadatosconstructorRangoTemporalUI)
        bloqueBloqueoUI.appendChild(selectorRangoUI)

        const motivoUI = document.createElement("textarea")
        motivoUI.classList.add("detalleBloqueos_motivo")
        motivoUI.setAttribute("componente", "contenedorMotivo")
        motivoUI.setAttribute("datoBloqueo", "motivoUI")
        motivoUI.rows = 10
        motivoUI.placeholder = "Escriba una breve descripción de por qué existe este bloqueo. Esto ayudará a recordar rápidamente por qué existe este bloqueo, no es obligatorio pero sí recomendable."
        bloqueBloqueoUI.appendChild(motivoUI)
        contenedorGlobal.appendChild(bloqueBloqueoUI)
        selectorEspacioBloqueos.appendChild(contenedorGlobal)
        casaVitini.view.__sharedMethods__.controladorBotonesGlobales.crear()
    },
    transactor: async function()  {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Creando bloqueo..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)


        const bloqueNuevo = casaVitini.view.__sharedMethods__.contructorObjeto()
        bloqueNuevo.zona = "administracion/bloqueos/crearNuevoBloqueo"

        const respuestaServidor = await casaVitini.shell.servidor(bloqueNuevo)
        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()
        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {

            const nuevoUID = respuestaServidor?.nuevoBloqueoUID
            const apartamentoIDV = respuestaServidor.apartamentoIDV
            const vistaFinal = `/administracion/gestion_de_bloqueos_temporales/` + apartamentoIDV + "/" + nuevoUID
            const navegacion = {
                vista: vistaFinal,
                tipoOrigen: "menuNavegador"
            }
            casaVitini.shell.navegacion.controladorVista(navegacion)
        }
    },
    obtenerApartamentos: async function()  {
        const transaccion = {
            zona: "administracion/componentes/apartamentosDisponiblesConfigurados"
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            return respuestaServidor?.ok
        }
    }
}