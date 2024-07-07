import { DateTime } from 'luxon';
import { codigoZonaHoraria } from '../configuracion/codigoZonaHoraria.mjs';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs'
import { limitesReservaPublica } from './limitesReservaPublica.mjs';
import { apartamentosPorRango } from '../selectoresCompartidos/apartamentosPorRango.mjs';
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from '../../repositorio/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs';
import { obtenerCamaDeLaHabitacionPorHabitacionUID } from '../../repositorio/arquitectura/configuraciones/obtenerCamaDeLaHabitacionPorHabitacionUID.mjs';
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from '../../repositorio/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';
import { utilidades } from '../../componentes/utilidades.mjs';

export const validarObjetoReserva = async (data) => {
    try {
        const filtroTitular = data?.filtroTitular
        const filtroHabitacionesCamas = data?.filtroHabitacionesCamas
        const reservaObjeto = data?.reservaObjeto

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
            nombreCampo: "el campo reserva"
        })
        const fechaEntrada_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: reservaObjeto?.fechaEntrada,
            nombreCampo: "El campo fechaEntrada del objetoReserva"
        })
        const fechaSalida_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: reservaObjeto?.fechaSalida,
            nombreCampo: "El campo fechaSalida del objetoReserva"
        })
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
        if (fechaEntradaReserva_ISO >= fechaSalidaReserva_ISO) {
            const error = "La fecha de entrada no puede ser anterior o igual a la fecha de salida"
            throw new Error(error)
        }

        const fechasParaValidarLimites = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO
        }


        await limitesReservaPublica(fechasParaValidarLimites)
        if (reservaObjeto.hasOwnProperty("codigosDescuento")) {
            const codigosDescuentoArray = []

            const codigoDescuentoArrayAsci = validadoresCompartidos.tipos.array({
                array: reservaObjeto.codigosDescuento,
                nombreCampo: "El campo codigoDescuento",
                sePermitenDuplicados: "no"
            })
            codigoDescuentoArrayAsci.forEach((codigo) => {
                const codigoDescuentoB64 = validadoresCompartidos.tipos.cadena({
                    string: codigo,
                    nombreCampo: "No has escrito ningún codigo de descuento, recuerda que",
                    filtro: "transformaABase64",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                })
                codigosDescuentoArray.push(codigoDescuentoB64)
            })
            
            if (codigosDescuentoArray.length > 0) {
                reservaObjeto.codigosDescuento = codigosDescuentoArray
                console.log("ss", reservaObjeto.codigosDescuento)
            }

        }


        if (!reservaObjeto.hasOwnProperty("alojamiento")) {
            const error = "No exite la llave de 'alojamiento' esperada dentro del objeto, por lo tante hasta aquí hemos llegado"
            throw new Error(error)
        }
        const alojamiento = reservaObjeto?.alojamiento
        const apartemtosIDVarray = Object.keys(alojamiento)

        if (apartemtosIDVarray.length === 0) {
            const error = "El objeto de lar eserva no tiene ningun apartamento definido en alojamiento"
            throw new Error(error)
        }

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


        const resueleApartamentosDisponibles = await apartamentosPorRango({
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            apartamentosIDV_array: apartemtosIDVarray,
            zonaConfiguracionAlojamientoArray: ["publica", "global"],
            zonaBloqueo_array: ["publico", "global"],
        })

        const apartamentosDisponibles = resueleApartamentosDisponibles?.apartamentosDisponibles
        if (apartamentosDisponibles.length === 0) {
            const error = "Sentimos informar que no ya no hay ningún apartamento disponible de su reserva para reservas por que estan ocupados."
            throw new Error(error)
        }
        const apartamentosOcupados = []
        for (const apartamento of Object.entries(alojamiento)) {
            const apartamentoIDV = apartamento[0]
            if (!apartamentosDisponibles.includes(apartamentoIDV)) {
                const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "noExiste"
                })
                apartamentosOcupados.push(apartamentoUI)
            }
        }

        if (apartamentosOcupados.length > 0) {
            const apartamentoUIOcupados = apartamentosOcupados.map((detallesApartamento) => {
                return detallesApartamento.apartamentoUI
            })

            const constructo = utilidades.contructorComasEY({
                array: apartamentoUIOcupados,
                articulo: "el"
            })
            let error
            if (apartamentosOcupados.length === 1) {
                error = `Sentimos informar que el ${constructo} no esta disponible para las fechas seleccionadas.`
            } else {
                error = `Sentimos informar que el ${constructo} ya no estan dipsonibles para las fechas seleccionadas.`
            }
            throw new Error(error)
        }

        for (const apartamento of Object.entries(alojamiento)) {
            const apartamentoIDV = apartamento[0]
            const habitacionesDelApartamentoPorValidar = apartamento[1].habitaciones
            const habitacionesPorApartamento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV)
            const habitacionesEstructura = {}
            const habitacionesSoloIDV = []
            habitacionesPorApartamento.forEach((habitacionApartamento) => {
                const habitacionIDV = habitacionApartamento.habitacionIDV
                const habitacionUID = habitacionApartamento.componenteUID
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
                        const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)
                        const apartamentoUI = apartamento.apartamentoUI
                        const error = `El ${apartamentoUI} contiene una habitacion que no existe, concretamente se hace referencia a un habitacionIDV: ${habitacionIDVPorValidar}`
                        throw new Error(error)
                    }
                }
                for (const habitacion of Object.entries(habitacionesDelApartamentoPorValidar)) {
                    const habitacionIDV = habitacion[0]
                    const habitacionComoEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV(habitacionIDV)
                    const habitacionUID = habitacionesEstructura[habitacionIDV]
                    const habitacionUI = habitacionComoEntidad.habitacionUI
                    const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                        apartamentoIDV,
                        errorSi: "noExiste"
                    })
                    const apartamentoUI = apartamento.apartamentoUI

                    const camaIDV = validadoresCompartidos.tipos.cadena({
                        string: habitacion[1]?.camaSeleccionada?.camaIDV,
                        nombreCampo: `El identificador visual camaIDV, en la habitacion ${habitacionUI}`,
                        filtro: "strictoIDV",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                    })

                    const dataCamaPorHabitacion = {
                        habitacionUID: habitacionUID,
                        camaIDV: camaIDV,
                    }
                    const camaPorHabitacion = await obtenerCamaDeLaHabitacionPorHabitacionUID(dataCamaPorHabitacion)
                    if (!camaPorHabitacion) {
                        const error = `Dentro de la habitacion ${habitacionUI} del apartamento ${apartamentoUI} no existe ninguna cama con identificador identificador visual: ${camaIDV}`
                        throw new Error(error)
                    }
                }
            }

        }
        if (filtroTitular === "si") {
            if (!reservaObjeto.hasOwnProperty("datosTitular")) {
                const error = "No exite la llave de 'datosTitular' esperada dentro del objeto, por lo tante hasta aquí hemos llegado"
                throw new Error(error)
            }

            const datosTitular = reservaObjeto.datosTitular
            const nombreTitular = validadoresCompartidos.tipos.cadena({
                string: datosTitular?.nombreTitular || "",
                nombreCampo: "El campo del nombre del titular",
                filtro: "strictoConEspacios",
                sePermiteVacio: "no",
                soloMayusculas: "si",
                limpiezaEspaciosAlrededor: "si",
                limpiezaEspaciosInternosGrandes: "si"
            })

            const pasaporteTitular = validadoresCompartidos.tipos.cadena({
                string: datosTitular?.pasaporteTitular || "",
                nombreCampo: "El campo del pasaporte del titular",
                filtro: "strictoConEspacios",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                limpiezaEspaciosInternos: "si"
            })

            const telefonoTitular = validadoresCompartidos.tipos
                .telefono(datosTitular.telefonoTitular)

            const correoTitular = validadoresCompartidos.tipos
                .correoElectronico(datosTitular.correoTitular)

            reservaObjeto.datosTitular.nombreTitular = nombreTitular
            reservaObjeto.datosTitular.pasaporteTitular = pasaporteTitular
            reservaObjeto.datosTitular.telefonoTitular = telefonoTitular
            reservaObjeto.datosTitular.correoTitular = correoTitular
        }

    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
