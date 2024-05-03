import { conexion } from "../../../../componentes/db.mjs";


export const cambiarPosicon = async (entrada, salida) => {
    try {
        const mensajeUID = entrada.body.mensajeUID;
        const posicion = entrada.body.posicion;
        const filtroIDV = /^[0-9]+$/;
        if (!mensajeUID || !filtroIDV.test(mensajeUID)) {
            const error = "El mensajeUID solo puede ser una cadena que acepta numeros";
            throw new Error(error);
        }
        if (!posicion || !filtroIDV.test(posicion) || posicion) {
            const error = "La posicion solo puede ser una cadena que acepta numeros enteros y positivos";
            throw new Error(error);
        }
        const mensajeB64 = btoa(mensaje);

        const validarUID = `
                                SELECT 
                                    "estado"
                                FROM 
                                    "mensajeEnPortada"
                                WHERE 
                                    "mensajeUID" = $1;
                               `;
        const resuelveValidacion = await conexion.query(validarUID, [mensajeUID]);
        if (resuelveValidacion.rowCount === 0) {
            const error = "No existe ningun mensaje con ese UID";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        const actualizarMensaje = `
                                UPDATE 
                                    "mensajeEnPortada"
                                SET
                                    mensaje = $1
                                WHERE
                                    "mensajeUID" = $2
                                    RETURNING *;`;
        const datosDelMensaje = [
            mensajeB64,
            mensajeUID
        ];
        const resuelveActualizacion = await conexion.query(actualizarMensaje, datosDelMensaje);
        if (resuelveActualizacion.rowCount === 0) {
            const error = "No se ha podido actualizar el mensaje por que no se ha encontrado";
            throw new Error(error);
        }
        const mensajeGuardado = resuelveEstado.rows[0].mensaje;
        await conexion.query('COMMIT'); // Confirmar la transacción
        const ok = {
            ok: "Se ha actualizado correctamente la posicion del mensaje",
            mensajeUID: mensajeUID,
            mensaje: atob(mensajeGuardado)
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