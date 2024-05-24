import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';
import { obtenerReservaPorReservaUID } from '../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs';
import { obtenerApartamentosDeLaReservaPorReservaUID } from '../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs';
import { obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles } from '../../repositorio/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles.mjs';
import { validadorPasado } from './rangoFlexible/pasado.mjs';
import { validadorFuturo } from './rangoFlexible/futuro.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';
export const validarModificacionRangoFechaResereva = async (metadatos) => {
    try {
        const mesCalendario = metadatos.mesCalendario.padStart(2, '0');
        const anoCalendario = metadatos.anoCalendario.padStart(2, '0');
        const sentidoRango = metadatos.sentidoRango

        validadoresCompartidos.fechas.cadenaAno(anoCalendario)
        validadoresCompartidos.fechas.cadenaMes(mesCalendario)

        const reservaUID = validadoresCompartidos.tipos.numero({
            number: metadatos.reservaUID,
            nombreCampo: "El identificador universal de la reservaUID (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        if (sentidoRango !== "pasado" && sentidoRango !== "futuro") {
            const error = "El campo 'sentidoRango' solo puede ser pasado o futuro"
            throw new Error(error)
        }
        // La fecha de entrada seleccionada no puede seer superior a la de la fecha de entrada de la reserva
        // extraer el rango y los apartamentos de la reserva actual

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoPago = reserva.estadoPagoIDV

        if (estadoPago === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada"
            throw new Error(error)
        }
        const fechaEntradaReserva_ISO = reserva.fechaEntrada
        const fechaSalidaReserva_ISO = reserva.fechaSalida
        const mesReservaEntrada = fechaEntradaReserva_ISO.split("-")[1]
        const anoReservaEntrada = fechaEntradaReserva_ISO.split("-")[0]
        const mesReservaSalida = fechaSalidaReserva_ISO.split("-")[1]
        const anoReservaSalida = fechaSalidaReserva_ISO.split("-")[0]

        const apartamentosDeLaReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
        const apartamentosReservaActual = apartamentosDeLaReserva.map((apartamento) => {
            return apartamento.apartamento
        })
        const apartamentosConConfiguracionDisponible = []
        // consulta apartamentos NO diponibles en configuracion global

        const configuracionesApartamentosSoloDiponibles = await obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles()
        configuracionesApartamentosSoloDiponibles.forEach((apartamentoConConfiguracionDisponible) => {
            apartamentosConConfiguracionDisponible.push(apartamentoConConfiguracionDisponible.apartamentoIDV)
        })
        const controlConfiguracionAlojamiento = apartamentosReservaActual.every(apto => apartamentosConConfiguracionDisponible.includes(apto));

        if (!controlConfiguracionAlojamiento) {
            const elementosNoComunes = apartamentosReservaActual.filter(elemento => !apartamentosConConfiguracionDisponible.includes(elemento));
            const arrayStringsPrePresentacionDatos = []

            for (const apartamentoIDV of elementosNoComunes) {
                const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)
                const nombreUI = `${apartamentoUI} (IDV: ${apartamentoIDV})`
                arrayStringsPrePresentacionDatos.push(nombreUI)
            }


            const ultimoElemento = arrayStringsPrePresentacionDatos.pop();
            const constructorCadenaFinalUI = arrayStringsPrePresentacionDatos.join(", ") + (arrayStringsPrePresentacionDatos.length > 0 ? " y " : "") + ultimoElemento;

            const error = "No se puede comprobar la elasticidad del rango de esta reserva por que hay apartamentos que no existen en la configuración de alojamiento o están en No disponible. Dicho de otra manera, esta reserva tiene apartamentos que ya no existen como configuración de alojamiento o tienen un estado No disponible. Puede que esta reserva se hiciera cuando existían unas configuraciones de alojamiento que ahora ya no existen, concretamente hablamos de los apartamentos: " + constructorCadenaFinalUI
            throw new Error(error)
        }
        // if (sentidoRango === "pasado") {

        //     // cuidado con el primer rangoPasadoLibre, si no hay apartamentos en futuro tambien da rangoPasadolibre
        //     // if (resuelveConsultaAlojamientoReservaActual.rowCount === 0) {
        //     //     const ok = {
        //     //         ok: "rangoPasadoLibre"
        //     //     }
        //     //     return ok
        //     // }

        //     const fechaSeleccionadaParaPasado_Objeto = DateTime.fromObject({
        //         year: anoCalendario,
        //         month: mesCalendario, day: 1
        //     })
        //         .minus({ months: 1 }).endOf('month')
        //     const fechaSeleccionadaParaPasado_ISO = fechaSeleccionadaParaPasado_Objeto.toISODate().toString()
        //     if (anoReservaSalida < anoCalendario || mesReservaSalida < mesCalendario && anoReservaSalida === anoCalendario) {
        //         const error = "El mes de entrada seleccionado no puede ser igual o superior a al mes de fecha de salida de la reserva"
        //         throw new Error(error)
        //     }
        //     /// No se tiene en en cuenta los apartamentos, solo busca bloqueos a sacoa partir de la fecha
        //     const configuracionBloqueos = {
        //         fechaInicioRango_ISO: fechaSeleccionadaParaPasado_ISO,
        //         fechaFinRango_ISO: fechaEntradaReserva_ISO,
        //         apartamentoIDV: apartamentosReservaActual,
        //         zonaBloqueo_array: [
        //             "global",
        //             "privado"
        //         ],
        //     }
        //     const bloqueosSeleccionados = await obtenerBloqueosPorRangoPorApartamentoIDV(configuracionBloqueos)
        //     const contenedorBloqueosEncontrados = []
        //     for (const detallesDelBloqueo of bloqueosSeleccionados) {
        //         const fechaEntradaBloqueo_ISO = detallesDelBloqueo.fechaEntrada_ISO
        //         const fechaSalidaBloqueo_ISO = detallesDelBloqueo.fechaSalida_ISO
        //         const apartamento = detallesDelBloqueo.apartamento
        //         const bloqueoUID = detallesDelBloqueo.uid
        //         const motivo = detallesDelBloqueo.motivo
        //         const tipoBloqueo = detallesDelBloqueo.tipoBloqueo
        //         const estructura = {
        //             fechaEntrada_ISO: fechaEntradaBloqueo_ISO,
        //             fechaSalida_ISO: fechaSalidaBloqueo_ISO,
        //             uid: bloqueoUID,
        //             tipoElemento: "bloqueo",
        //             apartamentoIDV: apartamento,
        //             tipoBloqueo: tipoBloqueo,
        //             motivo: motivo || "(Sin motivo espeficado en el bloqueo)"
        //         }
        //         contenedorBloqueosEncontrados.push(estructura)
        //     }
        //     const contenedorReservaEncontradas = []
        //     const configuracionReservas = {
        //         fechaInicioRango_ISO: fechaSeleccionadaParaPasado_ISO,
        //         fechaFinRango_ISO: fechaEntradaReserva_ISO,
        //         reservaUID: reservaUID,
        //         apartamentosIDV_array: apartamentosReservaActual,
        //     }
        //     const reservasSeleccionadas = await reservasPorRangoPorApartamentosArray(configuracionReservas)

        //     for (const detallesReserva of reservasSeleccionadas) {
        //         const reservaUID = detallesReserva.reservaUID
        //         const fechaEntrada_ISO = detallesReserva.fechaEntrada_ISO
        //         const fechaSalida_ISO = detallesReserva.fechaSalida_ISO
        //         const apartamentos = detallesReserva.apartamentos
        //         const estructura = {
        //             fechaEntrada_ISO: fechaEntrada_ISO,
        //             fechaSalida_ISO: fechaSalida_ISO,
        //             uid: reservaUID,
        //             tipoElemento: "reserva",
        //             apartamentos: apartamentos
        //         }
        //         contenedorReservaEncontradas.push(estructura)
        //     }
        //     // En base a los apartamentos de la reserva se impoirtan los calendarios que funcionan por apartmento
        //     const calendariosSincronizados = []
        //     for (const apartamentoIDV of apartamentosReservaActual) {
        //         const eventosCalendarioPorIDV = await sincronizarCalendariosAirbnbPorIDV(apartamentoIDV)
        //         calendariosSincronizados.push(eventosCalendarioPorIDV)
        //     }
        //     // Buscar solo los eventos del mismo mes
        //     const contenedorEventosCalendariosSincronizados = []
        //     // Iteramos el array con todos los grupos por apartamentoIDV
        //     for (const contenedorCalendariosPorIDV of calendariosSincronizados) {
        //         // Dentro de cada apartamentoIDV hay un grupo de calendarios
        //         const apartamentoIDV = contenedorCalendariosPorIDV.apartamentoIDV
        //         const calendariosPorApartamento = contenedorCalendariosPorIDV.calendariosPorApartamento
        //         // Obtenemos todos los eventos como objetos por calendario
        //         for (const eventosDelCalendario of calendariosPorApartamento) {
        //             const eventosCalendario = eventosDelCalendario.calendarioObjeto
        //             // Iteramos por cada evento
        //             for (const detallesDelEvento of eventosCalendario) {
        //                 const fechaFinal = detallesDelEvento.fechaFinal
        //                 const fechaInicio = detallesDelEvento.fechaInicio
        //                 const nombreEvento = detallesDelEvento.nombreEvento
        //                 const descripcion = detallesDelEvento.descripcion
        //                 const rangoInterno = await selectorRangoUniversal({
        //                     fechaInicio_rango_ISO: fechaSeleccionadaParaPasado_ISO,
        //                     fechaFin_rango_ISO: fechaEntradaReserva_ISO,
        //                     fechaInicio_elemento_ISO: fechaInicio,
        //                     fechaFin_elemento_ISO: fechaFinal,
        //                     tipoLimite: "noIncluido"
        //                 })
        //                 if (rangoInterno) {
        //                     const estructura = {
        //                         apartamentoIDV: apartamentoIDV,
        //                         fechaEntrada_ISO: fechaInicio,
        //                         fechaSalida_ISO: fechaFinal,
        //                         tipoElemento: "eventoCalendarioSincronizado",
        //                         nombreEvento: nombreEvento,
        //                         descripcion: descripcion,
        //                         tipoElemento: "eventoSincronizado"
        //                     }
        //                     contenedorEventosCalendariosSincronizados.push(estructura)

        //                 }
        //             }
        //         }
        //     }
        //     const fechaFinRango_entradaReserva_objeto = DateTime.fromISO(fechaEntradaReserva_ISO);
        //     const contenedorGlobal = [
        //         ...contenedorBloqueosEncontrados,
        //         ...contenedorReservaEncontradas,
        //         ...contenedorEventosCalendariosSincronizados,
        //     ]
        //     const contenedorDeEventosQueDejanSinRangoDisponible = []
        //     // Ojo: lo que se es haciendo aqui en este loop no es ver cuales estan dentro del mes, eso ya esta hecho, aquí lo que se mira es si los eventos estan enganchados al a fecha de entrada de la reserva para ver en primera instancia si hay algun tipo de rango disponible
        //     for (const detallesDelEvento of contenedorGlobal) {
        //         const fechaInicioEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaEntrada_ISO)
        //         const fechaFinEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaSalida_ISO)
        //         const tipoElemento = detallesDelEvento.tipoElemento
        //         if ((tipoElemento === "reserva" || tipoElemento === "eventoSincronizado")
        //             &&
        //             (
        //                 fechaInicioEvento_ISO < fechaFinRango_entradaReserva_objeto
        //                 &&
        //                 fechaFinRango_entradaReserva_objeto <= fechaFinEvento_ISO)) {
        //             contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
        //         }
        //         if (tipoElemento === "bloqueo") {
        //             const tipoBloqueo = detallesDelEvento.tipoBloqueo
        //             if ((tipoBloqueo === "rangoTemporal")
        //                 &&
        //                 (
        //                     fechaInicioEvento_ISO < fechaFinRango_entradaReserva_objeto
        //                     &&
        //                     fechaFinRango_entradaReserva_objeto <= fechaFinEvento_ISO
        //                 )) {
        //                 contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
        //             } else if (tipoBloqueo === "permanente") {
        //                 contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
        //             }
        //         }
        //     }
        //     if (contenedorDeEventosQueDejanSinRangoDisponible.length) {
        //         const ok = {
        //             ok: "noHayRangoPasado",
        //             limitePasado: fechaEntradaReserva_ISO,
        //             eventos: contenedorDeEventosQueDejanSinRangoDisponible
        //         }
        //         return ok
        //     }
        //     // Aqui se mira si habiendo algo de rango disponible. Aqui entonces se mira cuanto rango disponbile hay en el mes solicitaado
        //     const contenedorQueDejanRangoDisponbile = []
        //     for (const detallesDelEvento of contenedorGlobal) {
        //         const fechaInicioEvento_ISO = detallesDelEvento.fechaEntrada_ISO
        //         const fechaFinEvento_ISO = detallesDelEvento.fechaSalida_ISO
        //         const tipoElemento = detallesDelEvento.tipoElemento
        //         if (tipoElemento === "reserva" || tipoElemento === "eventoSincronizado") {
        //             const eventoBloqueanteDeRango = await selectorRangoUniversal({
        //                 fechaInicio_rango_ISO: fechaSeleccionadaParaPasado_ISO,
        //                 fechaFin_rango_ISO: fechaEntradaReserva_ISO,
        //                 fechaInicio_elemento_ISO: fechaInicioEvento_ISO,
        //                 fechaFin_elemento_ISO: fechaFinEvento_ISO,
        //                 tipoLimite: "noIncluido"
        //             })
        //             if (eventoBloqueanteDeRango) {
        //                 contenedorQueDejanRangoDisponbile.push(detallesDelEvento)
        //             }
        //         }
        //         if (tipoElemento === "bloqueo") {
        //             const tipoBloqueo = detallesDelEvento.tipoBloqueo
        //             if (tipoBloqueo === "rangoTemporal") {
        //                 const eventoBloqueanteDeRango = await selectorRangoUniversal({
        //                     fechaInicio_rango_ISO: fechaSeleccionadaParaPasado_ISO,
        //                     fechaFin_rango_ISO: fechaEntradaReserva_ISO,
        //                     fechaInicio_elemento_ISO: fechaInicioEvento_ISO,
        //                     fechaFin_elemento_ISO: fechaFinEvento_ISO,
        //                     tipoLimite: "incluido"
        //                 })
        //                 if (eventoBloqueanteDeRango) {
        //                     contenedorQueDejanRangoDisponbile.push(detallesDelEvento)
        //                 }
        //             } else if (tipoBloqueo === "permanete") {
        //                 contenedorQueDejanRangoDisponbile.push(detallesDelEvento)
        //             }
        //         }
        //     }
        //     if (contenedorQueDejanRangoDisponbile.length) {
        //         const eventosOrdenadorPorFechaDeSalida = contenedorQueDejanRangoDisponbile.sort((evento1, evento2) => {
        //             const fechaSalidaA = DateTime.fromISO(evento1.fechaSalida_ISO); // Convertir fecha de salida del evento 1 a objeto DateTime
        //             const fechaSalidaB = DateTime.fromISO(evento2.fechaSalida_ISO); // Convertir fecha de salida del evento 2 a objeto DateTime
        //             // Ordenar de manera descendente según la fecha de salida
        //             if (fechaSalidaA < fechaSalidaB) {
        //                 return 1; // Si la fecha de salida del evento 1 es menor, lo colocamos después en el array
        //             } else if (fechaSalidaA > fechaSalidaB) {
        //                 return -1; // Si la fecha de salida del evento 1 es mayor, lo colocamos antes en el array
        //             } else {
        //                 return 0; // Si las fechas de salida son iguales, no hay cambio en el orden
        //             }
        //         });
        //         // Hay mas de un evento con la fecha mas cercana?
        //         let fechaMasCercana = eventosOrdenadorPorFechaDeSalida[0].fechaSalida_ISO
        //         let sePermiteElMismoDia = "si"
        //         for (const detallesDeLosEventosOrdenados of eventosOrdenadorPorFechaDeSalida) {
        //             const fechaPorBuscar = detallesDeLosEventosOrdenados.fechaSalida_ISO
        //             const tipoElemento = detallesDeLosEventosOrdenados.tipoElemento
        //             if (fechaMasCercana === fechaPorBuscar &&
        //                 tipoElemento === "bloqueo") {
        //                 sePermiteElMismoDia = "no"
        //             }
        //         }
        //         const ok = {
        //             ok: "rangoPasadoLimitado",
        //             limitePasado: fechaMasCercana,
        //             origen: eventosOrdenadorPorFechaDeSalida[0].tipoElemento,
        //             comportamiento: "No se ha restado un dia por que es un bloqueo",
        //             eventos: eventosOrdenadorPorFechaDeSalida
        //         }
        //         if (sePermiteElMismoDia === "si") {
        //             const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        //             ok.limitePasado = DateTime.fromISO(fechaMasCercana, { zone: zonaHoraria }).minus({ days: 1 }).toISODate()
        //             ok.comportamiento = "Se ha restado un dia por que es una reserva o un evento sincronizado"
        //         }
        //         return ok
        //     }
        //     const ok = {
        //         ok: "rangoPasadoLibre"
        //     }
        //     return ok
        // }
        if (sentidoRango === "pasado") {
            const pasado = await validadorPasado({
                anoCalendario: anoCalendario,
                mesCalendario: mesCalendario,
                fechaEntradaReserva_ISO: fechaEntradaReserva_ISO,
                apartamentosReservaActual: apartamentosReservaActual,
            })
            return pasado
        }

        if (sentidoRango === "futuro") {
            const futuro = await validadorFuturo({
                anoCalendario: anoCalendario,
                mesCalendario: mesCalendario,
                fechaSalidaReserva_ISO: fechaSalidaReserva_ISO,
                apartamentosReservaActual: apartamentosReservaActual,
            })
            return futuro
        }

        // if (sentidoRango === "futuro") {
        //     const fechaSeleccionadaParaFuturo_Objeto = DateTime.fromObject({
        //         year: anoCalendario,
        //         month: mesCalendario, day: 1
        //     })
        //         .plus({ months: 1 })
        //     const fechaSeleccionadaParaFuturo_ISO = fechaSeleccionadaParaFuturo_Objeto.toISODate().toString()
        //     if ((anoReservaEntrada > anoCalendario) || (mesReservaEntrada > mesCalendario && anoReservaEntrada === anoCalendario)) {
        //         const error = "El mes de salida seleccionado no puede ser inferior a al mes de la fecha de entrada de la reserva"
        //         throw new Error(error)
        //     }
        //     const configuracionBloqueos = {
        //         fechaInicioRango_ISO: fechaSalidaReserva_ISO,
        //         fechaFinRango_ISO: fechaSeleccionadaParaFuturo_ISO,
        //         apartamentoIDV: apartamentosReservaActual,
        //         zonaBloqueo_array: [
        //             "global",
        //             "privado"
        //         ],
        //     }
        //     const bloqueosSeleccionados = await obtenerBloqueosPorRangoPorApartamentoIDV(configuracionBloqueos)

        //     const contenedorBloqueosEncontrados = []
        //     for (const detallesDelBloqueo of bloqueosSeleccionados) {
        //         const fechaEntradaBloqueo_ISO = detallesDelBloqueo.fechaEntrada_ISO
        //         const fechaSalidaBloqueo_ISO = detallesDelBloqueo.fechaSalida_ISO
        //         const apartamento = detallesDelBloqueo.apartamento
        //         const bloqueoUID = detallesDelBloqueo.uid
        //         const motivo = detallesDelBloqueo.motivo
        //         const tipoBloqueo = detallesDelBloqueo.tipoBloqueo
        //         const estructura = {
        //             fechaEntrada_ISO: fechaEntradaBloqueo_ISO,
        //             fechaSalida_ISO: fechaSalidaBloqueo_ISO,
        //             uid: bloqueoUID,
        //             tipoElemento: "bloqueo",
        //             apartamentoIDV: apartamento,
        //             tipoBloqueo: tipoBloqueo,
        //             motivo: motivo || "(Sin motivo espeficado en el bloqueo)"
        //         }
        //         contenedorBloqueosEncontrados.push(estructura)
        //     }
        //     const contenedorReservaEncontradas = []
        //     const configuracionReservas = {
        //         fechaInicioRango_ISO: fechaSalidaReserva_ISO,
        //         fechaFinRango_ISO: fechaSeleccionadaParaFuturo_ISO,
        //         reservaUID: reserva,
        //         apartamentosIDV_array: apartamentosReservaActual,
        //     }

        //     const reservasSeleccionadas = await reservasPorRangoPorApartamentosArray(configuracionReservas)
        //     for (const detallesReserva of reservasSeleccionadas) {
        //         const reserva = detallesReserva.reserva
        //         const fechaEntrada_ISO = detallesReserva.fechaEntrada_ISO
        //         const fechaSalida_ISO = detallesReserva.fechaSalida_ISO
        //         const apartamentos = detallesReserva.apartamentos
        //         const estructura = {
        //             fechaEntrada_ISO: fechaEntrada_ISO,
        //             fechaSalida_ISO: fechaSalida_ISO,
        //             uid: reserva,
        //             tipoElemento: "reserva",
        //             apartamentos: apartamentos
        //         }
        //         contenedorReservaEncontradas.push(estructura)
        //     }
        //     // En base a los apartamentos de la reserva se importan los calendarios que funcionan por apartamento
        //     const calendariosSincronizados = []
        //     for (const apartamentoIDV of apartamentosReservaActual) {
        //         const eventosCalendarioPorIDV = await sincronizarCalendariosAirbnbPorIDV(apartamentoIDV)
        //         calendariosSincronizados.push(eventosCalendarioPorIDV)
        //     }
        //     const contenedorEventosCalendariosSincronizados = []
        //     // Iteramos el array con todos los grupos por apartamentoIDV
        //     for (const contenedorCalendariosPorIDV of calendariosSincronizados) {
        //         // Dentro de cada apartamentoIDV hay un grupo de calendarios
        //         const apartamentoIDV = contenedorCalendariosPorIDV.apartamentoIDV
        //         const calendariosPorApartamento = contenedorCalendariosPorIDV.calendariosPorApartamento
        //         // Obtenemos todos los eventos como objetos por calendario
        //         for (const eventosDelCalendario of calendariosPorApartamento) {
        //             const eventosCalendario = eventosDelCalendario.calendarioObjeto
        //             // Iteramos por cada evento
        //             for (const detallesDelEvento of eventosCalendario) {
        //                 const fechaFinal = detallesDelEvento.fechaFinal
        //                 const fechaInicio = detallesDelEvento.fechaInicio
        //                 const nombreEvento = detallesDelEvento.nombreEvento
        //                 const descripcion = detallesDelEvento.descripcion
        //                 const rangoInterno = await selectorRangoUniversal({
        //                     fechaInicio_rango_ISO: fechaSalidaReserva_ISO,
        //                     fechaFin_rango_ISO: fechaSeleccionadaParaFuturo_ISO,
        //                     fechaInicio_elemento_ISO: fechaInicio,
        //                     fechaFin_elemento_ISO: fechaFinal,
        //                     tipoLimite: "noIncluido"
        //                 })
        //                 if (rangoInterno) {
        //                     const estructura = {
        //                         apartamentoIDV: apartamentoIDV,
        //                         fechaEntrada_ISO: fechaInicio,
        //                         fechaSalida_ISO: fechaFinal,
        //                         tipoElemento: "eventoCalendarioSincronizado",
        //                         nombreEvento: nombreEvento,
        //                         descripcion: descripcion,
        //                         tipoElemento: "eventoSincronizado"
        //                     }
        //                     contenedorEventosCalendariosSincronizados.push(estructura)
        //                 }
        //             }
        //         }
        //     }
        //     const fechaInicioRango_salidaReserva_objeto = DateTime.fromISO(fechaSalidaReserva_ISO);
        //     const contenedorGlobal = [
        //         ...contenedorBloqueosEncontrados,
        //         ...contenedorReservaEncontradas,
        //         ...contenedorEventosCalendariosSincronizados,
        //     ]
        //     const contenedorDeEventosQueDejanSinRangoDisponible = []
        //     for (const detallesDelEvento of contenedorGlobal) {
        //         const fechaInicioEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaEntrada_ISO)
        //         const fechaFinEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaSalida_ISO)
        //         const tipoElemento = detallesDelEvento.tipoElemento
        //         if ((tipoElemento === "reserva" || tipoElemento === "eventoSincronizado")
        //             &&
        //             (fechaInicioEvento_ISO < fechaInicioRango_salidaReserva_objeto &&
        //                 fechaInicioRango_salidaReserva_objeto <= fechaFinEvento_ISO)) {
        //             contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
        //         }
        //         if (tipoElemento === "bloqueo") {
        //             const tipoBloqueo = detallesDelEvento.tipoBloqueo
        //             if ((tipoBloqueo === "rangoTemporal")
        //                 &&
        //                 (fechaInicioEvento_ISO <= fechaInicioRango_salidaReserva_objeto &&
        //                     fechaInicioRango_salidaReserva_objeto <= fechaFinEvento_ISO)) {
        //                 contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
        //             } else if (tipoBloqueo === "permanente") {
        //                 contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
        //             }
        //         }
        //     }
        //     if (contenedorDeEventosQueDejanSinRangoDisponible.length) {
        //         const ok = {
        //             ok: "noHayRangoFuturo",
        //             limiteFuturo: fechaSalidaReserva_ISO,
        //             eventos: contenedorDeEventosQueDejanSinRangoDisponible
        //         }
        //         return ok
        //     }
        //     // Aqui se mira si habiendo algo de rango disponible. Aqui entonces se mira cuanto rango disponbile hay
        //     const contenedorQueDejanRangoDisponbile = []
        //     for (const detallesDelEvento of contenedorGlobal) {
        //         const fechaInicioEvento_ISO = detallesDelEvento.fechaEntrada_ISO
        //         const fechaFinEvento_ISO = detallesDelEvento.fechaSalida_ISO
        //         const tipoElemento = detallesDelEvento.tipoElemento
        //         if (tipoElemento === "reserva" || tipoElemento === "eventoSincronizado") {
        //             const eventoBloqueanteDeRango = await selectorRangoUniversal({
        //                 fechaInicio_rango_ISO: fechaSalidaReserva_ISO,
        //                 fechaFin_rango_ISO: fechaSeleccionadaParaFuturo_ISO,
        //                 fechaInicio_elemento_ISO: fechaInicioEvento_ISO,
        //                 fechaFin_elemento_ISO: fechaFinEvento_ISO,
        //                 tipoLimite: "noIncluido"
        //             })
        //             if (eventoBloqueanteDeRango) {
        //                 contenedorQueDejanRangoDisponbile.push(detallesDelEvento)
        //             }
        //         }
        //         if (tipoElemento === "bloqueo") {
        //             const tipoBloqueo = detallesDelEvento.tipoBloqueo
        //             if (tipoBloqueo === "rangoTemporal") {
        //                 const eventoBloqueanteDeRango = await selectorRangoUniversal({
        //                     fechaInicio_rango_ISO: fechaSalidaReserva_ISO,
        //                     fechaFin_rango_ISO: fechaSeleccionadaParaFuturo_ISO,
        //                     fechaInicio_elemento_ISO: fechaInicioEvento_ISO,
        //                     fechaFin_elemento_ISO: fechaFinEvento_ISO,
        //                     tipoLimite: "incluido"
        //                 })
        //                 if (eventoBloqueanteDeRango) {
        //                     contenedorQueDejanRangoDisponbile.push(detallesDelEvento)
        //                 }
        //             } else if (tipoBloqueo === "permanete") {
        //                 contenedorQueDejanRangoDisponbile.push(detallesDelEvento)
        //             }
        //         }
        //     }
        //     if (contenedorQueDejanRangoDisponbile.length) {
        //         const eventosOrdenadorPorFechaDeEntrada = contenedorQueDejanRangoDisponbile.sort((evento1, evento2) => {
        //             const fechaEntradaA = DateTime.fromISO(evento1.fechaEntrada_ISO); // Convertir fecha de salida del evento 1 a objeto DateTime
        //             const fechaEntradaB = DateTime.fromISO(evento2.fechaEntrada_ISO); // Convertir fecha de salida del evento 2 a objeto DateTime
        //             // Ordenar de manera descendente según la fecha de salida
        //             if (fechaEntradaA > fechaEntradaB) {
        //                 return 1; // Si la fecha de salida del evento 1 es menor, lo colocamos después en el array
        //             } else if (fechaEntradaA < fechaEntradaB) {
        //                 return -1; // Si la fecha de salida del evento 1 es mayor, lo colocamos antes en el array
        //             } else {
        //                 return 0; // Si las fechas de salida son iguales, no hay cambio en el orden
        //             }
        //         });
        //         let fechaMasCercana = eventosOrdenadorPorFechaDeEntrada[0].fechaEntrada_ISO
        //         let sePermiteElMismoDia = "si"
        //         for (const detallesDeLosEventosOrdenados of eventosOrdenadorPorFechaDeEntrada) {
        //             const fechaPorBuscar = detallesDeLosEventosOrdenados.fechaEntrada_ISO
        //             const tipoElemento = detallesDeLosEventosOrdenados.tipoElemento
        //             if (fechaMasCercana === fechaPorBuscar &&
        //                 tipoElemento === "bloqueo") {
        //                 sePermiteElMismoDia = "no"
        //             }
        //         }
        //         const ok = {
        //             ok: "rangoFuturoLimitado",
        //             limiteFuturo: fechaMasCercana,
        //             origen: eventosOrdenadorPorFechaDeEntrada[0].tipoElemento,
        //             comportamiento: "No se ha sumado un dia por que es un bloqueo",
        //             eventos: eventosOrdenadorPorFechaDeEntrada
        //         }
        //         if (sePermiteElMismoDia === "si") {
        //             const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        //             ok.limiteFuturo = DateTime.fromISO(fechaMasCercana, { zone: zonaHoraria }).plus({ days: 1 }).toISODate()
        //             ok.comportamiento = "Se ha sumado un dia por que es una reserva o un evento sincronizado"
        //         }
        //         return ok
        //     }
        //     const ok = {
        //         ok: "rangoFuturoLibre"
        //     }
        //     return ok
        // }
    } catch (errorCapturado) {
        throw error;
    }
}
