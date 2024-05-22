import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from "../../../../repositorio/arquitectura/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs";
import { obtenerCamasDeLaHabitacionPorHabitacionUID } from "../../../../repositorio/arquitectura/obtenerCamasDeLaHabitacionPorHabitacionUID.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../repositorio/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

export const detalleConfiguracionAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()


        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })


        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)

        if (configuracionApartamento.length === 0) {
            const error = "No hay ninguna configuracion disponible para este apartamento";
            throw new Error(error);
        }
        if (configuracionApartamento.length > 0) {
            const estadoConfiguracion = configuracionApartamento.estadoConfiguracion;
            const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV);

            const habitacionesPorApartamento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV)
            for (const detalleHabitacion of habitacionesPorApartamento) {
                const habitacionUID = detalleHabitacion.uid;
                const habitacionIDV = detalleHabitacion.habitacion;
                const habitacionUI = await obtenerHabitacionComoEntidadPorHabitacionIDV(habitacionIDV)
                if (!habitacionUI) {
                    const error = "No existe el identificador de la habitacionIDV";
                    throw new Error(error);
                }
                detalleHabitacion.habitacionUI = habitacionUI;

                const camasDeLaHabitacion = await obtenerCamasDeLaHabitacionPorHabitacionUID(habitacionUID)
                detalleHabitacion.camas = [];
                if (camasDeLaHabitacion.length > 0) {
                    for (const detallesCamaEnLaHabitacion of camasDeLaHabitacion) {
                        const uidCama = detallesCamaEnLaHabitacion.uid;
                        const camaIDV = detallesCamaEnLaHabitacion.cama;
                        const detallesCama = await obtenerDetallesCama(camaIDV)
                        if (!detallesCama) {
                            const error = "No existe el identificador de la camaIDV";
                            throw new Error(error);
                        }
                        const camaUI = detallesCama.camaUI
                        const capacidad = detallesCama.capacidad;
                        const estructuraCama = {
                            uid: uidCama,
                            camaIDV: camaIDV,
                            camaUI: camaUI,
                            capacidad: capacidad
                        };
                        detalleHabitacion.camas.push(estructuraCama);
                    }
                }
            }
            const ok = {
                ok: habitacionesEncontradas,
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI,
                estadoConfiguracion: estadoConfiguracion,
            };
            return ok
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }

}