import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const eliminarHabitacionDeConfiguracionDeAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const habitacionUID = validadoresCompartidos.tipos.numero({
            string: entrada.body.habitacionUID,
            nombreCampo: "El identificador universal de la habitación (habitacionUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const validarHabitacionUID = `
                                    SELECT 
                                    apartamento
                                    FROM "configuracionHabitacionesDelApartamento"
                                    WHERE uid = $1
                                    `;
        const resuelveValidarHabitacionUID = await conexion.query(validarHabitacionUID, [habitacionUID]);
        if (resuelveValidarHabitacionUID.rowCount === 0) {
            const error = "No existe la habitacion, revisa el habitacionUID";
            throw new Error(error);
        }
        const apartamentoIDV = resuelveValidarHabitacionUID.rows[0].apartamento;
        const consultaApartamento = `
                                SELECT 
                                "estadoConfiguracion"
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1;
                                `;
        const resuelveConsultaApartamento = await conexion.query(consultaApartamento, [apartamentoIDV]);
        if (resuelveConsultaApartamento.rows[0].estadoConfiguracion === "disponible") {
            const error = "No se puede eliminar una habitacion cuando el estado de la configuracion es Disponible, cambie el estado a no disponible para realizar anadir una cama";
            throw new Error(error);
        }
        const eliminarHabitacion = `
                                    DELETE FROM "configuracionHabitacionesDelApartamento"
                                    WHERE uid = $1;
                                    `;
        const resuelveEliminarHabitacion = await conexion.query(eliminarHabitacion, [habitacionUID]);
        if (resuelveEliminarHabitacion.rowCount === 0) {
            const error = "No se ha eliminado la habitacion por que no se ha entonctrado el registo en la base de datos";
            throw new Error(error);
        }
        if (resuelveEliminarHabitacion.rowCount === 1) {
            const ok = {
                "ok": "Se ha eliminado correctamente la habitacion como entidad",
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}