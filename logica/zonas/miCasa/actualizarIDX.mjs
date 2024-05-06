import { conexion } from "../../componentes/db.mjs";
import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";
import { eliminarCuentasNoVerificadas } from "../../sistema/VitiniIDX/eliminarCuentasNoVerificadas.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";

export const actualizarIDX = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        if (IDX.control()) return


        const usuarioIDX = entrada.session.usuario;
        const nuevoIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        await eliminarCuentasNoVerificadas();
        await conexion.query('BEGIN'); // Inicio de la transacción
        const actualizarIDX = `
                        UPDATE usuarios
                        SET 
                            usuario = $2
                        WHERE 
                            usuario = $1
                        RETURNING 
                            usuario           
                        `;
        const datos = [
            usuarioIDX,
            nuevoIDX
        ];
        nuevoIDX = `"${nuevoIDX}"`;
        const resuelveActualizarIDX = await conexion.query(actualizarIDX, datos);
        if (resuelveActualizarIDX.rowCount === 0) {
            const error = "No existe el nombre de usuario";
            throw new Error(error);
        }
        if (resuelveActualizarIDX.rowCount === 1) {
            const actualizarSessionesActivas = `
                            UPDATE sessiones
                            SET sess = jsonb_set(sess::jsonb, '{usuario}', $1::jsonb)::json
                            WHERE sess->>'usuario' = $2;
                                                   
                            `;
            await conexion.query(actualizarSessionesActivas, [nuevoIDX, usuarioIDX]);
            const IDXEstablecido = resuelveActualizarIDX.rows[0].usuario;
            const ok = {
                ok: "Se ha actualizado el IDX correctamente",
                usuarioIDX: IDXEstablecido
            };
            salida.json(ok);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
    }
}
