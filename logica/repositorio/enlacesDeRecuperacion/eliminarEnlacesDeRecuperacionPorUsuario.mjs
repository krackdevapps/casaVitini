import { conexion } from "../../componentes/db.mjs";

export const eliminarEnlacesDeRecuperacionPorUsuario = async (usuario) => {
    try {
        const consulta =`
        DELETE FROM "enlaceDeRecuperacionCuenta"
        WHERE usuario = $1
        RETURNING *;
        `;
        const resuelve = await conexion.query(consulta, [usuario]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

