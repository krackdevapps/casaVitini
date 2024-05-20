import { conexion } from "../../componentes/db.mjs";

export const obtenerDatosPersonalesPorPasaporteDual = async (data) => {
    try {

        const pasaporte = data.pasaporte
        const operacion = data.operacion
        const usuario = data.usuario

        const constructorSQL = (operacion, usuario) => {
            try {
                if (operacion === "actualizar") {
                    return `AND "usuariosIDX" <> '${usuario}'`
                } else if (operacion === "crear") {
                    return ""
                } else {
                    const error = "El validador de unicidadPasaporteYCorrreo esta mal configurado. Debe de especificarse el tipo de operacion."
                    throw new Error(error)
                }
            } catch (error) {
                throw error
            }
        }
        const inyectorSQL = constructorSQL(operacion, usuario)
        const consulta = `
        SELECT 
        *
        FROM 
        "datosDeUsuario"
        WHERE
        pasaporte = $1
        ${inyectorSQL};`;
        const resuelve = await conexion.query(consulta, [pasaporte]);
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}