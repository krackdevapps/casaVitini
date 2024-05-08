import { resolverApartamentoUI } from "../../../../sistema/resolucion/resolverApartamentoUI.mjs"
import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const addHabitacionToConfiguracionApartamento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return


        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        const habitacionIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacionIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const consultaApartamento = `
                                SELECT 
                                "estadoConfiguracion"
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1;
                                `;
        const resuelveConsultaApartamento = await conexion.query(consultaApartamento, [apartamentoIDV]);
        if (resuelveConsultaApartamento.rowCount === 0) {
            const error = "No hay ningun apartamento con ese identificador visual";
            throw new Error(error);
        }
        if (resuelveConsultaApartamento.rows[0].estadoConfiguracion === "disponible") {
            const error = "No se puede anadir una habitacion cuando el estado de la configuracion es Disponible, cambie el estado a no disponible para realizar anadir una cama";
            throw new Error(error);
        }
        if (resuelveConsultaApartamento.rowCount === 1) {
            const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
            const resolucionNombreHabitacion = await conexion.query(`SELECT "habitacionUI" FROM habitaciones WHERE habitacion = $1`, [habitacionIDV]);
            if (resolucionNombreHabitacion.rowCount === 0) {
                const error = "No existe el identificador visual de la habitacion";
                throw new Error(error);
            }
            const habitacionUI = resolucionNombreHabitacion.rows[0].habitacionUI;
            const validarInexistenciaHabitacionEnConfiguracionDeApartamento = await conexion.query(`SELECT * FROM "configuracionHabitacionesDelApartamento" WHERE apartamento = $1 AND habitacion = $2 `, [apartamentoIDV, habitacionIDV]);
            if (validarInexistenciaHabitacionEnConfiguracionDeApartamento.rowCount === 1) {
                const error = `Ya existe la ${habitacionUI} en esta configuracion del ${apartamentoUI}`;
                throw new Error(error);
            }
            const insertarHabitacion = `
                                    INSERT INTO "configuracionHabitacionesDelApartamento"
                                    (
                                    apartamento,
                                    habitacion
                                    )
                                    VALUES ($1, $2) RETURNING uid
                                    `;
            const resuelveInsertarHabitacion = await conexion.query(insertarHabitacion, [apartamentoIDV, habitacionIDV]);
            if (resuelveInsertarHabitacion.rowCount === 0) {
                const error = `Se han pasado las validaciones pero la base de datos no ha insertado el registro`;
                throw new Error(error);
            }
            if (resuelveInsertarHabitacion.rowCount === 1) {
                const ok = {
                    ok: "Se ha insertado correctament la nueva habitacion",
                    habitacionUID: resuelveInsertarHabitacion.rows[0].uid,
                    habitacionIDV: habitacionIDV,
                    habitacionUI: habitacionUI
                };
                salida.json(ok);
            }
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}