import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const detallesCliente = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const cliente = entrada.body.cliente;
        if (!cliente || !Number.isInteger(cliente)) {
            const error = "El campo cliente solo puede ser un numero positivo y entero que haga referencia al UID del cliente";
            throw new Error(error);
        }
        const consultaDetallesCliente = `
                            SELECT 
                            uid, 
                            nombre,
                            "primerApellido",
                            "segundoApellido",
                            pasaporte,
                            telefono,
                            email,
                            notas 
                            FROM 
                            clientes 
                            WHERE 
                            uid = $1`;
        const resolverConsultaDetallesCliente = await conexion.query(consultaDetallesCliente, [cliente]);
        if (resolverConsultaDetallesCliente.rowCount === 0) {
            const error = "No existe ningun clinete con ese UID";
            throw new Error(error);
        }
        const detallesCliente = resolverConsultaDetallesCliente.rows[0];
        const ok = {
            ok: detallesCliente
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
    }
}