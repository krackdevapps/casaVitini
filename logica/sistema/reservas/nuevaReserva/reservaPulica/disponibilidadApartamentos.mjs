import { utilidades } from "../../../../componentes/utilidades.mjs"
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { apartamentosPorRango } from "../../../selectoresCompartidos/apartamentosPorRango.mjs"

export const disponibilidadApartamentos = async (data) => {
    try {

        const fechaEntrada = data.fechaEntrada
        const fechaSalida = data.fechaSalida
        const apartamentosIDVArray = data.apartamentosIDVArray


        const resuelveApartamentosDisponibles = await apartamentosPorRango({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosIDV_array: apartamentosIDVArray,
            zonaConfiguracionAlojamientoArray: ["publica", "global"],
            zonaBloqueo_array: ["publico", "global"],
        })

        const apartamentosDisponibles = resuelveApartamentosDisponibles?.apartamentosDisponibles
        if (apartamentosDisponibles.length === 0) {
            const error = "Sentimos informar que de los apartamientos que solicita reservar no hay ninguno disponible."
            throw new Error(error)
        }
        const apartamentosOcupados = []

        for (const apartamentoIDV of apartamentosIDVArray) {
            if (!apartamentosDisponibles.includes(apartamentoIDV)) {
                const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "noExiste"
                })
                const apartamentoUI = apartamento.apartamentoUI
                apartamentosOcupados.push(apartamentoUI)
            }
        }
        if (apartamentosOcupados.length > 0) {
            const apartamentoUIOcupados = apartamentosOcupados.map((apartamentoUI) => {
                return apartamentoUI
            })

            const constructo = utilidades.constructorComasEY({
                array: apartamentoUIOcupados,
                articulo: "el"
            })
            let error

            if (apartamentosOcupados.length === 1) {
                error = `Sentimos informar que el ${constructo} ya no esta disponible para las fechas seleccionadas.`
            } else {
                error = `Sentimos informar que el ${constructo} ya no estan dipsonibles para las fechas seleccionadas.`
            }
            throw new Error(error)
        }
    } catch (error) {
        throw error
    }
}
