
import { conexion } from "../../../componentes/db.mjs";
import { controlCaducidadEnlacesDePago } from "../../../sistema/controlCaducidadEnlacesDePago.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const modificarEnlace = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

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
            sePermiteVacio: "si",
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
        const validarEnlaceUID = await conexion.query(`SELECT reserva FROM "enlacesDePago" WHERE "enlaceUID" = $1`, [enlaceUID]);
        if (validarEnlaceUID.rowCount === 0) {
            const error = "No existe el enlace de pago verifica el enlaceUID";
            throw new Error(error);
        }
        const fechaDeCaducidad = new Date(fechaActual.getTime() + (horasCaducidad * 60 * 60 * 1000));
        const actualizarEnlace = `
                            UPDATE "enlacesDePago"
                            SET 
                            "nombreEnlace" = $1,
                            descripcion = $2,
                            cantidad = $3,
                            caducidad = $4
                            WHERE reserva = $5;
                            `;
        const datosParaActualizar = [
            nombreEnlace,
            descripcion,
            cantidad,
            fechaDeCaducidad
        ];
        const resuelveActualizarEnlace = await conexion.query(actualizarEnlace, datosParaActualizar);
        if (resuelveActualizarEnlace.rowCount === 0) {
            const error = "No se ha podido actualizar los datos del enlace, reintentalo.";
            throw new Error(error);
        }
        if (resuelveActualizarEnlace.rowCount === 1) {
            const ok = {
                "ok": "Se ha actualizado corratmente los datos del enlace"
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}