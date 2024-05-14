import { conexion } from "../../componentes/db.mjs";

export const eliminarPerfilDelPRecio = async (apartamentoIDV) => {
    try {
        const consulta =`
        DELETE FROM "preciosApartamentos"
        WHERE apartamento = $1;
        `;
        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        if (resuelve.rowCount === 0) {
            const error = "No hay ningun perfil de precio que elimintar de este apartamento";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        const error = "Error en el adaptador obtenerCamasPorHabitacion"
        throw new Error(error)
    }

}