import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerHabitacionDelLaReserva } from "../../../../../infraestructure/repository/reservas/apartamentos/obtenerHabitacionDelLaReserva.mjs";
import { actualizaCamaDeLaHabitacion } from "../../../../../infraestructure/repository/reservas/apartamentos/actualizaCamaDeLaHabitacion.mjs";
import { insertarCamaEnLaHabitacion } from "../../../../../infraestructure/repository/reservas/apartamentos/insertarCamaEnLaHabitacion.mjs";
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from "../../../../../infraestructure/repository/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs";
import { obtenerReservasPorRango } from "../../../../../infraestructure/repository/reservas/selectoresDeReservas/obtenerReservasPorRango.mjs";
import { obtenerCamasFisicasPorReservaUID } from "../../../../../infraestructure/repository/reservas/apartamentos/obtenerCamasFisicasPorReservaUID.mjs";
import { insertarCamaFisicaEnLaHabitacion } from "../../../../../infraestructure/repository/reservas/apartamentos/insertarCamaFisicaEnLaHabitacion.mjs";
import { obtenerCamaCompartidaDeLaHabitacion } from "../../../../../infraestructure/repository/reservas/apartamentos/obtenerCamaCompartidaDeLaHabitacion.mjs";
import { obtenerCamaFisicaPorReservaUIDPorHabitacionUIDPorCamaIDV } from "../../../../../infraestructure/repository/reservas/apartamentos/obtenerCamaFisicaPorReservaUIDPorHabitacionUIDPorCamaIDV.mjs";
import { semaforoCompartidoReserva } from "../../../../../shared/semaforosCompartidos/semaforoCompartidoReserva.mjs";

export const gestionarCamasDeHabitacion = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await semaforoCompartidoReserva.acquire();
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 4
        })
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reservaUID (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            impedirCero: "si",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })
        const habitacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacionUID,
            nombreCampo: "El identificador universal de la habitacion (habitacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            impedirCero: "si",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })
        const nuevaCamaIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevaCamaIDV,
            nombreCampo: "El nuevaCamaIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            soloMinusculas: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        const tipoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoIDV,
            nombreCampo: "El campo tipoIDV de la cama",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        if (tipoIDV === "fisica" && tipoIDV === "compartida") {
            const m = "El campo tipoIDV solo espera fisica o compartida"
            throw new Error(m)

        }

        const reserva = await obtenerReservaPorReservaUID(reservaUID)

        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar porque está cancelada.";
            throw new Error(error);
        }
        const fechaInicio = reserva.fechaInicio
        const fechaSalida = reserva.fechaSalida


        await obtenerHabitacionDelLaReserva({
            reservaUID: reservaUID,
            habitacionUID: habitacionUID
        })

        const cama = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
            camaIDV: nuevaCamaIDV,
            tipoIDVArray: [tipoIDV],
            errorSi: "noExiste"
        })

        const camaUI = cama.camaUI
        if (tipoIDV === "compartida") {
            const camaDeLaHabitacion = await obtenerCamaCompartidaDeLaHabitacion({
                reservaUID: reservaUID,
                habitacionUID: habitacionUID
            })
            const ok = {}
            if (camaDeLaHabitacion?.componenteUID) {
                await actualizaCamaDeLaHabitacion({
                    reservaUID: reservaUID,
                    habitacionUID: habitacionUID,
                    nuevaCamaIDV: nuevaCamaIDV,
                    camaUI: camaUI
                })
                ok.ok = "Se ha actualizado correctamente la cama compartida"
            } else {
                const nuevaCamaEnHabitacion = await insertarCamaEnLaHabitacion({
                    reservaUID: reservaUID,
                    habitacionUID: habitacionUID,
                    nuevaCamaIDV: nuevaCamaIDV,
                    camaUI: camaUI
                })
                ok.ok = "Se ha añadido correctamente la nueva cama compartida a la habitación"
                ok.nuevoUID = nuevaCamaEnHabitacion.componenteUID
            }
            return ok
        } else if (tipoIDV === "fisica") {


            const cama = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
                camaIDV: nuevaCamaIDV,
                tipoIDVArray: [tipoIDV],
                errorSi: "noExiste"
            })
            const camaUI = cama.camaUI


            await obtenerCamaFisicaPorReservaUIDPorHabitacionUIDPorCamaIDV({
                reservaUID,
                habitacionUID,
                camaIDV: nuevaCamaIDV,
                errorSi: "existe"
            })


            await obtenerCamasFisicasPorReservaUID({
                reservaUID_array: [reservaUID],
                camaIDV: nuevaCamaIDV,
                errorSi: "existe"
            })


            const reservasConflicto = await obtenerReservasPorRango({
                fechaIncioRango_ISO: fechaInicio,
                fechaFinRango_ISO: fechaSalida
            })
            const reservaUID_Array = reservasConflicto.map((reserva) => {
                return reserva.reservaUID
            })
            const camaFisicaEnOTrasReservas = await obtenerCamasFisicasPorReservaUID({
                reservaUID_Array,
                camaIDV: nuevaCamaIDV,
                errorSi: "desactivado"
            })
            const estructura = {
                ok: "Resultado de la operacion"
            }
            if (camaFisicaEnOTrasReservas.length > 0) {
                estructura.estadoCamaFisica = "ocupada"
                estructura.descripcion = "La cama física no se ha insertado en la habitación porque está ocupada en otra habitación. A continuación se detalla el lugar de la cama física"
                estructura.reservas = camaFisicaEnOTrasReservas
            } else if (camaFisicaEnOTrasReservas.length === 0) {

                const camaFisicaInsertada = await insertarCamaFisicaEnLaHabitacion({
                    reservaUID,
                    habitacionUID,
                    nuevaCamaIDV,
                    camaUI
                })
                const componenteUID = camaFisicaInsertada.componenteUID
                estructura.estadoCamaFisica = "aceptada"
                estructura.descripcion = "La cama física se ha instalado en la habitación porque estaba disponible."
                estructura.camaIDV = nuevaCamaIDV
                estructura.componenteUID = componenteUID
                estructura.camaUI = camaUI
            }
            return estructura
        }
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (semaforoCompartidoReserva) {
            semaforoCompartidoReserva.release()
        }
    }
}