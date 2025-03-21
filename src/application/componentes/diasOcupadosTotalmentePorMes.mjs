import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../shared/configuracion/codigoZonaHoraria.mjs";
import { obtenerTodosLosCalendarios } from "../../shared/calendariosSincronizados/airbnb/obtenerTodosLosCalendarios.mjs";
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerReservasPorMesPorAno } from "../../infraestructure/repository/reservas/selectoresDeReservas/obtenerReservasPorMesPorAno.mjs";
import { obtenerBloqueosPorMes } from "../../infraestructure/repository/bloqueos/obtenerBloqueosPorMes.mjs";
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../infraestructure/repository/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs";
import { obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV } from "../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV.mjs";


export const diasOcupadosTotalmentePorMes = async (entrada) => {
    try {
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const ano = validadoresCompartidos.tipos.numero({
            number: entrada.body.ano,
            nombreCampo: "El campo del año",
            sePermiteVacio: "no",
            filtro: "numeroSimple",
            limpiezaEspaciosAlrededor: "si",
        })
        const mes = validadoresCompartidos.tipos.numero({
            number: entrada.body.mes,
            nombreCampo: "El campo del mes",
            sePermiteVacio: "no",
            filtro: "numeroSimple",
            limpiezaEspaciosAlrededor: "si",
        })
        validadoresCompartidos.fechas.cadenaMes
        if (mes < 0 || mes > 12) {
            const error = "El campo 'mes' solo puede ser un número entero y positivo entre el 1 y el 12";
            throw new Error(error);
        }
        if (ano < 0) {
            const error = "El campo año solo puede ser un número entero y positivo y superior a 0";
            throw new Error(error);
        }
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const anoActual = tiempoZH.year;
        const mesActual = tiempoZH.month;
        const constructorMes = DateTime.fromObject({ year: ano, month: mes, day: 1 });

        const ultimoDiaDelMes = constructorMes.endOf("month");

        const numeroUltimoDia = ultimoDiaDelMes.day;
        const rol = entrada.session?.rolIDV;
        const rolAdministrador = "administrador";
        const rolEmpleado = "empleado";
        if (anoActual > ano) {
            if (rol !== rolAdministrador && rol !== rolEmpleado) {
                const error = "Este componente solo proporciona información de fechas anteriores a la actual con una cuenta de tipo Administrador o Empleado.";
                throw new Error(error);
            }
        } else if (anoActual === ano && mesActual > mes) {
            if (rol !== rolAdministrador && rol !== rolEmpleado) {
                const error = "Este componente solo proporciona información de fechas anteriores a la actual con una cuenta de tipo Administrador o Empleado.";
                throw new Error(error);
            }
        }
        const reservasCoincidentes = await obtenerReservasPorMesPorAno({
            mes: mes,
            ano: ano,
            estadoReservaCancelada: "cancelada",
        })


        const configuracionesDisponibles = await obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV({
            estadoIDV: "activado",
            zonaArray: ["publica", "global", "privada"]
        })
        if (configuracionesDisponibles.length === 0) {
            const error = "No hay ningún apartamento disponible.";
            //throw new Error(error);
        }
        const apartamentosDisponibles = [];
        const apartamentosConfiguradosDisponibles = [];
        configuracionesDisponibles.forEach((apartamento) => {
            apartamentosConfiguradosDisponibles.push(apartamento.apartamentoIDV);
        });
        const bloqueoTemporal = "rangoTemporal";
        const bloqueoPermanente = "permanente";
        const bloqueosCoincidentes = await obtenerBloqueosPorMes({
            mes: mes,
            ano: ano,
            bloqueoPermanente: bloqueoPermanente,
            bloqueoTemporal: bloqueoTemporal
        })

        const obtenerFechasInternas = (fechaEntrada, fechaSalida) => {
            const fechasInternas = [];
            let fechaActual = DateTime.fromISO(fechaEntrada);
            const fechaFin = DateTime.fromISO(fechaSalida);
            while (fechaActual <= fechaFin) {
                const diaInterno = fechaActual.day;
                const mesInterno = fechaActual.month;
                const anoInterno = fechaActual.year;
                const diaFinal = diaInterno.toString();
                if (mes === mesInterno && ano === anoInterno) {
                    fechasInternas.push(diaInterno);
                }

                fechaActual = fechaActual.plus({ days: 1 });
            }
            return fechasInternas;
        };
        const objetoFechasInternas = {};
        for (const reservaCoincidente of reservasCoincidentes) {
            const reservaUID = reservaCoincidente.reservaUID;
            const apartamentosDeLaReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
            if (apartamentosDeLaReserva.length > 0) {
                const apartamentosPorReservaArray = [];
                apartamentosDeLaReserva.forEach((apartamento) => {
                    apartamentosPorReservaArray.push(apartamento.apartamentoIDV);
                });
                const fechaEntrada = reservaCoincidente.fechaEntrada;
                const fechaSalida = reservaCoincidente.fechaSalida;
                const fechasInternas = obtenerFechasInternas(fechaEntrada, fechaSalida);
                fechasInternas.forEach((fechaInterna) => {
                    if (!objetoFechasInternas[fechaInterna]?.apartamentos) {
                        const detalleDia = {
                            fecha: `${fechaInterna}/${mes}/${ano}`,
                            apartamentos: apartamentosPorReservaArray,
                            estadoDia: "porVer"
                        };
                        objetoFechasInternas[fechaInterna] = detalleDia;
                    } else {
                        let arrayExistente = objetoFechasInternas[fechaInterna].apartamentos;
                        const arrayFusion = Array.from(new Set(arrayExistente.concat(apartamentosPorReservaArray)));
                        objetoFechasInternas[fechaInterna].apartamentos = arrayFusion;
                    }
                });
            }
        }
        for (const bloqueoCoincidente of bloqueosCoincidentes) {
            const bloqueoUID = bloqueoCoincidente.uid;
            const apartamentoIDV = bloqueoCoincidente.apartamentoIDV;
            const fechaEntrada = bloqueoCoincidente.fechaEntrada;
            const fechaSalida = bloqueoCoincidente.fechaSalida;
            const tipoBloqueo = bloqueoCoincidente.tipoBloqueo;
            if (tipoBloqueo === "rangoTemporal") {
                const fechasInternas = obtenerFechasInternas(fechaEntrada, fechaSalida);
                fechasInternas.forEach((fechaInterna) => {
                    if (!objetoFechasInternas[fechaInterna]?.apartamentos) {
                        const detalleDia = {
                            fecha: `${fechaInterna}/${mes}/${ano}`,
                            apartamentos: Array(apartamentoIDV),
                            estadoDia: "porVer"
                        };
                        objetoFechasInternas[fechaInterna] = detalleDia;
                    } else {
                        const arrayExistente = objetoFechasInternas[fechaInterna].apartamentos;
                        if (!arrayExistente.includes(apartamentoIDV)) {
                            arrayExistente.push(apartamentoIDV);
                        }

                    }
                });
            }
            if (tipoBloqueo === "permanente") {

                const fechaInicioDelMes_ISO = `${ano}-${String(mes).padStart(2, "0")}-01`;
                const fechaFinDelMes_ISO = `${ano}-${String(mes).padStart(2, "0")}-${String(numeroUltimoDia).padStart(2, "0")}`;
                const fechasInternas = obtenerFechasInternas(fechaInicioDelMes_ISO, fechaFinDelMes_ISO);
                fechasInternas.forEach((fechaInterna) => {
                    if (!objetoFechasInternas[fechaInterna]?.apartamentos) {
                        const detalleDia = {
                            fecha: `${fechaInterna}/${mes}/${ano}`,
                            apartamentos: Array(apartamentoIDV),
                            estadoDia: "porVer"
                        };
                        objetoFechasInternas[fechaInterna] = detalleDia;
                    } else {
                        const arrayExistente = objetoFechasInternas[fechaInterna].apartamentos;
                        if (!arrayExistente.includes(apartamentoIDV)) {
                            arrayExistente.push(apartamentoIDV);
                        }

                    }
                });
            }
        }

        const calendariosSincronizadosAirbnb = (await obtenerTodosLosCalendarios()).calendariosSincronizados;
        for (const detallesDelCalendario of calendariosSincronizadosAirbnb) {
            const apartamentoIDV = detallesDelCalendario.apartamentoIDV;
            const nombreCalendario = detallesDelCalendario.nombreCalendario;
            const calendarioObjeto = detallesDelCalendario.calendarioObjeto;
            for (const detallesDelEvento of calendarioObjeto) {
                const fechaInicioEvento_ISO = detallesDelEvento.fechaInicio;


                const fechaFinalEvento_ISO = detallesDelEvento.fechaFinal;
                const apartamentosPorReservaArray = [apartamentoIDV];
                const fechasInternas = obtenerFechasInternas(fechaInicioEvento_ISO, fechaFinalEvento_ISO);
                fechasInternas.forEach((fechaInterna) => {
                    if (!objetoFechasInternas[fechaInterna]?.apartamentos) {
                        const detalleDia = {
                            fecha: `${fechaInterna}/${mes}/${ano}`,
                            apartamentos: apartamentosPorReservaArray,
                            estadoDia: "porVer"
                        };
                        objetoFechasInternas[fechaInterna] = detalleDia;
                    } else {
                        let arrayExistente = objetoFechasInternas[fechaInterna].apartamentos;
                        const arrayFusion = Array.from(new Set(arrayExistente.concat(apartamentosPorReservaArray)));
                        objetoFechasInternas[fechaInterna].apartamentos = arrayFusion;
                    }
                });
            }
        }



        const controlEstadoDia = (apartamentosConfiguradosDisponibles, apartamentosEncontradosNoDisponibles) => {
            apartamentosConfiguradosDisponibles.sort();
            apartamentosEncontradosNoDisponibles.sort();
            if (apartamentosConfiguradosDisponibles.length === 0) {
                return "diaCompleto";
            }
            else if (apartamentosEncontradosNoDisponibles.length === 0) {
                return "libre";
            }
            else if (apartamentosConfiguradosDisponibles.some(apartamento => !apartamentosEncontradosNoDisponibles.includes(apartamento))) {
                return "diaParcial"; // Los arrays tienen longitudes diferentes, no pueden ser iguales
            } else if (apartamentosConfiguradosDisponibles.every(apartamento => apartamentosEncontradosNoDisponibles.includes(apartamento))) {
                return "diaCompleto";
            }
        };
        for (const [fechaDia, detallesDia] of Object.entries(objetoFechasInternas)) {
            const apartamentosEncontradosNoDisponibles = detallesDia.apartamentos;
            detallesDia.estadoDia = controlEstadoDia(apartamentosConfiguradosDisponibles, apartamentosEncontradosNoDisponibles);
        }
        const respuestaFinal = {
            mes: mes,
            dias: objetoFechasInternas
        };
        const objetofinal = {
            ok: respuestaFinal
        };
        return objetofinal
    } catch (errorCapturado) {
        throw errorCapturado
    }
}