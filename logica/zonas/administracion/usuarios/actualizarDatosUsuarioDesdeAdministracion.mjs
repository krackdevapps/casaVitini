import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const actualizarDatosUsuarioDesdeAdministracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        let usuarioIDX = entrada.body.usuarioIDX;
        let nombre = entrada.body.nombre;
        let primerApellido = entrada.body.primerApellido;
        let segundoApellido = entrada.body.segundoApellido;
        let pasaporte = entrada.body.pasaporte;
        let telefono = entrada.body.telefono;
        let email = entrada.body.email;
        const validarDatosUsuario = {
            usuarioIDX: usuarioIDX,
            nombre: nombre,
            primerApellido: primerApellido,
            segundoApellido: segundoApellido,
            pasaporte: pasaporte,
            telefono: telefono,
            email: email
        };
        const datosValidados = await validadoresCompartidos.usuarios.actualizarDatos(validarDatosUsuario);
        usuarioIDX = datosValidados.usuarioIDX;
        nombre = datosValidados.nombre;
        primerApellido = datosValidados.primerApellido;
        segundoApellido = datosValidados.segundoApellido;
        pasaporte = datosValidados.pasaporte;
        telefono = datosValidados.telefono;
        email = datosValidados.email;
        await conexion.query('BEGIN'); // Inicio de la transacción


        // validar existencia de contrasena
        const validarUsuario = `
                             SELECT 
                             usuario
                             FROM usuarios
                             WHERE usuario = $1;
                             `;
        const resuelveValidarUsuario = await conexion.query(validarUsuario, [usuarioIDX]);
        if (!resuelveValidarUsuario.rowCount === 0) {
            const error = "No existe el usuario";
            throw new Error(error);
        }
        const actualizarDatosUsuario2 = `
                            UPDATE "datosDeUsuario"
                            SET 
                              nombre = COALESCE(NULLIF($1, ''), nombre),
                              "primerApellido" = COALESCE(NULLIF($2, ''), "primerApellido"),
                              "segundoApellido" = COALESCE(NULLIF($3, ''), "segundoApellido"),
                              pasaporte = COALESCE(NULLIF($4, ''), pasaporte),
                              telefono = COALESCE(NULLIF($5, ''), telefono),
                              email = COALESCE(NULLIF($6, ''), email)
                            WHERE "usuarioIDX" = $7
                            RETURNING 
                              nombre,
                              "primerApellido",
                              "segundoApellido",
                              pasaporte,
                              telefono,
                              email;                       
                            `;
        const datos = [
            nombre,
            primerApellido,
            segundoApellido,
            pasaporte,
            telefono,
            email,
            usuarioIDX,
        ];
        const resuelveActualizarDatosUsuario2 = await conexion.query(actualizarDatosUsuario2, datos);
        if (resuelveActualizarDatosUsuario2.rowCount === 1) {
            const datosActualizados = resuelveActualizarDatosUsuario2.rows;
            const ok = {
                ok: "El comportamiento se ha actualizado bien junto con los apartamentos dedicados",
                datosActualizados: datosActualizados
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