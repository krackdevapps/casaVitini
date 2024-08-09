import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { actualizarPerfilPrecioPorApartamentoUID } from "../../../repositorio/precios/actualizarPerfilPrecioPorApartamentoUID.mjs";
import { obtenerPerfilPrecioPorApartamentoUID } from "../../../repositorio/precios/obtenerPerfilPrecioPorApartamentoUID.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerImpuestosPorEntidadIDV } from "../../../repositorio/impuestos/obtenerImpuestosPorEntidadIDV.mjs";

export const establecerNuevoPrecioApartamento = async (entrada, salida) => {
    const mutex = new Mutex
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El campo apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const nuevoPrecio = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevoPrecio,
            nombreCampo: "El campo nuevoPrecio",
            filtro: "cadenaConNumerosConDosDecimales",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        if (configuracionApartamento.estadoConfiguracion === "disponible") {
            const error = "No se puede establecer un precio a este apartamento cuando la configuración está en modo disponible. Primero desactive la configuración del apartamento dejándola en estado no disponible y luego podrá hacer las modificaciones que necesite.";
            throw new Error(error);
        }
        const detallesApartamento = {};
        const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })).apartamentoUI
        detallesApartamento.apartamentoUI = apartamentoUI;
        detallesApartamento.apartamentoIDV = apartamentoIDV;

        const dataActualizarPerfilPrecio = {
            nuevoPrecio: nuevoPrecio,
            apartamentoIDV: apartamentoIDV,

        }
        await actualizarPerfilPrecioPorApartamentoUID(dataActualizarPerfilPrecio)

        const perfilDePrecio = await obtenerPerfilPrecioPorApartamentoUID(apartamentoIDV)
        const precioNetoApartamentoPorNoche = perfilDePrecio.precio;
        detallesApartamento.precioNetoPorNoche = precioNetoApartamentoPorNoche;
        detallesApartamento.totalImpuestos = "0.00";
        detallesApartamento.totalBrutoPorNoche = precioNetoApartamentoPorNoche;
        detallesApartamento.impuestos = [];


        const listaImpuestos = await obtenerImpuestosPorEntidadIDV({
            entidadIDV: "reserva",
            estadoIDV: "activado"
        })


        if (listaImpuestos.length > 0) {

            let sumaTotalImpuestos = 0;
            listaImpuestos.forEach((detalleImpuesto) => {
                const tipoImpositivo = detalleImpuesto.tipoImpositivo;
                const nombreImpuesto = detalleImpuesto.nombre;
                const tipoValorIDV = detalleImpuesto.tipoValorIDV;
                const impuestoUID = detalleImpuesto.impuestoUID

                const impuestosFinal = {
                    nombreImpuesto,
                    tipoImpositivo,
                    tipoValorIDV,
                    impuestoUID
                };
                if (tipoValorIDV === "porcentaje") {
                    const resultadoApliacado = (precioNetoApartamentoPorNoche * (tipoImpositivo / 100)).toFixed(2);
                    sumaTotalImpuestos += parseFloat(resultadoApliacado);
                    impuestosFinal.totalImpuesto = resultadoApliacado;
                }
                if (tipoValorIDV === "tasa") {
                    sumaTotalImpuestos += parseFloat(tipoImpositivo);
                    impuestosFinal.totalImpuesto = tipoImpositivo;
                }
                (detallesApartamento.impuestos).push(impuestosFinal);
            });
            let totalNocheBruto = Number(sumaTotalImpuestos) + Number(precioNetoApartamentoPorNoche);
            totalNocheBruto = totalNocheBruto.toFixed(2);
            detallesApartamento.totalImpuestos = sumaTotalImpuestos.toFixed(2);
            detallesApartamento.totalBrutoPorNoche = totalNocheBruto;
        }
        const ok = {
            ok: detallesApartamento
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}