// ---------- Données produits (photos dans assets/products/) ----------
// Prix : approximations pour le projet, pas les prix officiels.
const P = "assets/products/";
// glow : couleur du halo derrière le vêtement (photos détourées uniquement)
// cats : catégories du menu de gauche (un article peut en avoir plusieurs)
const products = [
  { name: "NIKE R419 TRACK JACKET [MYSTIQUE]", price: 214.99, img: P + "r419-track-jacket.png", cats: ["R419", "NEW", "JACKETS"] },
  { name: "NIKE R419 BASELAYER [MYSTIQUE]", price: 94.99, img: P + "r419-baselayer.png", cats: ["R419", "NEW", "TOPS / JERSEYS"] },
  { name: "ALCATRAZ CARGO PANTS [NAVY]", price: 119.99, img: P + "alcatraz-cargo-navy.png", glow: "rgba(60, 90, 220, .55)", cats: ["CLASSIC", "BOTTOMS"] },
  { name: "ALCATRAZ HEAVYWEIGHT VARSITY JERSEY [GREY]", price: 89.99, img: P + "varsity-jersey-grey.png", glow: "rgba(200, 200, 200, .35)", cats: ["TOPS / JERSEYS"] },
  { name: "OG ISLAND TEE [BABY BLUE]", price: 54.99, img: P + "og-island-tee-baby-blue.png", glow: "rgba(140, 190, 240, .5)", cats: ["CLASSIC", "T-SHIRTS"] },
  { name: "RUSTY ALCATRAZ TEE [BLACK]", price: 54.99, img: P + "rusty-alcatraz-tee-black.png", glow: "rgba(210, 60, 50, .45)", cats: ["T-SHIRTS"] },
  { name: "TRACK AND FIELD TEE [WHITE]", price: 54.99, img: P + "track-field-tee-white.png", glow: "rgba(255, 255, 255, .35)", cats: ["NEW", "T-SHIRTS"] },
  { name: "5 STARZ ALCATRAZ TANK TOP [BLACK]", price: 44.99, img: P + "5starz-tank-black.png", glow: "rgba(255, 213, 0, .4)", cats: ["CLASSIC", "TOPS / JERSEYS"] },
  { name: "STORM BUCKET HAT [PEACH]", price: 49.99, img: P + "storm-bucket-peach.png", glow: "rgba(240, 140, 80, .5)", cats: ["NEW"], oneSize: true },
];

// prix au format du site Corteiz : €214,99
const euro = { format: (n) => "€" + n.toFixed(2).replace(".", ",") };
const grid = document.getElementById("grid");

grid.innerHTML = products.map((p, i) => `
  <li class="card" data-name="${p.name.toLowerCase()}" data-cats="${p.cats.join("|")}">
    <button type="button" class="card__link" data-index="${i}">
      <div class="card__img">${p.img ? `<img src="${p.img}" alt="" loading="lazy"${p.glow ? ` class="has-glow" style="--glow: ${p.glow}"` : ""}>` : `<span>CRTZ</span>`}</div>
      <p class="card__name">${p.name}</p>
      <p class="card__price">${euro.format(p.price)}</p>
    </button>
  </li>`).join("");

// photos : apparition en fondu une fois chargées
function fadeIn(img) {
  const done = () => img.classList.add("is-loaded");
  if (img.complete && img.naturalWidth) done();
  else { img.addEventListener("load", done, { once: true }); img.addEventListener("error", done, { once: true }); }
}
grid.querySelectorAll(".card__img img").forEach(fadeIn);

// ---------- Recherche : loupe -> barre "Search" ----------
const search = document.getElementById("search");
const toggle = document.getElementById("search-toggle");
const input = document.getElementById("search-input");
const empty = document.getElementById("empty");

function openSearch() {
  search.classList.add("is-open");
  toggle.setAttribute("aria-expanded", "true");
  input.tabIndex = 0;
  // attend le début de l'animation pour que le focus ne fasse pas sauter la barre
  setTimeout(() => input.focus(), 120);
}
function closeSearch() {
  search.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  input.tabIndex = -1;
}

toggle.addEventListener("click", () => {
  if (!search.classList.contains("is-open")) openSearch();
  else if (input.value) input.focus();
  else closeSearch();
});

input.addEventListener("input", filter);
input.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    input.value = "";
    filter();
    closeSearch();
    toggle.focus();
  }
});
search.addEventListener("submit", (e) => e.preventDefault());

// raccourci clavier « / » pour ouvrir la recherche
document.addEventListener("keydown", (e) => {
  if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target;
  if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
  if (document.querySelector("dialog[open]")) return;
  e.preventDefault();
  openSearch();
});

