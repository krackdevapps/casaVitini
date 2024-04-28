--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2 (Postgres.app)
-- Dumped by pg_dump version 16.2 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    uid integer NOT NULL,
    nombre text,
    "primerApellido" text,
    "segundoApellido" text,
    pasaporte text,
    telefono text,
    email text,
    notas text
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- Name: Clientes_ID_Cliente_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clientes ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Clientes_ID_Cliente_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservas (
    reserva integer NOT NULL,
    entrada date NOT NULL,
    salida date NOT NULL,
    "estadoReserva" text NOT NULL,
    "estadoPago" text,
    origen text,
    creacion timestamp without time zone,
    "fechaCancelacion" timestamp without time zone,
    "UID" uuid
);


ALTER TABLE public.reservas OWNER TO postgres;

--
-- Name: Reservas_Reserva_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.reservas ALTER COLUMN reserva ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Reservas_Reserva_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: apartamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.apartamentos (
    apartamento text NOT NULL,
    "apartamentoUI" text
);


ALTER TABLE public.apartamentos OWNER TO postgres;

--
-- Name: apartamentosCaracteristicas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."apartamentosCaracteristicas" (
    uid integer NOT NULL,
    "apartamentoIDV" text,
    caracteristica text
);


ALTER TABLE public."apartamentosCaracteristicas" OWNER TO postgres;

--
-- Name: apartamentosCaracteristicas_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."apartamentosCaracteristicas" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."apartamentosCaracteristicas_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: bloqueosApartamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."bloqueosApartamentos" (
    uid integer NOT NULL,
    apartamento text,
    "tipoBloqueo" text,
    entrada date,
    salida date,
    motivo text,
    zona text
);


ALTER TABLE public."bloqueosApartamentos" OWNER TO postgres;

--
-- Name: bloqueosApartamentos_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."bloqueosApartamentos" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."bloqueosApartamentos_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: calendariosSincronizados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."calendariosSincronizados" (
    uid integer NOT NULL,
    url text,
    nombre text,
    "apartamentoIDV" text,
    "plataformaOrigen" text,
    "dataIcal" text,
    "uidPublico" text
);


ALTER TABLE public."calendariosSincronizados" OWNER TO postgres;

--
-- Name: calendariosSincronizados_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."calendariosSincronizados" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."calendariosSincronizados_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: camas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camas (
    cama text NOT NULL,
    "camaUI" text,
    capacidad integer NOT NULL
);


ALTER TABLE public.camas OWNER TO postgres;

--
-- Name: comportamientoPrecios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."comportamientoPrecios" (
    uid integer NOT NULL,
    "fechaInicio" date,
    "fechaFinal" date,
    explicacion text,
    "nombreComportamiento" text,
    estado text
);


ALTER TABLE public."comportamientoPrecios" OWNER TO postgres;

--
-- Name: comportamientoPreciosApartamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."comportamientoPreciosApartamentos" (
    uid integer NOT NULL,
    "apartamentoIDV" text,
    "comportamientoUID" integer NOT NULL,
    simbolo text,
    cantidad numeric(10,2)
);


ALTER TABLE public."comportamientoPreciosApartamentos" OWNER TO postgres;

--
-- Name: comportamientoPreciosApartamentos_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."comportamientoPreciosApartamentos" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."comportamientoPreciosApartamentos_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: comportamientoPrecios_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."comportamientoPrecios" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."comportamientoPrecios_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: configuracionApartamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."configuracionApartamento" (
    uid integer NOT NULL,
    "apartamentoIDV" text NOT NULL,
    "estadoConfiguracion" text NOT NULL,
    imagen text
);


ALTER TABLE public."configuracionApartamento" OWNER TO postgres;

--
-- Name: configuracionApartamentoDisponibildiad_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."configuracionApartamento" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."configuracionApartamentoDisponibildiad_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: configuracionHabitacionesDelApartamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."configuracionHabitacionesDelApartamento" (
    uid integer NOT NULL,
    apartamento text NOT NULL,
    habitacion text NOT NULL
);


ALTER TABLE public."configuracionHabitacionesDelApartamento" OWNER TO postgres;

--
-- Name: configuracionApartamento_UID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."configuracionHabitacionesDelApartamento" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."configuracionApartamento_UID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: configuracionCamasEnHabitacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."configuracionCamasEnHabitacion" (
    uid integer NOT NULL,
    habitacion integer NOT NULL,
    cama text NOT NULL
);


ALTER TABLE public."configuracionCamasEnHabitacion" OWNER TO postgres;

--
-- Name: configuracionGlobal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."configuracionGlobal" (
    "configuracionUID" text,
    valor text
);


ALTER TABLE public."configuracionGlobal" OWNER TO postgres;

--
-- Name: configuracionHabitacion_UID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."configuracionCamasEnHabitacion" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."configuracionHabitacion_UID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: datosDeUsuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."datosDeUsuario" (
    "usuarioIDX" text NOT NULL,
    email text,
    nombre text,
    "primerApellido" text,
    "segundoApellido" text,
    pasaporte text,
    telefono text,
    "estadoCorreo" text
);


ALTER TABLE public."datosDeUsuario" OWNER TO postgres;

--
-- Name: enlaceDeRecuperacionCuenta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."enlaceDeRecuperacionCuenta" (
    uid integer NOT NULL,
    usuario text NOT NULL,
    codigo text NOT NULL,
    "fechaCaducidad" timestamp without time zone NOT NULL
);


ALTER TABLE public."enlaceDeRecuperacionCuenta" OWNER TO postgres;

--
-- Name: enlaceDeRecuperacionCuenta_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."enlaceDeRecuperacionCuenta" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."enlaceDeRecuperacionCuenta_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: enlaceVerificarCuenta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."enlaceVerificarCuenta" (
    uid integer NOT NULL,
    usuario text NOT NULL,
    enlace text NOT NULL
);


ALTER TABLE public."enlaceVerificarCuenta" OWNER TO postgres;

--
-- Name: enlaceVerificarCuenta_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."enlaceVerificarCuenta" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."enlaceVerificarCuenta_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: enlacesDePago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."enlacesDePago" (
    "nombreEnlace" text,
    codigo text,
    reserva integer,
    descripcion text,
    caducidad timestamp without time zone,
    cantidad numeric(10,2),
    "enlaceUID" integer NOT NULL,
    "estadoPago" text
);


