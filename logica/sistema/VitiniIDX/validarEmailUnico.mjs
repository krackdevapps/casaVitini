import { conexion } from "../../componentes/db.mjs";

export const validarEMailUnico = async (email) => {

    try {
        const validarEmail = `
        SELECT 
        email
        FROM "datosDeUsuario"
        WHERE email = $1
        `;
        const resuelveValidarEmail = await conexion.query(validarEmail, [email]);
        if (resuelveValidarEmail.rowCount > 0) {
            const error = "El correo electronico ya existe, recupera tu cuenta de usuarios o escoge otro correo electronico";
            throw new Error(error);
        }
    } catch (error) {
        throw error
    }
}