// clic en dehors : on referme seulement si le champ est vide
document.addEventListener("pointerdown", (e) => {
  if (!search.contains(e.target) && !input.value) closeSearch();
});

// ---------- Filtre : catégorie du menu + recherche ----------
let activeCat = null;
const catLinks = [...document.querySelectorAll(".cats a")];
const status = document.getElementById("status");
const statusLabel = document.getElementById("status-label");
const statusClear = document.getElementById("status-clear");

catLinks.forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const cat = a.textContent.trim();
    setCategory(activeCat === cat ? null : cat);   // re-cliquer = tout afficher
  });
});
statusClear.addEventListener("click", () => setCategory(null));
document.querySelector(".logo").addEventListener("click", (e) => {
  e.preventDefault();
  input.value = "";
  setCategory(null);
});

function setCategory(cat) {
  activeCat = cat;
  catLinks.forEach((a) => {
    const on = a.textContent.trim() === cat;
    a.classList.toggle("is-active", on);
    if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  filter();
}

function filter() {
  const q = input.value.trim().toLowerCase();
  let shown = 0;
  grid.querySelectorAll(".card").forEach((card) => {
    const inCat = !activeCat || card.dataset.cats.split("|").includes(activeCat);
    const match = inCat && (!q || card.dataset.name.includes(q));
    card.hidden = !match;
    if (match) shown++;
  });

  const label = activeCat || "TOUS LES ARTICLES";
  statusLabel.textContent = `${label} (${shown})${q ? ` · « ${input.value.trim()} »` : ""}`;
  statusClear.hidden = !activeCat;
  document.title = activeCat ? `${activeCat} — Corteiz` : "Corteiz — Redesign";

  empty.hidden = shown > 0;
  empty.textContent = q
    ? `Aucun article ne correspond à « ${input.value.trim()} »${activeCat ? ` dans ${activeCat}` : ""}.`
    : "Aucun article dans cette catégorie pour le moment.";
}

// ---------- Fiche produit + panier ----------
const dialog = document.getElementById("product");
const dImg = document.getElementById("product-img");
const dName = document.getElementById("product-name");
const dPrice = document.getElementById("product-price");
const dSizes = document.getElementById("product-sizes");
const dAdd = document.getElementById("product-add");
const dMsg = document.getElementById("product-msg");
const cartCount = document.getElementById("cart-count");
const cartPill = document.querySelector(".pill--cart");
const SIZES_LIST = ["S", "M", "L", "XL"];
let current = null;
let chosenSize = null;
let addedTimer;

// panier = liste de { i: index du produit, size, qty } — un même article + taille = une seule ligne
let cart = [];
try { cart = JSON.parse(localStorage.getItem("crtz-cart-items")) || []; } catch (e) {}
cart = (Array.isArray(cart) ? cart : []).filter((it) => products[it.i]).reduce((acc, it) => {
  const same = acc.find((x) => x.i === it.i && x.size === it.size);
  if (same) same.qty += it.qty || 1; else acc.push({ i: it.i, size: it.size, qty: it.qty || 1 });
  return acc;
}, []);
const cartQty = () => cart.reduce((n, it) => n + it.qty, 0);

grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".card__link");
  if (btn) openProduct(products[+btn.dataset.index]);
});

function openProduct(p) {
  current = p;
  chosenSize = p.oneSize ? "TU" : null;
  dImg.src = p.img;
  dImg.alt = p.name;
  dImg.classList.toggle("has-glow", !!p.glow);
  dImg.style.setProperty("--glow", p.glow || "transparent");
  dName.textContent = p.name;
  dPrice.textContent = euro.format(p.price);
  dSizes.innerHTML = (p.oneSize ? ["TAILLE UNIQUE"] : SIZES_LIST).map((s) => `
    <button type="button" class="size${p.oneSize ? " is-selected" : ""}" aria-pressed="${p.oneSize}" data-size="${s}">${s}</button>`).join("");
  dMsg.textContent = "";
  resetAddButton();
  dialog.showModal();
}

dSizes.addEventListener("click", (e) => {
  const b = e.target.closest(".size");
  if (!b || current.oneSize) return;
  chosenSize = b.dataset.size;
  dSizes.querySelectorAll(".size").forEach((s) => {
    const on = s === b;
    s.classList.toggle("is-selected", on);
    s.setAttribute("aria-pressed", String(on));
  });
  dMsg.textContent = "";
});