ALTER TABLE public."enlacesDePago" OWNER TO postgres;

--
-- Name: enlacesDePago_enlaceUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."enlacesDePago" ALTER COLUMN "enlaceUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."enlacesDePago_enlaceUID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: enlacesPdf; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."enlacesPdf" (
    uid integer NOT NULL,
    enlace text,
    "reservaUID" integer,
    caducidad timestamp without time zone
);


ALTER TABLE public."enlacesPdf" OWNER TO postgres;

--
-- Name: enlacesPdf_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."enlacesPdf" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."enlacesPdf_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: estadoApartamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."estadoApartamentos" (
    uid integer NOT NULL,
    estado text,
    "estadoUI" text
);


ALTER TABLE public."estadoApartamentos" OWNER TO postgres;

--
-- Name: estadoApartamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."estadoApartamentos" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."estadoApartamentos_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: estadoPerfilPrecio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."estadoPerfilPrecio" (
    uid integer NOT NULL,
    estado text
);


ALTER TABLE public."estadoPerfilPrecio" OWNER TO postgres;

--
-- Name: estadoPerfilPrecio_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."estadoPerfilPrecio" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."estadoPerfilPrecio_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: estadosCuenta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."estadosCuenta" (
    estado text NOT NULL
);


ALTER TABLE public."estadosCuenta" OWNER TO postgres;

--
-- Name: estadosPago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."estadosPago" (
    uid integer NOT NULL,
    "estadosPago" text
);


ALTER TABLE public."estadosPago" OWNER TO postgres;

--
-- Name: estadosPago_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."estadosPago" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."estadosPago_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: estadosReserva; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."estadosReserva" (
    uid integer NOT NULL,
    estado text
);


ALTER TABLE public."estadosReserva" OWNER TO postgres;

--
-- Name: estadosReserva_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."estadosReserva" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."estadosReserva_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: habitaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.habitaciones (
    habitacion text NOT NULL,
    "habitacionUI" text NOT NULL
);


ALTER TABLE public.habitaciones OWNER TO postgres;

--
-- Name: impuestoTipoValor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."impuestoTipoValor" (
    uid integer NOT NULL,
    "tipoValorIDV" text,
    "tipoValorUI" text,
    simbolo text
);


ALTER TABLE public."impuestoTipoValor" OWNER TO postgres;

--
-- Name: impuestoTipoValor_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."impuestoTipoValor" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."impuestoTipoValor_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: impuestos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.impuestos (
    "impuestoUID" integer NOT NULL,
    nombre text,
    "tipoImpositivo" numeric(10,2),
    "tipoValor" text,
    "aplicacionSobre" text,
    estado text
);


ALTER TABLE public.impuestos OWNER TO postgres;

--
-- Name: impuestosAplicacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."impuestosAplicacion" (
    uid integer NOT NULL,
    "aplicacionIDV" text,
    "aplicacionUI" text
);


ALTER TABLE public."impuestosAplicacion" OWNER TO postgres;

--
-- Name: impuestosAplicacion_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."impuestosAplicacion" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."impuestosAplicacion_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: impuestosEstados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."impuestosEstados" (
    uid integer NOT NULL,
    "estadoIDV" text,
    "estadoUI" text
);


ALTER TABLE public."impuestosEstados" OWNER TO postgres;

--
-- Name: impuestosEstados_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."impuestosEstados" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."impuestosEstados_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: impuestos_idv_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.impuestos_idv_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER SEQUENCE public.impuestos_idv_seq OWNER TO postgres;

--
-- Name: impuestos_impuestoUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.impuestos ALTER COLUMN "impuestoUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."impuestos_impuestoUID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: interruptoresGlobales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."interruptoresGlobales" (
    "interruptorIDV" text NOT NULL,
    estado text
);


ALTER TABLE public."interruptoresGlobales" OWNER TO postgres;

--
-- Name: mensaesEnPortada_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."mensaesEnPortada_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER SEQUENCE public."mensaesEnPortada_uid_seq" OWNER TO postgres;

--
-- Name: mensajesEnPortada; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."mensajesEnPortada" (
    uid integer NOT NULL,
    mensaje text NOT NULL,
    estado text,
    posicion integer
);


ALTER TABLE public."mensajesEnPortada" OWNER TO postgres;

--
-- Name: mensajesEnPortada_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."mensajesEnPortada" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."mensajesEnPortada_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: monedas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monedas (
    uid integer NOT NULL,
    "monedaIDV" text,
    "monedaUI" text,
    simbolo text
);


ALTER TABLE public.monedas OWNER TO postgres;

--
-- Name: monedas_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.monedas ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.monedas_uid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificaciones (
    "notificacionUID" integer NOT NULL,
    "notificacionIDV" text,
    objeto json,
    "IDX" text
);


ALTER TABLE public.notificaciones OWNER TO postgres;

--
-- Name: notificaciones_notificacionUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.notificaciones ALTER COLUMN "notificacionUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."notificaciones_notificacionUID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ofertas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ofertas (
    uid integer NOT NULL,
    "fechaInicio" date,
    "fechaFin" date,
    "simboloNumero" text,
    "descuentoAplicadoA" text,
    "estadoOferta" text,
    "tipoOferta" text,
    cantidad numeric(10,2),
    "tipoDescuento" text,
    "nombreOferta" text,
    numero text,
    "nombrePublico" text
);


ALTER TABLE public.ofertas OWNER TO postgres;

--
-- Name: ofertasApartamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ofertasApartamentos" (
    uid integer NOT NULL,
    oferta integer NOT NULL,
    apartamento text,
    "tipoDescuento" text,
    cantidad numeric(10,2)
);


ALTER TABLE public."ofertasApartamentos" OWNER TO postgres;

--
-- Name: ofertasApartamentos_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."ofertasApartamentos" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."ofertasApartamentos_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ofertasAplicacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ofertasAplicacion" (
    uid integer NOT NULL,
    "aplicacionIDV" text,
    "aplicacionUI" text
);


ALTER TABLE public."ofertasAplicacion" OWNER TO postgres;

