--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0 (Debian 17.0-1.pgdg120+1)
-- Dumped by pg_dump version 17.0 (Debian 17.0-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET defauucast_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    "clienteUID" bigint NOT NULL,
    nombre text,
    "primerApellido" text,
    "segundoApellido" text,
    pasaporte text,
    telefono text,
    mail text,
    notas text,
    "testingVI" text
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- Name: Clientes_ID_Cliente_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clientes ALTER COLUMN "clienteUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Clientes_ID_Cliente_seq"
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
    "apartamentoIDV" text NOT NULL,
    "apartamentoUI" text
);


ALTER TABLE public.apartamentos OWNER TO postgres;

--
-- Name: apartamentosCaracteristicas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."apartamentosCaracteristicas" (
    "caracteristicaUID" bigint NOT NULL,
    "apartamentoIDV" text,
    "caracteristicaUI" text
);


ALTER TABLE public."apartamentosCaracteristicas" OWNER TO postgres;

--
-- Name: apartamentosCaracteristicas_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."apartamentosCaracteristicas" ALTER COLUMN "caracteristicaUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "bloqueoUID" bigint NOT NULL,
    "apartamentoIDV" text NOT NULL,
    "tipoBloqueoIDV" text NOT NULL,
    "fechaInicio" date,
    "fechaFin" date,
    motivo text,
    "zonaIDV" text NOT NULL,
    "calendarioIDV" text,
    "testingVI" text
);


ALTER TABLE public."bloqueosApartamentos" OWNER TO postgres;

--
-- Name: bloqueosApartamentos_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."bloqueosApartamentos" ALTER COLUMN "bloqueoUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "calendarioUID" bigint NOT NULL,
    url text,
    nombre text,
    "apartamentoIDV" text,
    "plataformaOrigenIDV" text,
    "dataIcal" text,
    "publicoUID" text,
    "testingVI" text
);


ALTER TABLE public."calendariosSincronizados" OWNER TO postgres;

--
-- Name: calendariosSincronizados_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."calendariosSincronizados" ALTER COLUMN "calendarioUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "camaIDV" text NOT NULL,
    "camaUI" text NOT NULL,
    capacidad bigint NOT NULL,
    "tipoIDV" text NOT NULL,
    "testingVI" text
);


ALTER TABLE public.camas OWNER TO postgres;

--
-- Name: comportamientoPrecios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."comportamientoPrecios" (
    "comportamientoUID" bigint NOT NULL,
    "nombreComportamiento" text,
    "estadoIDV" text,
    contenedor jsonb,
    "testingVI" text
);


ALTER TABLE public."comportamientoPrecios" OWNER TO postgres;

--
-- Name: comportamientoPrecios_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."comportamientoPrecios" ALTER COLUMN "comportamientoUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "configuracionUID" bigint NOT NULL,
    "apartamentoIDV" text NOT NULL,
    "estadoConfiguracionIDV" text NOT NULL,
    imagen text,
    "zonaIDV" text NOT NULL
);


ALTER TABLE public."configuracionApartamento" OWNER TO postgres;

--
-- Name: configuracionApartamentoDisponibildiad_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."configuracionApartamento" ALTER COLUMN "configuracionUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "componenteUID" bigint NOT NULL,
    "apartamentoIDV" text NOT NULL,
    "habitacionIDV" text NOT NULL
);


ALTER TABLE public."configuracionHabitacionesDelApartamento" OWNER TO postgres;

--
-- Name: configuracionApartamento_UID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."configuracionHabitacionesDelApartamento" ALTER COLUMN "componenteUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "componenteUID" bigint NOT NULL,
    "habitacionUID" bigint NOT NULL,
    "camaIDV" text NOT NULL
);


ALTER TABLE public."configuracionCamasEnHabitacion" OWNER TO postgres;

--
-- Name: configuracionGlobal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."configuracionGlobal" (
    "configuracionUID" text NOT NULL,
    valor text
);


ALTER TABLE public."configuracionGlobal" OWNER TO postgres;

--
-- Name: configuracionHabitacion_UID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."configuracionCamasEnHabitacion" ALTER COLUMN "componenteUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    usuario text NOT NULL,
    mail text,
    nombre text,
    "primerApellido" text,
    "segundoApellido" text,
    pasaporte text,
    telefono text,
    "estadoCorreoIDV" text
);


ALTER TABLE public."datosDeUsuario" OWNER TO postgres;

--
-- Name: enlaceDeRecuperacionCuenta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."enlaceDeRecuperacionCuenta" (
    "enlaceUID" bigint NOT NULL,
    usuario text NOT NULL,
    "codigoUPID" text NOT NULL,
    "fechaCaducidad" timestamp without time zone NOT NULL
);


ALTER TABLE public."enlaceDeRecuperacionCuenta" OWNER TO postgres;

--
-- Name: enlaceDeRecuperacionCuenta_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."enlaceDeRecuperacionCuenta" ALTER COLUMN "enlaceUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "enlaceUID" bigint NOT NULL,
    "IDX" text NOT NULL,
    "publicoUID" text NOT NULL
);


