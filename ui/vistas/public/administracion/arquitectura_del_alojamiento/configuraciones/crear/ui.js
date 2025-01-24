casaVitini.view = {
    start: async function ()  {
        const main = document.querySelector("main")
        const instanciaUID = document.querySelector("main[instanciaUID]").getAttribute("instanciaUID")

        main.setAttribute("zonaCSS", "administracion/arquitectura_de_alojamiento/configuraciones/nuevo")
        const transaccion = {
            zona: "administracion/arquitectura/entidades/listarApartamentosComoEntidades"
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
        if (!seccionRenderizada)

            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
        if (respuestaServidor?.ok) {
            const apartamentosEntidad = respuestaServidor?.apartamentosComoEntidadesDisponibles
            const espacioInfo = document.querySelector("[componente=info]")
            espacioInfo.classList.add("padding14")
            if (apartamentosEntidad.length === 0) {
                espacioInfo.innerHTML = `No hay entidades de apartamento disponibles para crear configuraciones. Si necesita crear una nueva configuración, primero genere un nuevo apartamento como entidad. Para ello, dirígete a: Arquitectura de alojamiento > Entidades de alojamiento > Generar nuevo apartamento.`
                const enlace = document.createElement("a")
                enlace.classList.add("enlace")
                enlace.textContent = "Ir directo a crear un nuevo apartamento como entidad"
                enlace.setAttribute("href", "/administracion/arquitectura_del_alojamiento/entidades/crear_entidad/tipo:apartamento")
                enlace.setAttribute("vista", "/administracion/arquitectura_del_alojamiento/entidades/crear_entidad/tipo:apartamento")
                enlace.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                main.appendChild(enlace)
            }
            if (apartamentosEntidad.length > 0) {
                espacioInfo.innerHTML = `Escoge un apartamento como entidad para construir la base de la configuración. Luego podrás llenar este apartamento con habitaciones y asignarles camas. Recuerda que aquí se muestran los apartamentos como entidades que no has usado para construir configuraciones de alojamiento.`
                const selectorZonaCreacionConfiguracion = document.querySelector("[componente=zonaCreacion]")
                const contenedorOpciones = document.createElement("select")
                contenedorOpciones.setAttribute("componente", "selectorApartamentoIDV")
                contenedorOpciones.classList.add("botonV1BlancoIzquierda")
                const opcion = document.createElement("option");
                opcion.value = "";
                opcion.disabled = true;
                opcion.selected = true;
                opcion.text = "Selecciona un apartamento como entidad para comenzar";
                contenedorOpciones.add(opcion);
                for (const detallesApartmentoComoEntidad of apartamentosEntidad) {
                    const apartamentoUI = detallesApartmentoComoEntidad.apartamentoUI
                    const apartamentoIDV = detallesApartmentoComoEntidad.apartamentoIDV
                    const opcion = document.createElement("option");
                    opcion.value = apartamentoIDV;
                    opcion.text = `${apartamentoUI} (${apartamentoIDV})`;
                    contenedorOpciones.add(opcion);
                }
                selectorZonaCreacionConfiguracion.appendChild(contenedorOpciones)
                const botonCrearConfiguracion = document.createElement("div")
                botonCrearConfiguracion.classList.add("botonV1BlancoIzquierda")
                botonCrearConfiguracion.textContent = "Crear configuración"
                botonCrearConfiguracion.addEventListener("click",() => { this.transactor()})
                selectorZonaCreacionConfiguracion.appendChild(botonCrearConfiguracion)
            }
        }
    },
    transactor: async function() {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Creando configuración de alojamiento..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const apartamentoSeleccionado = document.querySelector("[componente=selectorApartamentoIDV]").value
        if (!apartamentoSeleccionado) {
            const error = "Selecciona un apartamento primero desde el selector de lista"
            casaVitini.ui.componentes.advertenciaInmersiva(error)
        }
        const transaccion = {
            zona: "administracion/arquitectura/configuraciones/crearConfiguracionAlojamiento",
            apartamentoIDV: apartamentoSeleccionado
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const apartamentoIDV = respuestaServidor?.apartamentoIDV
            const vista = `/administracion/arquitectura_del_alojamiento/configuraciones/${apartamentoIDV}`
            const navegacion = {
                "vista": vista,
                "tipoOrigen": "menuNavegador"
            }
            casaVitini.shell.navegacion.controladorVista(navegacion)
        }
    }
}