import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from '../../../../../sistema/error/filtroError.mjs';
import { obtenerCalendarioPorCalendarioUID } from "../../../../../repositorio/configuracion/calendarioSincronizados/obtenerCalendarioPorCalendarioUID.mjs";

export const exportarCalendario = async (entrada, salida) => {   
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        
        const calendarioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.calendarioUID,
            nombreCampo: "El campo nuevoPreci",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })    
        await obtenerCalendarioPorCalendarioUID(calendarioUID)
        // Obtener las las reservas
        // Verificar que el apartmento este en esa reserva
        // añadirlo a una array
        // parsearlo en formato ical
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}