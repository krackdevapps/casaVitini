import { conexion } from "../globales/db.mjs";

export const insertarPerfilPrecio = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const precioInicial = data.precioInicial

        const consulta = `
        INSERT INTO 
        "preciosApartamentos"
        (
        "apartamentoIDV",
        precio
        )
        VALUES 
        (
        $1,
        $2
        ) 
        RETURNING 
        *
        `
        const parametros = [
            apartamentoIDV,
            precioInicial
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado el perfil de precio en el apartamiento.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}