--
-- Name: ofertasAplicacion_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."ofertasAplicacion" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."ofertasAplicacion_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ofertasEstado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ofertasEstado" (
    id integer NOT NULL,
    "estadoIDV" text,
    "estadoUI" text
);


ALTER TABLE public."ofertasEstado" OWNER TO postgres;

--
-- Name: ofertasEstado_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."ofertasEstado" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."ofertasEstado_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ofertasTipo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ofertasTipo" (
    uid integer NOT NULL,
    "tipoOfertaIDV" text,
    "tipoOfertaUI" text
);


ALTER TABLE public."ofertasTipo" OWNER TO postgres;

--
-- Name: ofertasTipoDescuento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ofertasTipoDescuento" (
    uid integer NOT NULL,
    "tipoDescuentoIDV" text,
    "tipoDescuentoUI" text
);


ALTER TABLE public."ofertasTipoDescuento" OWNER TO postgres;

--
-- Name: ofertasTipoDescuento_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."ofertasTipoDescuento" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."ofertasTipoDescuento_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ofertasTipo_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."ofertasTipo" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."ofertasTipo_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ofertas_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.ofertas ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.ofertas_uid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: plataformaDePago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."plataformaDePago" (
    "plataformaIDV" text NOT NULL,
    "plataformaUI" text NOT NULL
);


ALTER TABLE public."plataformaDePago" OWNER TO postgres;

--
-- Name: poolClientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."poolClientes" (
    uid integer NOT NULL,
    "nombreCompleto" text NOT NULL,
    pasaporte text,
    "pernoctanteUID" integer
);


ALTER TABLE public."poolClientes" OWNER TO postgres;

--
-- Name: poolClientesPreFormateo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."poolClientes" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."poolClientesPreFormateo_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: poolTitularesReserva; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."poolTitularesReserva" (
    uid integer NOT NULL,
    "nombreTitular" text,
    "pasaporteTitular" text,
    "emailTitular" text,
    "telefonoTitular" text,
    reserva integer
);


ALTER TABLE public."poolTitularesReserva" OWNER TO postgres;

--
-- Name: poolTitularesReserva_ud_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."poolTitularesReserva" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."poolTitularesReserva_ud_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: preciosApartamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."preciosApartamentos" (
    uid integer NOT NULL,
    apartamento text,
    precio numeric(10,2),
    moneda text
);


ALTER TABLE public."preciosApartamentos" OWNER TO postgres;

--
-- Name: precios_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."preciosApartamentos" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.precios_uid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaApartamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaApartamentos" (
    uid integer NOT NULL,
    reserva integer NOT NULL,
    apartamento text NOT NULL,
    "apartamentoUI" text
);


ALTER TABLE public."reservaApartamentos" OWNER TO postgres;

--
-- Name: reservaApartamentos_UID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaApartamentos" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaApartamentos_UID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaCamas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaCamas" (
    uid integer NOT NULL,
    habitacion integer NOT NULL,
    cama text NOT NULL,
    reserva integer,
    "camaUI" text
);


ALTER TABLE public."reservaCamas" OWNER TO postgres;

--
-- Name: reservaCamas_UID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaCamas" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaCamas_UID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaHabitaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaHabitaciones" (
    uid integer NOT NULL,
    apartamento integer NOT NULL,
    habitacion text NOT NULL,
    reserva integer,
    "habitacionUI" text
);


ALTER TABLE public."reservaHabitaciones" OWNER TO postgres;

--
-- Name: reservaHabitaciones_ID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaHabitaciones" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaHabitaciones_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaImpuestos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaImpuestos" (
    uid integer NOT NULL,
    reserva integer,
    "nombreImpuesto" text,
    "tipoImpositivo" numeric(10,2),
    "tipoValor" text,
    "calculoImpuestoPorcentaje" numeric(10,2)
);


ALTER TABLE public."reservaImpuestos" OWNER TO postgres;

--
-- Name: reservaImpuestos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaImpuestos" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaImpuestos_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaOfertas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaOfertas" (
    uid integer NOT NULL,
    reserva integer,
    "nombreOferta" text,
    "tipoOferta" text,
    definicion text,
    descuento numeric(10,2),
    "tipoDescuento" text,
    cantidad numeric(10,2),
    "detallesOferta" jsonb,
    "descuentoAplicadoA" text
);


ALTER TABLE public."reservaOfertas" OWNER TO postgres;

--
-- Name: reservaOfertas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaOfertas" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaOfertas_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaPagos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaPagos" (
    "pagoUID" integer NOT NULL,
    "plataformaDePago" text NOT NULL,
    "tarjetaDigitos" text,
    "pagoUIDPasarela" text,
    reserva integer NOT NULL,
    tarjeta text,
    cantidad numeric(10,2) NOT NULL,
    "fechaPago" timestamp without time zone,
    "pagadorNombre" text,
    "pagadorPasaporte" text,
    "chequeUID" text,
    "transferenciaUID" text
);


ALTER TABLE public."reservaPagos" OWNER TO postgres;

--
-- Name: reservaPagos_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaPagos" ALTER COLUMN "pagoUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaPagos_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaPernoctantes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaPernoctantes" (
    "pernoctanteUID" integer NOT NULL,
    reserva integer NOT NULL,
    habitacion integer,
    "clienteUID" integer,
    "fechaCheckIn" date,
    "fechaCheckOutAdelantado" timestamp without time zone
);


ALTER TABLE public."reservaPernoctantes" OWNER TO postgres;

--
-- Name: reservaPernoctante_UID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaPernoctantes" ALTER COLUMN "pernoctanteUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaPernoctante_UID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaReembolsos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaReembolsos" (
    "reembolsoUID" integer NOT NULL,
    "pagoUID" integer NOT NULL,
    cantidad numeric(10,2) NOT NULL,
    "plataformaDePago" text NOT NULL,
    "reembolsoUIDPasarela" text,
    estado text,
    "fechaCreacion" timestamp without time zone,
    "fechaActualizacion" timestamp without time zone
);


ALTER TABLE public."reservaReembolsos" OWNER TO postgres;

