import { conexion } from "../../componentes/db.mjs";

export const eliminarEnlacesDeRecuperacionPorUsuario = async (usuario) => {
    try {
        const consulta =`
        DELETE FROM "enlaceDeRecuperacionCuenta"
        WHERE usuario = $1;
        `;
        await conexion.query(consulta, [usuario]);
    } catch (error) {
        throw error
    }
}

