import { conexion } from "../../componentes/db.mjs";
export const actualizarEnlaceDePagoPorEnlaceUID = async (data) => {
    try {
        const nombreEnlace = data.nombreEnlace
        const descripcion = data.descripcion
        const cantidad = data.cantidad
        const fechaDeCaducidad = data.fechaDeCaducidad
        const reservaUID = data.reservaUID

        const consulta = `
           UPDATE "enlacesDePago"
           SET 
           "nombreEnlace" = $1,
           descripcion = $2,
           cantidad = $3,
           caducidad = $4
           WHERE 
           "reservaUID" = $5;
           `;
        const parametros = [
            nombreEnlace,
            descripcion,
            cantidad,
            fechaDeCaducidad,
            reservaUID
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido actualizar el enlace de pago por que no se ha encontrado ningun enlace de pago con ese enlaceUID";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

