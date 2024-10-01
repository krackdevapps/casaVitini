import { obtenerParConfiguracion } from '../../infraestructure/repository/configuracion/parConfiguracion/obtenerParConfiguracion.mjs';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';
export const obtenerParametroConfiguracion = async (configuracionUID) => {
    try {
        const confArrayUIDS = validadoresCompartidos.tipos.array({
            array: configuracionUID,
            nombreCampo: "El array depbtemerParametroConfiguracion ",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "no"
        })
        const parConfiguracion = await obtenerParConfiguracion([confArrayUIDS])
        return parConfiguracion
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
