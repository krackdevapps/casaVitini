import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs";
import { obtenerCamasDeLaHabitacionPorHabitacionUID } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerCamasDeLaHabitacionPorHabitacionUID.mjs";
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs";

export const detalleConfiguracionAlojamiento = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })


        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })

        const estadoConfiguracion = configuracionApartamento.estadoConfiguracionIDV;
        const zonaIDV = configuracionApartamento.zonaIDV;

        const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        const apartamentoUI = apartamento.apartamentoUI
        const habitaciones = []
        const habitacionesPorApartamento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV)
        for (const detalleHabitacion of habitacionesPorApartamento) {

            const habitacionUID = detalleHabitacion.componenteUID;
            const habitacionIDV = detalleHabitacion.habitacionIDV;
            const habitacion = await obtenerHabitacionComoEntidadPorHabitacionIDV({
                habitacionIDV,
                errorSi: "noExiste"
            })
            const habitacionUI = habitacion.habitacionUI
            detalleHabitacion.habitacionUI = habitacionUI;

            const camasDeLaHabitacion = await obtenerCamasDeLaHabitacionPorHabitacionUID(habitacionUID)
            detalleHabitacion.camas = [];
            if (camasDeLaHabitacion.length > 0) {
                for (const detallesCamaEnLaHabitacion of camasDeLaHabitacion) {
                    const camaIDV = detallesCamaEnLaHabitacion.camaIDV;
                    const camaUID = detallesCamaEnLaHabitacion.componenteUID;

                    const detallesCama = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
                        camaIDV,
                        tipoIDVArray: ["compartida"],
                        errorSi: "desactivado"
                    })

                    if (!detallesCama) {
                        const error = "No existe el identificador de la camaIDV";
                        throw new Error(error);
                    }
                    const camaUI = detallesCama.camaUI
                    const capacidad = detallesCama.capacidad;
                    const tipoIDV = detallesCama.tipoIDV;


                    const estructuraCama = {
                        camaIDV: camaIDV,
                        camaUI: camaUI,
                        tipoIDV: tipoIDV,
                        capacidad: capacidad,
                        camaUID: camaUID
                    };
                    detalleHabitacion.camas.push(estructuraCama);
                }
            }
            habitaciones.push(detalleHabitacion)
        }
        const ok = {
            ok: "Detalles de la configuración de alojamiento",
            apartamentoIDV: apartamentoIDV,
            apartamentoUI: apartamentoUI,
            estadoConfiguracion: estadoConfiguracion,
            zonaIDV: zonaIDV,
            habitaciones: habitaciones
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }

}