import { DateTime } from 'luxon';
import { codigoZonaHoraria } from '../configuracion/codigoZonaHoraria.mjs';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs'
import { limitesReservaPublica } from './limitesReservaPublica.mjs';
import { apartamentosPorRango } from '../selectoresCompartidos/apartamentosPorRango.mjs';
import { obtenerNombreApartamentoUI } from '../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs';
import { obtenerNombreHabitacionUI } from '../../repositorio/arquitectura/obtenerNombreHabitacionUI.mjs';
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from '../../repositorio/arquitectura/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs';
import { obtenerCamaDeLaHabitacionPorHabitacionUID } from '../../repositorio/arquitectura/obtenerCamaDeLaHabitacionPorHabitacionUID.mjs';

export const validarObjetoReserva = async (reserva) => {
    try {
        const fechaEntrada_Humano = reserva.entrada
        const fechaSalida_Humano = reserva.salida
        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada_Humano)).fecha_ISO
        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida_Humano)).fecha_ISO

        const nombreTitular = validadoresCompartidos.tipos.cadena({
            string: reserva.datosTitular?.nombreTitular || "",
            nombreCampo: "El campo del nombre del titular",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            soloMayusculas: "si",
            limpiezaEspaciosAlrededor: "si",
            limpiezaEspaciosInternosGrandes: "si"
        })

        const pasaporteTitular = validadoresCompartidos.tipos.cadena({
            string: reserva.datosTitular?.pasaporteTitular || "",
            nombreCampo: "El campo del pasaporte del titular",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            limpiezaEspaciosInternos: "si"
        })
        const telefonoTitular = validadoresCompartidos.tipos
            .telefono(reserva.datosTitular?.telefonoTitular || "")

        const correoTitular = validadoresCompartidos.tipos
            .correoElectronico(reserva.datosTitular?.correoTitular || "")

        reserva.datosTitular.nombreTitular = nombreTitular
        reserva.datosTitular.pasaporteTitular = pasaporteTitular
        reserva.datosTitular.telefonoTitular = telefonoTitular
        reserva.datosTitular.correoTitular = correoTitular

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActualTZ = tiempoZH.toISODate()
        const fechaEntradaReserva_ISO = DateTime.fromISO(fechaEntrada_ISO, { zone: zonaHoraria });
        const fechaSalidaReserva_ISO = DateTime.fromISO(fechaSalida_ISO, { zone: zonaHoraria });
        if (fechaEntradaReserva_ISO < fechaActualTZ) {
            const error = "La fecha de entrada no puede ser anterior a la fecha actual"
            throw new Error(error)
        }
        // validacion: la fecha de entrada no puede ser superior a la fecha de salida y al mimso tiempo la fecha de salida no puede ser inferior a la fecha de entrada
        if (fechaEntradaReserva_ISO >= fechaSalidaReserva_ISO) {
            const error = "La fecha de entrada no puede ser igual o superior que la fecha de salida"
            throw new Error(error)
        }
        const fechasParaValidarLimites = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO
        }
        await limitesReservaPublica(fechasParaValidarLimites)
        const alojamiento = reserva?.alojamiento
        if (!alojamiento) {
            const error = "No exite la llave de 'Alojamiento' esperada dentro del objeto, por lo tante hasta aquí hemos llegado"
            throw new Error(error)
        }
        // Comprobara que existen los apartamentos que se piden
        if (alojamiento !== null && typeof alojamiento !== 'object' && alojamiento.constructor !== Object) {
            const error = "Se esparaba un objeto para validar el alojamiento"
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
            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
            if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                const error = "el campo apartamentoIDV solo puede ser letras minúsculas y numeros. sin pesacios"
                throw new Error(error)
            }
            if (habitacionesDelApartamentoPorValidar !== null && typeof habitacionesDelApartamentoPorValidar !== 'object' && habitacionesDelApartamentoPorValidar.constructor !== Object) {
                const error = "Se esparaba un objeto para validar las habitaciones"
                throw new Error(error)
            }
            const habitacionesEstructura = {}
            const habitacionesSoloIDV = []
            const habitacionesPorApartamento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV) || []

            habitacionesPorApartamento.map((habitacionApartamento) => {
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
                const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV)
                const error = `Sentimos informar que el '${apartamentoUI}' no esta disponible para reservar para las fechas seleccionadas`
                throw new Error(error)
            }
            const habitacionesPorApartamento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV) || []
            const habitacionesEstructura = {}
            const habitacionesSoloIDV = []
            habitacionesPorApartamento.map((habitacionApartamento) => {
                const habitacionIDV = habitacionApartamento.habitacion
                const habitacionUID = habitacionApartamento.uid
                habitacionesEstructura[habitacionIDV] = habitacionUID
                habitacionesSoloIDV.push(habitacionIDV)
            })
            // 
            for (const detallesHabitacion of Object.entries(habitacionesDelApartamentoPorValidar)) {
                const habitacionIDVPorValidar = detallesHabitacion[0]
                if (!habitacionIDVPorValidar || !filtroCadenaMinusculasSinEspacios.test(habitacionIDVPorValidar)) {
                    const error = "El campo habitacionIDV solo puede ser letras minúsculas y numeros. sin pesacios"
                    throw new Error(error)
                }
                if (!habitacionesSoloIDV.includes(habitacionIDVPorValidar)) {
                    const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV)
                    const error = `El ${apartamentoUI} contiene una habitacion que no existe, concretamente la habitacion ${habitacionIDVPorValidar}`
                    throw new Error(error)
                }
            }
            for (const habitacion of Object.entries(habitacionesDelApartamentoPorValidar)) {
                const habitacionIDV = habitacion[0]
                const habitacionUID = habitacionesEstructura[habitacionIDV]
                const camaIDV = habitacion[1]?.camaSeleccionada?.camaIDV
                if (!camaIDV || !filtroCadenaMinusculasSinEspacios.test(camaIDV)) {
                    const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV)

                    const habitacionUI = await obtenerNombreHabitacionUI(habitacionIDV)
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
    } catch (error) {
        throw error;
    }
}
