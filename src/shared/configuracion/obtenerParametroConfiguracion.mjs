import { obtenerParConfiguracion } from '../../infraestructure/repository/configuracion/parConfiguracion/obtenerParConfiguracion.mjs';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';
import { configuracionesPredeterminadas } from './configuracionGlobal/configuracionesPredeterminadas.mjs';
export const obtenerParametroConfiguracion = async (configuracionUID) => {
    try {
        const confArrayUIDS = validadoresCompartidos.tipos.array({
            array: configuracionUID,
            nombreCampo: "El array de obtenerParametroConfiguracion",
            filtro: "strictoIDV",
            sePermitenDuplicados: "no"
        })
        const configuraciones = configuracionesPredeterminadas()
        const identificadoresNoReconocidos = []
        confArrayUIDS.forEach((cIDV) => {
            if (!configuraciones.hasOwnProperty(cIDV)) {
                identificadoresNoReconocidos.push(cIDV)
            }
        })
        if (identificadoresNoReconocidos.length > 0) {
            const error = {
                error: "Solicitar identificadores de configuracion no reconocidos.",
                identificadoresNoReconocidos: identificadoresNoReconocidos
            }
            throw error
        }
        const parConfiguracion = await obtenerParConfiguracion([confArrayUIDS])
        confArrayUIDS.forEach((configuracionIDV) => {
            if (
                !parConfiguracion.hasOwnProperty(configuracionIDV)
                ||
                !parConfiguracion[configuracionIDV]
                ||
                parConfiguracion[configuracionIDV].length === 0
            ) {
                parConfiguracion[configuracionIDV] = configuraciones[configuracionIDV]
            }
        })
        return parConfiguracion
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
