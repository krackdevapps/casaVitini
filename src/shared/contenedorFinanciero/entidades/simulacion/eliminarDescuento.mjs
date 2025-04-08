import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";
import { aplicarDescuento } from "../../../ofertas/entidades/reserva/aplicarDescuento.mjs";
import { constructorEstructuraDescuentos } from "../../../ofertas/global/constructorEstructuraDescuentos.mjs";
import { constructorEstructuraDescuentosReserva } from "../../../ofertas/entidades/reserva/constructorEstructuraDescuentosReserva.mjs";
import { totalesBasePorRango } from "../reserva/totalesBasePorRango.mjs";
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs";
import { aplicarImpuestos } from "../reserva/aplicarImpuestos.mjs";
export const eliminarDescuento = async (data) => {
    try {
        const estructura = data.estructura
        const fechaEntrada = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaEntrada,
            nombreCampo: "La fecha de entrada"
        })
        const fechaSalida = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaSalida,
            nombreCampo: "La fecha de salida "
        })
        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada: data.fechaEntrada,
            fechaSalida: data.fechaSalida,
            tipoVector: "diferente"
        })
        const apartamentosArray = validadoresCompartidos.tipos.array({
            array: data.apartamentosArray,
            nombreCampo: "El array de apartamentos",
            filtro: "strictoIDV",
            sePermitenDuplicados: "no"
        })
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const ofertaUIDParaEliminar = validadoresCompartidos.tipos.granEntero({
            number: data?.ofertaUID,
            nombreCampo: "El campo de ofertaUID dentro",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        const origen = validadoresCompartidos.tipos.cadena({
            string: data.origen,
            nombreCampo: "El campo origen",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const posicion = validadoresCompartidos.tipos.granEntero({
            number: data.posicion,
            nombreCampo: "El el campo de posicion",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        if (origen === "porAdministrador" && origen === "porCondicion") {
            const error = "El campo origen solo puede ser porAdminsitrador o porCondicion"
            throw new Error(error)
        }
        const desgloseFinancieroReserva = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
        const instantaneaNoches = desgloseFinancieroReserva.instantaneaNoches
        const instantaneaOfertasPorCondicion = desgloseFinancieroReserva.instantaneaOfertasPorCondicion ?? []
        const instantaneaOfertasPorAdministrador = desgloseFinancieroReserva.instantaneaOfertasPorAdministrador ?? []

        if (origen === "porAdministrador") {
            if (!instantaneaOfertasPorAdministrador[posicion]) {
                const error = "No existe la posición"
                throw new Error(error)
            }

            const ofertaUID = instantaneaOfertasPorAdministrador[posicion].oferta.ofertaUID
            if (ofertaUIDParaEliminar === ofertaUID) {
                instantaneaOfertasPorAdministrador.splice(posicion, 1);
            }
        }

        if (origen === "porCondicion") {
            if (!instantaneaOfertasPorCondicion[posicion]) {
                const error = "No existe la posición"
                throw new Error(error)
            }
            const ofertaUID = instantaneaOfertasPorCondicion[posicion].oferta.ofertaUID
            if (ofertaUIDParaEliminar === ofertaUID) {
                instantaneaOfertasPorCondicion.splice(posicion, 1);
            } else {
                const error = `Dentro de la posición ${posicion}, no se encuentra en ofertaUID ${ofertaUIDParaEliminar}, en esta posición está el ofertaUID ${ofertaUID}`
                throw new Error(error)
            }

        }

        await totalesBasePorRango({
            estructura,
            instantaneaNoches,
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosArray
        })
        constructorEstructuraDescuentos(estructura)
        constructorEstructuraDescuentosReserva(estructura)

        await aplicarDescuento({
            origen: origen,
            ofertasParaAplicarDescuentos: instantaneaOfertasPorCondicion,
            estructura: estructura,
            fechaEntradaReserva_ISO: fechaEntrada,
            fechaSalidaReserva_ISO: fechaSalida
        })

        const capaImpuestos = data.capaImpuestos
        if (capaImpuestos === "si") {
            await aplicarImpuestos({
                estructura,
                origen: "reserva"
            })
        }
    } catch (error) {
        throw error
    }
}