/* ══════════════════════════════════════════════
   iSTORE — script.js
   ──────────────────────────────────────────────
   Clases:  Producto · Carrito
   DOM:     querySelector · addEventListener · createElement
   Eventos: agregar · eliminar · vaciar · finalizar compra
══════════════════════════════════════════════ */

'use strict';

/* ════════════════════════════════════════════
   CLASE: Producto
   ──────────────────────────────────────────
   Atributos:
     id         {Number}
     nombre     {String}
     precio     {Number}
     imagen     {String}  — src leído del HTML
     categoria  {String}
════════════════════════════════════════════ */
class Producto {
  constructor(id, nombre, precio, imagen, categoria, descripcion, badge) {
    this.id          = id;
    this.nombre      = nombre;
    this.precio      = precio;
    this.imagen      = imagen;      // Src inyectado desde el HTML
    this.categoria   = categoria;
    this.descripcion = descripcion ?? '';
    this.badge       = badge       ?? null;
  }
}

/* ════════════════════════════════════════════
   CLASE: Carrito
   ──────────────────────────────────────────
   Atributos:
     articulos  {Array}   — [{ producto, cantidad }]
     total      {Number}
   Métodos:
     agregarProducto(producto, cantidad)
     eliminarProducto(id)
     calcularTotal()
     vaciarCarrito()
     renderizar()
════════════════════════════════════════════ */
class Carrito {

  constructor() {
    this.articulos = [];
    this.total     = 0;
  }

  /* ── Agregar producto ─────────────────── */
  agregarProducto(producto, cantidad = 1) {
    const existente = this.articulos.find(a => a.producto.id === producto.id);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.articulos.push({ producto, cantidad });
    }
    this.calcularTotal();
    this.renderizar();
    actualizarBadge();
    mostrarToast(`${producto.nombre} agregado al carrito`);
  }

  /* ── Eliminar producto ────────────────── */
  eliminarProducto(id) {
    this.articulos = this.articulos.filter(a => a.producto.id !== id);
    this.calcularTotal();
    this.renderizar();
    actualizarBadge();
  }

  /* ── Calcular total ───────────────────── */
  calcularTotal() {
    this.total = this.articulos.reduce(
      (acc, a) => acc + a.producto.precio * a.cantidad, 0
    );
  }

  /* ── Vaciar carrito ───────────────────── */
  vaciarCarrito() {
    this.articulos = [];
    this.total     = 0;
    this.renderizar();
    actualizarBadge();
  }

  /* ── Renderizar DOM del carrito ───────── */
  renderizar() {
    const itemsEl  = document.querySelector('#cartItems');
    const emptyEl  = document.querySelector('#cartEmptyMsg');
    const footerEl = document.querySelector('#cartFooter');
    const totalEl  = document.querySelector('#cartTotal');

    // 1. Limpiar ítems actuales (conservar el mensaje vacío)
    itemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());

    if (this.articulos.length === 0) {
      // Mostrar estado vacío
      emptyEl.style.display  = 'flex';
      footerEl.classList.add('hidden');
      return;
    }

    // 2. Ocultar estado vacío y mostrar footer
    emptyEl.style.display = 'none';
    footerEl.classList.remove('hidden');

    // 3. Construir un ítem por cada artículo
    this.articulos.forEach(({ producto, cantidad }) => {
      const item = document.createElement('div');
      item.className  = 'cart-item';
      item.dataset.id = producto.id;

      item.innerHTML = `
        <img
          class="ci-thumb"
          src="${producto.imagen}"
          alt="${producto.nombre}"
          onerror="this.src='https://placehold.co/62x62/f5f5f7/1d1d1f?text=📦'"
        />
        <div class="ci-info">
          <p  class="ci-name">${producto.nombre}</p>
          <p  class="ci-qty" >Cant: ${cantidad}</p>
        </div>
        <span class="ci-price">
          $${(producto.precio * cantidad).toLocaleString('es-CO')}
        </span>
        <button
          class="ci-del"
          data-id="${producto.id}"
          aria-label="Eliminar ${producto.nombre}"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" width="12" height="12">
            <line x1="18" y1="6"  x2="6"  y2="18"/>
            <line x1="6"  y1="6"  x2="18" y2="18"/>
          </svg>
        </button>
      `;

      itemsEl.appendChild(item);
    });

    // 4. Eventos: eliminar por ítem
    itemsEl.querySelectorAll('.ci-del').forEach(btn => {
      btn.addEventListener('click', () => {
        carrito.eliminarProducto(Number(btn.dataset.id));
      });
    });

    // 5. Actualizar total
    totalEl.textContent = `$${this.total.toLocaleString('es-CO')}`;
  }

} // — fin Carrito


