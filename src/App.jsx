import { useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useLocation, useParams } from "react-router-dom";
import { consultar, modoDemo, tieneToken } from "./api.js";
import Catalogo from "./Catalogo.jsx";
import { ImagenProducto } from "./Producto.jsx";

function Detalle({ productos, puntos, ocupado, canjear }) {
  const { id } = useParams();
  // La API no documenta GET /products/:id: buscamos en el catálogo completo.
  const producto = productos.find((item) => item._id === id);
  if (!producto)
    return (
      <section className="notice">
        <h1>Producto no encontrado</h1>
        <Link to="/">Volver al catálogo</Link>
      </section>
    );
  return (
    <section>
      <Link className="back" to="/">
        ← Volver al catálogo
      </Link>
      <div className="detail">
        <ImagenProducto producto={producto} />
        <div>
          <p className="eyebrow">{producto.category}</p>
          <h1>{producto.name}</h1>
          <p className="cost">
            {producto.cost.toLocaleString("es-AR")} <span>puntos</span>
          </p>
          <p className={puntos >= producto.cost ? "available" : "unavailable"}>
            {puntos >= producto.cost
              ? "Disponible para canjear"
              : `Te faltan ${(producto.cost - puntos).toLocaleString("es-AR")} puntos`}
          </p>
          <button
            disabled={ocupado || puntos < producto.cost}
            onClick={() => canjear(producto)}
          >
            {ocupado ? "Procesando…" : "Canjear ahora"}
          </button>
          <p>
            El canje descuenta el costo de tu saldo y registra el producto en tu
            historial.
          </p>
        </div>
      </div>
    </section>
  );
}

