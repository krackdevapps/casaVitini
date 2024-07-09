import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { insertarHabitacionEnApartamento } from "../../../../repositorio/arquitectura/configuraciones/insertarHabitacionEnApartamento.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../repositorio/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerHabitacionDelApartamentoPorHabitacionIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionIDV.mjs";

export const addHabitacionToConfiguracionApartamento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()


        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const habitacionIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacionIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const obtenerConfiguracionPorApartamento_ = await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        if (obtenerConfiguracionPorApartamento_.length === 0) {
            const error = "No hay ningun apartamento con ese identificador visual";
            throw new Error(error);
        }
        if (obtenerConfiguracionPorApartamento_.estadoConfiguracion === "disponible") {
            const error = "No se puede anadir una habitacion cuando el estado de la configuracion es Disponible, cambie el estado a no disponible para realizar anadir una cama";
            throw new Error(error);
        }
        if (obtenerConfiguracionPorApartamento_.length === 1) {
            const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)
            const habitacionUI = await obtenerHabitacionComoEntidadPorHabitacionIDV(habitacionIDV)
            if (!habitacionUI) {
                const error = "No existe el identificador visual de la habitacion";
                throw new Error(error);
            }
            const habitacionDelApartamento = await obtenerHabitacionDelApartamentoPorHabitacionIDV({
                apartamentoIDV:apartamentoIDV,
                habitacionIDV: habitacionIDV,
                errorSi: "existe"
            })

            if (habitacionDelApartamento.length > 0) {
                const error = `Ya existe la ${habitacionUI} en esta configuracion del ${apartamentoUI}`;
                throw new Error(error);
            }

            const dataInsertarHabitacionEnApartamento = {
                apartamentoIDV: apartamentoIDV,
                habitacionIDV: habitacionIDV
            }
            const insertarHabitacionEnApartamento_ = await insertarHabitacionEnApartamento(dataInsertarHabitacionEnApartamento)

            if (insertarHabitacionEnApartamento_.length === 0) {
                const error = `Se han pasado las validaciones pero la base de datos no ha insertado el registro`;
                throw new Error(error);
            }
            if (insertarHabitacionEnApartamento_.length === 1) {
                const ok = {
                    ok: "Se ha insertado correctament la nueva habitacion",
                    habitacionUID: insertarHabitacionEnApartamento_.uid,
                    habitacionIDV: habitacionIDV,
                    habitacionUI: habitacionUI
                };
                return ok
            }
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }

}