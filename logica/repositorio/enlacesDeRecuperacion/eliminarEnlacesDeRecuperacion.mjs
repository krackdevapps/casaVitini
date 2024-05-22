import { conexion } from "../../componentes/db.mjs";

export const eliminarEnlacesDeRecuperacion = async () => {
    try {
        const consulta = `
        DELETE FROM "enlaceDeRecuperacionCuenta"
        WHERE usuario = $1;`;
        await conexion.query(consulta, []);
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

