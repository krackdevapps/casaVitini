import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const eliminarEnlace = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()


        const enlaceUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.enlaceUID,
            nombreCampo: "El campo nuevoPreci",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const seleccionarEnlace = await conexion.query(`SELECT reserva FROM "enlacesDePago" WHERE "enlaceUID" = $1`, [enlaceUID]);
        if (seleccionarEnlace.rowCount === 0) {
            const error = "No existe el enlace de pago";
            throw new Error(error);
        }
        const eliminarEnlace = `
                            DELETE FROM "enlacesDePago"
                            WHERE "enlaceUID" = $1;
                            `;
        const resuelveEliminarEnlace = await conexion.query(eliminarEnlace, [enlaceUID]);
        if (resuelveEliminarEnlace.rowCount === 0) {
            const error = "No existe el enlace";
            throw new Error(error);
        }
        if (resuelveEliminarEnlace.rowCount === 1) {
            const ok = {
                ok: "Se ha eliminado el enlace correctamente"
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}