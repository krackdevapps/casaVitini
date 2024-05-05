import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";

export const actualizarMensaje = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const mensajeUID = entrada.body.mensajeUID;
        const mensaje = entrada.body.mensaje;
        const filtroIDV = /^[0-9]+$/;
        if (!mensajeUID || !filtroIDV.test(mensajeUID)) {
            const error = "El mensajeUID solo puede ser una cadena que acepta numeros";
            throw new Error(error);
        }
        const bufferObj = Buffer.from(mensaje, "utf8");
        const mensajeB64 = bufferObj.toString("base64");
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
        const estadoActual = resuelveValidacion.rows[0].estado;
        if (estadoActual !== "desactivado") {
            const error = "No se puede modificar un mensaje activo, primero desactiva el mensaje";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción


        const actualizarMensaje = `
                                UPDATE 
                                    "mensajesEnPortada"
                                SET
                                    mensaje = $1
                                WHERE
                                    uid = $2;`;
        const datosDelMensaje = [
            mensajeB64,
            mensajeUID
        ];
        const resuelveActualizacion = await conexion.query(actualizarMensaje, datosDelMensaje);
        if (resuelveActualizacion.rowCount === 0) {
            const error = "No se ha podido actualizar el mensaje por que no se ha encontrado";
            throw new Error(error);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
        const ok = {
            ok: "Se ha actualizado correctamente el interruptor",
            mensajeUID: mensajeUID
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