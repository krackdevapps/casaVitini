import { conexion } from "../../componentes/db.mjs";
export const insertarApartamentosDelComportamientoDePrecio = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const simbolo = data.simbolo
        const cantidadPorApartamento = data.cantidadPorApartamento
        const comportamientoUID = data.comportamientoUID

        const consulta = `
        INSERT INTO "comportamientoPreciosApartamentos"
    (
        "apartamentoIDV",
        simbolo,
        cantidad,
        "comportamientoUID"
    )
        VALUES
    (
        NULLIF($1, NULL),
        COALESCE($2, NULL),
        COALESCE($3::numeric, NULL),
        NULLIF($4::numeric, NULL)
    )
        RETURNING *;

        `;
        const parametros = [
            apartamentoIDV,
            simbolo,
            cantidadPorApartamento,
            comportamientoUID,
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar los nuevo apartamentos en el comportamiento";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
