import { componentes } from "../../../componentes.mjs";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";


export const actualizarIDXAdministracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const usuarioIDX = entrada.body.usuarioIDX;
        let nuevoIDX = entrada.body.nuevoIDX;
        const filtroCantidad = /^\d+\.\d{2}$/;
        const filtro_minúsculas_Mayusculas_numeros_espacios = /^[a-zA-Z0-9\s]+$/;
        const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
        const filtroNumeros = /^[0-9]+$/;
        const filtroCadenaSinEspacio = /^[a-z0-9]+$/;
        if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
            const error = "El campo usuarioIDX solo admite minúsculas y numeros";
            throw new Error(error);
        }
        nuevoIDX = nuevoIDX.toLowerCase();
        if (!nuevoIDX || !filtro_minúsculas_numeros.test(nuevoIDX)) {
            const error = "El campo nuevoIDX solo admite minúsculas y numeros";
            throw new Error(error);
        }
        await componentes.eliminarCuentasNoVerificadas();
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
                "ok": "Se ha actualizado el IDX correctamente",
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