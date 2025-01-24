casaVitini.view = {

    arranque: async function () {

        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladoURL.parametros

        if (Object.keys(parametros).length === 1 && parametros.hasOwnProperty("reserva")) {


            const preconfirmarReserva = {
                zona: "componentes/resolverQR",
                codigoIDV: "reserva",
                reservaUID: parametros.reserva
            }
            const respuestaServidor = await casaVitini.shell.servidor(preconfirmarReserva)


            if (respuestaServidor?.error) {
                return this.errorUI(respuestaServidor.error)
            } else if (respuestaServidor.ok) {

                const url = respuestaServidor.url
                return casaVitini.shell.navegacion.controladorVista({
                    vista: url
                })
            }
        } else {
            this.campoUI()
        }
    },
    parametroNoReconocido: () => {


        const main = document.querySelector("main")
        main.innerHTML = null

        const info = document.createElement("div")
        info.classList.add(
            "textoCentrado",
            "negrita",
            "padding12"

        )
        info.textContent = "No existe nada en esta dirección :)"
        main.appendChild(info)

        const boton = document.createElement("a")
        boton.classList.add(
            "botonV1",
            "comportamientoBoton",
            "areaSinDecoracionPredeterminada",
            "margin10"
        )
        boton.textContent = "Ir a Administración"
        boton.setAttribute("href", "/administracion")
        boton.setAttribute("vista", "/administracion")
        boton.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        main.appendChild(boton)

    },
    campoUI: () => {

        const titulo = document.createElement('p');
        titulo.className = 'titulo';
        titulo.textContent = 'Escanea el codigo QR';
        const marcoElasticoRelativo = document.createElement('div');
        marcoElasticoRelativo.className = 'marcoElasticoRelativo';
        const marcoElastico = document.createElement('div');
        marcoElastico.className = 'marcoElastico';
        const contenedorCrearCuenta = document.createElement('form');
        contenedorCrearCuenta.className = 'miCasa_crearCuenta_contenedorCrearCuenta';
        const texto = document.createElement('p');
        texto.className = 'texto padding6';
        texto.textContent = 'Casa Vitini puede proporcionar documentos como resguardos de reservas con códigos QR. Estos códigos están situados en la parte superior derecha de los documentos y son cuadrados compuestos por cuadrados internos. Estos códigos pueden ser leídos por teléfonos móviles, entre otros dispositivos. Para leer estos códigos, puedes usar la aplicación de cámara de tu teléfono. Si al abrir la cámara y escanear el código QR no aparece ninguna información, entra en los ajustes de la app de cámara y asegúrate de que esté activada la función de escanear códigos QR. Si aun así no consigues escanear el código QR, busca en la tienda de aplicaciones de tu teléfono aplicaciones para escanear códigos QR.';


        const secction = document.querySelector("main")
        secction.appendChild(titulo);
        contenedorCrearCuenta.appendChild(texto);
        marcoElastico.appendChild(contenedorCrearCuenta);
        marcoElasticoRelativo.appendChild(marcoElastico);
        secction.appendChild(marcoElasticoRelativo);
    },
    errorUI: (mensaje) => {

        const titulo = document.createElement('p');
        titulo.className = 'titulo';
        titulo.textContent = 'Tu codigo qr ha producido un error';
        const marcoElasticoRelativo = document.createElement('div');
        marcoElasticoRelativo.className = 'marcoElasticoRelativo';
        const marcoElastico = document.createElement('div');
        marcoElastico.className = 'marcoElastico';
        const contenedorCrearCuenta = document.createElement('form');
        contenedorCrearCuenta.className = 'miCasa_crearCuenta_contenedorCrearCuenta';
        const texto = document.createElement('p');
        texto.classList.add(
            "texto", "padding6",
            "textoCentrado"
        )
        texto.textContent = mensaje


        const secction = document.querySelector("main")
        secction.appendChild(titulo);
        contenedorCrearCuenta.appendChild(texto);
        marcoElastico.appendChild(contenedorCrearCuenta);
        marcoElasticoRelativo.appendChild(marcoElastico);
        secction.appendChild(marcoElasticoRelativo);
    },

}