ALTER TABLE public."enlaceVerificarCuenta" OWNER TO postgres;

--
-- Name: enlaceVerificarCuenta_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."enlaceVerificarCuenta" ALTER COLUMN "enlaceUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "reservaUID" numeric(1000,0) NOT NULL,
    descripcion text,
    "fechaCaducidad" timestamp without time zone,
    cantidad numeric(10,2),
    "enlaceUID" bigint NOT NULL,
    "estadoPagoIDV" text,
    "testingVI" text
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
    "enlaceUID" bigint NOT NULL,
    "publicoUID" text,
    "reservaUID" numeric(1000,0) NOT NULL,
    "fechaCaducidad" timestamp without time zone
);


ALTER TABLE public."enlacesPdf" OWNER TO postgres;

--
-- Name: enlacesPdf_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."enlacesPdf" ALTER COLUMN "enlaceUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "estadoUID" bigint NOT NULL,
    "estadoIDV" text,
    "estadoUI" text
);


ALTER TABLE public."estadoApartamentos" OWNER TO postgres;

--
-- Name: estadoApartamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."estadoApartamentos" ALTER COLUMN "estadoUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "estadoUID" bigint NOT NULL,
    "estadoIDV" text
);


ALTER TABLE public."estadoPerfilPrecio" OWNER TO postgres;

--
-- Name: estadoPerfilPrecio_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."estadoPerfilPrecio" ALTER COLUMN "estadoUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "estadoIDV" text NOT NULL
);


ALTER TABLE public."estadosCuenta" OWNER TO postgres;

--
-- Name: estadosPago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."estadosPago" (
    "estadoUID" bigint NOT NULL,
    "estadosDV" text
);


ALTER TABLE public."estadosPago" OWNER TO postgres;

--
-- Name: estadosPago_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."estadosPago" ALTER COLUMN "estadoUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "estadoUID" bigint NOT NULL,
    "estadoIDV" text
);


ALTER TABLE public."estadosReserva" OWNER TO postgres;

--
-- Name: estadosReserva_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."estadosReserva" ALTER COLUMN "estadoUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "habitacionIDV" text NOT NULL,
    "habitacionUI" text NOT NULL
);


ALTER TABLE public.habitaciones OWNER TO postgres;

--
-- Name: impuestos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.impuestos (
    "impuestoUID" bigint NOT NULL,
    nombre text,
    "tipoImpositivo" numeric(10,2),
    "tipoValorIDV" text,
    "entidadIDV" text,
    "estadoIDV" text,
    "testingVI" text
);


ALTER TABLE public.impuestos OWNER TO postgres;

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
    "estadoIDV" text
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
    "mensajeUID" bigint NOT NULL,
    mensaje text NOT NULL,
    "estadoIDV" text,
    posicion bigint,
    "testingVI" text
);


ALTER TABLE public."mensajesEnPortada" OWNER TO postgres;

--
-- Name: mensajesEnPortada_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."mensajesEnPortada" ALTER COLUMN "mensajeUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "monedaUID" bigint NOT NULL,
    "monedaIDV" text,
    "monedaUI" text,
    "simboloIDV" text
);


ALTER TABLE public.monedas OWNER TO postgres;

--
-- Name: monedas_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.monedas ALTER COLUMN "monedaUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.monedas_uid_seq
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
    "ofertaUID" bigint NOT NULL,
    "nombreOferta" text NOT NULL,
    "condicionesArray" jsonb NOT NULL,
    "descuentosJSON" jsonb NOT NULL,
    "fechaInicio" date NOT NULL,
    "estadoIDV" text NOT NULL,
    "fechaFinal" date NOT NULL,
    "zonaIDV" text NOT NULL,
    "entidadIDV" text NOT NULL,
    "testingVI" text
);


ALTER TABLE public.ofertas OWNER TO postgres;

--
-- Name: ofertasV2_ofertaUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.ofertas ALTER COLUMN "ofertaUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."ofertasV2_ofertaUID_seq"
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
    "clienteUID" bigint NOT NULL,
    "nombreCompleto" text NOT NULL,
    pasaporte text,
    "pernoctanteUID" bigint NOT NULL,
    "testingVI" text
);


ALTER TABLE public."poolClientes" OWNER TO postgres;

--
-- Name: poolClientesPreFormateo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."poolClientes" ALTER COLUMN "clienteUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "titularPoolUID" bigint NOT NULL,
    "nombreTitular" text,
    "pasaporteTitular" text,
    "mailTitular" text,
    "telefonoTitular" text,
    "reservaUID" numeric(1000,0) NOT NULL
);


ALTER TABLE public."poolTitularesReserva" OWNER TO postgres;

--
-- Name: poolTitularesReserva_ud_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."poolTitularesReserva" ALTER COLUMN "titularPoolUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "precioUID" bigint NOT NULL,
    "apartamentoIDV" text,
    precio numeric(10,2),
    "monedaIDV" text
);


ALTER TABLE public."preciosApartamentos" OWNER TO postgres;

--
-- Name: precios_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."preciosApartamentos" ALTER COLUMN "precioUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "componenteUID" bigint NOT NULL,
    "reservaUID" numeric(1000,0) NOT NULL,
    "apartamentoIDV" text NOT NULL,
    "apartamentoUI" text
);