--
-- Name: reservaReembolsos_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaReembolsos" ALTER COLUMN "reembolsoUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaReembolsos_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaTitulares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaTitulares" (
    uid integer NOT NULL,
    "titularUID" integer NOT NULL,
    "reservaUID" integer NOT NULL
);


ALTER TABLE public."reservaTitulares" OWNER TO postgres;

--
-- Name: reservaTitulares_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaTitulares" ALTER COLUMN uid ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."reservaTitulares_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaTotales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaTotales" (
    uid integer NOT NULL,
    reserva integer,
    "promedioNetoPorNoche" numeric(10,2),
    "totalReservaNetoSinOfertas" numeric(10,2),
    "totalReservaNeto" numeric(10,2),
    "totalDescuentos" numeric(10,2),
    "totalImpuestos" numeric(10,2),
    "totalConImpuestos" numeric(10,2)
);


ALTER TABLE public."reservaTotales" OWNER TO postgres;

--
-- Name: reservaTotalesPorApartamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaTotalesPorApartamento" (
    uid integer NOT NULL,
    reserva integer,
    "apartamentoIDV" text,
    "totalNetoRango" numeric(10,2),
    "precioMedioNocheRango" numeric(10,2),
    "apartamentoUI" text
);


ALTER TABLE public."reservaTotalesPorApartamento" OWNER TO postgres;

--
-- Name: reservaTotalesPorApartamento_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaTotalesPorApartamento" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaTotalesPorApartamento_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaTotalesPorNoche; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaTotalesPorNoche" (
    uid integer NOT NULL,
    reserva integer,
    "precioNetoNoche" numeric(10,2),
    descripcion text,
    "fechaDiaConNoche" date,
    apartamentos jsonb
);


ALTER TABLE public."reservaTotalesPorNoche" OWNER TO postgres;

--
-- Name: reservaTotalesPorNoche_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaTotalesPorNoche" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaTotalesPorNoche_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaTotales_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaTotales" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaTotales_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sessiones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessiones (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.sessiones OWNER TO postgres;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    usuario text NOT NULL,
    clave text NOT NULL,
    rol text NOT NULL,
    sal text NOT NULL,
    "estadoCuenta" text,
    "zonaHoraria" text,
    intentos integer,
    "cuentaVerificada" text,
    "codigoVerificacion" text,
    "fechaCaducidadCuentaNoVerificada" timestamp without time zone,
    "ultimoLogin" timestamp without time zone
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuariosConfiguracion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."usuariosConfiguracion" (
    uid integer NOT NULL,
    "IDX" text,
    "configuracionUID" text,
    valor text
);


ALTER TABLE public."usuariosConfiguracion" OWNER TO postgres;

--
-- Name: usuariosConfiguracion_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."usuariosConfiguracion" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."usuariosConfiguracion_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usuariosRoles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."usuariosRoles" (
    rol text NOT NULL,
    "rolUI" text
);


ALTER TABLE public."usuariosRoles" OWNER TO postgres;

--
-- Name: usuariosZonaHoraria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."usuariosZonaHoraria" (
    uid integer NOT NULL,
    configuracion text,
    "zonaHoraria" text,
    "IDX" text
);


ALTER TABLE public."usuariosZonaHoraria" OWNER TO postgres;

--
-- Name: usuariosZonaHoraria_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."usuariosZonaHoraria" ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."usuariosZonaHoraria_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: apartamentos apartamento; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apartamentos
    ADD CONSTRAINT apartamento UNIQUE (apartamento) INCLUDE (apartamento);


--
-- Name: apartamentosCaracteristicas apartamentosCaracteristicas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."apartamentosCaracteristicas"
    ADD CONSTRAINT "apartamentosCaracteristicas_pkey" PRIMARY KEY (uid);


--
-- Name: apartamentos apartamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apartamentos
    ADD CONSTRAINT apartamentos_pkey PRIMARY KEY (apartamento);


--
-- Name: bloqueosApartamentos bloqueosApartamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."bloqueosApartamentos"
    ADD CONSTRAINT "bloqueosApartamentos_pkey" PRIMARY KEY (uid);


--
-- Name: calendariosSincronizados calendariosSincronizados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."calendariosSincronizados"
    ADD CONSTRAINT "calendariosSincronizados_pkey" PRIMARY KEY (uid);


--
-- Name: camas cama; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camas
    ADD CONSTRAINT cama UNIQUE (cama) INCLUDE (cama);


--
-- Name: camas camas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camas
    ADD CONSTRAINT camas_pkey PRIMARY KEY (cama);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (uid);


--
-- Name: comportamientoPreciosApartamentos comportamientoPreciosApartamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."comportamientoPreciosApartamentos"
    ADD CONSTRAINT "comportamientoPreciosApartamentos_pkey" PRIMARY KEY (uid);


--
-- Name: comportamientoPrecios comportamientoPrecios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."comportamientoPrecios"
    ADD CONSTRAINT "comportamientoPrecios_pkey" PRIMARY KEY (uid);


--
-- Name: configuracionApartamento configuracionApartamentoDisponibildiad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionApartamento"
    ADD CONSTRAINT "configuracionApartamentoDisponibildiad_pkey" PRIMARY KEY (uid);


--
-- Name: configuracionApartamento configuracionApartamento_apartamentoIDV_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionApartamento"
    ADD CONSTRAINT "configuracionApartamento_apartamentoIDV_key" UNIQUE ("apartamentoIDV");


--
-- Name: configuracionHabitacionesDelApartamento configuracionApartamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionHabitacionesDelApartamento"
    ADD CONSTRAINT "configuracionApartamento_pkey" PRIMARY KEY (uid);


--
-- Name: configuracionGlobal configuracionGlobal_configuracionUID_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionGlobal"
    ADD CONSTRAINT "configuracionGlobal_configuracionUID_key" UNIQUE ("configuracionUID");


--
-- Name: configuracionCamasEnHabitacion configuracionHabitacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionCamasEnHabitacion"
    ADD CONSTRAINT "configuracionHabitacion_pkey" PRIMARY KEY (uid);


--
-- Name: datosDeUsuario datosDeUsuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."datosDeUsuario"
    ADD CONSTRAINT "datosDeUsuario_pkey" PRIMARY KEY ("usuarioIDX");