dAdd.addEventListener("click", () => {
  if (!chosenSize) {
    dMsg.textContent = "Choisis une taille.";
    return;
  }
  const i = products.indexOf(current);
  const same = cart.find((it) => it.i === i && it.size === chosenSize);
  if (same) same.qty++; else cart.push({ i, size: chosenSize, qty: 1 });
  saveCart();
  cartPill.classList.remove("is-bump");
  void cartPill.offsetWidth;            // relance l'animation
  cartPill.classList.add("is-bump");
  dAdd.textContent = "AJOUTÉ AU PANIER ✓";
  dAdd.classList.add("is-done");
  dMsg.textContent = `${current.name}${current.oneSize ? "" : ` · taille ${chosenSize}`} ajouté.`;
  clearTimeout(addedTimer);
  addedTimer = setTimeout(resetAddButton, 1600);
});

function resetAddButton() {
  clearTimeout(addedTimer);
  dAdd.textContent = "AJOUTER AU PANIER";
  dAdd.classList.remove("is-done");
}

document.getElementById("product-close").addEventListener("click", () => dialog.close());
// clic sur le fond sombre = fermer
dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });

// ---------- Panneau panier ----------
const drawer = document.getElementById("cart");
const cartList = document.getElementById("cart-list");
const cartEmpty = document.getElementById("cart-empty");
const cartFoot = document.getElementById("cart-foot");
const cartTotal = document.getElementById("cart-total");
const cartMsg = document.getElementById("cart-msg");

function saveCart() {
  try { localStorage.setItem("crtz-cart-items", JSON.stringify(cart)); } catch (e) {}
  renderCart();
}

function renderCart() {
  const n = cartQty();
  cartCount.textContent = n;
  cartPill.classList.toggle("has-items", n > 0);
  cartEmpty.hidden = n > 0;
  cartFoot.hidden = n === 0;
  cartList.innerHTML = cart.map((it, k) => {
    const p = products[it.i];
    return `
    <li class="cart-item">
      <img src="${p.img}" alt=""${p.glow ? ` class="has-glow" style="--glow: ${p.glow}"` : ""}>
      <div class="cart-item__info">
        <p class="cart-item__name">${p.name}</p>
        <p class="cart-item__meta">${it.size === "TU" ? "Taille unique" : "Taille " + it.size} · ${euro.format(p.price * it.qty)}</p>
        <div class="qty" role="group" aria-label="Quantité">
          <button type="button" class="qty__btn" data-k="${k}" data-d="-1" aria-label="Retirer un">−</button>
          <span class="qty__n">×${it.qty}</span>
          <button type="button" class="qty__btn" data-k="${k}" data-d="1" aria-label="Ajouter un">+</button>
        </div>
      </div>
      <button type="button" class="cart-item__remove" data-k="${k}" aria-label="Retirer ${p.name}">×</button>
    </li>`;
  }).join("");
  cartTotal.textContent = euro.format(cart.reduce((sum, it) => sum + products[it.i].price * it.qty, 0));
  cartMsg.textContent = "";
}

function openCart(e) {
  if (e) e.preventDefault();
  if (dialog.open) dialog.close();
  renderCart();
  drawer.showModal();
}

cartPill.addEventListener("click", openCart);
document.getElementById("checkout-pill").addEventListener("click", openCart);
document.getElementById("cart-close").addEventListener("click", () => drawer.close());
drawer.addEventListener("click", (e) => { if (e.target === drawer) drawer.close(); });
document.getElementById("product-cart").addEventListener("click", openCart);

cartList.addEventListener("click", (e) => {
  const q = e.target.closest(".qty__btn");
  if (q) {
    const it = cart[+q.dataset.k];
    it.qty += +q.dataset.d;
    if (it.qty <= 0) cart.splice(+q.dataset.k, 1);
    saveCart();
    return;
  }
  const b = e.target.closest(".cart-item__remove");
  if (!b) return;
  cart.splice(+b.dataset.k, 1);
  saveCart();
});
document.getElementById("cart-checkout").addEventListener("click", () => {
  cartMsg.textContent = "Démo : le paiement n'est pas disponible sur ce site.";
});

renderCart();
filter();

// ---------- Taille du site : 16 / 24 / 34 px ----------
const root = document.documentElement;
const sizeButtons = [...document.querySelectorAll("#size-switch button")];
const SIZES = ["16", "24", "34"];

function setSize(size, save = true) {
  root.dataset.size = size;
  const idx = SIZES.indexOf(size);
  sizeButtons.forEach((b, i) => {
    b.setAttribute("aria-checked", String(i === idx));
    b.tabIndex = i === idx ? 0 : -1;
    b.classList.toggle("is-covered", i <= idx);
  });
  if (save) try { localStorage.setItem("crtz-size", size); } catch (e) {}
}

sizeButtons.forEach((b, i) => {
  b.addEventListener("click", () => setSize(b.dataset.size));
  // flèches gauche / droite au clavier
  b.addEventListener("keydown", (e) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = sizeButtons[(i + dir + 3) % 3];
    setSize(next.dataset.size);
    next.focus();
  });
});

setSize(root.dataset.size || "16", false);
