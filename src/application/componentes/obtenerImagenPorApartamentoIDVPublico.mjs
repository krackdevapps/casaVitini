import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerImagenPorImagenUIDPorApartamentoIDV } from "../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/obtenerImagenPorImagenUIDPorApartamentoIDV.mjs";

export const obtenerImagenPorApartamentoIDVPublico = async (entrada) => {
    try {
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El campo apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const imagenUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.imagenUID,
            nombreCampo: "El campo imagenUID",
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

        const imagen = await obtenerImagenPorImagenUIDPorApartamentoIDV({
            apartamentoIDV,
            imagenUID
        })
        const ok = {
            ok: "Aquí la imagen del apartamento",
            apartamentoIDV,
            imagen
        }

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}