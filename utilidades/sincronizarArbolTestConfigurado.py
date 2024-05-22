import os
import shutil
import sys

def procesar_directorio(origen, destino):
    # Crear el directorio de destino si no existe
    if not os.path.exists(destino):
        os.makedirs(destino)

    # Recorrer los elementos en el directorio de origen
    for elemento in os.listdir(origen):
        ruta_origen = os.path.join(origen, elemento)
        ruta_destino = os.path.join(destino, elemento)

        # Si el elemento es un directorio, llamar recursivamente a esta función
        if os.path.isdir(ruta_origen):
            procesar_directorio(ruta_origen, ruta_destino)
        elif os.path.isfile(ruta_origen):
            # Si el elemento es un archivo .mjs, crear el archivo .test vacío en el destino
            if ruta_origen.endswith('.mjs'):
                nombre_base = os.path.splitext(elemento)[0]
                archivo_test = os.path.join(destino, f"{nombre_base}.test.js")
                # Crear el archivo .test si no existe
                if not os.path.exists(archivo_test):
                    open(archivo_test, 'a').close()

if __name__ == "__main__":
    origen = "./logica"
    destino ="./test"
    procesar_directorio(origen, destino)
    print("Proceso completado.")
