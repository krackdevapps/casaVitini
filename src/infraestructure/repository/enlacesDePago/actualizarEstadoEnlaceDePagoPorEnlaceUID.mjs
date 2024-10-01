import { conexion } from "../globales/db.mjs";
export const actualizarEstadoEnlaceDePagoPorEnlaceUID = async (data) => {
    try {
        const estado = data.estado
        const enlaceUID = data.enlaceUID

        const consulta = `
           UPDATE "enlacesDePago"
           SET 
           "estadoPagoIDV" = $1
           WHERE 
           "enlaceUID" = $2
           RETURNING
           *
           ;`;
        const parametros = [
            estado,
            enlaceUID
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido actualizar el enlace de pago porque no se ha encontrado ningún enlace de pago con ese enlaceUID";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

