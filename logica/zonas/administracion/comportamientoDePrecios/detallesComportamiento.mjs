import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerComportamientoDePrecioPorComportamientoUID } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientoPorComportamientoUID.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
export const detallesComportamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const comportamientoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.comportamientoUID,
            nombreCampo: "El identificador universal de la reserva (comportamientoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
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