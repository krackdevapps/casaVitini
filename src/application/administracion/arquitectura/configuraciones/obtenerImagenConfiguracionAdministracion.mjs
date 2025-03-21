import { obtenerImagenApartamentoPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerImagenApartamentoPorApartamentoIDV.mjs";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";


export const obtenerImagenConfiguracionAdministracion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si"
        })

        const configuracionDelApartamento = await obtenerImagenApartamentoPorApartamentoIDV({
            apartamentoIDV,
            estadoConfiguracionIDV_array: ["activado", "desactivado"]
        })

        const imagen = configuracionDelApartamento.imagen;
        const ok = {
            ok: "Imagen de la configuración administrativa del apartamento, png codificado en base64",
            imagen: imagen
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }

}