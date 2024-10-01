import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { actualizarDesgloseFinacieroPorReservaUID } from "../../../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroPorReservaUID.mjs"
import { insertarImpuestoPorReservaUID } from "../../../../../infraestructure/repository/reservas/transacciones/impuestos/insertarImpuestoPorReservaUID.mjs"
import { obtenerImpuestoPorImpuestoUIDPorReservaUID_simple } from "../../../../../infraestructure/repository/reservas/transacciones/impuestos/obtenerImpuestoPorImpuestoUIDPorReservaUID_simple.mjs"
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs"
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs"
import { procesador } from "../../../../../shared/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"

export const insertarImpuestoDedicadoEnReserva = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 4
        })
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const tipoImpositivo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoImpositivo,
            nombreCampo: "El tipoImpositivo",
            filtro: "cadenaConNumerosConDosDecimales",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no"
        })
        const tipoValorIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoValorIDV,
            nombreCampo: "El tipoValorIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const nombreImpuesto = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreImpuesto,
            nombreCampo: "El nombreImpuesto",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const generarCadenaAleatoria = (longitud) => {
            const caracteres = '0123456789';
            let cadenaAleatoria = '';
            for (let i = 0; i < longitud; i++) {
                const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                cadenaAleatoria += caracteres.charAt(indiceAleatorio);
            }
            return cadenaAleatoria;
        };

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, es inmutable."
            throw new Error(error)
        }

        const controlCodigoUnico = async () => {
            const longitudCodigo = 10;
            let codigoGenerado;
            let codigoExiste;
            do {
                const codigoGeneradoInstnacia = Number(generarCadenaAleatoria(longitudCodigo)) + 0
                codigoGenerado = codigoGeneradoInstnacia
                codigoExiste = await obtenerImpuestoPorImpuestoUIDPorReservaUID_simple({
                    reservaUID,
                    impuestoUID: codigoGenerado
                });
            } while (codigoExiste);
            return codigoGenerado;
        }

        const codigoGenerado = await controlCodigoUnico();
        const estructura = {
            impuestoUID: codigoGenerado,
            nombre: nombreImpuesto,
            tipoImpositivo: tipoImpositivo,
            tipoValorIDV: tipoValorIDV,
            entidadIDV: "reserva",
            estadoIDV: "activado",
            impuestoTVI: null
        }


        await campoDeTransaccion("iniciar")
        await insertarImpuestoPorReservaUID({
            reservaUID,
            impuesto: estructura
        })
        await actualizadorIntegradoDesdeInstantaneas(reservaUID)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha insertado el impuesto correctamente el impuesto dedicado en la reserva",
            reservaUID,
            impuestoDedicado: estructura
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}