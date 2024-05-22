import { insertarCamaEnHabitacion } from "../../../../repositorio/arquitectura/insertarCamasEnHabitacion.mjs";
import { obtenerCamaDeLaHabitacionPorHabitacionUID } from "../../../../repositorio/arquitectura/obtenerCamaDeLaHabitacionPorHabitacionUID.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerDetallesPorCama } from "../../../../repositorio/arquitectura/obtenerDetallesPorCama.mjs";
import { obtenerHabitacionDelApartamentoPorHabitacionUID } from "../../../../repositorio/arquitectura/obtenerHabitacionDelApartamentoPorHabitacionUID.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";

import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const addCamaToConfiguracionApartamentoHabitacion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const camaIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.camaIDV,
            nombreCampo: "El camaIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const habitacionUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.habitacionUID,
            nombreCampo: "El identificador universal de la habitación (habitacionUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const obtenerDetallesPorCama_ = await obtenerDetallesPorCama(camaIDV)
        if (obtenerDetallesPorCama_.length === 0) {
            const error = "No existe ninguna cama con ese identificador visual";
            throw new Error(error);
        }
        const camaUI = obtenerDetallesPorCama_.camaUI;
        const capacidad = obtenerDetallesPorCama_.capacidad;
        const obtenerHabitacionesPorApartamento_ = await obtenerHabitacionDelApartamentoPorHabitacionUID(habitacionUID)
        if (obtenerHabitacionesPorApartamento_.length === 0) {
            const error = "No hay ninguna habitacíon con ese UID";
            throw new Error(error);
        }
        if (obtenerHabitacionesPorApartamento_.length === 1) {
            const apartamentoIDV = obtenerHabitacionesPorApartamento_.apartamento;
            const obtenerConfiguracionPorApartamento_ = obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
            if (obtenerConfiguracionPorApartamento_.estadoConfiguracion === "disponible") {
                const error = "No se puede anadir una habitacion cuando el estado de la configuracion es Disponible, cambie el estado a no disponible para realizar anadir una cama";
                throw new Error(error);
            }
            const dataObtenerCamaPorHabitacion = {
                habitacionUID: habitacionUID,
                camaIDV: camaIDV
            }
            const obtenerCamaPorHabitacion_ = await obtenerCamaDeLaHabitacionPorHabitacionUID(dataObtenerCamaPorHabitacion)
            if (obtenerCamaPorHabitacion_.length > 0) {
                const error = "Esta cama ya existe";
                throw new Error(error);
            }
            if (obtenerCamaPorHabitacion_.length === 0) {
                const dataInsertarCamaEnHabitacion = {
                    habitacionUID: habitacionUID,
                    camaIDV: camaIDV
                }
                await insertarCamaEnHabitacion(dataInsertarCamaEnHabitacion)

                const nuevoUID = resuelveInsertarHabitacion.rows[0].uid;
                const ok = {
                    ok: "Se ha insertardo la cama correctamente en la habitacion",
                    nuevoUID: nuevoUID,
                    camaUI: camaUI,
                    camaIDV: camaIDV,
                    capaciad: capacidad
                };
                return ok

            }
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }

}