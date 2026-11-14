import { Link } from "react-router-dom";
import { useState } from "react";

export function ImagenProducto({ producto }) {
  const [fallo, setFallo] = useState(false);
  return producto.img?.url && !fallo ? (
    <img
      className="product-image"
      src={producto.img.url}
      alt={producto.name}
      loading="lazy"
      onError={() => setFallo(true)}
    />
  ) : (
    <div className="product-image placeholder" aria-label="Producto sin imagen">
      AP
    </div>
  );
}

// Las props traen datos y una función del padre; la tarjeta no maneja el saldo.
export default function Producto({ producto, puntos, ocupado, canjear }) {
  const faltante = Math.max(0, producto.cost - puntos);
  return (
    <article className="product-card">
      <Link className="product-link" to={`/productos/${producto._id}`}>
        <ImagenProducto producto={producto} />
        <span className="eyebrow">{producto.category}</span>
        <h3>{producto.name}</h3>
      </Link>
      <p className="cost">
        {producto.cost.toLocaleString("es-AR")} <span>puntos</span>
      </p>
      <p className={faltante ? "unavailable" : "available"}>
        {faltante
          ? `Te faltan ${faltante.toLocaleString("es-AR")} puntos`
          : "Disponible para canjear"}
      </p>
      <button
        disabled={ocupado || faltante > 0}
        onClick={() => canjear(producto)}
      >
        {ocupado ? "Procesando…" : "Canjear ahora"}
      </button>
    </article>
  );
}
