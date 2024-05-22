
import { controlCaducidadEnlacesDePago } from "../../../sistema/enlacesDePago/controlCaducidadEnlacesDePago.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

import { actualizarEnlaceDePagoPorEnlaceUID } from "../../../repositorio/enlacesDePago/actualizarEnlaceDePagoPorEnlaceUID.mjs";
import { obtenerEnlaceDePagoPorEnlaceUID } from "../../../repositorio/enlacesDePago/obtenerEnlaceDePagoPorEnlaceUID.mjs";

export const modificarEnlace = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const enlaceUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.enlaceUID,
            nombreCampo: "El campo enlaceUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const horasCaducidad = validadoresCompartidos.tipos.cadena({
            string: entrada.body.horasCaducidad || 72,
            nombreCampo: "El campo horasCaducidad",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const nombreEnlace = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreEnlace,
            nombreCampo: "El campo del nombreEnlace",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const descripcion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.descripcion,
            nombreCampo: "El campo del descripcion",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        const cantidad = validadoresCompartidos.tipos.cadena({
            string: entrada.body.cantidad,
            nombreCampo: "El campo cantidad",
            filtro: "cadenaConNumerosConDosDecimales",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        await controlCaducidadEnlacesDePago();       
        await obtenerEnlaceDePagoPorEnlaceUID(enlaceUID)
        const fechaDeCaducidad = new Date(fechaActual.getTime() + (horasCaducidad * 60 * 60 * 1000));
        await actualizarEnlaceDePagoPorEnlaceUID({
            nombreEnlace: nombreEnlace,
            descripcion: descripcion,
            cantidad: cantidad,
            fechaDeCaducidad: fechaDeCaducidad,
            enlaceUID: enlaceUID,
        })
        const ok = {
            ok: "Se ha actualizado corratmente los datos del enlace"
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}