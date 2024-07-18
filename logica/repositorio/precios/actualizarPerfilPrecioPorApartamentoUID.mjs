import { conexion } from "../../componentes/db.mjs";

export const actualizarPerfilPrecioPorApartamentoUID = async (data) => {
    try {
        const nuevoPrecio = data.nuevoPrecio
        const apartamentoIDV = data.apartamentoIDV

        const consulta = `
        UPDATE "preciosApartamentos"
        SET precio = $1
        WHERE "apartamentoIDV" = $2;
        `;
        const parametros = [
            nuevoPrecio,
            apartamentoIDV
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun perfil de precio que actualizar para este apartamento";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}