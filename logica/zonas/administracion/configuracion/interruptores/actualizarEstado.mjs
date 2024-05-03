import { conexion } from "../../../../componentes/db.mjs";
export const actualizarEstado = async (entrada, salida) => {
    try {
        const interruptorIDV = entrada.body.interruptorIDV;
        const estado = entrada.body.estado;
        const filtroIDV = /^[a-zA-Z0-9]+$/;
        if (!interruptorIDV || !filtroIDV.test(interruptorIDV)) {
            const error = "El interruptorIDV solo puede ser una cadena que acepta numeros, minusculas y mayusculas";
            throw new Error(error);
        }
        if (!estado ||
            !filtroIDV.test(estado) ||
            (estado !== "activado" && estado !== "desactivado")) {
            const error = "El estado solo puede ser activado o desactivado";
            throw new Error(error);
        }
        const validarInterruptorIDV = `
                                SELECT 
                                    "interruptorIDV"
                                FROM 
                                    "interruptoresGlobales"
                                WHERE 
                                    "interruptorIDV" = $1;
                               `;
        const resuelveConfiguracionGlobal = await conexion.query(validarInterruptorIDV, [interruptorIDV]);
        if (resuelveConfiguracionGlobal.rowCount === 0) {
            const error = "No existe ningun interruptor con ese indentificador visual";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        const actualizarInterruptor = `
                                UPDATE 
                                    "interruptoresGlobales"
                                SET
                                    estado = $1
                                WHERE
                                    "interruptorIDV" = $2
                                    RETURNING *;`;
        const nuevoEstado = [
            estado,
            interruptorIDV
        ];
        const resuelveEstado = await conexion.query(actualizarInterruptor, nuevoEstado);
        if (resuelveEstado.rowCount === 0) {
            const error = "No se ha podido actualizar el estado del interruptor";
            throw new Error(error);
        }
        const estadoNuevo = resuelveEstado.rows[0].estado;
        await conexion.query('COMMIT'); // Confirmar la transacción
        const ok = {
            ok: "Se ha actualizado correctamente el interruptor",
            interrutorIDV: interruptorIDV,
            estado: estadoNuevo
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