/* ════════════════════════════════════════════
   CATÁLOGO DE PRODUCTOS
   ──────────────────────────────────────────
   Las imágenes se leen desde el HTML (div#productImages).
   Así puedes cambiarlas fácilmente sin tocar el JS.
════════════════════════════════════════════ */

/* Leer srcs desde el HTML */
function leerImagenHTML(id) {
  const img = document.querySelector(`#productImages img[data-product-id="${id}"]`);
  // Si la imagen existe en el HTML → usar su src; si no → placeholder
  return img ? img.src : `https://placehold.co/400x440/f5f5f7/1d1d1f?text=Producto+${id}`;
}

/* Definición del catálogo */
const CATALOGO = [
  new Producto(
    1,
    'iPhone 15 Pro',
    5_999_000,
    leerImagenHTML(1),
    'iphone',
    'Titanio. Chip A17 Pro. Cámara 48 MP con zoom 5×.',
    'Nuevo'
  ),
  new Producto(
    2,
    'MacBook Air M3',
    6_499_000,
    leerImagenHTML(2),
    'mac',
    'Chip Apple M3. Hasta 18 h de batería. 13 pulgadas.',
    null
  ),
  new Producto(
    3,
    'iPad Pro 12.9"',
    7_299_000,
    leerImagenHTML(3),
    'ipad',
    'Chip M2. Pantalla Liquid Retina XDR. Ultra Retina.',
    null
  ),
  new Producto(
    4,
    'AirPods Pro 2',
    1_599_000,
    leerImagenHTML(4),
    'audio',
    'Cancelación activa de ruido. Audio espacial adaptativo.',
    'Best seller'
  ),
  new Producto(
    5,
    'Apple Watch Series 9',
    2_399_000,
    leerImagenHTML(5),
    'watch',
    'Chip S9. Gesto doble toque. Pantalla Always-On.',
    'Nuevo'
  ),
  new Producto(
    6,
    'MacBook Pro 14"',
    9_999_000,
    leerImagenHTML(6),
    'mac',
    'Chip M3 Pro. Pantalla Liquid Retina XDR. 14 pulgadas.',
    null
  ),
  new Producto(
    7,
    'iPhone 15',
    4_399_000,
    leerImagenHTML(7),
    'iphone',
    'Dynamic Island. USB‑C. Cámara 48 MP. Varios colores.',
    null
  ),
  new Producto(
    8,
    'iPad Air',
    3_699_000,
    leerImagenHTML(8),
    'ipad',
    'Chip M1. Compatible con Apple Pencil 2.ª generación.',
    null
  ),
];


/* ════════════════════════════════════════════
   INSTANCIA GLOBAL DEL CARRITO
════════════════════════════════════════════ */
const carrito = new Carrito();


/* ════════════════════════════════════════════
   RENDERIZAR CATÁLOGO
════════════════════════════════════════════ */
const TITULOS_CAT = {
  todos : 'Todos los productos',
  iphone: 'iPhone',
  mac   : 'Mac',
  ipad  : 'iPad',
  audio : 'Audio',
  watch : 'Apple Watch',
};

