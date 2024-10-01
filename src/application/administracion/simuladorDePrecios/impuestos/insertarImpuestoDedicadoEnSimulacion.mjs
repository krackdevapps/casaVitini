import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { actualizarDesgloseFinacieroPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroPorSimulacionUID.mjs"
import { insertarImpuestoPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/insertarImpuestoPorSimulacionUID.mjs"
import { obtenerImpuestoPorImpuestoUIDPorSimulacionUID_simple } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/obtenerImpuestoPorImpuestoUIDPorSimulacionUID_simple.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"
import { procesador } from "../../../../shared/contenedorFinanciero/procesador.mjs"
import { generarDesgloseSimpleGuardarlo } from "../../../../shared/simuladorDePrecios/generarDesgloseSimpleGuardarlo.mjs"
import { validarDataGlobalDeSimulacion } from "../../../../shared/simuladorDePrecios/validarDataGlobalDeSimulacion.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"

export const insertarImpuestoDedicadoEnSimulacion = async (entrada) => {
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

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El identificador universal de la simulacionUID (simulacionUID)",
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
        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)
        await validarDataGlobalDeSimulacion(simulacionUID)



        const controlCodigoUnico = async () => {
            const longitudCodigo = 10;
            let codigoGenerado;
            let codigoExiste;
            do {
                const codigoGeneradoInstnacia = Number(generarCadenaAleatoria(longitudCodigo)) + 0
                codigoGenerado = codigoGeneradoInstnacia
                codigoExiste = await obtenerImpuestoPorImpuestoUIDPorSimulacionUID_simple({
                    simulacionUID,
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
        await insertarImpuestoPorSimulacionUID({
            simulacionUID,
            impuesto: estructura
        })
        await generarDesgloseSimpleGuardarlo(simulacionUID)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha insertado el impuesto correctamente, el impuesto dedicado en la reserva.",
            simulacionUID,
            impuestoDedicado: estructura
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}