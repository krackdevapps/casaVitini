import { conexion } from "../../../../componentes/db.mjs";
import { eventosPorApartamneto } from "../../../../sistema/calendarios/capas/eventosPorApartamento.mjs";
import { eventosReservas } from "../../../../sistema/calendarios/capas/eventosReservas.mjs";
import { eventosTodosLosApartamentos } from "../../../../sistema/calendarios/capas/eventosTodosLosApartamentos.mjs";
import { eventosTodosLosBloqueos } from "../../../../sistema/calendarios/capas/eventosTodosLosBloqueos.mjs";
import { eventosPorApartamentoAirbnb } from "../../../../sistema/calendarios/capas/calendariosSincronizados/airbnb/eventosPorApartamentoAirbnb.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../../sistema/sistemaDeBloqueos/eliminarBloqueoCaducado.mjs";
import { DateTime } from "luxon";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";


export const multiCapa = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const fecha = entrada.body.fecha;
        validadoresCompartidos.fechas.fechaMesAno(fecha)

        const contenedorCapas = validadoresCompartidos.tipos.objetoLiteral({
            objetoLiteral: entrada.body.contenedorCapas,
            nombreCampo: "El campo de contenedorCapas",
        })

        const capas = validadoresCompartidos.tipos.array({
            array: contenedorCapas?.capas,
            nombreCampo: "El array de capas",
            filtro: "soloCadenasIDV",
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
                const llaveCalendarioObjeto = `${ano}-${mes}-${numeroDia}`;
                calendarioObjeto[llaveCalendarioObjeto] = [];
            }
            return calendarioObjeto;
        };
        const mesPorDias = constructorObjetoPorDias(fecha);
        const estructuraGlobal = {
            eventosMes: mesPorDias,
            eventosEnDetalle: []
        };
        const capasComoComponentes = {
            reservas: async () => {
                const eventosReservas_ = await eventosReservas(fecha);
                for (const [fechaDia, contenedorEventos] of Object.entries(eventosReservas_.eventosMes)) {
                    const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                    selectorDia.push(...contenedorEventos);
                }
                estructuraGlobal.eventosEnDetalle.push(...eventosReservas_.eventosEnDetalle);
            },
            todosLosApartamentos: async () => {
                const eventosTodosLosApartamentos_ = await eventosTodosLosApartamentos(fecha);
                for (const [fechaDia, contenedorEventos] of Object.entries(eventosTodosLosApartamentos_.eventosMes)) {
                    const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                    selectorDia.push(...contenedorEventos);
                }
                estructuraGlobal.eventosEnDetalle.push(...eventosTodosLosApartamentos_.eventosEnDetalle);
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
            porApartamento: async () => {
                const apartamentosIDV = validadoresCompartidos.tipos.array({
                    array: contenedorCapas.capasCompuestas.porApartamento,
                    nombreCampo: "El array de capas",
                    filtro: "soloCadenasIDV",
                    nombreCompleto: "En el array de capasCompuestas porApartamento"
                })

                const obtenerApartamentosIDV = `
                                            SELECT "apartamentoIDV"
                                            FROM "configuracionApartamento"
                                            `;
                const resuelveApartamentosIDV = await conexion.query(obtenerApartamentosIDV);
                if (resuelveApartamentosIDV.rowCount > 0) {
                    const apartamentosIDVValidos = resuelveApartamentosIDV.rows.map((apartamentoIDV) => {
                        return apartamentoIDV.apartamentoIDV;
                    });
                    const controlApartamentosF2 = apartamentosIDV.every(apartamentosIDV => apartamentosIDVValidos.includes(apartamentosIDV));
                    if (!controlApartamentosF2) {
                        const elementosFaltantes = apartamentosIDV.filter(apartamentosIDV => !apartamentosIDVValidos.includes(apartamentosIDV));
                        let error;
                        if (elementosFaltantes.length === 1) {
                            error = "En el array de apartamentosIDV hay un identificador que no existe: " + elementosFaltantes[0];
                        } if (elementosFaltantes.length === 2) {
                            error = "En el array de apartamentosIDV hay identifcadores que no existen: " + elementosFaltantes.join("y");
                        }
                        if (elementosFaltantes.length > 2) {
                            const conComa = elementosFaltantes;
                            const ultima = elementosFaltantes.pop();
                            error = "En el array de apartamentosIDV hay identifcadores que no existen: " + conComa.join(", ") + " y " + ultima;
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
            todoAirbnb: async () => {
                // Obtengo todo los uids de los calendarios sincronizados en un objeto y lo itero
                const plataformaAibnb = "airbnb";
                const obtenerUIDCalendriosSincronizadosAirbnb = `
                                           SELECT uid
                                           FROM "calendariosSincronizados"
                                           WHERE "plataformaOrigen" = $1
                                           `;
                const calendariosSincronizadosAirbnbUIDS = await conexion.query(obtenerUIDCalendriosSincronizadosAirbnb, [plataformaAibnb]);
                if (calendariosSincronizadosAirbnbUIDS.rowCount > 0) {
                    const calendariosUIDS = calendariosSincronizadosAirbnbUIDS.rows.map((calendario) => {
                        return calendario.uid;
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
            calendariosAirbnb: async () => {
                const calendariosUID = validadoresCompartidos.tipos.array({
                    array: contenedorCapas.capasCompuestas.calendariosAirbnb,
                    nombreCampo: "El array de capasCompuesta de los calendarios Airbnbn",
                    filtro: "soloCadenasIDV",
                    nombreCompleto: "En el array del calendario multi capa"
                })
                // Validar que le nombre del apartamento existe como tal
                const plataformaOrigen = "airbnb";
                const obtenerCalendariosUID = `
                                            SELECT uid
                                            FROM "calendariosSincronizados"
                                            WHERE "plataformaOrigen" = $1
                                            `;
                const resuelveCalendariosUID = await conexion.query(obtenerCalendariosUID, [plataformaOrigen]);
                if (resuelveCalendariosUID.rowCount > 0) {
                    const calendariosUIDValidos = resuelveCalendariosUID.rows.map((calendarioUID) => {
                        return String(calendarioUID.uid);
                    });
                    const controlCalendariosF2 = calendariosUID.every(calendariosUID => calendariosUIDValidos.includes(calendariosUID));
                    if (!controlCalendariosF2) {
                        const elementosFaltantes = calendariosUID.filter(calendariosUID => !calendariosUIDValidos.includes(calendariosUID));
                        let error;
                        if (elementosFaltantes.length === 1) {
                            error = "En el array de calendariosUIDS hay un identificador que no existe: " + elementosFaltantes[0];
                        } if (elementosFaltantes.length === 2) {
                            error = "En el array de calendariosUIDS hay identifcadores que no existen: " + elementosFaltantes.join("y");
                        }
                        if (elementosFaltantes.length > 2) {
                            const conComa = elementosFaltantes;
                            const ultima = elementosFaltantes.pop();
                            error = "En el array de calendariosUIDS hay identifcadores que no existen: " + conComa.join(", ") + " y " + ultima;
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
                await capasComoComponentes.reservas();
                await capasComoComponentes.todosLosApartamentos();
                await capasComoComponentes.todosLosBloqueos();
                await capasComoComponentes.todoAirbnb();
            }
        };
        const capasDisponibles = Object.keys(capasComoComponentes);
        const todosPresentes = capas.every(capa => capasDisponibles.includes(capa));
        if (!todosPresentes) {
            const elementosFaltantes = capas.filter(capa => !capasDisponibles.includes(capa));
            let error;
            if (elementosFaltantes.length === 1) {
                error = "En el array de capasIDV hay un identificador que no existe: " + elementosFaltantes[0];
            } if (elementosFaltantes.length === 2) {
                error = "En el array de capasIDV hay identifcadores que no existen: " + elementosFaltantes.join("y");
            }
            if (elementosFaltantes.length > 2) {
                const conComa = elementosFaltantes;
                const ultima = elementosFaltantes.pop();
                error = "En el array de capasIDV hay identifcadores que no existen: " + conComa.join(", ") + " y " + ultima;
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
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        return salida.json(error);
    }
}