import { useState } from "react";
import Producto from "./Producto.jsx";

export default function Catalogo({ productos, puntos, ocupado, canjear }) {
  const [categoria, setCategoria] = useState("Todas");
  const [orden, setOrden] = useState("original");
  const [pagina, setPagina] = useState(1);
  const categorias = [
    "Todas",
    ...new Set(productos.map((producto) => producto.category)),
  ];
  // filter y sort producen la vista; copiamos el array para no modificar las props.
  const filtrados = productos.filter(
    (producto) => categoria === "Todas" || producto.category === categoria,
  );
  const ordenados = [...filtrados];
  if (orden !== "original")
    ordenados.sort((a, b) =>
      orden === "menor" ? a.cost - b.cost : b.cost - a.cost,
    );
  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / 8));
  const visibles = ordenados.slice((pagina - 1) * 8, pagina * 8);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">RECOMPENSAS QUE ELEGÍS VOS</p>
        <h1>
          Tus puntos.
          <br />
          <em>Tu próxima elección.</em>
        </h1>
        <p>
          Explorá el catálogo y encontrá algo que te acompañe todos los días.
        </p>
        <a
          className="button"
          href="#catalogo"
          onClick={(evento) => {
            evento.preventDefault();
            document
              .getElementById("catalogo")
              .scrollIntoView({ behavior: "smooth" });
          }}
        >
          Ver todos los productos ↓
        </a>
      </section>
      <section id="catalogo" aria-labelledby="catalog-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ELEGÍ TU RECOMPENSA</p>
            <h2 id="catalog-title">Catálogo de productos</h2>
          </div>
          <p>{ordenados.length} productos</p>
        </div>
        <div className="filters">
          <label>
            Categoría
            <select
              value={categoria}
              onChange={(evento) => {
                setCategoria(evento.target.value);
                setPagina(1);
              }}
            >
              {categorias.map((valor) => (
                <option key={valor}>{valor}</option>
              ))}
            </select>
          </label>
          <label>
            Ordenar por
            <select
              value={orden}
              onChange={(evento) => {
                setOrden(evento.target.value);
                setPagina(1);
              }}
            >
              <option value="original">Orden del catálogo</option>
              <option value="menor">Menor precio</option>
              <option value="mayor">Mayor precio</option>
            </select>
          </label>
        </div>
        {visibles.length ? (
          <div className="product-grid">
            {visibles.map((producto) => (
              <Producto
                key={producto._id}
                producto={producto}
                puntos={puntos}
                ocupado={ocupado}
                canjear={canjear}
              />
            ))}
          </div>
        ) : (
          <p className="notice">No hay productos en esta categoría.</p>
        )}
        <nav className="pagination" aria-label="Páginas del catálogo">
          <button
            className="secondary"
            disabled={pagina === 1}
            onClick={() => setPagina(pagina - 1)}
          >
            Anterior
          </button>
          <span>
            Página {pagina} de {totalPaginas}
          </span>
          <button
            className="secondary"
            disabled={pagina === totalPaginas}
            onClick={() => setPagina(pagina + 1)}
          >
            Siguiente
          </button>
        </nav>
      </section>
      <section className="steps" aria-label="Cómo funciona">
        <div>
          <span>01 / EXPLORÁ</span>
          <h2>Encontrá tu favorito.</h2>
          <p>Recorré las categorías y mirá el detalle de cada producto.</p>
        </div>
        <div>
          <span>02 / ELEGÍ</span>
          <h2>Usá tus puntos.</h2>
          <p>Revisá tu saldo y canjeá una recompensa disponible.</p>
        </div>
        <div>
          <span>03 / DISFRUTÁ</span>
          <h2>Todo en tu historial.</h2>
          <p>Consultá los productos que ya canjeaste.</p>
        </div>
      </section>
    </>
  );
}
