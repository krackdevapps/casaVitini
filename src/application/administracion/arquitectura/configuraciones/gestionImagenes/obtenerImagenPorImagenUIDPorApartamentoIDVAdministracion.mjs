import { obtenerImagenPorImagenUIDPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/obtenerImagenPorImagenUIDPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";

export const obtenerImagenPorImagenUIDPorApartamentoIDVAdministracion = async (entrada) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()


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

        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
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