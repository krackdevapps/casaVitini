import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { actualizarImagenDelApartamentoPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/actualizarImagenDelApartamentoPorApartamentoIDV.mjs";
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";

export const gestionImagenConfiguracionApartamento = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const contenidoArchivo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.contenidoArchivo,
            nombreCampo: "El campo del contenidoArchivo",
            filtro: "cadenaBase64",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const esImagenPNG = (contenidoArchivo) => {
            const binarioMagicoPNG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
            const buffer = Buffer.from(contenidoArchivo, 'base64');
            return buffer.subarray(0, 8).compare(binarioMagicoPNG) === 0;
        };
        const esImagenTIFF = (contenidoArchivo) => {
            const binarioMagicoTIFF = Buffer.from([73, 73, 42, 0]); // Puedes ajustar estos valores según el formato TIFF que estés buscando
            const buffer = Buffer.from(contenidoArchivo, 'base64');
            return buffer.subarray(0, 4).compare(binarioMagicoTIFF) === 0 || buffer.subarray(0, 4).compare(Buffer.from([77, 77, 0, 42])) === 0; // Otro formato posible
        };
        const esImagenJPEG = (contenidoArchivo) => {
            const binarioMagicoJPEG = Buffer.from([255, 216, 255]);
            const buffer = Buffer.from(contenidoArchivo, 'base64');
            return buffer.subarray(0, 3).compare(binarioMagicoJPEG) === 0;
        };
        if (esImagenPNG(contenidoArchivo)) {
        } else if (esImagenTIFF(contenidoArchivo)) {
        } else if (esImagenJPEG(contenidoArchivo)) {
        } else {
            const error = "Solo se acetan imagenes PNG, TIFF, JPEG y JPG.";
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")

        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })

        if (configuracionApartamento.estadoConfiguracionIDV === "disponible") {
            const error = "No se puede actualizar la imagen de una configuración de apartamento cuando está disponible. Cambie el estado primero.";
            throw new Error(error);
        }
        await actualizarImagenDelApartamentoPorApartamentoIDV({
            apartamentoIDV,
            imagen: contenidoArchivo
        })
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha actualizado la imagen correctamente",
            imagen: String(contenidoArchivo)
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}