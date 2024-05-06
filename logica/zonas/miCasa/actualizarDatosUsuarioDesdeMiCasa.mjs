import { DateTime } from "luxon";
import { conexion } from "../../componentes/db.mjs";
import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";

export const actualizarDatosUsuarioDesdeMiCas = async (entrada, salida) => {

    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        if (IDX.control()) return

        const usuarioIDX = entrada.session.usuario;

        const nombre = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombre,
            nombreCampo: "El campo del nombre",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        const primerApellido = validadoresCompartidos.tipos.cadena({
            string: entrada.body.primerApellido,
            nombreCampo: "El campo del primer apellido",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })

        const segundoApellido = validadoresCompartidos.tipos.cadena({
            string: entrada.body.segundoApellido,
            nombreCampo: "El campo del segundo apellido",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })

        const pasaporte = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pasaporte,
            nombreCampo: "El campo del pasaporte",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
            limpiezaEspaciosInternos: "si"
        })

        const email = validadoresCompartidos.tipos
            .correoElectronico(entrada.body.email)
        const telefono = validadoresCompartidos.tipos
            .telefono(entrada.body.telefono)

        await conexion.query('BEGIN'); // Inicio de la transacción
        const controlCorreo = `
                SELECT 
                    email
                FROM 
                    "datosDeUsuario" 
                WHERE 
                    email = $1 AND "usuarioIDX" <> $2`;
        const resolverObtenerDatosUsuario = await conexion.query(controlCorreo, [email, usuarioIDX]);
        if (resolverObtenerDatosUsuario.rowCount > 0) {
            const error = "Ya existe una cuenta con ese correo electroníco. Escoge otro correo. Si ese es tu unico correo puedes recuperar tu cuenta de usuario con ese correo.";
            throw new Error(error);
        }
        const controlNuevoCorreoPorVerifical = `
                SELECT 
                    email
                FROM 
                    "datosDeUsuario" 
                WHERE 
                    "usuarioIDX" = $1 
                    AND
                    email = $2`;
        const resuelveNuevoCorreoPorVerifical = await conexion.query(controlNuevoCorreoPorVerifical, [usuarioIDX, email]);
        const actualizarDatosUsuario = `
                UPDATE "datosDeUsuario"
                SET 
                  "nombre" = COALESCE(NULLIF($1, ''), "nombre"),
                  "primerApellido" = COALESCE(NULLIF($2, ''), "primerApellido"),
                  "segundoApellido" = COALESCE(NULLIF($3, ''), "segundoApellido"),
                  "pasaporte" = COALESCE(NULLIF($4, ''), "pasaporte"),
                  "telefono" = COALESCE(NULLIF($5, ''), "telefono"),
                  "email" = COALESCE(NULLIF($6, ''), "email")
                WHERE "usuarioIDX" = $7
                RETURNING 
                  "nombre",
                  "primerApellido",
                  "segundoApellido",
                  "pasaporte",
                  "telefono",
                  "email";            
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
        const resuelveActualizarDatosUsuario = await conexion.query(actualizarDatosUsuario, datos);
        if (resuelveNuevoCorreoPorVerifical.rowCount === 0 && email.length > 0) {
            const fechaActualUTC = DateTime.utc();
            const fechaCaducidadCuentaNoVerificada = fechaActualUTC.plus({ minutes: 30 });

            const volverAVerificarCuenta = `
                    UPDATE 
                        usuarios
                    SET 
                        "cuentaVerificada" = $1,
                        "fechaCaducidadCuentaNoVerificada" =$2
                    WHERE 
                        usuario = $3;`;
            await conexion.query(volverAVerificarCuenta, ["no", fechaCaducidadCuentaNoVerificada, usuarioIDX]);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
        if (resuelveActualizarDatosUsuario.rowCount === 1) {
            const ok = {
                ok: "El comportamiento se ha actualizado bien junto con los apartamentos dedicados",
                datosActualizados: resuelveActualizarDatosUsuario.rows
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
    }
}