ALTER TABLE public."reservaApartamentos" OWNER TO postgres;

--
-- Name: reservaApartamentos_UID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaApartamentos" ALTER COLUMN "componenteUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "componenteUID" bigint NOT NULL,
    "habitacionUID" bigint NOT NULL,
    "camaIDV" text NOT NULL,
    "reservaUID" numeric(1000,0) NOT NULL,
    "camaUI" text
);


ALTER TABLE public."reservaCamas" OWNER TO postgres;

--
-- Name: reservaCamasFisicas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaCamasFisicas" (
    "componenteUID" bigint NOT NULL,
    "camaIDV" text NOT NULL,
    "reservaUID" numeric(1000,0) NOT NULL,
    "habitacionUID" bigint,
    "camaUI" text NOT NULL
);


ALTER TABLE public."reservaCamasFisicas" OWNER TO postgres;

--
-- Name: reservaCamasFisicas_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaCamasFisicas" ALTER COLUMN "componenteUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaCamasFisicas_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaCamas_UID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaCamas" ALTER COLUMN "componenteUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaCamas_UID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaFinanciero; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaFinanciero" (
    "componenteUID" bigint NOT NULL,
    "reservaUID" numeric(1000,0) NOT NULL,
    "desgloseFinanciero" json,
    "instantaneaNoches" jsonb,
    "instantaneaOfertasPorCondicion" jsonb,
    "instantaneaSobreControlPrecios" jsonb,
    "instantaneaOfertasPorAdministrador" jsonb,
    "instantaneaImpuestos" jsonb
);


ALTER TABLE public."reservaFinanciero" OWNER TO postgres;

--
-- Name: reservaHabitaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaHabitaciones" (
    "componenteUID" bigint NOT NULL,
    "apartamentoUID" bigint NOT NULL,
    "habitacionIDV" text NOT NULL,
    "reservaUID" numeric(1000,0),
    "habitacionUI" text
);


ALTER TABLE public."reservaHabitaciones" OWNER TO postgres;

--
-- Name: reservaHabitaciones_ID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaHabitaciones" ALTER COLUMN "componenteUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaHabitaciones_ID_seq"
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
    "pagoUID" bigint NOT NULL,
    "plataformaDePagoIDV" text NOT NULL,
    "tarjetaDigitos" text,
    "pagoUIDPasarela" text,
    "reservaUID" numeric(1000,0) NOT NULL,
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
    "componenteUID" bigint NOT NULL,
    "reservaUID" numeric(1000,0) NOT NULL,
    "habitacionUID" bigint,
    "clienteUID" bigint,
    "fechaCheckIn" date,
    "fechaCheckOutAdelantado" date
);


ALTER TABLE public."reservaPernoctantes" OWNER TO postgres;

--
-- Name: reservaPernoctante_UID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaPernoctantes" ALTER COLUMN "componenteUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "reembolsoUID" bigint NOT NULL,
    "pagoUID" bigint NOT NULL,
    cantidad numeric(10,2) NOT NULL,
    "plataformaDePagoIDV" text NOT NULL,
    "reembolsoUIDPasarela" text,
    "estadoIDV" text,
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
-- Name: reservaServicios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaServicios" (
    "servicioUID" bigint NOT NULL,
    "reservaUID" numeric(1000,0),
    nombre text,
    contenedor jsonb
);


ALTER TABLE public."reservaServicios" OWNER TO postgres;

--
-- Name: reservaServicios_servicioUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaServicios" ALTER COLUMN "servicioUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaServicios_servicioUID_seq"
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
    "titularUID" bigint NOT NULL,
    "clienteUID" bigint NOT NULL,
    "reservaUID" numeric(1000,0) NOT NULL,
    "testingVI" text
);


ALTER TABLE public."reservaTitulares" OWNER TO postgres;

--
-- Name: reservaTitulares_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaTitulares" ALTER COLUMN "titularUID" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."reservaTitulares_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaTotales_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaFinanciero" ALTER COLUMN "componenteUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaTotales_uid_seq"
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
    "fechaEntrada" date NOT NULL,
    "fechaSalida" date NOT NULL,
    "estadoReservaIDV" text NOT NULL,
    "estadoPagoIDV" text,
    "origenIDV" text,
    "fechaCreacion" timestamp without time zone,
    "fechaCancelacion" timestamp without time zone,
    "reservaUID" numeric(1000,0) NOT NULL,
    "testingVI" text
);


ALTER TABLE public.reservas OWNER TO postgres;

--
-- Name: servicios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicios (
    "servicioUID" bigint NOT NULL,
    nombre text NOT NULL,
    "zonaIDV" text NOT NULL,
    contenedor jsonb NOT NULL,
    "testingVI" text,
    "estadoIDV" text NOT NULL
);


ALTER TABLE public.servicios OWNER TO postgres;

