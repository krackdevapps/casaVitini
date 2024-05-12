import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const obtenerRoles = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()  

        const consultaRoles = `
                            SELECT 
                            rol, 
                            "rolUI"
                            FROM 
                            "usuariosRoles";`;
        const resolverConsultaRoles = await conexion.query(consultaRoles);
        if (resolverConsultaRoles.rowCount === 0) {
            const error = "No existe ningún rol";
            throw new Error(error);
        }
        const roles = resolverConsultaRoles.rows;
        const ok = {
            ok: roles
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}