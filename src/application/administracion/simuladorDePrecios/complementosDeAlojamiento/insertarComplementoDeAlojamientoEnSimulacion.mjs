import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { obtenerHabitacionDelApartamentoPorHabitacionUID } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionUID.mjs"
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs"
import { obtenerComplementoPorComplementoUID } from "../../../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementoPorComplementoUID.mjs"
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerAlojamientoDeLaSimulacionPorApartamentoIDV } from "../../../../infraestructure/repository/simulacionDePrecios/alojamiento/obtenerAlojamientoDeLaSimulacionPorApartamentoIDV.mjs"
import { insertarComplementoAlojamientoPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/complementosDeAlojamiento/insertarComplementoAlojamientoPorSimulacionUID.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { controladorGeneracionDesgloseFinanciero } from "../../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"

export const insertarComplementoDeAlojamientoEnSimulacion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()


        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El  simulacionUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        const complementoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.complementoUID,
            nombreCampo: "El  complementoUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })
        await obtenerSimulacionPorSimulacionUID(simulacionUID)
        const complemento = await obtenerComplementoPorComplementoUID(complementoUID)
        const apartamentoIDV = complemento.apartamentoIDV
        const complementoUI = complemento.complementoUI
        const tipoUbicacion = complemento.tipoUbicacion
        const definicion = complemento.definicion
        const tipoPrecio = complemento.tipoPrecio
        const precio = complemento.precio
        const habitacionUID = complemento.habitacionUID

        const apartamentoEntidad = await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        const apartamentoUI = apartamentoEntidad.apartamentoUI
        const alojamiento = await obtenerAlojamientoDeLaSimulacionPorApartamentoIDV({
            simulacionUID,
            apartamentoIDV
        })
        if (!alojamiento?.apartamentoIDV) {
            const m = `El complemento de alojamiento que tratas de insertar forma parte de la configuracion de alojamiento ${apartamentoUI} (${apartamentoIDV}), primero inserta esa configuración de alojamiento en la simulación`
            throw new Error(m)
        }
        const apartamentoUID = alojamiento.apartamentoUID
        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        if (tipoUbicacion === "habitacion") {

            const habitacionDeLaConfiguracion = await obtenerHabitacionDelApartamentoPorHabitacionUID(habitacionUID)
            const habitacionIDV = habitacionDeLaConfiguracion?.habitacionIDV
            const habitacionEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV({
                habitacionIDV,
                errorSi: "noExiste"
            })

            const habitacionUI = habitacionEntidad.habitacionUI
            complemento.habitacionUI = habitacionUI
            complemento.habitacionIDV = habitacionIDV

        }

        await campoDeTransaccion("iniciar")
        // No puede haber dos apartametnos iguales en la simulacion
        const complementoDeAlojamiento = await insertarComplementoAlojamientoPorSimulacionUID({
            simulacionUID,
            complementoUI,
            apartamentoIDV,
            definicion,
            tipoPrecio,
            tipoUbicacion,
            precio,
            apartamentoUID,
            habitacionIDV: complemento.habitacionIDV,
            habitacionUI: complemento.habitacionUI,
        })
        const postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)
        await campoDeTransaccion("confirmar")
        return {
            ok: "Se ha insertado el complemento de alojamiento en la simulacion",
            complementoDeAlojamiento,
            simulacionUID,
            ...postProcesadoSimualacion
        }
    } catch (error) {
        await campoDeTransaccion("cancelar")
        throw error
    }
}