--
-- Name: datosDeUsuario datosDeUsuario_usuarioIDX_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."datosDeUsuario"
    ADD CONSTRAINT "datosDeUsuario_usuarioIDX_key" UNIQUE ("usuarioIDX");


--
-- Name: datosDeUsuario datosDeUsuiario_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."datosDeUsuario"
    ADD CONSTRAINT "datosDeUsuiario_email_key" UNIQUE (email);


--
-- Name: datosDeUsuario datosDeUsuiario_pasaporte_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."datosDeUsuario"
    ADD CONSTRAINT "datosDeUsuiario_pasaporte_key" UNIQUE (pasaporte);


--
-- Name: enlaceDeRecuperacionCuenta enlaceDeRecuperacionCuenta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlaceDeRecuperacionCuenta"
    ADD CONSTRAINT "enlaceDeRecuperacionCuenta_pkey" PRIMARY KEY (uid);


--
-- Name: enlaceVerificarCuenta enlaceVerificarCuenta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlaceVerificarCuenta"
    ADD CONSTRAINT "enlaceVerificarCuenta_pkey" PRIMARY KEY (uid);


--
-- Name: enlacesDePago enlacesDePago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlacesDePago"
    ADD CONSTRAINT "enlacesDePago_pkey" PRIMARY KEY ("enlaceUID");


--
-- Name: enlacesPdf enlacesPdf_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlacesPdf"
    ADD CONSTRAINT "enlacesPdf_pkey" PRIMARY KEY (uid);


--
-- Name: estadoApartamentos estadoApartamentos_estado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadoApartamentos"
    ADD CONSTRAINT "estadoApartamentos_estado_key" UNIQUE (estado);


--
-- Name: estadoApartamentos estadoApartamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadoApartamentos"
    ADD CONSTRAINT "estadoApartamentos_pkey" PRIMARY KEY (uid);


--
-- Name: estadoPerfilPrecio estadoPerfilPrecio_estado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadoPerfilPrecio"
    ADD CONSTRAINT "estadoPerfilPrecio_estado_key" UNIQUE (estado);


--
-- Name: estadoPerfilPrecio estadoPerfilPrecio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadoPerfilPrecio"
    ADD CONSTRAINT "estadoPerfilPrecio_pkey" PRIMARY KEY (uid);


--
-- Name: estadosCuenta estadosCuenta_estado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadosCuenta"
    ADD CONSTRAINT "estadosCuenta_estado_key" UNIQUE (estado);


--
-- Name: estadosCuenta estadosCuenta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadosCuenta"
    ADD CONSTRAINT "estadosCuenta_pkey" PRIMARY KEY (estado);


--
-- Name: estadosPago estadosPago_estadosPago_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadosPago"
    ADD CONSTRAINT "estadosPago_estadosPago_key" UNIQUE ("estadosPago");


--
-- Name: estadosPago estadosPago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadosPago"
    ADD CONSTRAINT "estadosPago_pkey" PRIMARY KEY (uid);


--
-- Name: estadosReserva estadosReserva_estado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadosReserva"
    ADD CONSTRAINT "estadosReserva_estado_key" UNIQUE (estado);


--
-- Name: estadosReserva estadosReserva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadosReserva"
    ADD CONSTRAINT "estadosReserva_pkey" PRIMARY KEY (uid);


--
-- Name: habitaciones habitacion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habitaciones
    ADD CONSTRAINT habitacion UNIQUE (habitacion) INCLUDE (habitacion);


--
-- Name: habitaciones habitaciones_habitacionUI_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habitaciones
    ADD CONSTRAINT "habitaciones_habitacionUI_key" UNIQUE ("habitacionUI");


--
-- Name: habitaciones habitaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habitaciones
    ADD CONSTRAINT habitaciones_pkey PRIMARY KEY (habitacion);


--
-- Name: impuestoTipoValor impuestoTipoValor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."impuestoTipoValor"
    ADD CONSTRAINT "impuestoTipoValor_pkey" PRIMARY KEY (uid);


--
-- Name: impuestoTipoValor impuestoTipoValor_simbolo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."impuestoTipoValor"
    ADD CONSTRAINT "impuestoTipoValor_simbolo_key" UNIQUE (simbolo);


--
-- Name: impuestoTipoValor impuestoTipoValor_tipoValorIDV_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."impuestoTipoValor"
    ADD CONSTRAINT "impuestoTipoValor_tipoValorIDV_key" UNIQUE ("tipoValorIDV");


--
-- Name: impuestosAplicacion impuestosAplicacion_aplicacionIDV_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."impuestosAplicacion"
    ADD CONSTRAINT "impuestosAplicacion_aplicacionIDV_key" UNIQUE ("aplicacionIDV");


--
-- Name: impuestosAplicacion impuestosAplicacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."impuestosAplicacion"
    ADD CONSTRAINT "impuestosAplicacion_pkey" PRIMARY KEY (uid);


--
-- Name: impuestosEstados impuestosEstados_estadoIDV_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."impuestosEstados"
    ADD CONSTRAINT "impuestosEstados_estadoIDV_key" UNIQUE ("estadoIDV");


--
-- Name: impuestosEstados impuestosEstados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."impuestosEstados"
    ADD CONSTRAINT "impuestosEstados_pkey" PRIMARY KEY (uid);


--
-- Name: impuestos impuestos_impuesto_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.impuestos
    ADD CONSTRAINT impuestos_impuesto_key UNIQUE (nombre);


--
-- Name: impuestos impuestos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.impuestos
    ADD CONSTRAINT impuestos_pkey PRIMARY KEY ("impuestoUID");


--
-- Name: interruptoresGlobales interruptoresGlobales_interruptorIDV_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."interruptoresGlobales"
    ADD CONSTRAINT "interruptoresGlobales_interruptorIDV_key" UNIQUE ("interruptorIDV");


--
-- Name: interruptoresGlobales interruptoresGlobales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."interruptoresGlobales"
    ADD CONSTRAINT "interruptoresGlobales_pkey" PRIMARY KEY ("interruptorIDV");


--
-- Name: mensajesEnPortada mensaesEnPortada_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."mensajesEnPortada"
    ADD CONSTRAINT "mensaesEnPortada_pkey" PRIMARY KEY (uid, mensaje);


