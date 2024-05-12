import { obtenerNombreApartamentoUI } from "../../../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs"
import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/obtenerConfiguracionPorApartamentoIDV.mjs";
import { insertarHabitacionEnApartamento } from "../../../../repositorio/arquitectura/insertarHabitacionEnApartamento.mjs";
import { obtenerNombreHabitacionUI } from "../../../../repositorio/arquitectura/obtenerNombreHabitacionUI.mjs";

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
            const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV)
            const habitacionUI = await obtenerNombreHabitacionUI(habitacionIDV)
            if (!habitacionUI) {
                const error = "No existe el identificador visual de la habitacion";
                throw new Error(error);
            }
            const validarInexistenciaHabitacionEnConfiguracionDeApartamento = await conexion.query(`SELECT * FROM "configuracionHabitacionesDelApartamento" WHERE apartamento = $1 AND habitacion = $2 `, [apartamentoIDV, habitacionIDV]);

            if (validarInexistenciaHabitacionEnConfiguracionDeApartamento.rowCount === 1) {
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
                salida.json(ok);
            }
        }
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}