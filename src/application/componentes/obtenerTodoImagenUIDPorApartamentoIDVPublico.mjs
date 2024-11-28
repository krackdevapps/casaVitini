import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerTodasLasImagenesUIDPorApartamentoIDV } from "../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/obtenerTodasLasImagenesUIDPorApartamentoIDV.mjs";

export const obtenerTodoImagenUIDPorApartamentoIDVPublico = async (entrada) => {
    try {
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El campo apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const configuracionDeAlojamiento = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        const estadoConfiguracionIDV = configuracionDeAlojamiento.estadoConfiguracionIDV
        const zonaIDV = configuracionDeAlojamiento.zonaIDV
        const zonasIDV = ["global", "publica"]
        if (estadoConfiguracionIDV === "desactivado") {
            throw {
                error: "No existe el apartamentoIDV",
                code: "estadoDesactivado"
            }
        }
        if (!zonasIDV.includes(zonaIDV)) {
            throw {
                error: "No existe el apartamentoIDV",
                code: "zonaNoAccesible"
            }
        }

        const imagenes = await obtenerTodasLasImagenesUIDPorApartamentoIDV(apartamentoIDV)
        const ok = {
            ok: "Aquí tienes los UID de todas las imagenes del apartamento",
            apartamentoIDV,
            imagenes
        }

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}