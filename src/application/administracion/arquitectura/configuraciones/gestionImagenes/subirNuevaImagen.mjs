import { insertarImagenPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/insertarImagenPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { utilidades } from "../../../../../shared/utilidades.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";

export const subirNuevaImagen = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const contenidoArchivo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.contenidoArchivo,
            nombreCampo: "El campo del contenidoArchivo",
            filtro: "cadenaBase64",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        
        utilidades.filtroBase64Imagenes(contenidoArchivo)
        await campoDeTransaccion("iniciar")

        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })

        const imagenInsertada = await insertarImagenPorApartamentoIDV({
            apartamentoIDV,
            imagenBase64: contenidoArchivo
        })
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha actualizado la imagen correctamente",
            ...imagenInsertada
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}