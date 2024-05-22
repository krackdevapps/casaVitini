import { conexion } from "../../componentes/db.mjs";
export const eliminarClientePorClienteIDV = async (clienteUID) => {
    try {
        const consulta = `
        DELETE FROM clientes
        WHERE "clienteTVI" = $1
        RETURNING
        *;`;
        const resuelve = await conexion.query(consulta, [clienteUID])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
