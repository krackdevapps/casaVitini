import { conexion } from "../globales/db.mjs";

export const insertarElemento = async (data) => {
    try {
        const nombre = data.nombre
        const cantidad = data.cantidad
        const tipoLimite = data.tipoLimite
        const cantidadMinima = data.cantidadMinima
        const descripcion = data.descripcion

        const consulta = `
        INSERT INTO "inventarioGeneral"
        (
        nombre,
        cantidad,
        "tipoLimite",
        "cantidadMinima",
        "descripcion"
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `;
        const parametros = [
            nombre,
            cantidad,
            tipoLimite,
            cantidadMinima,
            descripcion
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado el elemento en el inventario."
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}