--
-- Name: servicios_servicioUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.servicios ALTER COLUMN "servicioUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."servicios_servicioUID_seq"
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
-- Name: simulacionesDePrecio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."simulacionesDePrecio" (
    "simulacionUID" bigint NOT NULL,
    "desgloseFinanciero" jsonb,
    "instantaneaNoches" jsonb,
    "instantaneaSobreControlPrecios" jsonb,
    "instantaneaOfertasPorCondicion" jsonb,
    "instantaneaOfertasPorAdministrador" jsonb,
    "instantaneaImpuestos" jsonb,
    nombre text,
    "fechaCreacion" date,
    "fechaEntrada" date,
    "fechaSalida" date,
    "apartamentosIDVARRAY" jsonb,
    "reservaUID" numeric(10,0) NOT NULL,
    "testingVI" text,
    "zonaIDV" text
);


ALTER TABLE public."simulacionesDePrecio" OWNER TO postgres;

--
-- Name: simulacionesDePrecioServicios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."simulacionesDePrecioServicios" (
    "servicioUID" bigint NOT NULL,
    nombre text,
    contenedor jsonb,
    "simulacionUID" bigint NOT NULL
);


ALTER TABLE public."simulacionesDePrecioServicios" OWNER TO postgres;

--
-- Name: simulacionesDePrecioServicios_servicioUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."simulacionesDePrecioServicios" ALTER COLUMN "servicioUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."simulacionesDePrecioServicios_servicioUID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: simulacionesDePrecio_simulacionUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."simulacionesDePrecio" ALTER COLUMN "simulacionUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."simulacionesDePrecio_simulacionUID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    usuario text NOT NULL,
    clave text NOT NULL,
    "rolIDV" text NOT NULL,
    sal text NOT NULL,
    "estadoCuentaIDV" text,
    "zonaHoraria" text,
    intentos bigint,
    "cuentaVerificadaIDV" text,
    "codigoVerificacion" text,
    "fechaCaducidadCuentaNoVerificada" timestamp without time zone,
    "ultimoLogin" timestamp without time zone,
    "testingVI" text
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuariosConfiguracion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."usuariosConfiguracion" (
    "configuracionUID" bigint NOT NULL,
    usuario text,
    "configuracionIDV" text,
    valor text
);


ALTER TABLE public."usuariosConfiguracion" OWNER TO postgres;

--
-- Name: usuariosConfiguracion_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."usuariosConfiguracion" ALTER COLUMN "configuracionUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    "rolIDV" text NOT NULL,
    "rolUI" text
);


ALTER TABLE public."usuariosRoles" OWNER TO postgres;

--
-- Name: usuariosZonaHoraria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."usuariosZonaHoraria" (
    "zonaUID" bigint NOT NULL,
    "configuracionIDV" text,
    "zonaHoraria" text,
    usuario text
);


ALTER TABLE public."usuariosZonaHoraria" OWNER TO postgres;

