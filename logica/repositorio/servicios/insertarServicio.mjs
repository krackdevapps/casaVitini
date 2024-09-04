import { conexion } from "../../componentes/db.mjs";
export const insertarServicio = async (data) => {
    try {
        const nombreServicio = data.nombreServicio
        const zonaIDV = data.zonaIDV
        const contenedor = data.contenedor
        const testingVI = data.testingVI
        const estadoIDV = data.estadoIDV

        const insertar = `
        INSERT INTO 
        servicios
        (
        "nombre",
        "zonaIDV",
        contenedor,
        "testingVI",
        "estadoIDV"
        )
        VALUES ($1,$2,$3,$4,$5) 
        RETURNING
        *
        `
        const parametros = [
            nombreServicio,
            zonaIDV,
            contenedor,
            testingVI,
            estadoIDV
        ]
        const resuelve = await conexion.query(insertar, parametros)
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
