// testimonials page - renders the built-in reviews plus any the visitor
// has submitted, which are kept in localStorage so they survive a refresh

const baseReviews = [
  { name: "Priya Nair", rating: 5, badge: "Verified Buyer", type: "Villa", text: "Daniel found us a villa we'd never have seen online. Zero pressure, total honesty about a roofing issue, and he negotiated the repair into the price. We've already recommended InnoState twice." },
  { name: "Marcus Tan", rating: 5, badge: "Verified Renter", type: "Apartment", text: "Renting through InnoState was painless. Viewing on Tuesday, keys by Friday, and the property manager actually picks up the phone when something breaks." },
  { name: "Elena Vasquez", rating: 4, badge: "Verified Buyer", type: "Apartment", text: "Sofia talked us out of an apartment we loved because the building had structural issues. Six weeks later she found us something better for less money. That's the kind of agent you keep." },
  { name: "James Okafor", rating: 5, badge: "Verified Buyer", type: "Villa", text: "Sold our townhouse 8% above the initial valuation. The staging advice alone was worth the commission. Communication was constant without being annoying." },
  { name: "Hannah Kim", rating: 5, badge: "Verified Renter", type: "Apartment", text: "As a first-time renter I had a hundred questions. Omar answered every single one without making me feel stupid. The contract was explained line by line." },
  { name: "Robert Diaz", rating: 4, badge: "Verified Buyer", type: "Apartment", text: "Professional from start to finish. The paperwork was handled before I even thought to ask about it. Only reason it's not five stars is the photographer was late once." }
];

const STORAGE_KEY = "innostate_reviews";

function getSavedReviews() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return []; // corrupted storage shouldn't break the page
  }
}

function starString(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

// escape user-typed text before putting it into innerHTML,
// otherwise someone could inject HTML through the review form
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function reviewHTML(r) {
  return `
    <div class="card review-card reveal in-view">
      <div class="review-head">
        <div class="avatar">${initials(escapeHTML(r.name))}</div>
        <div>
          <h4>${escapeHTML(r.name)}</h4>
          <span class="badge">${r.badge}</span>
        </div>
      </div>
      <div class="stars">${starString(r.rating)}</div>
      <blockquote>${escapeHTML(r.text)}</blockquote>
    </div>`;
}

const reviewsGrid = document.getElementById("reviews-grid");

function renderReviews() {
  // saved reviews go first so the visitor sees theirs straight away
  const all = [...getSavedReviews(), ...baseReviews];
  reviewsGrid.innerHTML = all.map(reviewHTML).join("");
}

renderReviews();

// ---- leave a review form ----

const form = document.getElementById("review-form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = document.getElementById("review-msg");
  const name = document.getElementById("rev-name").value.trim();
  const rating = parseInt(document.getElementById("rev-rating").value, 10);
  const type = document.getElementById("rev-type").value;
  const text = document.getElementById("rev-text").value.trim();

  if (!name || !rating || !type || text.length < 10) {
    msg.className = "form-msg error";
    msg.textContent = "Please complete all fields - reviews need to be at least 10 characters.";
    return;
  }

  const review = { name, rating, type, text, badge: "New Review" };
  const saved = getSavedReviews();
  saved.unshift(review);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

  renderReviews();
  form.reset();
  msg.className = "form-msg success";
  msg.textContent = "Thanks for the review! It's now live on this page.";
  window.scrollTo({ top: 0, behavior: "smooth" });
});
