import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const datosCuentaIDX = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const usuarioIDX = entrada.body.usuarioIDX;
        const filtroCadena = /^[a-z0-9]+$/;
        if (!usuarioIDX || !filtroCadena.test(usuarioIDX)) {
            const error = "el campo 'usuarioIDX' solo puede ser letras minúsculas, numeros y sin pesacios";
            throw new Error(error);
        }
        const consultaDetallesUsuario = `
                            SELECT 
                            usuario, 
                            rol,
                            "estadoCuenta"
                            FROM 
                            usuarios
                            WHERE 
                            usuario = $1;`;
        const resolverConsultaDetallesUsuario = await conexion.query(consultaDetallesUsuario, [usuarioIDX]);
        if (resolverConsultaDetallesUsuario.rowCount === 0) {
            const error = "No existe ningun usuario con ese IDX";
            throw new Error(error);
        }
        const detallesCliente = resolverConsultaDetallesUsuario.rows[0];
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