import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const actualizarDatosUsuarioDesdeAdministracion = async (entrada, salida) => {
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

        const validarDatosUsuario = {
            usuarioIDX: usuarioIDX,
            pasaporte: pasaporte,
            email: email
        };
        await validadoresCompartidos.usuarios.unicidadPasaporteYCorrreo(validarDatosUsuario);
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