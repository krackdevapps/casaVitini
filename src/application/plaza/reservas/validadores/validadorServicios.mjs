import { validarServiciosPubicos } from "../../../../shared/servicios/validarServiciosPublicos.mjs"

export const validadorServicios = async(data) => {

    const servicios = data.servicios
    const schemaControl = data.schemaControl
    const serviciosSiReconocidos = data.serviciosSiReconocidos
    
        if (servicios.length > 0) {
            const controlServicios = await validarServiciosPubicos(servicios)
            schemaControl.servicios = controlServicios
            serviciosSiReconocidos.push(...controlServicios.serviciosSiReconocidos)
        }

}