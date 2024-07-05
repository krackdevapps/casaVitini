import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { eliminarApartamentoComoEntidad } from "../../../../repositorio/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs";
import { eliminarHabitacionComoEntidad } from "../../../../repositorio/arquitectura/entidades/habitacion/eliminarHabitacionComoEntidad.mjs";
import { eliminarCamaComoEntidad } from "../../../../repositorio/arquitectura/entidades/cama/eliminarCamaComoEntidad.mjs";
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from "../../../../repositorio/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs";
import { codigoZonaHoraria } from "../../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { DateTime } from "luxon";
import { obtenerReservasPresentesFuturas } from "../../../../repositorio/reservas/selectoresDeReservas/obtenerReservasPresentesFuturas.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { reservasPresentesFuturas } from "../../../../sistema/reservas/reservasPresentasFuturas.mjs";
import { obtenerCamasFisicasPorReservaUIDArrayPorCamaIDV } from "../../../../repositorio/reservas/apartamentos/obtenerCamasFisicasPorReservaUIDArrayPorCamaIDV.mjs";

export const eliminarEntidadAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
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

            await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV: entidadIDV,
                errorSi: "noExiste"
            })

            const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV(entidadIDV)
            if (configuracionApartamento?.configuracionUID) {
                const error = "No se puede borrar esta apartamento como entidad por que esta en dentro de una configuracion de alojamiento, por favor borra primero al configuracion de alojamiento y despues borra esta entidad de apartamento."
                throw new Error(error)
            }

            await eliminarApartamentoComoEntidad(entidadIDV)
            const ok = {
                ok: "Se ha eliminado correctamente el apartamento como entidad",
            };
            return ok

        }
        if (tipoEntidad === "habitacion") {
            const obtenerHabitacionComoEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV(entidadIDV)
            if (!obtenerHabitacionComoEntidad.habitacion) {
                const error = "No existe la habitacion, revisa el habitacionIDV";
                throw new Error(error);
            }
            const eliminarHabitacion = await eliminarHabitacionComoEntidad(entidadIDV)
            if (eliminarHabitacion.rowCount === 0) {
                const error = "No se ha eliminado la habitacion por que no se ha entonctrado el registo en la base de datos";
                throw new Error(error);
            }
            if (eliminarHabitacion.rowCount === 1) {
                const ok = {
                    ok: "Se ha eliminado correctamente la habitacion como entidad",
                };
                return ok
            }
        }
        if (tipoEntidad === "cama") {
            const tipoIDV = validadoresCompartidos.tipos.cadena({
                string: entrada.body.tipoIDV,
                nombreCampo: "El campo tipoIDV de la cama",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
                camaIDV: entidadIDV,
                tipoIDVArray: [tipoIDV],
                errorSi: "noExiste"
            })

            if (tipoIDV === "fisica") {

                const reservasActivas = await reservasPresentesFuturas()
                const reservasUIDArray = reservasActivas.map((reserva) => {
                    return reserva.reservaUID
                })
                const reservasEnUso = await obtenerCamasFisicasPorReservaUIDArrayPorCamaIDV({
                    reservaUID_array: reservasUIDArray,
                    camaIDV: entidadIDV,
                    errorSi: "desactivado"
                })
                if (reservasEnUso.length > 0) {
                    const error = {
                        error: "No se puede borrar esta cama fisica por que esta en reservas activas presentes o futuras.",
                        reservasActiva: reservasEnUso
                    }
                    throw error
                }
            }
            await eliminarCamaComoEntidad(entidadIDV)
            const ok = {
                ok: "Se ha eliminado correctamente la cama como entidad",
            }
            return ok
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}