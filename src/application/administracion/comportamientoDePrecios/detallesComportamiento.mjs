import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerComportamientoDePrecioPorComportamientoUID } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientoPorComportamientoUID.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
export const detallesComportamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const comportamientoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.comportamientoUID,
            nombreCampo: "El identificador universal de la reserva (comportamientoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })


        const detallesComportamiento = await obtenerComportamientoDePrecioPorComportamientoUID(comportamientoUID)

        const apartamentosDelComportamiento = detallesComportamiento.contenedor.apartamentos

        for (const detallesApartamento of apartamentosDelComportamiento) {
            const apartamentoIDV = detallesApartamento.apartamentoIDV
            const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "desactivado"
            }))?.apartamentoUI || `Apartamento desconocido (${apartamentoIDV})`

            detallesApartamento.apartamentoUI = apartamentoUI
        }


        const ok = {
            ok: "Aquí tiene los detalles del comportamiento",
            detallesComportamiento
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}