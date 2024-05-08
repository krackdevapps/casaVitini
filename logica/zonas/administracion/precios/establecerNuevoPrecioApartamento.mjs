import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { resolverApartamentoUI } from "../../../sistema/resolucion/resolverApartamentoUI.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const establecerNuevoPrecioApartamento = async (entrada, salida) => {
    let mutex
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return


        mutex = new Mutex()
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

        const validarApartamento = `
                            SELECT
                            "apartamentoIDV", "estadoConfiguracion"
                            FROM 
                            "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1
                            `;
        const resuelveValidarApartamento = await conexion.query(validarApartamento, [apartamentoIDV]);
        if (resuelveValidarApartamento.rowCount === 0) {
            const error = "No existe el apartamenro";
            throw new Error(error);
        }
        if (resuelveValidarApartamento.rows[0].estadoConfiguracion === "disponible") {
            const error = "No se puede puede establecer un precio a este apartmento cuadno la configuracion esta en modo disponible. Primero desactive la configuracion del apartmento dejandola en estado No disponible y luego podra hacer las modificaciones que necesite";
            throw new Error(error);
        }
        const detallesApartamento = {};
        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
        detallesApartamento.apartamentoUI = apartamentoUI;
        detallesApartamento.apartamentoIDV = apartamentoIDV;
        const insertarNuevoPrecioApartamento = `
                            UPDATE "preciosApartamentos"
                            SET precio = $1
                            WHERE "apartamento" = $2;
                            `;
        const resuelveInsertarNuevoPrecioApartamento = await conexion.query(insertarNuevoPrecioApartamento, [nuevoPrecio, apartamentoIDV]);
        if (resuelveInsertarNuevoPrecioApartamento.rowCount === 0) {
            const error = "No existe ningun perfil de precio que actualizar para este apartamento";
            throw new Error(error);
        }
        const listarPrecioApartamento = `
                            SELECT
                            uid, apartamento, precio, moneda
                            FROM 
                            "preciosApartamentos"
                            WHERE apartamento = $1
                            `;
        const resuelveListarPrecioApartamento = await conexion.query(listarPrecioApartamento, [apartamentoIDV]);
        if (resuelveListarPrecioApartamento.rowCount === 0) {
            const error = "No hay ningun precio de este apartamento en el sistema";
            throw new Error(error);
        }
        const precioNetoApartamentoPorDia = resuelveListarPrecioApartamento.rows[0].precio;
        detallesApartamento.precioNetoPorDia = precioNetoApartamentoPorDia;
        detallesApartamento.totalImpuestos = "0.00";
        detallesApartamento.totalBrutoPordia = precioNetoApartamentoPorDia;
        detallesApartamento.impuestos = [];

        const seleccionarImpuestos = `
                            SELECT
                            nombre, "tipoImpositivo", "tipoValor"
                            FROM
                            impuestos
                            WHERE
                            ("aplicacionSobre" = $1 OR "aplicacionSobre" = $2) AND estado = $3;
    
                            `;
        const resuelveSeleccionarImpuestos = await conexion.query(seleccionarImpuestos, ["totalNeto", "totalReservaNeto", "activado"]);
        if (resuelveSeleccionarImpuestos.rowCount > 0) {

            const impuestosEncontrados = resuelveSeleccionarImpuestos.rows;
            let impuestosFinal;
            let sumaTotalImpuestos = 0;
            impuestosEncontrados.map((detalleImpuesto) => {
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
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        if (mutex) {
            mutex.release();
        }

    }

}