--
-- Name: usuariosZonaHoraria_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."usuariosZonaHoraria" ALTER COLUMN "zonaUID" ADD GENERATED ALWAYS AS IDENTITY (
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
    ADD CONSTRAINT apartamento UNIQUE ("apartamentoIDV") INCLUDE ("apartamentoIDV");


--
-- Name: apartamentosCaracteristicas apartamentosCaracteristicas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."apartamentosCaracteristicas"
    ADD CONSTRAINT "apartamentosCaracteristicas_pkey" PRIMARY KEY ("caracteristicaUID");


--
-- Name: apartamentos apartamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apartamentos
    ADD CONSTRAINT apartamentos_pkey PRIMARY KEY ("apartamentoIDV");


--
-- Name: bloqueosApartamentos bloqueosApartamentos_calendarioIDV_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."bloqueosApartamentos"
    ADD CONSTRAINT "bloqueosApartamentos_calendarioIDV_key" UNIQUE ("calendarioIDV");


--
-- Name: bloqueosApartamentos bloqueosApartamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."bloqueosApartamentos"
    ADD CONSTRAINT "bloqueosApartamentos_pkey" PRIMARY KEY ("bloqueoUID");


--
-- Name: calendariosSincronizados calendariosSincronizados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."calendariosSincronizados"
    ADD CONSTRAINT "calendariosSincronizados_pkey" PRIMARY KEY ("calendarioUID");


--
-- Name: camas cama; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camas
    ADD CONSTRAINT cama UNIQUE ("camaIDV") INCLUDE ("camaIDV");


--
-- Name: camas camas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camas
    ADD CONSTRAINT camas_pkey PRIMARY KEY ("camaIDV");


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY ("clienteUID");


--
-- Name: comportamientoPrecios comportamientoPrecios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."comportamientoPrecios"
    ADD CONSTRAINT "comportamientoPrecios_pkey" PRIMARY KEY ("comportamientoUID");


--
-- Name: configuracionApartamento configuracionApartamentoDisponibildiad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionApartamento"
    ADD CONSTRAINT "configuracionApartamentoDisponibildiad_pkey" PRIMARY KEY ("configuracionUID");


--
-- Name: configuracionApartamento configuracionApartamento_apartamentoIDV_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionApartamento"
    ADD CONSTRAINT "configuracionApartamento_apartamentoIDV_key" UNIQUE ("apartamentoIDV");


--
-- Name: configuracionApartamento configuracionApartamento_configuracionUID_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionApartamento"
    ADD CONSTRAINT "configuracionApartamento_configuracionUID_key" UNIQUE ("configuracionUID");


--
-- Name: configuracionHabitacionesDelApartamento configuracionApartamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionHabitacionesDelApartamento"
    ADD CONSTRAINT "configuracionApartamento_pkey" PRIMARY KEY ("componenteUID");


--
-- Name: configuracionGlobal configuracionGlobal_configuracionUID_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionGlobal"
    ADD CONSTRAINT "configuracionGlobal_configuracionUID_key" UNIQUE ("configuracionUID");


--
-- Name: configuracionGlobal configuracionGlobal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionGlobal"
    ADD CONSTRAINT "configuracionGlobal_pkey" PRIMARY KEY ("configuracionUID");


--
-- Name: configuracionCamasEnHabitacion configuracionHabitacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionCamasEnHabitacion"
    ADD CONSTRAINT "configuracionHabitacion_pkey" PRIMARY KEY ("componenteUID");


--
-- Name: datosDeUsuario datosDeUsuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."datosDeUsuario"
    ADD CONSTRAINT "datosDeUsuario_pkey" PRIMARY KEY (usuario);


--
-- Name: datosDeUsuario datosDeUsuario_usuarioIDX_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."datosDeUsuario"
    ADD CONSTRAINT "datosDeUsuario_usuarioIDX_key" UNIQUE (usuario);


--
-- Name: datosDeUsuario datosDeUsuiario_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."datosDeUsuario"
    ADD CONSTRAINT "datosDeUsuiario_email_key" UNIQUE (mail);


--
-- Name: datosDeUsuario datosDeUsuiario_pasaporte_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."datosDeUsuario"
    ADD CONSTRAINT "datosDeUsuiario_pasaporte_key" UNIQUE (pasaporte);


--
-- Name: enlaceDeRecuperacionCuenta enlaceDeRecuperacionCuenta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlaceDeRecuperacionCuenta"
    ADD CONSTRAINT "enlaceDeRecuperacionCuenta_pkey" PRIMARY KEY ("enlaceUID");


--
-- Name: enlaceDeRecuperacionCuenta enlaceDeRecuperacionCuenta_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlaceDeRecuperacionCuenta"
    ADD CONSTRAINT "enlaceDeRecuperacionCuenta_usuario_key" UNIQUE (usuario);


--
-- Name: enlaceVerificarCuenta enlaceVerificarCuenta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlaceVerificarCuenta"
    ADD CONSTRAINT "enlaceVerificarCuenta_pkey" PRIMARY KEY ("enlaceUID");


--
-- Name: enlacesDePago enlacesDePago_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlacesDePago"
    ADD CONSTRAINT "enlacesDePago_codigo_key" UNIQUE (codigo);


--
-- Name: enlacesDePago enlacesDePago_enlaceTVI_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlacesDePago"
    ADD CONSTRAINT "enlacesDePago_enlaceTVI_key" UNIQUE ("testingVI");


--
-- Name: enlacesDePago enlacesDePago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlacesDePago"
    ADD CONSTRAINT "enlacesDePago_pkey" PRIMARY KEY ("enlaceUID");


--
-- Name: enlacesPdf enlacesPdf_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlacesPdf"
    ADD CONSTRAINT "enlacesPdf_pkey" PRIMARY KEY ("enlaceUID");


--
-- Name: estadoApartamentos estadoApartamentos_estado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadoApartamentos"
    ADD CONSTRAINT "estadoApartamentos_estado_key" UNIQUE ("estadoIDV");


--
-- Name: estadoApartamentos estadoApartamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadoApartamentos"
    ADD CONSTRAINT "estadoApartamentos_pkey" PRIMARY KEY ("estadoUID");


--
-- Name: estadoPerfilPrecio estadoPerfilPrecio_estado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadoPerfilPrecio"
    ADD CONSTRAINT "estadoPerfilPrecio_estado_key" UNIQUE ("estadoIDV");


--
-- Name: estadoPerfilPrecio estadoPerfilPrecio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadoPerfilPrecio"
    ADD CONSTRAINT "estadoPerfilPrecio_pkey" PRIMARY KEY ("estadoUID");


--
-- Name: estadosCuenta estadosCuenta_estado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadosCuenta"
    ADD CONSTRAINT "estadosCuenta_estado_key" UNIQUE ("estadoIDV");


--
-- Name: estadosCuenta estadosCuenta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadosCuenta"
    ADD CONSTRAINT "estadosCuenta_pkey" PRIMARY KEY ("estadoIDV");


--
-- Name: estadosPago estadosPago_estadosPago_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadosPago"
    ADD CONSTRAINT "estadosPago_estadosPago_key" UNIQUE ("estadosDV");


--
-- Name: estadosPago estadosPago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadosPago"
    ADD CONSTRAINT "estadosPago_pkey" PRIMARY KEY ("estadoUID");


--
-- Name: estadosReserva estadosReserva_estado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadosReserva"
    ADD CONSTRAINT "estadosReserva_estado_key" UNIQUE ("estadoIDV");


--
-- Name: estadosReserva estadosReserva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."estadosReserva"
    ADD CONSTRAINT "estadosReserva_pkey" PRIMARY KEY ("estadoUID");


--
-- Name: habitaciones habitacion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habitaciones
    ADD CONSTRAINT habitacion UNIQUE ("habitacionIDV") INCLUDE ("habitacionIDV");


--
-- Name: habitaciones habitaciones_habitacionUI_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habitaciones
    ADD CONSTRAINT "habitaciones_habitacionUI_key" UNIQUE ("habitacionUI");


--
-- Name: habitaciones habitaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habitaciones
    ADD CONSTRAINT habitaciones_pkey PRIMARY KEY ("habitacionIDV");


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
    ADD CONSTRAINT "mensaesEnPortada_pkey" PRIMARY KEY ("mensajeUID", mensaje);


--
-- Name: monedas monedas_monedaIDV_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monedas
    ADD CONSTRAINT "monedas_monedaIDV_key" UNIQUE ("monedaIDV");


--
-- Name: monedas monedas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monedas
    ADD CONSTRAINT monedas_pkey PRIMARY KEY ("monedaUID");


--
-- Name: monedas monedas_simbolo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monedas
    ADD CONSTRAINT monedas_simbolo_key UNIQUE ("simboloIDV");


--
-- Name: ofertas ofertasV2_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ofertas
    ADD CONSTRAINT "ofertasV2_pkey" PRIMARY KEY ("ofertaUID");


--
-- Name: ofertas ofertas_nombreOferta_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ofertas
    ADD CONSTRAINT "ofertas_nombreOferta_key" UNIQUE ("nombreOferta");


--
-- Name: plataformaDePago plataformaDePago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."plataformaDePago"
    ADD CONSTRAINT "plataformaDePago_pkey" PRIMARY KEY ("plataformaIDV");


--
-- Name: poolClientes poolClientesPreFormateo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."poolClientes"
    ADD CONSTRAINT "poolClientesPreFormateo_pkey" PRIMARY KEY ("clienteUID");


--
-- Name: poolTitularesReserva poolTitularesReserva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."poolTitularesReserva"
    ADD CONSTRAINT "poolTitularesReserva_pkey" PRIMARY KEY ("titularPoolUID");


--
-- Name: mensajesEnPortada posicion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."mensajesEnPortada"
    ADD CONSTRAINT posicion UNIQUE (posicion) INCLUDE (posicion);


--
-- Name: preciosApartamentos precios_apartamento_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."preciosApartamentos"
    ADD CONSTRAINT precios_apartamento_key UNIQUE ("apartamentoIDV");


--
-- Name: preciosApartamentos precios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."preciosApartamentos"
    ADD CONSTRAINT precios_pkey PRIMARY KEY ("precioUID");


--
-- Name: reservaApartamentos reservaApartamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaApartamentos"
    ADD CONSTRAINT "reservaApartamentos_pkey" PRIMARY KEY ("componenteUID");


--
-- Name: reservaCamasFisicas reservaCamasFisicas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamasFisicas"
    ADD CONSTRAINT "reservaCamasFisicas_pkey" PRIMARY KEY ("componenteUID");


--
-- Name: reservaCamasFisicas reservaCamasFisicas_uid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamasFisicas"
    ADD CONSTRAINT "reservaCamasFisicas_uid_key" UNIQUE ("componenteUID");


--
-- Name: reservaCamas reservaCamas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamas"
    ADD CONSTRAINT "reservaCamas_pkey" PRIMARY KEY ("componenteUID");


--
-- Name: reservaFinanciero reservaDesgloseFinanciero_componenteUID_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaFinanciero"
    ADD CONSTRAINT "reservaDesgloseFinanciero_componenteUID_key" UNIQUE ("componenteUID");


--
-- Name: reservaHabitaciones reservaHabitaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaHabitaciones"
    ADD CONSTRAINT "reservaHabitaciones_pkey" PRIMARY KEY ("componenteUID");


--
-- Name: reservaPagos reservaPagos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPagos"
    ADD CONSTRAINT "reservaPagos_pkey" PRIMARY KEY ("pagoUID");


--
-- Name: reservaPernoctantes reservaPernoctante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPernoctantes"
    ADD CONSTRAINT "reservaPernoctante_pkey" PRIMARY KEY ("componenteUID");


--
-- Name: reservaReembolsos reservaReembolsos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaReembolsos"
    ADD CONSTRAINT "reservaReembolsos_pkey" PRIMARY KEY ("reembolsoUID");


--
-- Name: reservaServicios reservaServicios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaServicios"
    ADD CONSTRAINT "reservaServicios_pkey" PRIMARY KEY ("servicioUID");


--
-- Name: reservaTitulares reservaTitulares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaTitulares"
    ADD CONSTRAINT "reservaTitulares_pkey" PRIMARY KEY ("titularUID");


--
-- Name: reservaFinanciero reservaTotales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaFinanciero"
    ADD CONSTRAINT "reservaTotales_pkey" PRIMARY KEY ("componenteUID");


--
-- Name: reservas reservas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_pkey PRIMARY KEY ("reservaUID");


--
-- Name: reservas reservas_reservaUIDnuevo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT "reservas_reservaUIDnuevo_key" UNIQUE ("reservaUID");


--
-- Name: servicios servicios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT servicios_pkey PRIMARY KEY ("servicioUID");


--
-- Name: sessiones session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessiones
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: simulacionesDePrecioServicios simulacionDePrecioServicios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecioServicios"
    ADD CONSTRAINT "simulacionDePrecioServicios_pkey" PRIMARY KEY ("servicioUID");


--
-- Name: simulacionesDePrecio simulacionesDePrecio_reservaUID_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecio"
    ADD CONSTRAINT "simulacionesDePrecio_reservaUID_key" UNIQUE ("reservaUID");


--
-- Name: simulacionesDePrecio simulacionesDePrecio_uid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecio"
    ADD CONSTRAINT "simulacionesDePrecio_uid_key" UNIQUE ("simulacionUID");


--
-- Name: simulacionesDePrecio simuladorPrecios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecio"
    ADD CONSTRAINT "simuladorPrecios_pkey" PRIMARY KEY ("simulacionUID");


--
-- Name: usuariosConfiguracion usuariosConfiguracion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosConfiguracion"
    ADD CONSTRAINT "usuariosConfiguracion_pkey" PRIMARY KEY ("configuracionUID");


--
-- Name: usuariosRoles usuariosRoles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosRoles"
    ADD CONSTRAINT "usuariosRoles_pkey" PRIMARY KEY ("rolIDV");


--
-- Name: usuariosZonaHoraria usuariosZonaHoraria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosZonaHoraria"
    ADD CONSTRAINT "usuariosZonaHoraria_pkey" PRIMARY KEY ("zonaUID");


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
-- Name: configuracionHabitacionesDelApartamento Apartamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionHabitacionesDelApartamento"
    ADD CONSTRAINT "Apartamento" FOREIGN KEY ("apartamentoIDV") REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaHabitaciones Apartamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaHabitaciones"
    ADD CONSTRAINT "Apartamento" FOREIGN KEY ("apartamentoUID") REFERENCES public."reservaApartamentos"("componenteUID") ON DELETE CASCADE NOT VALID;


--
-- Name: configuracionCamasEnHabitacion Cama; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionCamasEnHabitacion"
    ADD CONSTRAINT "Cama" FOREIGN KEY ("camaIDV") REFERENCES public.camas("camaIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: configuracionHabitacionesDelApartamento Habitacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionHabitacionesDelApartamento"
    ADD CONSTRAINT "Habitacion" FOREIGN KEY ("habitacionIDV") REFERENCES public.habitaciones("habitacionIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: configuracionCamasEnHabitacion Habitacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionCamasEnHabitacion"
    ADD CONSTRAINT "Habitacion" FOREIGN KEY ("habitacionUID") REFERENCES public."configuracionHabitacionesDelApartamento"("componenteUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaCamas Habitacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamas"
    ADD CONSTRAINT "Habitacion" FOREIGN KEY ("habitacionUID") REFERENCES public."reservaHabitaciones"("componenteUID") ON DELETE CASCADE NOT VALID;


--
-- Name: reservaPernoctantes Habitacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPernoctantes"
    ADD CONSTRAINT "Habitacion" FOREIGN KEY ("habitacionUID") REFERENCES public."reservaHabitaciones"("componenteUID") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: usuariosZonaHoraria IDX; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosZonaHoraria"
    ADD CONSTRAINT "IDX" FOREIGN KEY (usuario) REFERENCES public.usuarios(usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaPernoctantes Pernoctante; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPernoctantes"
    ADD CONSTRAINT "Pernoctante" FOREIGN KEY ("clienteUID") REFERENCES public.clientes("clienteUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaApartamentos Reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaApartamentos"
    ADD CONSTRAINT "Reserva" FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON DELETE CASCADE;


--
-- Name: preciosApartamentos apartamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."preciosApartamentos"
    ADD CONSTRAINT apartamento FOREIGN KEY ("apartamentoIDV") REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: configuracionApartamento apartamentoIDV; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionApartamento"
    ADD CONSTRAINT "apartamentoIDV" FOREIGN KEY ("apartamentoIDV") REFERENCES public.apartamentos("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: apartamentosCaracteristicas apartamentoIDV; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."apartamentosCaracteristicas"
    ADD CONSTRAINT "apartamentoIDV" FOREIGN KEY ("apartamentoIDV") REFERENCES public.apartamentos("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: calendariosSincronizados apartamentoIDV; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."calendariosSincronizados"
    ADD CONSTRAINT "apartamentoIDV" FOREIGN KEY ("apartamentoIDV") REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bloqueosApartamentos apartamentos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."bloqueosApartamentos"
    ADD CONSTRAINT apartamentos FOREIGN KEY ("apartamentoIDV") REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaCamasFisicas camaIDV; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamasFisicas"
    ADD CONSTRAINT "camaIDV" FOREIGN KEY ("camaIDV") REFERENCES public.camas("camaIDV") ON UPDATE CASCADE;


--
-- Name: datosDeUsuario datosDeUsuiario_usuarioIDX_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."datosDeUsuario"
    ADD CONSTRAINT "datosDeUsuiario_usuarioIDX_fkey" FOREIGN KEY (usuario) REFERENCES public.usuarios(usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: configuracionApartamento estadoConfiguracion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionApartamento"
    ADD CONSTRAINT "estadoConfiguracion" FOREIGN KEY ("estadoConfiguracionIDV") REFERENCES public."estadoApartamentos"("estadoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: usuarios estadoCuenta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "estadoCuenta" FOREIGN KEY ("estadoCuentaIDV") REFERENCES public."estadosCuenta"("estadoIDV") ON UPDATE CASCADE;


--
-- Name: reservas estadoReserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT "estadoReserva" FOREIGN KEY ("estadoReservaIDV") REFERENCES public."estadosReserva"("estadoIDV") ON UPDATE CASCADE;


--
-- Name: reservaCamasFisicas habitacionUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamasFisicas"
    ADD CONSTRAINT "habitacionUID" FOREIGN KEY ("habitacionUID") REFERENCES public."reservaHabitaciones"("componenteUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: preciosApartamentos moneda; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."preciosApartamentos"
    ADD CONSTRAINT moneda FOREIGN KEY ("monedaIDV") REFERENCES public.monedas("monedaIDV") ON UPDATE CASCADE;


--
-- Name: reservaReembolsos pagoUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaReembolsos"
    ADD CONSTRAINT "pagoUID" FOREIGN KEY ("pagoUID") REFERENCES public."reservaPagos"("pagoUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: poolClientes pernoctanteUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."poolClientes"
    ADD CONSTRAINT "pernoctanteUID" FOREIGN KEY ("pernoctanteUID") REFERENCES public."reservaPernoctantes"("componenteUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaPagos plataforma; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPagos"
    ADD CONSTRAINT plataforma FOREIGN KEY ("plataformaDePagoIDV") REFERENCES public."plataformaDePago"("plataformaIDV");


--
-- Name: reservaReembolsos plataformaDePago; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaReembolsos"
    ADD CONSTRAINT "plataformaDePago" FOREIGN KEY ("plataformaDePagoIDV") REFERENCES public."plataformaDePago"("plataformaIDV");


--
-- Name: enlacesPdf reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlacesPdf"
    ADD CONSTRAINT reserva FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: poolTitularesReserva reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."poolTitularesReserva"
    ADD CONSTRAINT reserva FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaCamas reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamas"
    ADD CONSTRAINT reserva FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaHabitaciones reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaHabitaciones"
    ADD CONSTRAINT reserva FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaPagos reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPagos"
    ADD CONSTRAINT reserva FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaPernoctantes reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPernoctantes"
    ADD CONSTRAINT reserva FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaTitulares reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaTitulares"
    ADD CONSTRAINT reserva FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaCamasFisicas reservaUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamasFisicas"
    ADD CONSTRAINT "reservaUID" FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaFinanciero reservaUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaFinanciero"
    ADD CONSTRAINT "reservaUID" FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaServicios reservaUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaServicios"
    ADD CONSTRAINT "reservaUID" FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: enlacesDePago reservas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlacesDePago"
    ADD CONSTRAINT reservas FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: usuarios rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT rol FOREIGN KEY ("rolIDV") REFERENCES public."usuariosRoles"("rolIDV") ON UPDATE CASCADE;


--
-- Name: simulacionesDePrecioServicios simulacionUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecioServicios"
    ADD CONSTRAINT "simulacionUID" FOREIGN KEY ("simulacionUID") REFERENCES public."simulacionesDePrecio"("simulacionUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaTitulares titular; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaTitulares"
    ADD CONSTRAINT titular FOREIGN KEY ("clienteUID") REFERENCES public.clientes("clienteUID") ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: enlaceDeRecuperacionCuenta usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlaceDeRecuperacionCuenta"
    ADD CONSTRAINT usuario FOREIGN KEY (usuario) REFERENCES public.usuarios(usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: enlaceVerificarCuenta usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlaceVerificarCuenta"
    ADD CONSTRAINT usuario FOREIGN KEY ("IDX") REFERENCES public.usuarios(usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: usuariosConfiguracion usuarios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosConfiguracion"
    ADD CONSTRAINT usuarios FOREIGN KEY (usuario) REFERENCES public.usuarios(usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

COPY public.usuarios (usuario, clave, "rolIDV", sal, "estadoCuentaIDV", "zonaHoraria", intentos, "cuentaVerificadaIDV", "codigoVerificacion", "fechaCaducidadCuentaNoVerificada", "ultimoLogin", "testingVI") FROM stdin;
admin	3cdfbaf02424006bc61d8c898c5c3b7388e6bd95e41bfed5f36032da533a925c3b60c83f1a1c29de1af3412bfbd2a0485b152257b23fee9d930883cb698d8690	administrador	d0d163bef7625e75ca06ace7a2e4833b	activado	\N	\N	si	\N	\N	\N	\N
\.