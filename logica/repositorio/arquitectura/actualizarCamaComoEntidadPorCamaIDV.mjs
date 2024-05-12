import { conexion } from "../../componentes/db.mjs";

export const actualizarCamaComoEntidadPorCamaIDV = async (data) => {
    try {
        
        const camaIDV = data.camaIDV
        const camaUI = data.camaUI
        const capacidad = data.capacidad
        const entidadIDV = data.entidadIDV

        const consulta = `
        UPDATE camas
        SET 
        cama = COALESCE($1, cama),
        "camaUI" = COALESCE($2, "camaUI"),
        capacidad = COALESCE($3, "capacidad")
        WHERE cama = $4
        `;
        const parametros = [
            camaIDV,
            camaUI,
            capacidad,
            entidadIDV,
        ];
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve
    } catch (errorAdaptador) {
        const error = "Error en el adaptador actualizarCamaComoEntidadPorCamaIDV"
        throw new Error(error)
    }

}