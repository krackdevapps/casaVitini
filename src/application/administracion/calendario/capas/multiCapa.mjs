import { eventosReservas } from "../../../../shared/calendarios/eventos/eventosReservas.mjs";
import { eventosTodosLosApartamentos } from "../../../../shared/calendarios/eventos/eventosTodosLosApartamentos.mjs";
import { eventosTodosLosBloqueos } from "../../../../shared/calendarios/eventos/eventosTodosLosBloqueos.mjs";
import { eventosPorApartamentoAirbnb } from "../../../../shared/calendarios/eventos/calendariosSincronizados/airbnb/eventosPorApartamentoAirbnb.mjs";
import { eliminarBloqueoCaducado } from "../../../../shared/bloqueos/eliminarBloqueoCaducado.mjs";
import { DateTime } from "luxon";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerTodasLasConfiguracionDeLosApartamento } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamento.mjs";
import { obtenerCalendariosPorPlataformaIDV } from "../../../../infraestructure/repository/calendario/obtenerCalendariosPorPlataformaIDV.mjs";
import { eventosPorApartamneto } from "../../../../shared/calendarios/eventos/eventosPorApartamento.mjs";
import { comportamientosDePrecioBasadosEnDiaPorApartamento } from "../../../../shared/calendarios/capasComoComponentes/comportamientosDePrecioBasadosEnDiaPorApartamento.mjs";
import { comportamientosDePrecioPorApartamento } from "../../../../shared/calendarios/capasComoComponentes/comportamientosDePrecioPorApartamento.mjs";
import { todosLosComportamientosDePrecioDeTodosLosApartamentos } from "../../../../shared/calendarios/capasComoComponentes/todosLosComportamientosDePrecioDeTodosLosApartamentos.mjs";
import { todosLosComportamientosDePrecioBasadosEnDia } from "../../../../shared/calendarios/capasComoComponentes/todosLosComportamientosDePrecioBasadosEnDia.mjs";
import { preciosNocheBasePorApartamento } from "../../../../shared/calendarios/capasComoComponentes/preciosNocheBasePorApartamento.mjs";
import { todosLosPreciosNetoBaseSumados } from "../../../../shared/calendarios/capasComoComponentes/todosLosPreciosNetoBaseSumados.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { bloqueosPorApartamento } from "../../../../shared/calendarios/capasComoComponentes/bloqueosPorApartamento.mjs";

