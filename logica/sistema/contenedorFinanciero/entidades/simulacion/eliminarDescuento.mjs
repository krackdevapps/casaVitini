import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";
import { aplicarDescuento } from "../../../ofertas/entidades/reserva/aplicarDescuento.mjs";
import { constructorEstructuraDescuentos } from "../../../ofertas/global/contructorEstructuraDescuentos.mjs";
import { contructorEstructuraDescuentosReserva } from "../../../ofertas/entidades/reserva/contructorEstructuraDescuentosReserva.mjs";
import { totalesBasePorRango } from "../reserva/totalesBasePorRango.mjs";
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs";
import { aplicarImpuestos } from "../reserva/aplicarImpuestos.mjs";
export const eliminarDescuento = async (data) => {
    try {
        const estructura = data.estructura
        const fechaEntrada = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaEntrada,
            nombreCampo: "La fecha de entrada del actualizarDesgloseFinanciero"
        })
        const fechaSalida = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaSalida,
            nombreCampo: "La fecha de salida del actualizarDesgloseFinanciero"
        })
        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada: data.fechaEntrada,
            fechaSalida: data.fechaSalida,
            tipoVector: "diferente"
        })
        const apartamentosArray = validadoresCompartidos.tipos.array({
            array: data.apartamentosArray,
            nombreCampo: "El array de apartamentos en el actualizarDesgloseFinanciero",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "no"
        })
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const ofertaUIDParaEliminar = validadoresCompartidos.tipos.numero({
            number: data?.ofertaUID,
            nombreCampo: "El campo de ofertaUID dentro del actualizarDesgloseFinanciero",
            filtro: "numeroSimple",
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
        const posicion = validadoresCompartidos.tipos.numero({
            number: data.posicion,
            nombreCampo: "El el campo de posicion",
            filtro: "numeroSimple",
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
                const error = "No existe la posicion"
                throw new Error(error)
            }

            const ofertaUID = instantaneaOfertasPorAdministrador[posicion].oferta.ofertaUID
            if (ofertaUIDParaEliminar === ofertaUID) {
                instantaneaOfertasPorAdministrador.splice(posicion, 1);
            }
        }

        if (origen === "porCondicion") {
            if (!instantaneaOfertasPorCondicion[posicion]) {
                const error = "No existe la posicion"
                throw new Error(error)
            }
            const ofertaUID = instantaneaOfertasPorCondicion[posicion].oferta.ofertaUID
            if (ofertaUIDParaEliminar === ofertaUID) {
                instantaneaOfertasPorCondicion.splice(posicion, 1);
            } else {
                const error = `Dentro de la posicion ${posicion}, no se encuentra en ofertaUID ${ofertaUIDParaEliminar}, en esta posicion está el ofertaUID ${ofertaUID}`
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
        contructorEstructuraDescuentosReserva(estructura)

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