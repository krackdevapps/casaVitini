import { obtenerImagenenPorUID } from "../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/obtenerImagenenPorUID.mjs";
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";

export const obtenerImagenComoArchivo = async (entrada, salida) => {
    try {
        const componenteID_pre = entrada.url.toLowerCase()
        const componente_val = validadoresCompartidos.tipos.cadena({
            string: componenteID_pre,
            nombreCampo: "La ruta del componente",
            filtro: "url",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const componenteID_array = componente_val.split("/").filter(n => n)
        componenteID_array.shift()
        const imagenUID_pre = componenteID_array[1]

        const imagenUID = validadoresCompartidos.tipos.cadena({
            string: imagenUID_pre,
            nombreCampo: "imagenUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const imagen = await obtenerImagenenPorUID(imagenUID)    
        if (!imagen) {
            salida.statusCode = 404;
            salida.end("Error desconocido");
        } else {
            salida.setHeader('Content-Type', 'image/jpeg');
            const imagenBase64 = imagen.imagenBase64
            const buffer = Buffer.from(imagenBase64, 'base64');
            salida.statusCode = 200;
            salida.end(buffer);
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

