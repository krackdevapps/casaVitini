casaVitini.view = {
    start: function ()  {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/arquitecturaDelAlojamiento/entidades/entidadUI")
        const urlRaw = window.location.pathname;
        let url = urlRaw.toLowerCase()
        url = url.split("/")
        url = url.filter((url) => url)
        delete url[0]
        delete url[1]
        delete url[2]
        delete url[3]
        url = url.filter((url) => url)
        const entradaTipoEntidad = url[0].split(":")
        if (entradaTipoEntidad[0] === "tipo") {
            const tipoEntidad = entradaTipoEntidad[1]
           this.portadaUI(tipoEntidad)
        } else {

        }
    },
    portadaUI: async function (entidad)  {
        const espacioBotonesGlobales = document.querySelector("[componente=espacioBotonesGlobales]")
        const espacioConfiguracionDelAlojamiento = document.querySelector("[componente=configuracionDelAlojamiento]")
        const selectorTitulo = document.querySelector("[componente=titulo]")
        if (entidad === "apartamento") {
            selectorTitulo.textContent = "Crear un nuevo apartamento como entidad"

            const contenedorEntidad = document.createElement("div")
            contenedorEntidad.classList.add("confAlojamiento_entidades_crearEntidad_contenedorEntidad")
            contenedorEntidad.setAttribute("tipoEntidad", "apartamento")

            const bloqueTituloApartamento = document.createElement("div")
            bloqueTituloApartamento.classList.add("confAlojamiento_entidades_crearEntidad_bloqueTitulo")

            const infoTituloApartamento = document.createElement("div")
            infoTituloApartamento.classList.add("padding14")
            infoTituloApartamento.textContent = "Escriba el nombre del apartamento. El nombre debe de ser único, no pueden existir dos apartamentos con el mismo nombre."
            bloqueTituloApartamento.appendChild(infoTituloApartamento)

            const campoTituloApartamento = document.createElement("input")
            campoTituloApartamento.classList.add("botonV1BlancoIzquierda_campo")
            campoTituloApartamento.setAttribute("campo", "apartamentoUI")
            campoTituloApartamento.placeholder = "Nombre del apartamento"
            bloqueTituloApartamento.appendChild(campoTituloApartamento)
            contenedorEntidad.appendChild(bloqueTituloApartamento)



            const infoTituloPulicoApartamento = document.createElement("div")
            infoTituloPulicoApartamento.classList.add("padding14")
            infoTituloPulicoApartamento.textContent = "Escriba el nombre del apartamento publico. Este nombre sera mostrado publicmente para identificar y describir el parlamento"
            bloqueTituloApartamento.appendChild(infoTituloPulicoApartamento)



            const campoTituloPublicoApartamento = document.createElement("input")
            campoTituloPublicoApartamento.classList.add("botonV1BlancoIzquierda_campo")
            campoTituloPublicoApartamento.setAttribute("campo", "apartamentoUIPublico")
            campoTituloPublicoApartamento.placeholder = "Nombre publico del apartamento"
            bloqueTituloApartamento.appendChild(campoTituloPublicoApartamento)
            contenedorEntidad.appendChild(bloqueTituloApartamento)


            const infoDefTituloPulicoApartamento = document.createElement("div")
            infoDefTituloPulicoApartamento.classList.add("padding14")
            infoDefTituloPulicoApartamento.textContent = "Escriba una descripcion bajo el titulo publico del apartamento, esta descripcion se mostrara bajo el titulo público del apartamento"
            bloqueTituloApartamento.appendChild(infoDefTituloPulicoApartamento)



            const campoDefTituloPublicoApartamento = document.createElement("input")
            campoDefTituloPublicoApartamento.classList.add("botonV1BlancoIzquierda_campo")
            campoDefTituloPublicoApartamento.setAttribute("campo", "definicionPublica")
            campoDefTituloPublicoApartamento.placeholder = "Definicion publica bajo el titulo publico del apartamento"
            bloqueTituloApartamento.appendChild(campoDefTituloPublicoApartamento)
            contenedorEntidad.appendChild(bloqueTituloApartamento)

            const bloqueApartamentoIDV = document.createElement("div")
            bloqueApartamentoIDV.classList.add("confAlojamiento_entidades_crearEntidad_bloqueTitulo")

            const infoApartamentoIDV = document.createElement("div")
            infoApartamentoIDV.classList.add("padding14")
            infoApartamentoIDV.textContent = "Escriba un identificador visual para el apartamento, este solo puede estar compuesto por minúsculas y números, nada más ni siquiera espacios o caracteres de puntuación. Si quiere, puede dejar en blanco este campo y el sistema lo rellenará con un identificador visual automáticamente. Pero es recomendable que lo haga usted y haga un patrón sencillo para poder identificar visualmente el apartamento y si por alguna situación no se pudiera acceder al identificador de interfaz de usuario."
            bloqueApartamentoIDV.appendChild(infoApartamentoIDV)

            const campoApartamentoIDV = document.createElement("input")
            campoApartamentoIDV.classList.add("botonV1BlancoIzquierda_campo")
            campoApartamentoIDV.setAttribute("campo", "apartamentoIDV")
            campoApartamentoIDV.placeholder = "Identificador visual del apartamento(ApartamentoIDV)"
            bloqueApartamentoIDV.appendChild(campoApartamentoIDV)
            contenedorEntidad.appendChild(bloqueApartamentoIDV)

            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("confAlojamiento_entidades_crearEntidad_contenedorBotones")
            contenedorEntidad.appendChild(contenedorBotones)


            const botonCrearEntidad = document.createElement("div")
            botonCrearEntidad.classList.add("botonV1BlancoIzquierda")
            botonCrearEntidad.textContent = "Crear nuevo apartamento como entidad"
            botonCrearEntidad.addEventListener("click",() => { this.crearEntidadTransactor()})
            contenedorBotones.appendChild(botonCrearEntidad)
            espacioConfiguracionDelAlojamiento.appendChild(contenedorEntidad)
        }
        if (entidad === "habitacion") {
            selectorTitulo.textContent = "Crear una nueva habitación como entidad"

            const contenedorEntidad = document.createElement("div")
            contenedorEntidad.classList.add("confAlojamiento_entidades_crearEntidad_contenedorEntidad")
            contenedorEntidad.setAttribute("tipoEntidad", "habitacion")
            const bloqueTituloHabitacion = document.createElement("div")
            bloqueTituloHabitacion.classList.add("confAlojamiento_entidades_crearEntidad_bloqueTitulo")
            const infoTituloHabitacion = document.createElement("div")
            infoTituloHabitacion.classList.add("padding14")
            infoTituloHabitacion.textContent = "Escriba el nombre de la nueva habitación. El nombre debe de ser único e irrepetible."
            bloqueTituloHabitacion.appendChild(infoTituloHabitacion)
            const campoTituloHabitacion = document.createElement("input")
            campoTituloHabitacion.classList.add("botonV1BlancoIzquierda_campo")
            campoTituloHabitacion.setAttribute("campo", "habitacionUI")
            campoTituloHabitacion.placeholder = "Nombre del la habitación"
            bloqueTituloHabitacion.appendChild(campoTituloHabitacion)
            contenedorEntidad.appendChild(bloqueTituloHabitacion)
            const bloqueHabitacionIDV = document.createElement("div")
            bloqueHabitacionIDV.classList.add("confAlojamiento_entidades_crearEntidad_bloqueTitulo")
            const infoHabitacionIDV = document.createElement("div")
            infoHabitacionIDV.classList.add("padding14")
            infoHabitacionIDV.textContent = "Escriba un identificador visual para la nueva habitación, este solo puede estar compuesto por minúsculas y números, nada más ni siquiera espacios o caracteres de puntuación. Si quiere, puede dejar en blanco este campo y el sistema lo rellenará con identificador visual automáticamente. Pero es recomendable que lo hagan ustedes y siga un patrón sencillo para poder identificar visualmente el apartamento y, por alguna situación, no se pudiera acceder al identificador de interfaz."
            bloqueHabitacionIDV.appendChild(infoHabitacionIDV)
            const campoHabitacionIDV = document.createElement("input")
            campoHabitacionIDV.classList.add("botonV1BlancoIzquierda_campo")
            campoHabitacionIDV.setAttribute("campo", "habitacionIDV")
            campoHabitacionIDV.placeholder = "Identificador visual de la habitación(HabitacionIDV)"
            bloqueHabitacionIDV.appendChild(campoHabitacionIDV)
            contenedorEntidad.appendChild(bloqueHabitacionIDV)
            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("confAlojamiento_entidades_crearEntidad_contenedorBotones")
            const botonCrearEntidad = document.createElement("div")
            botonCrearEntidad.classList.add("botonV1BlancoIzquierda")
            botonCrearEntidad.textContent = "Crear nueva habitación como entidad"
            botonCrearEntidad.addEventListener("click",() => { this.crearEntidadTransactor()})
            contenedorBotones.appendChild(botonCrearEntidad)
            contenedorEntidad.appendChild(contenedorBotones)
            espacioConfiguracionDelAlojamiento.appendChild(contenedorEntidad)
        }
        if (entidad === "cama") {
            selectorTitulo.textContent = "Crear una nueva cama como entidad"

            const contenedorEntidad = document.createElement("div")
            contenedorEntidad.classList.add("confAlojamiento_entidades_crearEntidad_contenedorEntidad")
            contenedorEntidad.setAttribute("tipoEntidad", "cama")
            const bloqueTituloCama = document.createElement("div")
            bloqueTituloCama.classList.add("confAlojamiento_entidades_crearEntidad_bloqueTitulo")
            const infoTituloCama = document.createElement("div")
            infoTituloCama.classList.add("padding14")
            infoTituloCama.textContent = "Escriba el nombre de la nueva cama.El nombre debe de ser único e irrepetible"
            bloqueTituloCama.appendChild(infoTituloCama)
            const campoTituloCama = document.createElement("input")
            campoTituloCama.classList.add("botonV1BlancoIzquierda_campo")
            campoTituloCama.setAttribute("campo", "camaUI")
            campoTituloCama.placeholder = "Nombre del la cama"
            bloqueTituloCama.appendChild(campoTituloCama)
            contenedorEntidad.appendChild(bloqueTituloCama)
            const bloqueCamaIDV = document.createElement("div")
            bloqueCamaIDV.classList.add("confAlojamiento_entidades_crearEntidad_bloqueTitulo")
            const infoCamaIDV = document.createElement("div")
            infoCamaIDV.classList.add("padding14")
            infoCamaIDV.textContent = "Escriba un identificador visual para la nueva cama, este solo puede estar compuesto por minúsculas y números, nada más ni siquiera espacios o caracteres de puntuación. Si quiere, puede dejar en blanco este campo y el sistema lo rellenará con identificador visual automáticamente. Pero es recomendable que lo hagan ustedes y siga un patrón sencillo para poder identificar visualmente el apartamento y, por alguna situación, no se pudiera acceder al identificador de interfaz."
            bloqueCamaIDV.appendChild(infoCamaIDV)
            const campoCamaIDV = document.createElement("input")
            campoCamaIDV.classList.add("botonV1BlancoIzquierda_campo")
            campoCamaIDV.placeholder = "Identificador visual de la cama(CamaIDV)"
            campoCamaIDV.setAttribute("campo", "camaIDV")
            bloqueCamaIDV.appendChild(campoCamaIDV)
            contenedorEntidad.appendChild(bloqueCamaIDV)
            const bloqueCapacidadPernoctativa = document.createElement("div")
            bloqueCapacidadPernoctativa.classList.add("confAlojamiento_entidades_crearEntidad_bloqueTitulo")
            const infoCaapacidadPernoctativa = document.createElement("div")
            infoCaapacidadPernoctativa.classList.add("padding14")
            infoCaapacidadPernoctativa.textContent = "Escriba la capacidad pernoctativa de la cama."
            bloqueCapacidadPernoctativa.appendChild(infoCaapacidadPernoctativa)
            const campoCapacidadPernoctativa = document.createElement("input")
            campoCapacidadPernoctativa.classList.add("botonV1BlancoIzquierda_campo")
            campoCapacidadPernoctativa.placeholder = "Escriba el número de plazas de la cama, por ejemplo: 2."
            campoCapacidadPernoctativa.setAttribute("campo", "capacidad")
            bloqueCapacidadPernoctativa.appendChild(campoCapacidadPernoctativa)
            contenedorEntidad.appendChild(bloqueCapacidadPernoctativa)

            const contenedorSelector = document.createElement("div")
            contenedorSelector.classList.add(
                "flexVertical",
                "gap6"
            )
            contenedorEntidad.appendChild(contenedorSelector)

            const infoSelector = document.createElement("div")
            infoSelector.classList.add("padding14")
            infoSelector.textContent = "Selecciona el tipo de cama. La cama compartida es aquella que puede ser insertada en varias configuraciones de alojamiento diferentes, mientras que la cama del tipo físico es aquella que, es usada como cama extra."
            contenedorSelector.appendChild(infoSelector)

            const selectorTipoCama = document.createElement("select")
            selectorTipoCama.setAttribute("campo", "tipoCama")
            selectorTipoCama.classList.add("botonV1BlancoIzquierda_campo")
            const opcion = document.createElement("option");
            opcion.value = "";
            opcion.disabled = true;
            opcion.selected = true;
            opcion.text = "Selecciona el tipo de cama";
            selectorTipoCama.add(opcion);
            const opcionCamaCompartida = document.createElement("option");
            opcionCamaCompartida.value = "compartida";
            opcionCamaCompartida.text = "Cama Fija (Compartida)";
            selectorTipoCama.add(opcionCamaCompartida);
            const opcionCamaFisica = document.createElement("option");
            opcionCamaFisica.value = "fisica";
            opcionCamaFisica.text = "Cama extra (Física)";
            selectorTipoCama.add(opcionCamaFisica);
            contenedorSelector.appendChild(selectorTipoCama)

            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("confAlojamiento_entidades_crearEntidad_contenedorBotones")
            const botonCrearEntidad = document.createElement("div")
            botonCrearEntidad.classList.add("botonV1BlancoIzquierda")
            botonCrearEntidad.textContent = "Crear nueva cama como entidad"
            botonCrearEntidad.addEventListener("click", () => { this.crearEntidadTransactor()})
            contenedorBotones.appendChild(botonCrearEntidad)
            contenedorEntidad.appendChild(contenedorBotones)
            espacioConfiguracionDelAlojamiento.appendChild(contenedorEntidad)
        }
    },
    crearEntidadTransactor: async function()  {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Creando entidad..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const transaccion = {
            zona: "administracion/arquitectura/entidades/crearEntidadAlojamiento"
        }
        const selectorTipoEntidad = document.querySelector("[tipoEntidad]").getAttribute("tipoEntidad")
        transaccion.tipoEntidad = selectorTipoEntidad
        const selectorCampos = document.querySelectorAll("[campo]")
        selectorCampos.forEach((campo) => {
            const nombreCampo = campo.getAttribute("campo")
            const datoCampo = campo.value
            transaccion[nombreCampo] = datoCampo
        })

        const respuestaServidor = await casaVitini.shell.servidor(transaccion)

        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const nuevoUID = respuestaServidor?.nuevoUID
            const vista = `/administracion/arquitectura_del_alojamiento/entidades/editar_entidad/${selectorTipoEntidad}:${nuevoUID}`
            const navegacion = {
                vista: vista,
                tipoOrigen: "menuNavegador"
            }
            casaVitini.shell.navegacion.controladorVista(navegacion)
        }
    }
}