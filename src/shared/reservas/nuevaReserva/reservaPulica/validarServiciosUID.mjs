import { validarServiciosPubicos } from "../../../servicios/validarServiciosPublicos.mjs"

export const validarServiciosUID = async (data) => {
    try {
        const serviciosUIDSolicitados = data.serviciosUIDSolicitados || []
        if (serviciosUIDSolicitados.length > 0) {
            await validarServiciosPubicos(serviciosUIDSolicitados)
        }
    } catch (error) {
        throw error
    }
}