import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";


export const eliminar = async (entrada, salida) => {   
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return
        
        const clienteUID = entrada.body.clienteUID;
        if (!clienteUID || !Number.isInteger(clienteUID)) {
            const error = "El campo cliente solo puede ser un numero positivo y entero que haga referencia al UID del cliente";
            throw new Error(error);
        }
        const validarCliente = `
                            SELECT
                            uid
                            FROM 
                            clientes
                            WHERE
                            uid = $1`;
        const resuelveValidarCliente = await conexion.query(validarCliente, [clienteUID]);
        if (resuelveValidarCliente.rowCount === 0) {
            const error = "No existe el cliente, revisa su identificador";
            throw new Error(error);
        }
        if (resuelveValidarCliente.rowCount === 1) {
            const consultaEliminarCliente = `
                                DELETE FROM clientes
                                WHERE uid = $1;
                                `;
            const resuelveValidarYEliminarImpuesto = await conexion.query(consultaEliminarCliente, [clienteUID]);
            if (resuelveValidarYEliminarImpuesto.rowCount === 0) {
                const error = "No existe el cliente, revisa su identificador";
                throw new Error(error);
            }
            if (resuelveValidarYEliminarImpuesto.rowCount === 1) {
                const ok = {
                    ok: "Se ha eliminado correctamente el cliente",
                    clienteUID: clienteUID
                };
                salida.json(ok);
            }
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}