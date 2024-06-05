import { DateTime } from 'luxon';
import { codigoZonaHoraria } from '../configuracion/codigoZonaHoraria.mjs';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs'
import { limitesReservaPublica } from './limitesReservaPublica.mjs';
import { apartamentosPorRango } from '../selectoresCompartidos/apartamentosPorRango.mjs';
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from '../../repositorio/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs';
import { obtenerCamaDeLaHabitacionPorHabitacionUID } from '../../repositorio/arquitectura/configuraciones/obtenerCamaDeLaHabitacionPorHabitacionUID.mjs';
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from '../../repositorio/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';

export const validarObjetoReserva = async (data) => {
    try {
        const filtroTitular = data.filtroTitular
        const filtroHabitacionesCamas = data.filtroHabitacionesCamas
        const reservaObjeto = data.reservaObjeto

        if (filtroTitular !== "si" && filtroTitular !== "no") {
            const error = "El validadorObjetoReserva mal configrado. Necesita el filtroTitular en si o no."
            throw new Error(error)
        }

        if (filtroHabitacionesCamas !== "si" && filtroHabitacionesCamas !== "no") {
            const error = "El validadorObjetoReserva mal configrado. Necesita el filtroHabitacionesCamas en si o no."
            throw new Error(error)
        }

        validadoresCompartidos.tipos.objetoLiteral({
            objetoLiteral: reservaObjeto,
            nombreCampo: "el campo reservaObjeto"
        })

        const fechaEntrada_Humano = reservaObjeto.fechaEntrada
        const fechaSalida_Humano = reservaObjeto.fecahSalida
        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada_Humano)).fecha_ISO
        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida_Humano)).fecha_ISO
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActualTZ = tiempoZH.toISODate()
        const fechaEntradaReserva_ISO = DateTime.fromISO(fechaEntrada_ISO, { zone: zonaHoraria });
        const fechaSalidaReserva_ISO = DateTime.fromISO(fechaSalida_ISO, { zone: zonaHoraria });

        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            tipoVector: "diferente"
        })

        if (fechaEntradaReserva_ISO < fechaActualTZ) {
            const error = "La fecha de entrada no puede ser anterior a la fecha actual"
            throw new Error(error)
        }

        const fechasParaValidarLimites = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO
        }
        await limitesReservaPublica(fechasParaValidarLimites)
        const alojamiento = reservaObjeto?.alojamiento
        if (reservaObjeto.hasOwnProterpy("alojamiento")) {
            const error = "No exite la llave de 'alojamiento' esperada dentro del objeto, por lo tante hasta aquí hemos llegado"
            throw new Error(error)
        }

        const apartemtosIDVarray = Object.keys(alojamiento)
        const controlApartamentosIDVUnicos = new Set(apartemtosIDVarray);
        if (controlApartamentosIDVUnicos.size !== apartemtosIDVarray.length) {
            const error = "Existen apartamentosIDV repetidos en el objeto de la reserva"
            throw new Error(error)
        }
        for (const apartamento of Object.entries(alojamiento)) {
            const apartamentoIDV = apartamento[0]
            const habitacionesDelApartamentoPorValidar = apartamento[1].habitaciones

            validadoresCompartidos.tipos.cadena({
                string: apartamentoIDV,
                nombreCampo: "El campo apartamentoIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
            validadoresCompartidos.tipos.objetoLiteral({
                objetoLiteral: habitacionesDelApartamentoPorValidar,
                nombreCampo: "el campo habitacionesDelApartamentoPorValidar"
            })

            const habitacionesEstructura = {}
            const habitacionesSoloIDV = []
            const habitacionesPorApartamento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV) || []

            habitacionesPorApartamento.forEach((habitacionApartamento) => {
                const habitacionIDV = habitacionApartamento.habitacion
                const habitacionUID = habitacionApartamento.uid
                habitacionesEstructura[habitacionIDV] = habitacionUID
                habitacionesSoloIDV.push(habitacionIDV)
            })
        }
        const fecha = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            apartamentosIDV_array: apartemtosIDVarray
        }
        const resueleApartamentosDisponibles = await apartamentosPorRango(fecha)
        const apartamentosDisponibles = resueleApartamentosDisponibles?.apartamentosDisponibles
        if (apartamentosDisponibles.length === 0) {
            const error = "No hay ningun apartamento disponible"
            throw new Error(error)
        }
        for (const apartamento of Object.entries(alojamiento)) {
            const apartamentoIDV = apartamento[0]
            const habitacionesDelApartamentoPorValidar = apartamento[1].habitaciones
            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
            if (!apartamentosDisponibles.includes(apartamentoIDV)) {
                const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)
                const error = `Sentimos informar que el '${apartamentoUI}' ya no esta disponible para reservar para las fechas seleccionadas`
                throw new Error(error)
            }
            const habitacionesPorApartamento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV) || []
            const habitacionesEstructura = {}
            const habitacionesSoloIDV = []
            habitacionesPorApartamento.forEach((habitacionApartamento) => {
                const habitacionIDV = habitacionApartamento.habitacion
                const habitacionUID = habitacionApartamento.uid
                habitacionesEstructura[habitacionIDV] = habitacionUID
                habitacionesSoloIDV.push(habitacionIDV)
            })

            if (filtroHabitacionesCamas === "si") {
                for (const detallesHabitacion of Object.entries(habitacionesDelApartamentoPorValidar)) {
                    const habitacionIDVPorValidar = detallesHabitacion[0]

                    validadoresCompartidos.tipos.cadena({
                        string: habitacionIDVPorValidar,
                        nombreCampo: "El campo habitacionIDV",
                        filtro: "strictoIDV",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                    })
                    if (!habitacionesSoloIDV.includes(habitacionIDVPorValidar)) {
                        const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)
                        const error = `El ${apartamentoUI} contiene una habitacion que no existe, concretamente la habitacion ${habitacionIDVPorValidar}`
                        throw new Error(error)
                    }
                }
                for (const habitacion of Object.entries(habitacionesDelApartamentoPorValidar)) {
                    const habitacionIDV = habitacion[0]
                    const habitacionUID = habitacionesEstructura[habitacionIDV]
                    const camaIDV = habitacion[1]?.camaSeleccionada?.camaIDV
                    if (!camaIDV || !filtroCadenaMinusculasSinEspacios.test(camaIDV)) {
                        const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)

                        const habitacionUI = await obtenerHabitacionComoEntidadPorHabitacionIDV(habitacionIDV)
                        const error = `Por favor selecciona el tipo de cama de la ${habitacionUI} del apartamento ${apartamentoUI}`
                        throw new Error(error)
                    }
                    const dataCamaPorHabitacion = {
                        habitacionUID: habitacionUID,
                        camaIDV: camaIDV,
                    }
                    const camaPorHabitacion = await obtenerCamaDeLaHabitacionPorHabitacionUID(dataCamaPorHabitacion)
                    if (camaPorHabitacion.length === 0) {
                        const error = `Dentro de la habitacion ${habitacionIDV} del apartamento ${apartamentoIDV} no exista la cama ${camaIDV}`
                        throw new Error(error)
                    }
                }
            }

        }
        if (filtroTitular === "si") {
            const nombreTitular = validadoresCompartidos.tipos.cadena({
                string: reservaObjeto.datosTitular?.nombreTitular || "",
                nombreCampo: "El campo del nombre del titular",
                filtro: "strictoConEspacios",
                sePermiteVacio: "no",
                soloMayusculas: "si",
                limpiezaEspaciosAlrededor: "si",
                limpiezaEspaciosInternosGrandes: "si"
            })

            const pasaporteTitular = validadoresCompartidos.tipos.cadena({
                string: reservaObjeto.datosTitular?.pasaporteTitular || "",
                nombreCampo: "El campo del pasaporte del titular",
                filtro: "strictoConEspacios",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                limpiezaEspaciosInternos: "si"
            })
            const telefonoTitular = validadoresCompartidos.tipos
                .telefono(reservaObjeto.datosTitular?.telefonoTitular || "")

            const correoTitular = validadoresCompartidos.tipos
                .correoElectronico(reservaObjeto.datosTitular?.correoTitular || "")

            reservaObjeto.datosTitular.nombreTitular = nombreTitular
            reservaObjeto.datosTitular.pasaporteTitular = pasaporteTitular
            reservaObjeto.datosTitular.telefonoTitular = telefonoTitular
            reservaObjeto.datosTitular.correoTitular = correoTitular
        }

    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
