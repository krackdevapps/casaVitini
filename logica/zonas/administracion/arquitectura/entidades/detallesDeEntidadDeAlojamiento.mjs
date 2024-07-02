import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerTodasLasCaracteristicasDelApartamento } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerTodasLasCaracteristicasDelApartamento.mjs";
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from "../../../../repositorio/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs";

export const detallesDeEntidadDeAlojamiento = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

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

        }
        if (tipoEntidad === "habitacion") {
            const habitacionesComoEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV(entidadIDV)
            if (!habitacionesComoEntidad.habitacion) {
                const error = "No existe la habitacion";
                throw new Error(error);
            }
            const ok = {
                ok: habitacionesComoEntidad
            };
            return ok

        }
        if (tipoEntidad === "cama") {

            const camaComoEntidad = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
                camaIDV: entidadIDV,
                tipoIDVArray: ["fisica", "compartida"],
                errorSi: "noExiste"
            })

            const ok = {
                ok: camaComoEntidad
            };
            return ok

        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}