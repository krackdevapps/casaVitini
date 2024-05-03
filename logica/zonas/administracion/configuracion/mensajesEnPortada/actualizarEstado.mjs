import { conexion } from "../../../../componentes/db.mjs";

export const actualizarEstado = async (entrada, salida) => {
    try {
        const mensajeUID = entrada.body.mensajeUID;
        const estado = entrada.body.estado;
        const filtroIDV = /^[0-9]+$/;
        if (!mensajeUID || !filtroIDV.test(mensajeUID)) {
            const error = "El mensajeUID solo puede ser una cadena que acepta numeros";
            throw new Error(error);
        }
        if (estado !== "activado" && estado !== "desactivado") {
            const error = "El estado solo puede ser activado o desactivado";
            throw new Error(error);
        }
        const validarUID = `
                                SELECT 
                                    "estado"
                                FROM 
                                    "mensajesEnPortada"
                                WHERE 
                                    uid = $1;
                               `;
        const resuelveValidacion = await conexion.query(validarUID, [mensajeUID]);
        if (resuelveValidacion.rowCount === 0) {
            const error = "No existe ningun mensaje con ese UID";
            throw new Error(error);
        }

        await conexion.query('BEGIN'); // Inicio de la transacción


        const actualizarMensaje = `
                                UPDATE 
                                    "mensajesEnPortada"
                                SET
                                    estado = $1
                                WHERE
                                    uid = $2;`;
        const resuelveActualizacion = await conexion.query(actualizarMensaje, [estado, mensajeUID]);
        if (resuelveActualizacion.rowCount === 0) {
            const error = "No se ha podido actualizar el mensaje por que no se ha encontrado";
            throw new Error(error);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
        const ok = {
            ok: "Se ha actualizado el estado correctamente",
            mensajeUID: mensajeUID,
            estado: estado
        };
        salida.json(ok);
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}