export const multiCapa = async (entrada) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const fecha = entrada.body.fecha;
        await validadoresCompartidos.fechas.fechaMesAno(fecha)

        const contenedorCapas = validadoresCompartidos.tipos.objetoLiteral({
            objetoLiteral: entrada.body.contenedorCapas,
            nombreCampo: "El campo de contenedorCapas",
        })

        const capas = validadoresCompartidos.tipos.array({
            array: contenedorCapas?.capas,
            nombreCampo: "El array de capas",
            filtro: "strictoIDV",
            nombreCompleto: "En el array del calendario multi capa"
        })

        const constructorObjetoPorDias = (fecha) => {
            const fechaArray = fecha.split("-");
            const mes = fechaArray[0];
            const ano = fechaArray[1];
            const fechaObjeto = DateTime.fromObject({ year: ano, month: mes, day: 1 });
            const numeroDeDiasDelMes = fechaObjeto.daysInMonth;
            const calendarioObjeto = {};
            for (let numeroDia = 1; numeroDia <= numeroDeDiasDelMes; numeroDia++) {

                const diaISO = String(numeroDia).padStart(2, "0")
                const mesISO = String(mes).padStart(2, "0")

                const llaveCalendarioObjeto = `${ano}-${mesISO}-${diaISO}`;
                calendarioObjeto[llaveCalendarioObjeto] = [];
            }
            return calendarioObjeto;
        };
        const mesPorDias = constructorObjetoPorDias(fecha);
        const estructuraGlobal = {
            capasIDV: capas,
            eventosMes: mesPorDias,
            eventosEnDetalle: [],
            contenedorDia: {},
            apartamentos: {}
        };

        const inyectarTodosLosApartamentos = async () => {
            const configuracionesAlojamiento = await obtenerTodasLasConfiguracionDeLosApartamento()
            for (const alojamiento of configuracionesAlojamiento) {
                const apartamentoIDV = alojamiento.apartamentoIDV
                const apartamento = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV: apartamentoIDV,
                    errorSi: "noExiste"
                }))
                const apartamentoUI = apartamento.apartamentoUI
                estructuraGlobal.apartamentos[apartamentoIDV] = apartamentoUI
            }
        }

        const capasComoComponentes = {
            // Cambiar reservas por todasLasReservas
            todasLasReservas: async () => {
                const eventosReservas_ = await eventosReservas(fecha);
                for (const [fechaDia, contenedorEventos] of Object.entries(eventosReservas_.eventosMes)) {
                    const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                    selectorDia.push(...contenedorEventos);
                }
                estructuraGlobal.eventosEnDetalle.push(...eventosReservas_.eventosEnDetalle);
            },
            todasLasReservasPorApartamento: async () => {
                const eventosTodosLosApartamentos_ = await eventosTodosLosApartamentos(fecha);
                for (const [fechaDia, contenedorEventos] of Object.entries(eventosTodosLosApartamentos_.eventosMes)) {
                    const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                    selectorDia.push(...contenedorEventos);
                }
                estructuraGlobal.eventosEnDetalle.push(...eventosTodosLosApartamentos_.eventosEnDetalle);
            },
            todosLosPreciosSumados: async () => {
                const desglosePorNoche = await todosLosPreciosNetoBaseSumados({
                    fecha: fecha
                });
                estructuraGlobal.contenedorDia.desglosePorNoche = desglosePorNoche
            },
            todosLosBloqueos: async () => {
                await eliminarBloqueoCaducado();
                const eventosTodosLosBloqueos_ = await eventosTodosLosBloqueos(fecha);
                for (const [fechaDia, contenedorEventos] of Object.entries(eventosTodosLosBloqueos_.eventosMes)) {
                    const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                    selectorDia.push(...contenedorEventos);
                }
                estructuraGlobal.eventosEnDetalle.push(...eventosTodosLosBloqueos_.eventosEnDetalle);
            },
            todosLosComportamientosDePrecio: async () => {
                const eventosTipoRango = await todosLosComportamientosDePrecioDeTodosLosApartamentos({
                    fecha: fecha
                });
                for (const [fechaDia, contenedorEventos] of Object.entries(eventosTipoRango.eventosMes)) {
                    const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                    selectorDia.push(...contenedorEventos);
                }
                estructuraGlobal.eventosEnDetalle.push(...eventosTipoRango.eventosEnDetalle);

                const eventosTipoDia = await todosLosComportamientosDePrecioBasadosEnDia({
                    fecha: fecha,
                });
                for (const [fechaDia, contenedorEventos] of Object.entries(eventosTipoDia.eventosMes)) {
                    const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                    selectorDia.push(...contenedorEventos);
                }

                estructuraGlobal.eventosEnDetalle.push(...eventosTipoDia.eventosEnDetalle);
                await inyectarTodosLosApartamentos()

            },
            todoAirbnb: async () => {

                const plataformaAibnb = "airbnb";
                const calendariosPorPlataforma = await obtenerCalendariosPorPlataformaIDV(plataformaAibnb)
                if (calendariosPorPlataforma.length > 0) {
                    const calendariosUIDS = calendariosPorPlataforma.map((calendario) => {
                        return calendario.calendarioUID;
                    });
                    for (const calendarioUID of calendariosUIDS) {
                        const metadatosEventos = {
                            fecha: fecha,
                            calendarioUID: String(calendarioUID)
                        };
                        const eventosPorApartamentoAirbnb_ = await eventosPorApartamentoAirbnb(metadatosEventos);
                        for (const [fechaDia, contenedorEventos] of Object.entries(eventosPorApartamentoAirbnb_.eventosMes)) {
                            const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                            selectorDia.push(...contenedorEventos);
                        }
                        estructuraGlobal.eventosEnDetalle.push(...eventosPorApartamentoAirbnb_.eventosEnDetalle);
                    }
                }
            },
            precioNochePorApartamento: async () => {
                if (!contenedorCapas.hasOwnProperty("capasCompuestas")) {
                    const m = "En el objeto de contenedorCapas, en este tipo de capa, la de precioNochePorApartamento, se espera una llave capasCompuestas"
                    throw new Error(m)
                } else if (capas.includes("todosLosPreciosSumados")) {
                    const m = "Si solicitas la capa compuesto precioNochePorApartamento no solicites la capa todosLosPreciosSumados por que es contradictorio"
                    throw new Error(m)
                }
                const capasCompuestas = contenedorCapas?.capasCompuestas
                if (!capasCompuestas.hasOwnProperty("precioNochePorApartamento")) {
                    const m = "Dentro de la llave capaCompuesta, se espera una llave precioNochePorApartamento"
                    throw new Error(m)
                }
                const apartamentosIDV = validadoresCompartidos.tipos.array({
                    array: capasCompuestas.precioNochePorApartamento,
                    nombreCampo: "La llave precioNochePorApartamento",
                    filtro: "strictoIDV",
                    nombreCompleto: "En el array de capasCompuestas precioNochePorApartamento",
                    sePermitenDuplicados: "no"
                })
                const configuracionesApartamentos = await obtenerTodasLasConfiguracionDeLosApartamento()
                if (configuracionesApartamentos.length > 0) {
                    const apartamentosIDVValidos = configuracionesApartamentos.map((apartamentoIDV) => {
                        return apartamentoIDV.apartamentoIDV;
                    });
                    const controlApartamentosF2 = apartamentosIDV.every(apartamentosIDV => apartamentosIDVValidos.includes(apartamentosIDV));
                    if (!controlApartamentosF2) {
                        const elementosFaltantes = apartamentosIDV.filter(apartamentosIDV => !apartamentosIDVValidos.includes(apartamentosIDV));
                        let error;
                        if (elementosFaltantes.length === 1) {
                            error = "En el array de apartamentosIDV hay un identificador que no existe: " + elementosFaltantes[0];
                        } if (elementosFaltantes.length === 2) {
                            error = "En el array de apartamentosIDV hay identificadores que no existen: " + elementosFaltantes.join("y");
                        }
                        if (elementosFaltantes.length > 2) {
                            const conComa = elementosFaltantes;
                            const ultima = elementosFaltantes.pop();
                            error = "En el array de apartamentosIDV hay identificadores que no existen: " + conComa.join(", ") + " y " + ultima;
                        }
                        throw new Error(error);
                    }
                    const desglosePorNoche = await preciosNocheBasePorApartamento({
                        fecha: fecha,
                        apartamentosIDV
                    });

                    estructuraGlobal.contenedorDia.desglosePorNoche = desglosePorNoche

                    for (const apartamentoIDV of apartamentosIDV) {
                        const apartamento = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                            apartamentoIDV: apartamentoIDV,
                            errorSi: "noExiste"
                        }))
                        const apartamentoUI = apartamento.apartamentoUI
                        estructuraGlobal.apartamentos[apartamentoIDV] = apartamentoUI
                    }
                }
            },
            reservasPorApartamento: async () => {
                if (!contenedorCapas.hasOwnProperty("capasCompuestas")) {
                    const m = "En el objeto de contenedorCapas, en este tipo de capa, la de reservasPorApartamento, se espera una llave capasCompuestas"
                    throw new Error(m)
                } else if (capas.includes("todasLasReservasPorApartamento")) {
                    const m = "Si solicitas la capa compuesta porApartamento no solicites la capa todasLasReservasPorApartamento por que es contradictorio"
                    throw new Error(m)
                }
                const capasCompuestas = contenedorCapas?.capasCompuestas
                if (!capasCompuestas.hasOwnProperty("reservasPorApartamento")) {
                    const m = "Dentro de la llave capaCompuesta, se espera una llave reservasPorApartamento"
                    throw new Error(m)
                }
                const apartamentosIDV = validadoresCompartidos.tipos.array({
                    array: capasCompuestas.reservasPorApartamento,
                    nombreCampo: "La llave reservasPorApartamento",
                    filtro: "strictoIDV",
                    nombreCompleto: "En el array de capasCompuestas reservasPorApartamento",
                    sePermitenDuplicados: "no"
                })
                const configuracionesApartamentos = await obtenerTodasLasConfiguracionDeLosApartamento()
                if (configuracionesApartamentos.length > 0) {
                    const apartamentosIDVValidos = configuracionesApartamentos.map((apartamentoIDV) => {
                        return apartamentoIDV.apartamentoIDV;
                    });
                    const controlApartamentosF2 = apartamentosIDV.every(apartamentosIDV => apartamentosIDVValidos.includes(apartamentosIDV));
                    if (!controlApartamentosF2) {
                        const elementosFaltantes = apartamentosIDV.filter(apartamentosIDV => !apartamentosIDVValidos.includes(apartamentosIDV));
                        let error;
                        if (elementosFaltantes.length === 1) {
                            error = "En el array de apartamentosIDV hay un identificador que no existe: " + elementosFaltantes[0];
                        } if (elementosFaltantes.length === 2) {
                            error = "En el array de apartamentosIDV hay identificadores que no existen: " + elementosFaltantes.join("y");
                        }
                        if (elementosFaltantes.length > 2) {
                            const conComa = elementosFaltantes;
                            const ultima = elementosFaltantes.pop();
                            error = "En el array de apartamentosIDV hay identificadores que no existen: " + conComa.join(", ") + " y " + ultima;
                        }
                        throw new Error(error);
                    }
                    for (const apartamentoIDV of apartamentosIDV) {
                        const metadatosEventos = {
                            fecha: fecha,
                            apartamentoIDV: apartamentoIDV
                        };
                        const eventos = await eventosPorApartamneto(metadatosEventos);
                        for (const [fechaDia, contenedorEventos] of Object.entries(eventos.eventosMes)) {
                            const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                            selectorDia.push(...contenedorEventos);
                        }
                        estructuraGlobal.eventosEnDetalle.push(...eventos.eventosEnDetalle);
                    }
                }
            },
            bloqueosPorApartamento: async () => {
                if (!contenedorCapas.hasOwnProperty("capasCompuestas")) {
                    const m = "En el objeto de contenedorCapas, en este tipo de capa, la de bloqueosPorApartamento, se espera una llave capasCompuestas"
                    throw new Error(m)
                } else if (capas.includes("todosLosBloqueos")) {
                    const m = "Si solicitas la capa compuesta bloqueosPorApartamento no solicites la capa todosLosBloqueos por que es contradictorio"
                    throw new Error(m)
                }
                const capasCompuestas = contenedorCapas?.capasCompuestas
                if (!capasCompuestas.hasOwnProperty("bloqueosPorApartamento")) {
                    const m = "Dentro de la llave capaCompuesta, se espera una llave bloqueosPorApartamento"
                    throw new Error(m)
                }
                const apartamentosIDV = validadoresCompartidos.tipos.array({
                    array: capasCompuestas.bloqueosPorApartamento,
                    nombreCampo: "La llave bloqueosPorApartamento",
                    filtro: "strictoIDV",
                    nombreCompleto: "En el array de capasCompuestas bloqueosPorApartamento",
                    sePermitenDuplicados: "no"
                })
                const configuracionesApartamentos = await obtenerTodasLasConfiguracionDeLosApartamento()
                estructuraGlobal.apartamentos = {}
                if (configuracionesApartamentos.length > 0) {
                    const apartamentosIDVValidos = configuracionesApartamentos.map((apartamentoIDV) => {
                        return apartamentoIDV.apartamentoIDV;
                    });
                    const controlApartamentosF2 = apartamentosIDV.every(apartamentosIDV => apartamentosIDVValidos.includes(apartamentosIDV));
                    if (!controlApartamentosF2) {
                        const elementosFaltantes = apartamentosIDV.filter(apartamentosIDV => !apartamentosIDVValidos.includes(apartamentosIDV));
                        let error;

                        if (elementosFaltantes.length === 1) {
                            error = "En el array de apartamentosIDV hay un identificador que no existe: " + elementosFaltantes[0];
                        } if (elementosFaltantes.length === 2) {
                            error = "En el array de apartamentosIDV hay identificadores que no existen: " + elementosFaltantes.join("y");
                        }
                        if (elementosFaltantes.length > 2) {
                            const conComa = elementosFaltantes;
                            const ultima = elementosFaltantes.pop();
                            error = "En el array de apartamentosIDV hay identificadores que no existen: " + conComa.join(", ") + " y " + ultima;
                        }
                        throw new Error(error);
                    }
                    //  for (const apartamentoIDV of apartamentosIDV) {

                    const eventosTipoRango = await bloqueosPorApartamento({
                        fecha: fecha,
                        apartamentosIDV
                    });
                    for (const [fechaDia, contenedorEventos] of Object.entries(eventosTipoRango.eventosMes)) {
                        const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                        selectorDia.push(...contenedorEventos);
                    }
                    estructuraGlobal.eventosEnDetalle.push(...eventosTipoRango.eventosEnDetalle);

                    for (const apartamentoIDV of apartamentosIDV) {
                        const apartamento = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                            apartamentoIDV: apartamentoIDV,
                            errorSi: "noExiste"
                        }))
                        const apartamentoUI = apartamento.apartamentoUI
                        estructuraGlobal.apartamentos[apartamentoIDV] = apartamentoUI
                    }
                }
            },
            comportamientosPorApartamento: async () => {
                if (!contenedorCapas.hasOwnProperty("capasCompuestas")) {
                    const m = "En el objeto de contenedorCapas, en este tipo de capa, la de comportamientosPorApartamento, se espera una llave capasCompuestas"
                    throw new Error(m)
                } else if (capas.includes("todosLosComportamientosDePrecio")) {
                    const m = "Si solicitas la capa compuesto comportamientosPorApartamento no solicites la capa todosLosComportamientosDePrecio por que es contradictorio"
                    throw new Error(m)
                }
                const capasCompuestas = contenedorCapas?.capasCompuestas
                if (!capasCompuestas.hasOwnProperty("comportamientosPorApartamento")) {
                    const m = "Dentro de la llave capaCompuesta, se espera una llave comportamientosPorApartamento"
                    throw new Error(m)
                }
                const apartamentosIDV = validadoresCompartidos.tipos.array({
                    array: capasCompuestas.comportamientosPorApartamento,
                    nombreCampo: "La llave comportamientosPorApartamento",
                    filtro: "strictoIDV",
                    nombreCompleto: "En el array de capasCompuestas comportamientosPorApartamento",
                    sePermitenDuplicados: "no"
                })
                const configuracionesApartamentos = await obtenerTodasLasConfiguracionDeLosApartamento()



                estructuraGlobal.apartamentos = {}
                if (configuracionesApartamentos.length > 0) {
                    const apartamentosIDVValidos = configuracionesApartamentos.map((apartamentoIDV) => {
                        return apartamentoIDV.apartamentoIDV;
                    });
                    const controlApartamentosF2 = apartamentosIDV.every(apartamentosIDV => apartamentosIDVValidos.includes(apartamentosIDV));
                    if (!controlApartamentosF2) {
                        const elementosFaltantes = apartamentosIDV.filter(apartamentosIDV => !apartamentosIDVValidos.includes(apartamentosIDV));
                        let error;

                        if (elementosFaltantes.length === 1) {
                            error = "En el array de apartamentosIDV hay un identificador que no existe: " + elementosFaltantes[0];
                        } if (elementosFaltantes.length === 2) {
                            error = "En el array de apartamentosIDV hay identificadores que no existen: " + elementosFaltantes.join("y");
                        }
                        if (elementosFaltantes.length > 2) {
                            const conComa = elementosFaltantes;
                            const ultima = elementosFaltantes.pop();
                            error = "En el array de apartamentosIDV hay identificadores que no existen: " + conComa.join(", ") + " y " + ultima;
                        }
                        throw new Error(error);
                    }
                    //  for (const apartamentoIDV of apartamentosIDV) {

                    const eventosTipoRango = await comportamientosDePrecioPorApartamento({
                        fecha: fecha,
                        apartamentosIDV
                    });
                    for (const [fechaDia, contenedorEventos] of Object.entries(eventosTipoRango.eventosMes)) {
                        const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                        selectorDia.push(...contenedorEventos);
                    }
                    estructuraGlobal.eventosEnDetalle.push(...eventosTipoRango.eventosEnDetalle);

                    const eventosTipoDia = await comportamientosDePrecioBasadosEnDiaPorApartamento({
                        fecha: fecha,
                        apartamentosIDV
                    });
                    for (const [fechaDia, contenedorEventos] of Object.entries(eventosTipoDia.eventosMes)) {
                        const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                        selectorDia.push(...contenedorEventos);
                    }

                    estructuraGlobal.eventosEnDetalle.push(...eventosTipoDia.eventosEnDetalle);

                    for (const apartamentoIDV of apartamentosIDV) {
                        const apartamento = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                            apartamentoIDV: apartamentoIDV,
                            errorSi: "noExiste"
                        }))
                        const apartamentoUI = apartamento.apartamentoUI
                        estructuraGlobal.apartamentos[apartamentoIDV] = apartamentoUI
                    }
                }
            },
            calendariosAirbnb: async () => {

                if (!contenedorCapas.hasOwnProperty("capasCompuestas")) {
                    const m = "En el objeto de contenedorCapas, en este tipo de capa, la de calendariosAirbnb, se espera una llave capasCompuestas"
                    throw new Error(m)
                } else if (capas.includes("todoAirbnb")) {
                    const m = "Si solicitas la capa compuesto calendariosAirbnb no solicites la capa todoAirbnb por que es contradictorio"
                    throw new Error(m)
                }
                const capasCompuestas = contenedorCapas?.capasCompuestas
                if (!capasCompuestas.hasOwnProperty("calendariosAirbnb")) {
                    const m = "Dentro de la llave capaCompuesta, se espera una llave porApartamento"
                    throw new Error(m)
                }

                const calendariosUID = validadoresCompartidos.tipos.array({
                    array: contenedorCapas.capasCompuestas.calendariosAirbnb,
                    nombreCampo: "El array de capasCompuesta de los calendarios Airbnbn",
                    filtro: "strictoIDV",
                    nombreCompleto: "En el array del calendario multi capa"
                })

                const plataformaOrigen = "airbnb";
                const calendariosPorPlataforma = await obtenerCalendariosPorPlataformaIDV(plataformaOrigen)

                if (calendariosPorPlataforma.length > 0) {
                    const calendariosUIDValidos = calendariosPorPlataforma.map((calendarioUID) => {
                        return String(calendarioUID.calendarioUID);
                    });
                    const controlCalendariosF2 = calendariosUID.every(calendariosUID => calendariosUIDValidos.includes(calendariosUID));
                    if (!controlCalendariosF2) {
                        const elementosFaltantes = calendariosUID.filter(calendariosUID => !calendariosUIDValidos.includes(calendariosUID));
                        let error;
                        if (elementosFaltantes.length === 1) {
                            error = "En el array de calendariosUIDS hay un identificador que no existe: " + elementosFaltantes[0];
                        } if (elementosFaltantes.length === 2) {
                            error = "En el array de calendariosUIDS hay identificadores que no existen: " + elementosFaltantes.join(" y ");
                        }
                        if (elementosFaltantes.length > 2) {
                            const conComa = elementosFaltantes;
                            const ultima = elementosFaltantes.pop();
                            error = "En el array de calendariosUIDS hay identificadores que no existen: " + conComa.join(", ") + " y " + ultima;
                        }
                        throw new Error(error);
                    }
                    for (const calendarioUID of calendariosUID) {
                        const metadatosEventos = {
                            fecha: fecha,
                            calendarioUID: calendarioUID
                        };
                        const eventos = await eventosPorApartamentoAirbnb(metadatosEventos);
                        for (const [fechaDia, contenedorEventos] of Object.entries(eventos.eventosMes)) {
                            const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                            selectorDia.push(...contenedorEventos);
                        }
                        estructuraGlobal.eventosEnDetalle.push(...eventos.eventosEnDetalle);
                    }
                }
            },
            global: async () => {
                // Orden de aparticion
                await capasComoComponentes.todasLasReservas();
                await capasComoComponentes.todasLasReservasPorApartamento();
                await capasComoComponentes.todosLosComportamientosDePrecio()
                await capasComoComponentes.todosLosBloqueos();
                await capasComoComponentes.todosLosPreciosSumados();
                await capasComoComponentes.todoAirbnb();

                await inyectarTodosLosApartamentos()
            },
        };
        const capasDisponibles = Object.keys(capasComoComponentes);
        const todosPresentes = capas.every(capa => capasDisponibles.includes(capa));
        if (!todosPresentes) {
            const elementosFaltantes = capas.filter(capa => !capasDisponibles.includes(capa));
            let error;
            if (elementosFaltantes.length === 1) {
                error = "En el array de capasIDV hay un identificador que no existe: " + elementosFaltantes[0];
            } if (elementosFaltantes.length === 2) {
                error = "En el array de capasIDV hay identificadores que no existen: " + elementosFaltantes.join("y");
            }
            if (elementosFaltantes.length > 2) {
                const conComa = elementosFaltantes;
                const ultima = elementosFaltantes.pop();
                error = "En el array de capasIDV hay identificadores que no existen: " + conComa.join(", ") + " y " + ultima;
            }
            throw new Error(error);
        }
        for (const capa of capas) {
            await capasComoComponentes[capa]();
        }
        const ok = {
            ok: "Eventos del calendario",
            ...estructuraGlobal
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}