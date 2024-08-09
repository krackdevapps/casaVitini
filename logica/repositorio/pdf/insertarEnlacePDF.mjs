import { conexion } from "../../componentes/db.mjs";

export const insertarEnlacePDF = async (data) => {
    try {

        const reservaUID = data.reservaUID
        const enlaceUPID = data.enlaceUPID
        const fechaCaducidad = data.fechaCaducidad

        const consulta = `
        INSERT INTO
        "enlacesPdf"
        (
        "reservaUID",
        "publicoUID",
        "fechaCaducidad"
        )
        VALUES 
        ($1, $2, $3)
        RETURNING
        "enlaceUID";`;
        const parametros = [
            reservaUID,
            enlaceUPID,
            fechaCaducidad
        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido crear el enlace.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}