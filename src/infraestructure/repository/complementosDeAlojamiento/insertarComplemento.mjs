import { conexion } from "../globales/db.mjs";
export const insertarComplemento = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV
        const complementoUI = data.complementoUI
        const definicion = data.definicion
        const tipoPrecio = data.tipoPrecio
        const precio = data.precio
        const testingVI = data.testingVI
        const estadoIDV = data.estadoIDV

        const insertar = `
        INSERT INTO 
        "complementosDeAlojamiento"
        (
        "apartamentoIDV",
        "complementoUI",
        definicion,
        "tipoPrecio",
        precio,
        "testingVI",
        "estadoIDV"
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7) 
        RETURNING
        *
        `
        const parametros = [
            apartamentoIDV,
            complementoUI,
            definicion,
            tipoPrecio,
            precio,
            testingVI,
            estadoIDV
        ]
        const resuelve = await conexion.query(insertar, parametros)
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
