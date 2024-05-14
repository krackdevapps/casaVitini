import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerImpuestosPorNombreDelImpuesto } from "../../../repositorio/impuestos/obtenerImpuestosPorNombreDelImpuesto.mjs";
import { actualizarImpuesto } from "../../../repositorio/impuestos/actualizarImpuesto.mjs";
import { obtenerImpuestosPorImppuestoUID } from "../../../repositorio/impuestos/obtenerImpuestosPorImpuestoUID.mjs";

export const guardarModificacionImpuesto = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();

        const impuestoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.impuestoUID,
            nombreCampo: "El UID del impuesto",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const nombreImpuesto = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreImpuesto,
            nombreCampo: "El nombre del impuesto",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const tipoImpositivo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoImpositivo,
            nombreCampo: "El tipo impositivo",
            filtro: "cadenaConNumerosConDosDecimales",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const tipoValor = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoValor,
            nombreCampo: "El tipo valor",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const aplicacionSobre = validadoresCompartidos.tipos.cadena({
            string: entrada.body.aplicacionSobre,
            nombreCampo: "El campo de la aplicacion sobre",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const estado = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estado,
            nombreCampo: "El campo de la aplicacion sobre",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        // Validar si el nombre del impuesto es unico        
        const impuestosPorNombre = await obtenerImpuestosPorNombreDelImpuesto(nombreImpuesto)
        for (const detallesDelImpuesto of impuestosPorNombre) {
            if (detallesDelImpuesto.impuestoUID !== impuestoUID) {
                const error = "Ya existe un impuesto con ese nombre exacto. Por favor selecciona otro nombre para este impuesto con el fin de tener nombres unicos en los impuestos y poder distingirlos correctamente.";
                throw new Error(error);
            }
        }

        validadoresCompartidos.filtros.estados(estado)

        await obtenerTipoValorPorTipoValorIDV(tipoValor)
        await obtenerAplicacionIDVporAplicacionIDV(aplicacionSobre)

        const dataActualizarImpuesto = {
            impuestoUID: impuestoUID,
            nombreImpuesto: nombreImpuesto,
            tipoImpositivo: tipoImpositivo,
            tipoValor: tipoValor,
            aplicacionSobre: aplicacionSobre,
            estado: estado,
        }

        await actualizarImpuesto(dataActualizarImpuesto)

        const perfilImpuesto = await obtenerImpuestosPorImppuestoUID(impuestoUID)
        const ok = {
            ok: "El impuesto se ha actualizado correctamente",
            detallesImpuesto: perfilImpuesto
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}