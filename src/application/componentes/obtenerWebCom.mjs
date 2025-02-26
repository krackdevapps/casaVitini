import { obtenerWebCom_ } from "../../shared/obtenerWebCom.mjs";
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";

export const obtenerWebCom = async (entrada, salida) => {
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


        const comData = await obtenerWebCom_({
            componente: componenteID_array,
            usuario: entrada.session?.usuario,
            rolIDV: entrada.session?.rolIDV

        })
        salida.setHeader('Content-Type', 'application/javascript; charset=UTF-8');

        if (comData.error) {
            salida.statusCode = 404;
            salida.end(comData.errorUI);

        } else if (comData.ok) {
            salida.statusCode = 200;
            salida.end(comData.data);
        } else {
            salida.statusCode = 404;
            salida.end("Error desconocido");
        }


    } catch (errorCapturado) {
        throw errorCapturado
    }
}

