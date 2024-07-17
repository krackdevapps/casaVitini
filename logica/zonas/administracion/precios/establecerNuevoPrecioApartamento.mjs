import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { actualizarPerfilPrecioPorApartamentoUID } from "../../../repositorio/precios/actualizarPerfilPrecioPorApartamentoUID.mjs";
import { obtenerPerfilPrecioPorApartamentoUID } from "../../../repositorio/precios/obtenerPerfilPrecioPorApartamentoUID.mjs";
import { obtenerImpuestosPorAplicacionSobre } from "../../../repositorio/impuestos/obtenerImpuestosPorAplicacionSobre.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

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
            nombreCampo: "El campo nuevoPreci",
            filtro: "cadenaConNumerosConDosDecimales",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
     
        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        if (configuracionApartamento.estadoConfiguracion === "disponible") {
            const error = "No se puede puede establecer un precio a este apartmento cuadno la configuracion esta en modo disponible. Primero desactive la configuracion del apartmento dejandola en estado No disponible y luego podra hacer las modificaciones que necesite";
            throw new Error(error);
        }
        const detallesApartamento = {};
        const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        }).apartamentoUI
        detallesApartamento.apartamentoUI = apartamentoUI;
        detallesApartamento.apartamentoIDV = apartamentoIDV;       
  
        const dataActualizarPerfilPrecio = {
            nuevoPrecio:nuevoPrecio,
            apartamentoIDV:apartamentoIDV,

        }
        await actualizarPerfilPrecioPorApartamentoUID(dataActualizarPerfilPrecio)
        
        const perfilDePrecio = await obtenerPerfilPrecioPorApartamentoUID(apartamentoIDV)
        const precioNetoApartamentoPorDia = perfilDePrecio.precio;
        detallesApartamento.precioNetoPorDia = precioNetoApartamentoPorDia;
        detallesApartamento.totalImpuestos = "0.00";
        detallesApartamento.totalBrutoPordia = precioNetoApartamentoPorDia;
        detallesApartamento.impuestos = [];

        const dataImpuestosPorAplicacion = {
            aplicacionSobre: ["totalNeto", "totalReservaNeto"],
            estado: "activado"
        }
        const listaImpuestos= await  obtenerImpuestosPorAplicacionSobre(dataImpuestosPorAplicacion)
        if (listaImpuestos.length > 0) {

            let impuestosFinal;
            let sumaTotalImpuestos = 0;
            listaImpuestos.forEach((detalleImpuesto) => {
                const tipoImpositivo = detalleImpuesto.tipoImpositivo;
                const nombreImpuesto = detalleImpuesto.nombre;
                const tipoValor = detalleImpuesto.tipoValor;
                impuestosFinal = {
                    "nombreImpuesto": nombreImpuesto,
                    "tipoImpositivo": tipoImpositivo,
                    "tipoValor": tipoValor,
                };
                if (tipoValor === "porcentaje") {
                    const resultadoApliacado = (precioNetoApartamentoPorDia * (tipoImpositivo / 100)).toFixed(2);
                    sumaTotalImpuestos += parseFloat(resultadoApliacado);
                    impuestosFinal.totalImpuesto = resultadoApliacado;
                }
                if (tipoValor === "tasa") {
                    sumaTotalImpuestos += parseFloat(tipoImpositivo);
                    impuestosFinal.totalImpuesto = tipoImpositivo;
                }
                (detallesApartamento.impuestos).push(impuestosFinal);
            });
            let totalDiaBruto = Number(sumaTotalImpuestos) + Number(precioNetoApartamentoPorDia);
            totalDiaBruto = totalDiaBruto.toFixed(2);
            detallesApartamento.totalImpuestos = sumaTotalImpuestos.toFixed(2);
            detallesApartamento.totalBrutoPordia = totalDiaBruto;
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