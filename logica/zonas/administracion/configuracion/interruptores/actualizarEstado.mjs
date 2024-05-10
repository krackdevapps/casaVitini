import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const actualizarEstado = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const interruptorIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.interruptorIDV,
            nombreCampo: "El interruptorIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const estado = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estado,
            nombreCampo: "El estado",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        if (estado !== "activado" && estado !== "desactivado") {
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
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}