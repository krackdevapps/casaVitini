import { obtenerImagenApartamentoPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerImagenApartamentoPorApartamentoIDV.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";


export const obtenerImagenConfiguracionAdministracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si"
        })

        const configuracionDelApartamento = await obtenerImagenApartamentoPorApartamentoIDV(apartamentoIDV)

        const imagen = configuracionDelApartamento.imagen;
        const ok = {
            ok: "Imagen de la configuracion adminsitrativa del apartamento, png codificado en base64",
            imagen: imagen
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }

}