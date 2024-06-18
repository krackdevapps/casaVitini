import { utilidades } from "../../../../componentes/utilidades.mjs"

export const validarObjeto = (data) => {
    try {
        const zonaSobreControl = data.zonaSobreControl
        const zonas = [
            "totalReserva",
            "porApartamento",
            "porDia"
        ]
        if (zonaSobreControl === zonas[0]) {





        } else if (zonaSobreControl === zonas[1]) {

        } else if (zonaSobreControl === zonas[2]) {


        }
        if (!zonas.includes(zonaSobreControl)) {
            const zonasUI = utilidades.contructorComasEY(zonas)
            const error = "No se reconcoe la zona del sobrecontrol, solo existen: " + zonasUI
            throw new Error(error)
        }

    } catch (error) {
        throw error
    }
}