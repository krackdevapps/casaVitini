import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { eliminarApartamentoComoEntidad } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs";
import { eliminarHabitacionComoEntidad } from "../../../../infraestructure/repository/arquitectura/entidades/habitacion/eliminarHabitacionComoEntidad.mjs";
import { eliminarCamaComoEntidad } from "../../../../infraestructure/repository/arquitectura/entidades/cama/eliminarCamaComoEntidad.mjs";
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { reservasPresentesFuturas } from "../../../../shared/reservas/reservasPresentasFuturas.mjs";
import { obtenerCamasFisicasPorReservaUIDArrayPorCamaIDV } from "../../../../infraestructure/repository/reservas/apartamentos/obtenerCamasFisicasPorReservaUIDArrayPorCamaIDV.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";

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
            validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
                objeto: entrada.body,
                numeroDeLLavesMaximo: 2
            })
            await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV: entidadIDV,
                errorSi: "noExiste"
            })
            try {
                await obtenerConfiguracionPorApartamentoIDV({
                    apartamentoIDV: entidadIDV,
                    errorSi: "existe"
                })
            } catch (error) {
                const m = "Esta entidad de apartamento está siendo usada como base para una configuración de alojamiento. No puedes eliminar esta entidad mientras sea usada como base para la configuración de alojamiento. Puedes editarla pero no eliminarla."
                throw new Error(m)
            }

            await eliminarApartamentoComoEntidad(entidadIDV)
            const ok = {
                ok: "Se ha eliminado correctamente el apartamento como entidad",
            };
            return ok
        } else if (tipoEntidad === "habitacion") {
            validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
                objeto: entrada.body,
                numeroDeLLavesMaximo: 2
            })
            const obtenerHabitacionComoEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV({
                habitacionIDV: entidadIDV,
                errorSi: "noExiste"
            })
            if (!obtenerHabitacionComoEntidad?.habitacionIDV) {
                const error = "No existe la habitación, revisa el habitacionIDV";
                throw new Error(error);
            }
            await eliminarHabitacionComoEntidad(entidadIDV)

            const ok = {
                ok: "Se ha eliminado correctamente la habitación como entidad",
            };
            return ok

        } else if (tipoEntidad === "cama") {
            validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
                objeto: entrada.body,
                numeroDeLLavesMaximo: 3
            })
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
                        error: "No se puede borrar esta cama física porque está en reservas activas presentes o futuras.",
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
        } else {
            const m = "No se reconoce el tipo de entidad"
            throw new Error(m)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}