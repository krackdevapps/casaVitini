import { conexion } from "../globales/db.mjs";
export const eliminarClientePorClienteUID = async (clienteUID) => {
    try {
        const consulta = `
        DELETE FROM clientes
        WHERE "clienteUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [clienteUID])
        if (resuelve.rowCount === 0) {
            const error = "No existe el cliente, revisa su identificador";
            throw new Error(error)
        }
        if (resuelve.rowCount === 1) {
            const clienteEliminado = resuelve.rows[0]
            return clienteEliminado
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
