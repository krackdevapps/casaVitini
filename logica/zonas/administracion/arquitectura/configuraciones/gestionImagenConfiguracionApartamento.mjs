import { conexion } from "../../../../componentes/db.mjs";

export const gestionImagenConfiguracionApartamento = async (entrada, salida) => {
    try {
        const apartamentoIDV = entrada.body.apartamentoIDV;
        const contenidoArchivo = entrada.body.contenidoArchivo;
        const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
        if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
            const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin pesacios";
            throw new Error(error);
        }
        const filtroBase64 = /^[A-Za-z0-9+/=]+$/;
        if (typeof contenidoArchivo !== "string" || !filtroBase64.test(contenidoArchivo)) {
            const error = "El campo contenido archivo solo acepta archivos codificados en base64";
            throw new Error(error);
        }
        const esImagenPNG = (contenidoArchivo) => {
            const binarioMagicoPNG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
            // Decodifica la cadena base64 a un buffer
            const buffer = Buffer.from(contenidoArchivo, 'base64');
            // Compara los primeros 8 bytes del buffer con el binario mágico
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
        await conexion.query('BEGIN'); // Inicio de la transacción
        const validarIDV = `
                                    SELECT 
                                    "estadoConfiguracion"
                                    FROM "configuracionApartamento"
                                    WHERE "apartamentoIDV" = $1
                                    `;
        const resuelveValidarIDV = await conexion.query(validarIDV, [apartamentoIDV]);
        if (resuelveValidarIDV.rowCount === 0) {
            const error = "No existe el apartamento como entidad. Primero crea la entidad y luego podras crear la configuiracíon";
            throw new Error(error);
        }
        if (resuelveValidarIDV.rows[0].estadoConfiguracion === "disponible") {
            const error = "No se puede actualizar la imagen de una configuracion de apartamento cuando esta disponbile,cambie el estado primero";
            throw new Error(error);
        }
        const actualizarImagenConfiguracion = `
                                UPDATE "configuracionApartamento"
                                SET imagen = $1
                                WHERE "apartamentoIDV" = $2;
                                `;
        const resuelveActualizarImagenConfiguracion = await conexion.query(actualizarImagenConfiguracion, [contenidoArchivo, apartamentoIDV]);
        if (resuelveActualizarImagenConfiguracion.rowCount === 0) {
            const error = "No se ha podido actualizar la imagen del apartmento reintentalo";
            throw new Error(error);
        }
        if (resuelveActualizarImagenConfiguracion.rowCount === 1) {
            const ok = {
                ok: "Se ha actualizado imagen correctamnte",
                imagen: String(contenidoArchivo)
            };
            salida.json(ok);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}