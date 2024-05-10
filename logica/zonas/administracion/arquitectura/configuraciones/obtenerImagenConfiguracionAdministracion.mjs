import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const obtenerImagenConfiguracionAdministracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si"
        })
        const consultaPerfilConfiguracion = `
                                SELECT 
                                imagen
                                imagen
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1;
                                `;
        const resuelveConsultaPerfilConfiguracion = await conexion.query(consultaPerfilConfiguracion, [apartamentoIDV]);
        if (resuelveConsultaPerfilConfiguracion.rowCount === 0) {
            const error = "No hay ninguna configuracion disponible para este apartamento";
            throw new Error(error);
        }
        if (resuelveConsultaPerfilConfiguracion.rowCount === 1) {
            const imagen = resuelveConsultaPerfilConfiguracion.rows[0].imagen;
            const ok = {
                ok: "Imagen de la configuracion adminsitrativa del apartamento, png codificado en base64",
                imagen: imagen
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}