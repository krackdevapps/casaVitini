import { conexion } from "../../componentes/db.mjs";
export const eliminarCliente = async (clienteUID) => {
    try {
        const consulta = `
        DELETE FROM clientes
        WHERE uid = $1;
        `;
        const resuelve = await conexion.query(consulta, clienteUID)
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