function renderizarCatalogo(filtro = 'todos') {
  const grid    = document.querySelector('#catalogGrid');
  const h2      = document.querySelector('#catalogH2');
  const count   = document.querySelector('#catalogCount');

  const lista = filtro === 'todos'
    ? CATALOGO
    : CATALOGO.filter(p => p.categoria === filtro);

  h2.textContent    = TITULOS_CAT[filtro] ?? 'Productos';
  count.textContent = `${lista.length} ${lista.length === 1 ? 'producto' : 'productos'}`;
  grid.innerHTML    = '';

  lista.forEach((prod, idx) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.style.animationDelay = `${idx * 0.06}s`;

    card.innerHTML = `
      <div class="card-img-zone">
        ${prod.badge ? `<span class="card-badge">${prod.badge}</span>` : ''}
        <img
          src="${prod.imagen}"
          alt="${prod.nombre}"
          loading="lazy"
          onerror="this.src='https://placehold.co/400x440/f5f5f7/1d1d1f?text=${encodeURIComponent(prod.nombre)}'"
        />
      </div>
      <div class="card-body">
        <p  class="card-cat" >${prod.categoria}</p>
        <h3 class="card-name">${prod.nombre}</h3>
        <p  class="card-desc">${prod.descripcion}</p>
        <p  class="card-price">
          <sup>$</sup>${prod.precio.toLocaleString('es-CO')}
        </p>
      </div>
      <button class="btn-add-cart" data-id="${prod.id}">
        Agregar al carrito
      </button>
    `;

    grid.appendChild(card);
  });

  /* Eventos: botones "Agregar al carrito" */
  grid.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id   = Number(btn.dataset.id);
      const prod = CATALOGO.find(p => p.id === id);
      if (!prod) return;

      carrito.agregarProducto(prod, 1);

      // Feedback visual en el botón
      btn.textContent = '✓ Agregado';
      btn.classList.add('done');
      setTimeout(() => {
        btn.textContent = 'Agregar al carrito';
        btn.classList.remove('done');
      }, 1800);
    });
  });
}


/* ════════════════════════════════════════════
   BADGE DEL CARRITO
════════════════════════════════════════════ */
function actualizarBadge() {
  const total  = carrito.articulos.reduce((s, a) => s + a.cantidad, 0);
  const badge  = document.querySelector('#cartBadge');
  badge.textContent = total;
  badge.classList.remove('pop');
  void badge.offsetWidth; // Forzar reflow para reiniciar la animación
  badge.classList.add('pop');
}


/* ════════════════════════════════════════════
   TOAST
════════════════════════════════════════════ */
let _toastTimer;

function mostrarToast(mensaje) {
  const toast = document.querySelector('#toast');
  clearTimeout(_toastTimer);
  toast.textContent = mensaje;
  toast.classList.add('show');
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}


/* ════════════════════════════════════════════
   ABRIR / CERRAR CARRITO
════════════════════════════════════════════ */
function abrirCarrito() {
  document.querySelector('#cartDrawer').classList.add('open');
  document.querySelector('#backdrop').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function cerrarCarrito() {
  document.querySelector('#cartDrawer').classList.remove('open');
  document.querySelector('#backdrop').classList.remove('show');
  document.body.style.overflow = '';
}


/* ════════════════════════════════════════════
   MODAL: COMPRA FINALIZADA
════════════════════════════════════════════ */
function abrirModal() {
  document.querySelector('#modalOverlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function cerrarModal() {
  document.querySelector('#modalOverlay').classList.remove('show');
  document.body.style.overflow = '';
}


/* ════════════════════════════════════════════
   EVENTOS GLOBALES
════════════════════════════════════════════ */

/* Abrir / cerrar carrito */
document.querySelector('#cartToggle').addEventListener('click', abrirCarrito);
document.querySelector('#cartClose').addEventListener('click', cerrarCarrito);
document.querySelector('#backdrop').addEventListener('click', cerrarCarrito);

/* Vaciar carrito */
document.querySelector('#btnClear').addEventListener('click', () => {
  if (carrito.articulos.length === 0) return;
  carrito.vaciarCarrito();
  mostrarToast('Carrito vaciado');
});

/* Finalizar compra */
document.querySelector('#btnCheckout').addEventListener('click', () => {
  if (carrito.articulos.length === 0) return;
  cerrarCarrito();
  // Pequeño delay para que el drawer cierre suavemente antes del modal
  setTimeout(() => {
    carrito.vaciarCarrito();   // Vaciar carrito
    actualizarBadge();         // Reiniciar badge
    abrirModal();              // Mostrar "Compra realizada"
  }, 380);
});

/* Cerrar modal */
document.querySelector('#modalClose').addEventListener('click', () => {
  cerrarModal();
});

/* Tecla ESC */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    cerrarCarrito();
    cerrarModal();
  }
});

/* Filtros de categoría */
document.querySelectorAll('.fil').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.fil').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderizarCatalogo(btn.dataset.cat);
  });
});


/* ════════════════════════════════════════════
   INICIALIZACIÓN
════════════════════════════════════════════ */
renderizarCatalogo('todos');
carrito.renderizar();