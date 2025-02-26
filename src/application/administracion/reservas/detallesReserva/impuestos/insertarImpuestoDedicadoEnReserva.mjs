import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { insertarImpuestoPorReservaUID } from "../../../../../infraestructure/repository/reservas/transacciones/impuestos/insertarImpuestoPorReservaUID.mjs"
import { obtenerImpuestoPorImpuestoUIDPorReservaUID_simple } from "../../../../../infraestructure/repository/reservas/transacciones/impuestos/obtenerImpuestoPorImpuestoUIDPorReservaUID_simple.mjs"
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs"
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs"
import { validarImpuesto } from "../../../../../shared/impuestos/validarImpuesto.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"

export const insertarImpuestoDedicadoEnReserva = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const impuesto = entrada.body
        const impuestoValidado = validarImpuesto(impuesto)


        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, es inmutable."
            throw new Error(error)
        }
        const entidadIDV = impuestoValidado.entidadIDV
        const nombre = impuestoValidado.nombre
        const tipoImpositivo = impuestoValidado.tipoImpositivo
        const tipoValorIDV = impuestoValidado.tipoValorIDV
        const generarCadenaAleatoria = (longitud) => {
            const caracteres = '0123456789';
            let cadenaAleatoria = '';
            for (let i = 0; i < longitud; i++) {
                const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                cadenaAleatoria += caracteres.charAt(indiceAleatorio);
            }
            return cadenaAleatoria;
        };


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
            nombre: nombre,
            tipoImpositivo: tipoImpositivo,
            tipoValorIDV: tipoValorIDV,
            entidadIDV:entidadIDV,
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