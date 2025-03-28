import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerTodasLasConfiguracionDeLosApartamento } from "../../infraestructure/repository/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamento.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerTodasLasCaracteristicasDelApartamento } from "../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerTodasLasCaracteristicasDelApartamento.mjs";
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from "../../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs";

export const obtenerTodoApartamentoIDVPublico = async (entrada) => {
    try {
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const configuracionDeAlojamiento = await obtenerTodasLasConfiguracionDeLosApartamento()

        const configuracionDeAlojamientoPublicas = configuracionDeAlojamiento.filter(c => {
            const zonaIDV = c.zonaIDV
            const estadoConfiguracionIDV = c.estadoConfiguracionIDV
            const apartamentoIDV = c.apartamentoIDV
            const zonasIDV = ["global", "publica"]
            if (estadoConfiguracionIDV === "activado" && zonasIDV.includes(zonaIDV)) {
                return apartamentoIDV
            }
        })
        for (const cA of configuracionDeAlojamientoPublicas) {
            const apartamentoIDV = cA.apartamentoIDV
            const entidadApartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })
            const aparatmentoUI = entidadApartamento.aparatmentoUI
            const apartamentoUIPublico = entidadApartamento.apartamentoUIPublico
            const definicionPublica = entidadApartamento.definicionPublica
            cA.aparatmentoUI = aparatmentoUI
            cA.apartamentoUIPublico = apartamentoUIPublico
            cA.definicionPublica = definicionPublica           
            cA.descripcion = entidadApartamento.descripcion
            cA.numeroHuespedes = entidadApartamento.numeroHuespedes

            const habitaciones = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV)
            cA.habitaciones = habitaciones

            const caracteristicas = await obtenerTodasLasCaracteristicasDelApartamento(apartamentoIDV)
            cA.caracteristicas = caracteristicas

        }


        const ok = {
            ok: "Aquí tienes los apartamentoIDV publicos o globales, junto con sus configuraciones y características",
            configuracionDeAlojamientoPublicas
        }

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}