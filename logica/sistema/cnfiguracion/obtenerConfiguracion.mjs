import { conexion } from "../../componentes/db.mjs";
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs";

export const obtenerConfiguracion = async (parametrosConfiguracion) => {
    try {
        const parametrosConfiguracion = validadoresCompartidos.tipos.array({
            array: parametrosConfiguracion,
            nombreCampo: "El sistema de configuracion",
            filtro: "soloCadenasIDV",
            noSePermitenDuplicados: "si"
        })        
        
        const consultaConfiguracionGlobal = `
            SELECT 
            valor,
            "configuracionUID"
            FROM 
            "configuracionGlobal"
            WHERE 
            "configuracionUID" = ANY($1);
       `;
   
        const resuelveConfiguracionGlobal = await conexion.query(consultaConfiguracionGlobal, {parametrosConfiguracion});
        if (resuelveConfiguracionGlobal.rowCount === 0) {
            const error = "No hay configuraciones globales con estos parametros";
            throw new Error(error);
        }
        const configuraciones = resuelveConfiguracionGlobal.rows;
        return configuraciones
    } catch (errorCapturado) {
        throw errorCapturado
    }

}