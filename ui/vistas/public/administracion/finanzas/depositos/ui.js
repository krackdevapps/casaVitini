casaVitini.view = {
    start: function () {

        const granuladorURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladorURL.parametros

        if (parametros?.deposito) {
            const zona = parametros?.zona
            if (!zona) {
                this.detallesDelDeposito.arranque({
                    deposito: parametros.deposito
                })
            }
        } else {
            this.portada.arranque()
        }


    },
    portada: {
        arranque: function () {






        }
    }


}