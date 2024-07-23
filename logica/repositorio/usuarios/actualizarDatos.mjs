import { DateTime } from "luxon";
import { conexion } from "../../componentes/db.mjs";

export const actualizarDatos = async (data) => {


    const usuario = data.usuario

    const mail = data.mail
    const nombre = data.nombre
    const primerApellido = data.primerApellido
    const segundoApellido = data.segundoApellido
    const pasaporte = data.pasaporte
    const telefono = data.telefono
    const cuentaVerificada = "no"

    try {

        const controlNuevoCorreoPorVerifical = `
            SELECT 
            mail
            FROM 
            "datosDeUsuario" 
            WHERE 
            usuario <> $1 
            AND
            mail = $2`;
        const resuelveNuevoCorreoPorVerifical = await conexion.query(
            controlNuevoCorreoPorVerifical,
            [usuario, mail]
        );
        if (resuelveNuevoCorreoPorVerifical.rowCount > 0) {
            //const cuentaConCorreoAsociado = resuelveNuevoCorreoPorVerifical.rows[0].usuario
            const error = "El correo electronico ya tiene un VitiniIDX asociado. Utiliza esa cuenta, recuperala o inserta otro correo electronico para esta cuenta."
            throw new Error(error)
        }

        const actualizarDatosUsuario = `
            UPDATE "datosDeUsuario"
            SET
              "nombre" = $1,
              "primerApellido" = $2,
              "segundoApellido" = $3,
              "pasaporte" = $4,
              "telefono" = $5,
              "mail" = $6
            WHERE usuario = $7
            RETURNING
              *
            `;
        const datos = [
            nombre,
            primerApellido,
            segundoApellido,
            pasaporte,
            telefono,
            mail,
            usuario
        ]
        const datosActualuizzados = await conexion.query(
            actualizarDatosUsuario,
            datos
        );
        if (datosActualuizzados.rowCount === 0) {
            const error = "No se han actualizado los datos de usuario"
            throw new Error(error)
        }
        return datosActualuizzados.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado;
    }
};
