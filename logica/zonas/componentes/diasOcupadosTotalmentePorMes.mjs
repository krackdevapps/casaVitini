import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../sistema/codigoZonaHoraria.mjs";
import { conexion } from "../../componentes/db.mjs";
import { obtenerTodosLosCalendarios } from "../../sistema/calendariosSincronizados/airbnb/obtenerTodosLosCalendarios.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";


export const diasOcupadosTotalmentePorMes = async (entrada, salida) => {
    try {
        const ano = validadoresCompartidos.tipos.numero({
            string: entrada.body.ano,
            nombreCampo: "El campo del año",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const mes = validadoresCompartidos.tipos.numero({
            string: entrada.body.mes,
            nombreCampo: "El campo del mes",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

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
        const estadoReservaCancelada = "cancelada";
        const reservarEnEseMes = `
            SELECT 
            reserva,
            to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
            to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
            FROM 
            reservas
            WHERE
            (
                DATE_PART('YEAR', entrada) < $2
                OR (
                    DATE_PART('YEAR', entrada) = $2
                    AND DATE_PART('MONTH', entrada) <= $1
                )
            )
            AND (
                DATE_PART('YEAR', salida) > $2
                OR (
                    DATE_PART('YEAR', salida) = $2
                    AND DATE_PART('MONTH', salida) >= $1
                )
            )
            AND "estadoReserva" <> $3
           `;
        const resuelveReservarEnEseMes = await conexion.query(reservarEnEseMes, [mes, ano, estadoReservaCancelada]);
        const reservasCoincidentes = resuelveReservarEnEseMes.rows;
        // Cuantos apartamentos disponibles existen
        const consultaApartamentosDisponibles = `
            SELECT 
            "apartamentoIDV"
            FROM 
            "configuracionApartamento"
            WHERE 
            "estadoConfiguracion" = $1;          
           `;
        const estadoConfiguracionDisponible = "disponible";
        const resuelveConsultaApartamentosDisponibles = await conexion.query(consultaApartamentosDisponibles, [estadoConfiguracionDisponible]);
        if (resuelveConsultaApartamentosDisponibles.rowCount === 0) {
            const error = "No hay ningun apartamento disponible";
            throw new Error(error);
        }
        const apartamentosDisponiblesPorFormatear = resuelveConsultaApartamentosDisponibles.rows;
        const apartamentosDisponbiles = [];
        const apartamentosConfiguradosDisponibles = [];
        apartamentosDisponiblesPorFormatear.map((apartamento) => {
            apartamentosConfiguradosDisponibles.push(apartamento.apartamentoIDV);
        });
        const consultaApartamentosBloqueados = ` 
            SELECT 
            apartamento,
            "tipoBloqueo",
            to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
            to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
            FROM "bloqueosApartamentos"
            WHERE
            (
                "tipoBloqueo" = $4 AND
                (
                DATE_PART('YEAR', entrada) < $2
                OR (
                    DATE_PART('YEAR', entrada) = $2
                    AND DATE_PART('MONTH', entrada) <= $1
                )
            )
            AND (
                DATE_PART('YEAR', salida) > $2
                OR (
                    DATE_PART('YEAR', salida) = $2
                    AND DATE_PART('MONTH', salida) >= $1
                )
            )) 
            OR
            "tipoBloqueo" = $3;
            `;
        const bloqueoTemporal = "rangoTemporal";
        const bloqueoPermanente = "permanente";
        const resuelveApartamentosBloqueados = await conexion.query(consultaApartamentosBloqueados, [mes, ano, bloqueoPermanente, bloqueoTemporal]);
        const bloqueosCoincidentes = resuelveApartamentosBloqueados.rows;
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
            const consultaApartamentosPorReserva = `
                SELECT 
                apartamento
                FROM "reservaApartamentos"
                WHERE reserva = $1;          
                `;
            const resuelveConsultaApartamentosPorReserva = await conexion.query(consultaApartamentosPorReserva, [reservaUID]);
            if (resuelveConsultaApartamentosPorReserva.rowCount > 0) {
                const apartamentosPorReservaObjetoCompleto = resuelveConsultaApartamentosPorReserva.rows;
                const apartamentosPorReservaArray = [];
                apartamentosPorReservaObjetoCompleto.map((apartamento) => {
                    apartamentosPorReservaArray.push(apartamento.apartamento);
                });
                const fechaEntrada_ISO = reservaCoincidente.fechaEntrada_ISO;
                const fechaSalida_ISO = reservaCoincidente.fechaSalida_ISO;
                const fechasInternas = obtenerFechasInternas(fechaEntrada_ISO, fechaSalida_ISO);
                fechasInternas.map((fechaInterna) => {
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
                fechasInternas.map((fechaInterna) => {
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
                fechasInternas.map((fechaInterna) => {
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
                fechasInternas.map((fechaInterna) => {
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
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
    }
}