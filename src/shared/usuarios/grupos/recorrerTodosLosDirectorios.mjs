
import fs from 'fs';
import path from 'path';
export const recorrerTodosLosDirectorios = async () => {

    const rutas = {
        controladores: [],
        vistas: []
    };
    const raizControladores = "./src/application/administracion"
    const raizVistas = "./ui/vistas/public/administracion"

    function recorrerControladores(carpeta) {
        const elementos = fs.readdirSync(carpeta);

        elementos.forEach((elemento) => {
            const rutaCompleta = path.join(carpeta, elemento);
            const stats = fs.statSync(rutaCompleta);

            if (stats.isDirectory()) {
                recorrerControladores(rutaCompleta);
            } else if (stats.isFile() && path.extname(rutaCompleta) === '.mjs') {
                const rutaFinal = rutaCompleta.split("src/application")[1].split(".mjs")[0]
                rutas.controladores.push(rutaFinal);
            }
        });
    }
    recorrerControladores(raizControladores);
    function recorrerVistas(carpeta) {
        const elementos = fs.readdirSync(carpeta);

        elementos.forEach((elemento) => {
            const rutaCompleta = path.join(carpeta, elemento);
            const stats = fs.statSync(rutaCompleta);

            if (stats.isDirectory()) {
                recorrerVistas(rutaCompleta);
            } else if (stats.isFile() && path.extname(rutaCompleta) === '.ejs') {
                const rutaFinal = rutaCompleta.split("ui/vistas/public")[1].split("/ui.ejs")[0]
                rutas.vistas.push(rutaFinal);
            }
        });
    }
    recorrerVistas(raizVistas);
    return rutas;
}