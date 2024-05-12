import { conexion } from "../../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from '../../../../../sistema/error/filtroError.mjs';

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
  
        const consultaSelecionaCalendario = `
                                    SELECT 
                                    uid
                                    FROM 
                                    "calendariosSincronizados" 
                                    WHERE 
                                    uid = $1`;
        const resuelveSelecionarCalendario = await conexion.query(consultaSelecionaCalendario, [calendarioUID]);
        if (resuelveSelecionarCalendario.rowCount === 0) {
            const error = "No existe el calendario que quieres borrar, por favor revisa el identificado calendarioUID que has introducido.";
            throw new Error(error);
        }
        // Obtener las las reservas
        // Verificar que el apartmento este en esa reserva
        // añadirlo a una array
        // parsearlo en formato ical
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}