--
-- Name: monedas monedas_monedaIDV_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monedas
    ADD CONSTRAINT "monedas_monedaIDV_key" UNIQUE ("monedaIDV");


--
-- Name: monedas monedas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monedas
    ADD CONSTRAINT monedas_pkey PRIMARY KEY (uid);


--
-- Name: monedas monedas_simbolo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monedas
    ADD CONSTRAINT monedas_simbolo_key UNIQUE (simbolo);


--
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY ("notificacionUID");


--
-- Name: ofertasApartamentos ofertasApartamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ofertasApartamentos"
    ADD CONSTRAINT "ofertasApartamentos_pkey" PRIMARY KEY (uid);


--
-- Name: ofertasAplicacion ofertasAplicacion_aplicacionIDV_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ofertasAplicacion"
    ADD CONSTRAINT "ofertasAplicacion_aplicacionIDV_key" UNIQUE ("aplicacionIDV");


--
-- Name: ofertasAplicacion ofertasAplicacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ofertasAplicacion"
    ADD CONSTRAINT "ofertasAplicacion_pkey" PRIMARY KEY (uid);


--
-- Name: ofertasEstado ofertasEstado_estadoIDV_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ofertasEstado"
    ADD CONSTRAINT "ofertasEstado_estadoIDV_key" UNIQUE ("estadoIDV");


--
-- Name: ofertasEstado ofertasEstado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ofertasEstado"
    ADD CONSTRAINT "ofertasEstado_pkey" PRIMARY KEY (id);


--
-- Name: ofertasTipoDescuento ofertasTipoDescuento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ofertasTipoDescuento"
    ADD CONSTRAINT "ofertasTipoDescuento_pkey" PRIMARY KEY (uid);


--
-- Name: ofertasTipoDescuento ofertasTipoDescuento_tipoDescuentoIDV_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ofertasTipoDescuento"
    ADD CONSTRAINT "ofertasTipoDescuento_tipoDescuentoIDV_key" UNIQUE ("tipoDescuentoIDV");


--
-- Name: ofertasTipo ofertasTipo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ofertasTipo"
    ADD CONSTRAINT "ofertasTipo_pkey" PRIMARY KEY (uid);


--
-- Name: ofertasTipo ofertasTipo_tipoOfertaIDV_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ofertasTipo"
    ADD CONSTRAINT "ofertasTipo_tipoOfertaIDV_key" UNIQUE ("tipoOfertaIDV");


--
-- Name: ofertas ofertas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ofertas
    ADD CONSTRAINT ofertas_pkey PRIMARY KEY (uid);


--
-- Name: plataformaDePago plataformaDePago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."plataformaDePago"
    ADD CONSTRAINT "plataformaDePago_pkey" PRIMARY KEY ("plataformaIDV");


--
-- Name: poolClientes poolClientesPreFormateo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."poolClientes"
    ADD CONSTRAINT "poolClientesPreFormateo_pkey" PRIMARY KEY (uid);


--
-- Name: poolTitularesReserva poolTitularesReserva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."poolTitularesReserva"
    ADD CONSTRAINT "poolTitularesReserva_pkey" PRIMARY KEY (uid);


--
-- Name: mensajesEnPortada posicion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."mensajesEnPortada"
    ADD CONSTRAINT posicion UNIQUE (posicion) INCLUDE (posicion);


--
-- Name: preciosApartamentos precios_apartamento_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."preciosApartamentos"
    ADD CONSTRAINT precios_apartamento_key UNIQUE (apartamento);


--
-- Name: preciosApartamentos precios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."preciosApartamentos"
    ADD CONSTRAINT precios_pkey PRIMARY KEY (uid);


--
-- Name: reservaApartamentos reservaApartamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaApartamentos"
    ADD CONSTRAINT "reservaApartamentos_pkey" PRIMARY KEY (uid);


--
-- Name: reservaCamas reservaCamas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamas"
    ADD CONSTRAINT "reservaCamas_pkey" PRIMARY KEY (uid);


--
-- Name: reservaHabitaciones reservaHabitaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaHabitaciones"
    ADD CONSTRAINT "reservaHabitaciones_pkey" PRIMARY KEY (uid);


--
-- Name: reservaImpuestos reservaImpuestos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaImpuestos"
    ADD CONSTRAINT "reservaImpuestos_pkey" PRIMARY KEY (uid);


--
-- Name: reservaOfertas reservaOfertas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaOfertas"
    ADD CONSTRAINT "reservaOfertas_pkey" PRIMARY KEY (uid);


--
-- Name: reservaPagos reservaPagos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPagos"
    ADD CONSTRAINT "reservaPagos_pkey" PRIMARY KEY ("pagoUID");


--
-- Name: reservaPernoctantes reservaPernoctante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPernoctantes"
    ADD CONSTRAINT "reservaPernoctante_pkey" PRIMARY KEY ("pernoctanteUID");


--
-- Name: reservaReembolsos reservaReembolsos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaReembolsos"
    ADD CONSTRAINT "reservaReembolsos_pkey" PRIMARY KEY ("reembolsoUID");


--
-- Name: reservaTitulares reservaTitulares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaTitulares"
    ADD CONSTRAINT "reservaTitulares_pkey" PRIMARY KEY (uid);


--
-- Name: reservaTotalesPorApartamento reservaTotalesPorApartamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaTotalesPorApartamento"
    ADD CONSTRAINT "reservaTotalesPorApartamento_pkey" PRIMARY KEY (uid);


--
-- Name: reservaTotalesPorNoche reservaTotalesPorNoche_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaTotalesPorNoche"
    ADD CONSTRAINT "reservaTotalesPorNoche_pkey" PRIMARY KEY (uid);


--
-- Name: reservaTotales reservaTotales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaTotales"
    ADD CONSTRAINT "reservaTotales_pkey" PRIMARY KEY (uid);


--
-- Name: reservas reservas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_pkey PRIMARY KEY (reserva);


--
-- Name: reservas reservas_reserva_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_reserva_key UNIQUE (reserva);


--
-- Name: sessiones session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessiones
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: usuariosConfiguracion usuariosConfiguracion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosConfiguracion"
    ADD CONSTRAINT "usuariosConfiguracion_pkey" PRIMARY KEY (uid);


