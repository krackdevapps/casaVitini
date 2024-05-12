import { conexion } from "../../componentes/db.mjs";

export const insertarCamaComoEntidad = async (data) => {

    const camaIDV = data.camaIDV
    const camaUI = data.camaUI
    const capacidad = data.capacidad

    try {
        const consulta = `
        INSERT INTO camas
        (
        cama,
        "camaUI",
        capacidad
        )
        VALUES 
        (
        $1,
        $2,
        $3
        )
        RETURNING *
        `;
        const resuelve = await conexion.query(consulta, [camaIDV, camaUI, capacidad]);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}