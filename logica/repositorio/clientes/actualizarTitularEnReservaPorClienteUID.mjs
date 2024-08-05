import { conexion } from "../../componentes/db.mjs";
export const actualizarTitularEnReservaPorClienteUID = async (data) => {
    try {
        const clienteUID_origen = data.clienteUID_origen
        const clienteUID_destino = data.clienteUID_destino

        const consulta = `
            UPDATE "reservaTitulares"
            SET 
            "clienteUID" = $1
            WHERE 
            "clienteUID" = $2
            RETURNING
            *
            `;
        const datosCliente = [
            clienteUID_destino,
            clienteUID_origen
        ]
        const resuelve = await conexion.query(consulta, datosCliente);
         return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
