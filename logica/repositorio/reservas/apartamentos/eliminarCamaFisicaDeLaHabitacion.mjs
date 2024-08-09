import { conexion } from "../../../componentes/db.mjs"

export const eliminarCamaFisicaDeLaHabitacion = async (data) => {
    try {
        const componenteUID = data.componenteUID
        const reservaUID = data.reservaUID
        const consulta = `
        DELETE FROM 
        "reservaCamasFisicas"
        WHERE 
        "componenteUID" = $1
        AND
        "reservaUID" = $2;
        `;
        const parametros = [
            componenteUID,
            reservaUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha encontrado ninguna cama física que eliminar con ese componenteUID y reservaUID"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

