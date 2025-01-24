
export const sharedMethods = {
    controladorCuentaAtras: function (data) {
        let segundosDeLaCuentaAtras = data.segundosDeLaCuentaAtras
        const zonaHoraria = data.zonaHoraria
        const horaLimiteDelMismoDia = data.horaLimiteDelMismoDia
        const instanciaUID = data.instanciaUID
        const selectorDestino = `[instanciaUID="${instanciaUID}"] [contenedor=cuentaAtras]`

        const selector = document.querySelector(selectorDestino);


        const actualizarCuenta = () => {


            const selectorRenderizado = document.querySelector(selectorDestino);


            if (!selectorRenderizado) {

                clearInterval(countdownInterval);
            }

            const days = Math.floor(segundosDeLaCuentaAtras / (24 * 60 * 60));
            const hours = Math.floor((segundosDeLaCuentaAtras % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((segundosDeLaCuentaAtras % (60 * 60)) / 60);
            const seconds = segundosDeLaCuentaAtras % 60;
            let cuentraAtrasFormateadaUI

            if (days > 0) {
                cuentraAtrasFormateadaUI = `${days} Días ${hours} Horas ${minutes} Minutos ${seconds < 10 ? '0' : ''}${seconds} Segundos`;
            } else if (hours > 0) {
                cuentraAtrasFormateadaUI = `${hours} Horas ${minutes} Minutos ${seconds < 10 ? '0' : ''}${seconds} Segundos`;
            } else if (minutes > 0) {
                cuentraAtrasFormateadaUI = `${minutes} Minutos ${seconds < 10 ? '0' : ''}${seconds} Segundos`;
            } else if (seconds > 0) {
                cuentraAtrasFormateadaUI = `${seconds < 10 ? '0' : ''}${seconds} Segundos`;
            }


            selector.textContent = `Tiempo restante reservar hoy: ${cuentraAtrasFormateadaUI}`;


            segundosDeLaCuentaAtras--;


            if (segundosDeLaCuentaAtras < 0) {
                clearInterval(countdownInterval);
                const selectorContenedor = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (selectorContenedor) {
                    selectorContenedor.innerHTML = null
                    selectorContenedor.textContent = this.mensajeNoAceptacion({
                        horaLimite: horaLimiteDelMismoDia,
                        zonaHoraria: zonaHoraria
                    });
                }

            }
        }
        const countdownInterval = setInterval(actualizarCuenta, 1000);
        actualizarCuenta();
    },
    mensajeNoAceptacion: (data) => {
        const horaLimite = data.horaLimite
        const zonaHoraria = data.zonaHoraria
        return `¡Ya no aceptamos reservas con fecha de entrada para hoy online pasadas las ${horaLimite} (Hora local en zona horaria de ${zonaHoraria} en formato 24H). Póngase en contacto con nosotros si desea hacer su reserva con fecha de entrada para hoy. Si desea realizar una reserva con fecha de entrada para mañana o más adelante, puede seguir realizándola online. Gracias.`
    },
}