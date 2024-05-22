import { conexion } from "../../componentes/db.mjs";

export const obtenerNombreColumnaPorTabla = async (data) => {
    try {

        const tabla = data.tabla
        const nombreColumna = data.nombreColumna

        const consulta = `
        SELECT 
        column_name
        FROM 
        information_schema.columns
        WHERE 
        table_name = $1 
        AND 
        column_name = $2;
        `;
        const parametros = [
            tabla,
            nombreColumna
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

