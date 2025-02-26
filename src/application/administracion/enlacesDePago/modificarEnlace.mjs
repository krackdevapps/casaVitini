
import { controlCaducidadEnlacesDePago } from "../../../shared/enlacesDePago/controlCaducidadEnlacesDePago.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { actualizarEnlaceDePagoPorEnlaceUID } from "../../../infraestructure/repository/enlacesDePago/actualizarEnlaceDePagoPorEnlaceUID.mjs";
import { obtenerEnlaceDePagoPorEnlaceUID } from "../../../infraestructure/repository/enlacesDePago/obtenerEnlaceDePagoPorEnlaceUID.mjs";
import { codigoZonaHoraria } from "../../../shared/configuracion/codigoZonaHoraria.mjs";
import { DateTime } from "luxon";

export const modificarEnlace = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 5
        })
        const enlaceUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.enlaceUID,
            nombreCampo: "El campo enlaceUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const horasCaducidad = validadoresCompartidos.tipos.cadena({
            string: entrada.body.horasCaducidad || "72",
            nombreCampo: "El campo horasCaducidad",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
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
            devuelveUnTipoNumber: "si"

        })

        await controlCaducidadEnlacesDePago();
        await obtenerEnlaceDePagoPorEnlaceUID(enlaceUID)
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaDeCaducidad = tiempoZH.plus({ hours: horasCaducidad }).toISO();
        await actualizarEnlaceDePagoPorEnlaceUID({
            nombreEnlace: nombreEnlace,
            descripcion: descripcion,
            cantidad: cantidad,
            fechaDeCaducidad: fechaDeCaducidad,
            enlaceUID: enlaceUID,
        })
        const ok = {
            ok: "Se han actualizado correctamente los datos del enlace."
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}