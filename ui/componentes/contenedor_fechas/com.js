class ContenedorFechas extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = ` 
        <style>
        
        .contenedorFechasSobreBloque {
                backdrop-filter: blur(50px);
                -webkit-backdrop-filter: blur(50px);
                border-radius: 13px;
                display: flex;
                flex-direction: column;
                align-content: flex-start;
                align-items: stretch;
                flex-wrap: nowrap;
                justify-content: flex-start;
                gap: 6px;
                backdrop-filter: blur(50px);
                -webkit-backdrop-filter: blur(50px);
                }
            .contenedorFechasCompartido {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-gap: 6px;
                grid-auto-rows: minmax(auto, auto);
                padding: 0px;
                justify-items: stretch;
                justify-content: center;
                align-content: center;
                align-items: stretch;
                }
            .contenedorFecha {
                background: rgba(255, 255, 255, 0.3);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                align-content: center;
                flex-wrap: nowrap;
                border-radius: 12px;
                padding: 10px;
                cursor: default;
                user-select: none;
                -webkit-user-select: none;
                }
            p {
                margin: 0px
            }
            .negrita {
                font-weight: bolder;
            }
        </style>
        
        `;
    }
    connectedCallback() {
        // this.shadowRoot.querySelector('#miBoton').addEventListener('click', () => {
        //     this.#cambiarColor(); // Llamada al método privado
        // });
        console.log("h")
        //   this.arranque()
    }
    arranque() {
        this.contenedorFechasUI = (data) => {
            const metodoSelectorDia = data?.metodoSelectorDia
            const nombreContenedor = data?.nombreContenedor
            const nombreFechaEntrada = data?.nombreFechaEntrada || "Fecha inicio"
            const nombreFechaSalida = data?.nombreFechaSalida || "Fecha Final"
            const instanciaUID_contenedorFechas = casaVitini.utilidades.codigoFechaInstancia()
            const seleccionableDiaLimite = data?.seleccionableDiaLimite
            const modo = data?.modo
            if (modo !== "administracion" && modo !== "vision") {
                const m = "contneedorFechaUI necesita un moodo."
                return casaVitini.ui.componentes.advertenciaInmersiva(m)
            }
            const sobreControlConfiguracion = data.sobreControlConfiguracion || {}
            const configuracionCalendarioInicio = data?.configuracionCalendarioInicio || {
                rangoIDV: "inicioRango",
                contenedorOrigenIDV: "[calendario=entrada]",
                perfilMes: "calendario_entrada_perfilSimple",
                metodoSelectorDia,
                seleccionableDiaLimite,
                ...sobreControlConfiguracion.configuracionInicio
            }
            configuracionCalendarioInicio.instanciaUID_contenedorFechas = instanciaUID_contenedorFechas
            const configuracionCalendarioFinal = data?.configuracionCalendarioFinal || {
                rangoIDV: "finalRango",
                contenedorOrigenIDV: "[calendario=salida]",
                perfilMes: "calendario_salida_perfilSimple",
                metodoSelectorDia,
                seleccionableDiaLimite,
                ...sobreControlConfiguracion.configuracionFin
            }
            configuracionCalendarioFinal.instanciaUID_contenedorFechas = instanciaUID_contenedorFechas
            if (nombreContenedor) {
                const selector = document.querySelector(nombreContenedor)
                if (selector) {
                    const error = "Cuidado, el contenedor de fecha ui tiene un nombre de contenedor ya existente en el dom."
                    return casaVitini.ui.componentes.advertenciaInmersiva(error)
                }
            }
            const divContenedor = document.createElement('div');
            divContenedor.classList.add('contenedorFechasSobreBloque');
            divContenedor.setAttribute("CSS", "selectorFechas")
            divContenedor.setAttribute("instanciaUID_contenedorFechas", instanciaUID_contenedorFechas)
            divContenedor.setAttribute('nombreContenedor', nombreContenedor);



            const divContenedorHorizontal = document.createElement('div');
            divContenedorHorizontal.classList.add('contenedorFechasCompartido');


            const divContenedorFechaInicio = document.createElement('div');
            divContenedorFechaInicio.classList.add('contenedorFecha');
            divContenedorFechaInicio.setAttribute('calendario', 'entrada');
            divContenedorFechaInicio.setAttribute('nombreContenedor', nombreContenedor);
            divContenedorFechaInicio.setAttribute('componente', 'inicioOferta');
            divContenedorFechaInicio.setAttribute('paralizadorEvento', 'ocultadorCalendarios');
            if (modo === "administracion") {
                divContenedorFechaInicio.addEventListener("click", (e) => {
                    casaVitini.ui.componentes.calendario.configurarCalendario(configuracionCalendarioInicio)
                })
            }

            const pFechaInicio = document.createElement('p');
            pFechaInicio.classList.add('negrita');
            pFechaInicio.textContent = nombreFechaEntrada

            const pFechaInicioSeleccionada = document.createElement('p');
            pFechaInicioSeleccionada.classList.add('fechaInicio');
            pFechaInicioSeleccionada.setAttribute('fechaUI', 'fechaInicio');
            pFechaInicioSeleccionada.textContent = '(Seleccionar)';
            divContenedorFechaInicio.appendChild(pFechaInicio);
            divContenedorFechaInicio.appendChild(pFechaInicioSeleccionada);

            const divContenedorFechaFin = document.createElement('div');
            divContenedorFechaFin.classList.add('contenedorFecha');
            divContenedorFechaFin.setAttribute('calendario', 'salida');
            divContenedorFechaFin.setAttribute('paralizadorEvento', 'ocultadorCalendarios');
            divContenedorFechaFin.setAttribute('componente', 'finOferta');
            if (modo === "administracion") {
                divContenedorFechaFin.addEventListener("click", () => {
                    casaVitini.ui.componentes.calendario.configurarCalendario(configuracionCalendarioFinal)
                })
            }

            const pFechaFin = document.createElement('p');
            pFechaFin.classList.add('negrita');
            pFechaFin.textContent = nombreFechaSalida

            const pFechaFinSeleccionada = document.createElement('p');
            pFechaFinSeleccionada.classList.add('fechaFin');
            pFechaFinSeleccionada.setAttribute('fechaUI', 'fechaFin');
            pFechaFinSeleccionada.textContent = '(Seleccionar)';


            divContenedorFechaFin.appendChild(pFechaFin);
            divContenedorFechaFin.appendChild(pFechaFinSeleccionada);
            divContenedorHorizontal.appendChild(divContenedorFechaInicio);
            divContenedorHorizontal.appendChild(divContenedorFechaFin);
            divContenedor.appendChild(divContenedorHorizontal);
            this.shadowRoot.appendChild(divContenedor)
        }
    }
}

// Definimos el nuevo elemento
customElements.define('contenedor-fechas', ContenedorFechas);
