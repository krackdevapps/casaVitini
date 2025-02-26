import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";

import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerTodasLasCaracteristicasDelApartamento } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerTodasLasCaracteristicasDelApartamento.mjs";
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";

export const detallesDeEntidadDeAlojamiento = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const tipoEntidad = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoEntidad,
            nombreCampo: "El tipoEntidad",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const entidadIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.entidadIDV,
            nombreCampo: "El entidadIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        if (tipoEntidad === "apartamento") {
            const apartamentoEntidad = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV: entidadIDV,
                errorSi: "noExiste"
            })

            const caracteristicasDelApartamento = await obtenerTodasLasCaracteristicasDelApartamento(entidadIDV)
            const ok = {
                ok: apartamentoEntidad,
                caracteristicas: caracteristicasDelApartamento
            };
            return ok

        } else if (tipoEntidad === "habitacion") {
            const habitacionesComoEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV({
                habitacionIDV: entidadIDV,
                errorSi: "noExiste"
            })
            if (!habitacionesComoEntidad?.habitacionIDV) {
                const error = "No existe la habitación";
                throw new Error(error);
            }
            const ok = {
                ok: habitacionesComoEntidad
            };
            return ok

        } else if (tipoEntidad === "cama") {

            const camaComoEntidad = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
                camaIDV: entidadIDV,
                tipoIDVArray: ["fisica", "compartida"],
                errorSi: "noExiste"
            })

            const ok = {
                ok: camaComoEntidad
            };
            return ok

        } else {
            const m = "No se reconoce el tipo de entidad"
            throw new Error(m)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}