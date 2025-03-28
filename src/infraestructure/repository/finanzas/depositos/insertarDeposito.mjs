import { conexion } from "../../globales/db.mjs";

export const insertarDeposito = async (data) => {
    try {
        const nombre = data.nombre
        const plataforma = data.plataforma
        const fechaCreacion = data.fechaCreacion

        const consulta = `
        INSERT INTO finanzas.depositos
        (
        nombre,
        plataforma,
        "fechaCreacion"
        )
        VALUES ($1, $2, $3)
        RETURNING *
        `;
        const parametros = [
            nombre,
            plataforma,
            fechaCreacion
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado el nuevo deposito."
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}