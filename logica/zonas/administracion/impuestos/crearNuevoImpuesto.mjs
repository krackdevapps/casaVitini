import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerImpuestosPorNombreDelImpuesto } from "../../../repositorio/impuestos/obtenerImpuestosPorNombreDelImpuesto.mjs";
import { obtenerTipoValorPorTipoValorIDV } from "../../../repositorio/impuestos/obtenerTipoValorPorTipoValorIDV.mjs";
import { insertarImpuesto } from "../../../repositorio/impuestos/insertarImpuesto.mjs";

export const crearNuevoImpuesto = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const mutex = new Mutex()
        await mutex.acquire();

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

        // Validar si el nombre del impuesto es unico        
        const impuestosPorNombre = await obtenerImpuestosPorNombreDelImpuesto(nombreImpuesto)
        if (impuestosPorNombre.length > 0) {
            const error = "Ya existe un impuesto con ese nombre exacto. Por favor selecciona otro nombre para este impuesto con el fin de tener nombres unicos en los impuestos y poder distingirlos correctamente.";
            throw new Error(error);
        }

        await obtenerTipoValorPorTipoValorIDV(tipoValor)
        // IMPORTANTE Hay que validar APLICAICON SOBRE1
        
        const dataNuevoImpuesto = {
            nombreImpuesto: nombreImpuesto,
            tipoImpositivo: tipoImpositivo,
            tipoValor: tipoValor,
            aplicacionSobre: aplicacionSobre,
            estado: "desactivado"
        }
        const nuevoImpuesto = await insertarImpuesto(dataNuevoImpuesto)
        const ok = {
            ok: "Se ha creado el nuevo impuesto",
            nuevoImpuestoUID: nuevoImpuesto.impuestoUID
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