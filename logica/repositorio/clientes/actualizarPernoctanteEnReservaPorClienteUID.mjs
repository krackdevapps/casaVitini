import { conexion } from "../../componentes/db.mjs";
export const actualizarPernoctanteEnReservaPorClienteUID = async (data) => {
    try {
        
        const clienteUID_origen = data.clienteUID_origen
        const clienteUID_destino = data.clienteUID_destino

        const consulta = `
            UPDATE "reservaPernoctantes"
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
        console.log(datosCliente)
        const resuelve = await conexion.query(consulta, datosCliente);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}