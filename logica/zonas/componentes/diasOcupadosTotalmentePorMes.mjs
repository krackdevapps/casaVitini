import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../sistema/configuracion/codigoZonaHoraria.mjs";
import { obtenerTodosLosCalendarios } from "../../sistema/calendariosSincronizados/airbnb/obtenerTodosLosCalendarios.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerReservasPorMes } from "../../repositorio/reservas/selectoresDeReservas/obtenerReservasPorMesPorAno.mjs";
import { obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles } from "../../repositorio/arquitectura/obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles.mjs";
import { obtenerBloqueosPorMes } from "../../repositorio/bloqueos/obtenerBloqueosPorMes.mjs";
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs";


export const diasOcupadosTotalmentePorMes = async (entrada, salida) => {
    try {
        const ano = validadoresCompartidos.tipos.numero({
            number: entrada.body.ano,
            nombreCampo: "El campo del año",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const mes = validadoresCompartidos.tipos.numero({
            number: entrada.body.mes,
            nombreCampo: "El campo del mes",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        validadoresCompartidos.fechas.cadenaMes
        if (mes < 0 || mes > 12) {
            const error = "El campo 'mes' solo puede ser un numero entero y positivo entre el 1 y el 12";
            throw new Error(error);
        }
        if (ano < 0) {
            const error = "El campo 'ano' solo puede ser un numero entero y positivo y superior a 0";
            throw new Error(error);
        }
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const anoActual = tiempoZH.year;
        const mesActual = tiempoZH.month;
        const contructorMes = DateTime.fromObject({ year: ano, month: mes, day: 1 });
        // Obtén el último día del mes
        const ultimoDiaDelMes = contructorMes.endOf("month");
        // Extrae el número del último día del mes
        const numeroUltimoDia = ultimoDiaDelMes.day;
        const rol = entrada.session.rol;
        const rolAdministrador = "administrador";
        const rolEmpleado = "empleado";
        if (anoActual > ano) {
            if (rol !== rolAdministrador && rol !== rolEmpleado) {
                const error = "Este componete solo proporciona informacion de fechas anteriores a la actual con una cuenta de tipo Administrador o Empleado";
                throw new Error(error);
            }
        } else if (anoActual === ano && mesActual > mes) {
            if (rol !== rolAdministrador && rol !== rolEmpleado) {
                const error = "Este componete solo proporciona informacion de fechas anteriores a la actual con una cuenta de tipo Administrador o Empleado";
                throw new Error(error);
            }
        }
        const reservasCoincidentes = await obtenerReservasPorMes({
            mes: mes,
            ano: ano,
            estadoReservaCancelada: "cancelada",
        })
        // Cuantos apartamentos disponibles existen
        const configuracionesDisponibles = await obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles()
        if (configuracionesDisponibles.length === 0) {
            const error = "No hay ningun apartamento disponible";
            throw new Error(error);
        }
        const apartamentosDisponbiles = [];
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
        // Seleccionar apartamentos bloqueados
        const obtenerFechasInternas = (fechaEntrada_ISO, fechaSalida_ISO) => {
            const fechasInternas = [];
            let fechaActual = DateTime.fromISO(fechaEntrada_ISO);
            const fechaFin = DateTime.fromISO(fechaSalida_ISO);
            while (fechaActual <= fechaFin) {
                const diaInterno = fechaActual.day;
                const mesInterno = fechaActual.month;
                const anoInterno = fechaActual.year;
                const diaFinal = diaInterno.toString();
                if (mes === mesInterno && ano === anoInterno) {
                    fechasInternas.push(diaInterno);
                }
                // Incrementa la fecha actual en un día
                fechaActual = fechaActual.plus({ days: 1 });
            }
            return fechasInternas;
        };
        const objetoFechasInternas = {};
        for (const reservaCoincidente of reservasCoincidentes) {
            const reservaUID = reservaCoincidente.reserva;
            const apartamentosDeLaReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
            if (apartamentosDeLaReserva.length > 0) {
                const apartamentosPorReservaArray = [];
                apartamentosDeLaReserva.forEach((apartamento) => {
                    apartamentosPorReservaArray.push(apartamento.apartamentoIDV);
                });
                const fechaEntrada_ISO = reservaCoincidente.fechaEntrada_ISO;
                const fechaSalida_ISO = reservaCoincidente.fechaSalida_ISO;
                const fechasInternas = obtenerFechasInternas(fechaEntrada_ISO, fechaSalida_ISO);
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
            const apartamentoIDV = bloqueoCoincidente.apartamento;
            const fechaEntrada_ISO = bloqueoCoincidente.fechaEntrada_ISO;
            const fechaSalida_ISO = bloqueoCoincidente.fechaSalida_ISO;
            const tipoBloqueo = bloqueoCoincidente.tipoBloqueo;
            if (tipoBloqueo === "rangoTemporal") {
                const fechasInternas = obtenerFechasInternas(fechaEntrada_ISO, fechaSalida_ISO);
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
                        //objetoFechasInternas[fechaInterna].apartamentos = arrayExistente
                    }
                });
            }
            if (tipoBloqueo === "permanente") {
                // EL error esta en que anoActual es el ano del presetne y no del año que se le solicita
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
                        //objetoFechasInternas[fechaInterna].apartamentos = arrayExistente
                    }
                });
            }
        }
        // Sacar todos los uid de los calendarios
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
        // Y  por calendario, procesar los eventos
        // Obtener los objetos de los dias de los calendarios sincronizados
        // Pasarlo por fechas intenras e agregar con el sistema que impide duplicados
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
        salida.json(objetofinal);
    } catch (errorCapturado) {
        throw errorCapturado
    } 
}