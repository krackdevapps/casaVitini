import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const actualizarEstadoCuentaDesdeAdministracion = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        const nuevoEstado = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevoEstado,
            nombreCampo: "El campo de nuevo estado",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })


        if (nuevoEstado !== "activado" && nuevoEstado !== "desactivado") {
            const error = "El campo nuevoEstado solo puede ser activado o desactivado";
            throw new Error(error);
        }
        // validar existencia de contrasena
        const validarClave = `
                            SELECT 
                            clave
                            FROM usuarios
                            WHERE usuario = $1;
                            `;
        const resuelveValidarClave = await conexion.query(validarClave, [usuarioIDX]);
        if (!resuelveValidarClave.rows[0].clave) {
            const error = "No se puede activar una cuenta que carece de contrasena, por favor establece una contrasena primero";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        const actualizarEstadoCuenta = `
                            UPDATE usuarios
                            SET 
                                "estadoCuenta" = $1
                            WHERE 
                                usuario = $2
                            `;
        const datos = [
            nuevoEstado,
            usuarioIDX
        ];
        const resuelveEstadoCuenta = await conexion.query(actualizarEstadoCuenta, datos);
        if (resuelveEstadoCuenta.rowCount === 0) {
            const error = "No se encuentra el usuario";
            throw new Error(error);
        }
        if (resuelveEstadoCuenta.rowCount === 1) {
            if (nuevoEstado !== "desactivado") {
                const cerrarSessiones = `
                                    DELETE FROM sessiones
                                    WHERE sess->> 'usuario' = $1;
                                    `;
                await conexion.query(cerrarSessiones, [usuarioIDX]);
            }
            const ok = {
                ok: "Se ha actualizado el estado de la cuenta",
                estadoCuenta: nuevoEstado
            };
            salida.json(ok);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
    }
}