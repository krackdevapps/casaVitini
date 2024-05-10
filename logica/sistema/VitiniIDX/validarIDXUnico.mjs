import { conexion } from "../../componentes/db.mjs";

export const validarIDXUnico = async (IDX) => {
    try {
        const validarNuevoUsuario = `
        SELECT 
        usuario
        FROM usuarios
        WHERE lower(usuario) = lower($1)
        `;
        const resuelveValidarNuevoUsaurio = await conexion.query(validarNuevoUsuario, [IDX]);
        if (resuelveValidarNuevoUsaurio.rowCount > 0) {
            const error = "El nombre de usuario no esta disponible, escoge otro";
            throw new Error(error);
        }
        if (IDX === "crear" || IDX === "buscador") {
            const error = "El nombre de usuario no esta disponbile, escoge otro";
            throw new Error(error);
        }
    } catch (error) {
        throw error
    }


}