--
-- Name: usuariosRoles usuariosRoles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosRoles"
    ADD CONSTRAINT "usuariosRoles_pkey" PRIMARY KEY (rol);


--
-- Name: usuariosZonaHoraria usuariosZonaHoraria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosZonaHoraria"
    ADD CONSTRAINT "usuariosZonaHoraria_pkey" PRIMARY KEY (uid);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (usuario);


--
-- Name: usuarios usuarios_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_usuario_key UNIQUE (usuario);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.sessiones USING btree (expire);


--
-- Name: reservaHabitaciones Apartamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaHabitaciones"
    ADD CONSTRAINT "Apartamento" FOREIGN KEY (apartamento) REFERENCES public."reservaApartamentos"(uid) ON DELETE CASCADE NOT VALID;


--
-- Name: configuracionHabitacionesDelApartamento Apartamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionHabitacionesDelApartamento"
    ADD CONSTRAINT "Apartamento" FOREIGN KEY (apartamento) REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: configuracionCamasEnHabitacion Cama; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionCamasEnHabitacion"
    ADD CONSTRAINT "Cama" FOREIGN KEY (cama) REFERENCES public.camas(cama) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaCamas Habitacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamas"
    ADD CONSTRAINT "Habitacion" FOREIGN KEY (habitacion) REFERENCES public."reservaHabitaciones"(uid) ON DELETE CASCADE NOT VALID;


