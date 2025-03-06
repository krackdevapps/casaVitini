class MiBoton extends HTMLElement {
    // Método privado
    #cambiarColor() {
        const boton = this.shadowRoot.querySelector('#miBoton');
        boton.style.backgroundColor = boton.style.backgroundColor === 'red' ? '#007bff' : 'red';
    }


    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                button {
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    font-size: 16px;
                    cursor: pointer;
                    border-radius: 5px;
                }
                button:hover {
                    background-color: #0056b3;
                }
            </style>
            <button id="miBoton">¡Clic aquí!</button>
        `;
    }
    connectedCallback() {
        this.shadowRoot.querySelector('#miBoton').addEventListener('click', () => {
            this.#cambiarColor(); // Llamada al método privado
        });

    }

    // Método público
    resetColor() {
        const boton = this.shadowRoot.querySelector('#miBoton');
        boton.style.backgroundColor = '#007bff';
    }
}

// Definimos el nuevo elemento
customElements.define('mi-boton', MiBoton);
