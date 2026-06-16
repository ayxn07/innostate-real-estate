// fetches listings from the server API and renders cards on the
// properties page (with filtering) and the home page (first 3 only)

let allProperties = [];

const grid = document.getElementById("property-grid");
const featuredGrid = document.getElementById("featured-grid");

// listings added from the admin dashboard live in localStorage,
// merge them with the ones served from the JSON file
function adminProperties() {
  try {
    return JSON.parse(localStorage.getItem("innostate_admin_props")) || [];
  } catch {
    return [];
  }
}

function savedIds() {
  try {
    return JSON.parse(localStorage.getItem("innostate_saved")) || [];
  } catch {
    return [];
  }
}

fetch("/api/properties")
  .then((res) => res.json())
  .then((data) => {
    allProperties = data.concat(adminProperties());
    if (featuredGrid) renderCards(allProperties.slice(0, 3), featuredGrid);
    if (grid) {
      applyParamsFromURL();
      applyFilters();
    }
  })
  .catch(() => {
    const target = grid || featuredGrid;
    if (target) target.innerHTML = '<p class="no-results">Could not load listings. Is the server running?</p>';
  });

function cardHTML(p) {
  const saved = savedIds().includes(p.id);
  return `
    <div class="card property-card reveal in-view">
      <button class="save-btn ${saved ? "saved" : ""}" data-id="${p.id}">&#10084;</button>
      <img src="${p.image}" alt="${p.title}">
      <div class="card-body">
        <span class="price">${p.priceLabel}</span>
        <h3>${p.title}</h3>
        <p class="location">${p.location} &middot; ${p.type} &middot; For ${p.purpose === "Buy" ? "Sale" : "Rent"}</p>
        <div class="meta">
          <span>${p.beds} Beds</span>
          <span>${p.baths} Baths</span>
          <span>${p.sqft.toLocaleString()} sq ft</span>
        </div>
        <a href="property-details.html?id=${p.id}" class="btn btn-outline">View Details</a>
      </div>
    </div>`;
}

function renderCards(list, target) {
  if (list.length === 0) {
    target.innerHTML = '<p class="no-results">No properties match those filters. Try widening your search.</p>';
    return;
  }
  target.innerHTML = list.map(cardHTML).join("");

  // heart button toggles the id in localStorage so the
  // client dashboard can list everything that's been saved
  target.querySelectorAll(".save-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id, 10);
      let ids = savedIds();
      ids = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
      localStorage.setItem("innostate_saved", JSON.stringify(ids));
      btn.classList.toggle("saved");
    });
  });
}

// ---- filtering (properties page only) ----

const filterIds = ["filter-location", "filter-type", "filter-price", "filter-purpose"];

// price filter works on bands rather than exact numbers, and rentals
// are monthly so they always count as the "low" band
function inPriceBand(p, band) {
  if (!band) return true;
  if (p.purpose === "Rent") return band === "low";
  if (band === "low") return p.price < 750000;
  if (band === "mid") return p.price >= 750000 && p.price <= 1500000;
  return p.price > 1500000;
}

function applyFilters() {
  const loc = document.getElementById("filter-location").value;
  const type = document.getElementById("filter-type").value;
  const price = document.getElementById("filter-price").value;
  const purpose = document.getElementById("filter-purpose").value;

  const filtered = allProperties.filter((p) =>
    (!loc || p.location === loc) &&
    (!type || p.type === type) &&
    (!purpose || p.purpose === purpose) &&
    inPriceBand(p, price)
  );

  renderCards(filtered, grid);
}

// the home page search bar submits here with query params,
// so pre-select the dropdowns to match before first render
function applyParamsFromURL() {
  const params = new URLSearchParams(window.location.search);
  const map = { location: "filter-location", type: "filter-type", price: "filter-price" };
  Object.entries(map).forEach(([param, id]) => {
    const value = params.get(param);
    if (value) document.getElementById(id).value = value;
  });
}

if (grid) {
  filterIds.forEach((id) => {
    document.getElementById(id).addEventListener("change", applyFilters);
  });

  document.getElementById("filter-reset").addEventListener("click", () => {
    filterIds.forEach((id) => (document.getElementById(id).value = ""));
    applyFilters();
  });
}