--
-- Name: configuracionHabitacionesDelApartamento Habitacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionHabitacionesDelApartamento"
    ADD CONSTRAINT "Habitacion" FOREIGN KEY (habitacion) REFERENCES public.habitaciones(habitacion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: configuracionCamasEnHabitacion Habitacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionCamasEnHabitacion"
    ADD CONSTRAINT "Habitacion" FOREIGN KEY (habitacion) REFERENCES public."configuracionHabitacionesDelApartamento"(uid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaPernoctantes Habitacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPernoctantes"
    ADD CONSTRAINT "Habitacion" FOREIGN KEY (habitacion) REFERENCES public."reservaHabitaciones"(uid) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notificaciones IDX; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT "IDX" FOREIGN KEY ("IDX") REFERENCES public.usuarios(usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: usuariosZonaHoraria IDX; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosZonaHoraria"
    ADD CONSTRAINT "IDX" FOREIGN KEY ("IDX") REFERENCES public.usuarios(usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaPernoctantes Pernoctante; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPernoctantes"
    ADD CONSTRAINT "Pernoctante" FOREIGN KEY ("clienteUID") REFERENCES public.clientes(uid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaApartamentos Reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaApartamentos"
    ADD CONSTRAINT "Reserva" FOREIGN KEY (reserva) REFERENCES public.reservas(reserva) ON DELETE CASCADE NOT VALID;


--
-- Name: preciosApartamentos apartamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."preciosApartamentos"
    ADD CONSTRAINT apartamento FOREIGN KEY (apartamento) REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ofertasApartamentos apartamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ofertasApartamentos"
    ADD CONSTRAINT apartamento FOREIGN KEY (apartamento) REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comportamientoPreciosApartamentos apartamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."comportamientoPreciosApartamentos"
    ADD CONSTRAINT apartamento FOREIGN KEY ("apartamentoIDV") REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: configuracionApartamento apartamentoIDV; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionApartamento"
    ADD CONSTRAINT "apartamentoIDV" FOREIGN KEY ("apartamentoIDV") REFERENCES public.apartamentos(apartamento) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: apartamentosCaracteristicas apartamentoIDV; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."apartamentosCaracteristicas"
    ADD CONSTRAINT "apartamentoIDV" FOREIGN KEY ("apartamentoIDV") REFERENCES public.apartamentos(apartamento) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: calendariosSincronizados apartamentoIDV; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."calendariosSincronizados"
    ADD CONSTRAINT "apartamentoIDV" FOREIGN KEY ("apartamentoIDV") REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bloqueosApartamentos apartamentos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."bloqueosApartamentos"
    ADD CONSTRAINT apartamentos FOREIGN KEY (apartamento) REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ofertas aplicacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ofertas
    ADD CONSTRAINT aplicacion FOREIGN KEY ("descuentoAplicadoA") REFERENCES public."ofertasAplicacion"("aplicacionIDV") ON UPDATE CASCADE;


--
-- Name: comportamientoPreciosApartamentos comportamientoUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."comportamientoPreciosApartamentos"
    ADD CONSTRAINT "comportamientoUID" FOREIGN KEY ("comportamientoUID") REFERENCES public."comportamientoPrecios"(uid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: datosDeUsuario datosDeUsuiario_usuarioIDX_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."datosDeUsuario"
    ADD CONSTRAINT "datosDeUsuiario_usuarioIDX_fkey" FOREIGN KEY ("usuarioIDX") REFERENCES public.usuarios(usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: configuracionApartamento estadoConfiguracion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionApartamento"
    ADD CONSTRAINT "estadoConfiguracion" FOREIGN KEY ("estadoConfiguracion") REFERENCES public."estadoApartamentos"(estado) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: usuarios estadoCuenta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "estadoCuenta" FOREIGN KEY ("estadoCuenta") REFERENCES public."estadosCuenta"(estado) ON UPDATE CASCADE;


--
-- Name: ofertas estadoOferta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ofertas
    ADD CONSTRAINT "estadoOferta" FOREIGN KEY ("estadoOferta") REFERENCES public."ofertasEstado"("estadoIDV") ON UPDATE CASCADE;


--
-- Name: reservas estadoReserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT "estadoReserva" FOREIGN KEY ("estadoReserva") REFERENCES public."estadosReserva"(estado) ON UPDATE CASCADE;


--
-- Name: impuestos impuestosAplicacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.impuestos
    ADD CONSTRAINT "impuestosAplicacion" FOREIGN KEY ("aplicacionSobre") REFERENCES public."impuestosAplicacion"("aplicacionIDV");


--
-- Name: impuestos impuestosEstados; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.impuestos
    ADD CONSTRAINT "impuestosEstados" FOREIGN KEY (estado) REFERENCES public."impuestosEstados"("estadoIDV") ON UPDATE CASCADE;


--
-- Name: preciosApartamentos moneda; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."preciosApartamentos"
    ADD CONSTRAINT moneda FOREIGN KEY (moneda) REFERENCES public.monedas("monedaIDV") ON UPDATE CASCADE;


--
-- Name: ofertasApartamentos oferta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ofertasApartamentos"
    ADD CONSTRAINT oferta FOREIGN KEY (oferta) REFERENCES public.ofertas(uid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaReembolsos pagoUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaReembolsos"
    ADD CONSTRAINT "pagoUID" FOREIGN KEY ("pagoUID") REFERENCES public."reservaPagos"("pagoUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: poolClientes pernoctanteUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."poolClientes"
    ADD CONSTRAINT "pernoctanteUID" FOREIGN KEY ("pernoctanteUID") REFERENCES public."reservaPernoctantes"("pernoctanteUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaPagos plataforma; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPagos"
    ADD CONSTRAINT plataforma FOREIGN KEY ("plataformaDePago") REFERENCES public."plataformaDePago"("plataformaIDV");


--
-- Name: reservaReembolsos plataformaDePago; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaReembolsos"
    ADD CONSTRAINT "plataformaDePago" FOREIGN KEY ("plataformaDePago") REFERENCES public."plataformaDePago"("plataformaIDV");


--
-- Name: reservaHabitaciones reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaHabitaciones"
    ADD CONSTRAINT reserva FOREIGN KEY (reserva) REFERENCES public.reservas(reserva) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaCamas reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamas"
    ADD CONSTRAINT reserva FOREIGN KEY (reserva) REFERENCES public.reservas(reserva) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaTotales reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaTotales"
    ADD CONSTRAINT reserva FOREIGN KEY (reserva) REFERENCES public.reservas(reserva) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaImpuestos reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaImpuestos"
    ADD CONSTRAINT reserva FOREIGN KEY (reserva) REFERENCES public.reservas(reserva) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaOfertas reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaOfertas"
    ADD CONSTRAINT reserva FOREIGN KEY (reserva) REFERENCES public.reservas(reserva) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaTotalesPorNoche reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaTotalesPorNoche"
    ADD CONSTRAINT reserva FOREIGN KEY (reserva) REFERENCES public.reservas(reserva) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaTotalesPorApartamento reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaTotalesPorApartamento"
    ADD CONSTRAINT reserva FOREIGN KEY (reserva) REFERENCES public.reservas(reserva) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaPagos reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPagos"
    ADD CONSTRAINT reserva FOREIGN KEY (reserva) REFERENCES public.reservas(reserva) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: poolTitularesReserva reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."poolTitularesReserva"
    ADD CONSTRAINT reserva FOREIGN KEY (reserva) REFERENCES public.reservas(reserva) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaPernoctantes reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPernoctantes"
    ADD CONSTRAINT reserva FOREIGN KEY (reserva) REFERENCES public.reservas(reserva) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: enlacesPdf reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlacesPdf"
    ADD CONSTRAINT reserva FOREIGN KEY ("reservaUID") REFERENCES public.reservas(reserva) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaTitulares reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaTitulares"
    ADD CONSTRAINT reserva FOREIGN KEY ("reservaUID") REFERENCES public.reservas(reserva) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: enlacesDePago reservas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlacesDePago"
    ADD CONSTRAINT reservas FOREIGN KEY (reserva) REFERENCES public.reservas(reserva) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: usuarios rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT rol FOREIGN KEY (rol) REFERENCES public."usuariosRoles"(rol) ON UPDATE CASCADE;


--
-- Name: ofertas tipoDescuento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ofertas
    ADD CONSTRAINT "tipoDescuento" FOREIGN KEY ("tipoDescuento") REFERENCES public."ofertasTipoDescuento"("tipoDescuentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ofertasApartamentos tipoDescuento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ofertasApartamentos"
    ADD CONSTRAINT "tipoDescuento" FOREIGN KEY ("tipoDescuento") REFERENCES public."ofertasTipoDescuento"("tipoDescuentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ofertas tipoOferta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ofertas
    ADD CONSTRAINT "tipoOferta" FOREIGN KEY ("tipoOferta") REFERENCES public."ofertasTipo"("tipoOfertaIDV") ON UPDATE CASCADE;


--
-- Name: impuestos tipoValor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.impuestos
    ADD CONSTRAINT "tipoValor" FOREIGN KEY ("tipoValor") REFERENCES public."impuestoTipoValor"("tipoValorIDV") ON UPDATE CASCADE;


--
-- Name: reservaTitulares titular; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaTitulares"
    ADD CONSTRAINT titular FOREIGN KEY ("titularUID") REFERENCES public.clientes(uid) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: enlaceDeRecuperacionCuenta usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlaceDeRecuperacionCuenta"
    ADD CONSTRAINT usuario FOREIGN KEY (usuario) REFERENCES public.usuarios(usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: enlaceVerificarCuenta usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlaceVerificarCuenta"
    ADD CONSTRAINT usuario FOREIGN KEY (usuario) REFERENCES public.usuarios(usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: usuariosConfiguracion usuarios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosConfiguracion"
    ADD CONSTRAINT usuarios FOREIGN KEY ("IDX") REFERENCES public.usuarios(usuario) ON UPDATE CASCADE ON DELETE CASCADE;

COPY public."usuariosRoles" (rol, "rolUI") FROM stdin;
administrador	Administrador
cliente	Cliente
empleado	Empleado
\.


COPY public."estadosCuenta" (estado) FROM stdin;
activado
desactivado
\.

COPY public.usuarios (usuario, clave, rol, sal, "estadoCuenta", "zonaHoraria", intentos, "cuentaVerificada", "codigoVerificacion", "fechaCaducidadCuentaNoVerificada", "ultimoLogin") FROM stdin;
administrador	0f59770e523d3f0f51ebdcea2fe93edbedd534b531361b2797e6e0adbe02f8224453875cc055e5af7cb5762b3a8f419937e853e70fb2e35c4cdaaafdcc89f031	administrador	11072a14237105f2e97614defc77fa6e	activado	\N	0	si	\N	\N	2024-03-17 10:17:12.827
\.


--
-- PostgreSQL database dump complete
--