function Historial() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    const controlador = new AbortController();
    setError("");
    setDatos(null);
    consultar("/user/history", undefined, controlador.signal)
      .then(setDatos)
      .catch((error) => {
        if (!controlador.signal.aborted) setError(error.message);
      });
    return () => controlador.abort();
  }, [intento]);
  return (
    <section>
      <Link className="back" to="/">
        ← Volver al catálogo
      </Link>
      <h1>Mis canjes</h1>
      {error ? (
        <div role="alert" className="notice">
          <p>{error}</p>
          <button onClick={() => setIntento(intento + 1)}>Reintentar</button>
        </div>
      ) : !datos ? (
        <p role="status">Cargando historial…</p>
      ) : !datos.length ? (
        <p className="notice">Todavía no canjeaste productos.</p>
      ) : (
        <ul className="history">
          {datos.map((item, indice) => (
            <li key={`${item._id}-${indice}`}>
              <strong>{item.name || item.productId}</strong>
              <span>{item.cost} puntos</span>
              <time>{new Date(item.createDate).toLocaleString("es-AR")}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function App() {
  const [productos, setProductos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [intento, setIntento] = useState(0);
  const bloqueo = useRef(false);
  const ubicacion = useLocation();
  useEffect(() => {
    document.title =
      ubicacion.pathname === "/"
        ? "Aeropuntos · Catálogo"
        : "Aeropuntos · Recompensas";
    window.scrollTo(0, 0);
  }, [ubicacion.pathname]);
  useEffect(() => {
    const controlador = new AbortController();
    setError("");
    setUsuario(null);
    Promise.all([
      consultar("/products", undefined, controlador.signal),
      consultar("/user/me", undefined, controlador.signal),
    ])
      .then(([catalogo, perfil]) => {
        if (!controlador.signal.aborted) {
          setProductos(catalogo);
          setUsuario(perfil);
        }
      })
      .catch((error) => {
        if (!controlador.signal.aborted) setError(error.message);
      });
    return () => controlador.abort();
  }, [intento]);

  async function ejecutarAccion(ruta, datos, texto) {
    // El ref impide un segundo POST incluso antes del próximo render de React.
    if (bloqueo.current) return;
    bloqueo.current = true;
    setOcupado(true);
    setMensaje("");
    setErrorAccion("");
    let completada = false;
    try {
      await consultar(ruta, datos);
      completada = true;
      // El servidor es la fuente del saldo: volvemos a pedirlo tras el POST.
      setUsuario(await consultar("/user/me"));
      setMensaje(texto);
    } catch (error) {
      if (completada) {
        setUsuario(null);
        setError(
          "La operación se realizó, pero no se pudo actualizar el saldo. Recargá los datos antes de operar de nuevo.",
        );
      } else
        setErrorAccion(
          `${error.message} Si se cortó la conexión, verificá el saldo y el historial antes de repetir la operación.`,
        );
    } finally {
      bloqueo.current = false;
      setOcupado(false);
    }
  }
  function canjear(producto) {
    if (!usuario || usuario.points < producto.cost) return;
    ejecutarAccion(
      "/redeem",
      { productId: producto._id },
      `Canjeaste ${producto.name}.`,
    );
  }
  const repo = import.meta.env.VITE_REPO_URL;
  return (
    <>
      <a
        className="skip"
        href="#contenido"
        onClick={(evento) => {
          evento.preventDefault();
          document.getElementById("contenido").focus();
        }}
      >
        Saltar al contenido
      </a>
      {modoDemo && (
        <div className="demo-banner">
          MODO PRÁCTICA · Datos ficticios. Los puntos y canjes se reinician al
          recargar.
        </div>
      )}
      <header className="site-header">
        <Link className="brand" to="/">
          aero<span>puntos</span>
          <i aria-hidden="true">↗</i>
        </Link>
        <nav aria-label="Principal">
          <Link to="/">Catálogo</Link>
          <Link to="/historial">Mis canjes</Link>
        </nav>
        {usuario && (
          <div className="balance">
            <span>{usuario.name}</span>
            <strong>{usuario.points.toLocaleString("es-AR")} pts</strong>
          </div>
        )}
      </header>
      <main id="contenido" tabIndex="-1">
        {usuario && (
          <div className="points-bar">
            <span>¿Te faltan puntos para tu próxima elección?</span>
            <div>
              {[1000, 5000, 7500].map((cantidad) => (
                <button
                  className="secondary"
                  key={cantidad}
                  disabled={ocupado}
                  onClick={() =>
                    ejecutarAccion(
                      "/user/points",
                      { amount: cantidad },
                      `Agregaste ${cantidad} puntos.`,
                    )
                  }
                >
                  +{cantidad.toLocaleString("es-AR")} puntos
                </button>
              ))}
            </div>
          </div>
        )}
        {mensaje && (
          <p className="notice success" role="status">
            {mensaje}
          </p>
        )}
        {errorAccion && (
          <div className="notice" role="alert">
            <p>{errorAccion}</p>
            <button
              className="secondary"
              onClick={() => {
                setErrorAccion("");
                setIntento(intento + 1);
              }}
            >
              Actualizar saldo
            </button>
          </div>
        )}
        {error ? (
          <section className="notice" role="alert">
            <h1>No pudimos cargar el catálogo</h1>
            <p>{error}</p>
            {!tieneToken && !modoDemo && (
              <p>
                Configurá tu token según el README, o iniciá con{" "}
                <code>npm run dev:demo</code> para practicar.
              </p>
            )}
            <button onClick={() => setIntento(intento + 1)}>Reintentar</button>
          </section>
        ) : !usuario ? (
          <p className="notice" role="status">
            Cargando productos y saldo…
          </p>
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <Catalogo
                  productos={productos}
                  puntos={usuario.points}
                  ocupado={ocupado}
                  canjear={canjear}
                />
              }
            />
            <Route
              path="/productos/:id"
              element={
                <Detalle
                  productos={productos}
                  puntos={usuario.points}
                  ocupado={ocupado}
                  canjear={canjear}
                />
              }
            />
            <Route path="/historial" element={<Historial />} />
            <Route
              path="*"
              element={
                <section className="notice">
                  <h1>Página no encontrada</h1>
                  <Link to="/">Volver al catálogo</Link>
                </section>
              }
            />
          </Routes>
        )}
      </main>
      <footer>
        <p>Aeropuntos · Programación Avanzada 2024</p>
        {repo ? (
          <a href={repo} target="_blank" rel="noreferrer">
            Código en GitHub ↗
          </a>
        ) : (
          <span>Repositorio pendiente de publicación</span>
        )}
      </footer>
    </>
  );
}
