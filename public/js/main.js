// shared behaviour for every page: nav, footer year, scroll reveal, home carousel

// mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

// when someone is logged in, swap the nav "Login" link for a small
// profile button with a dropdown of quick links
const navUser = (() => {
  try {
    return JSON.parse(localStorage.getItem("innostate_user"));
  } catch {
    return null;
  }
})();

const loginLink = document.querySelector('.nav-links a[href="login.html"]');
if (navUser && loginLink) {
  const dashHref = navUser.role === "admin" ? "admin-dashboard.html" : "client-dashboard.html";
  const displayName = (navUser.name || navUser.email.split("@")[0]).split(" ")[0];
  const li = loginLink.parentElement;

  li.innerHTML = `
    <div class="profile-menu">
      <button class="profile-btn">
        <span class="profile-name"></span>
        <span class="profile-caret">&#9662;</span>
      </button>
      <div class="profile-drop">
        <a href="${dashHref}">My Dashboard</a>
        <a href="properties.html">Browse Properties</a>
        ${navUser.role === "admin" ? '<a href="admin-dashboard.html">Add Property</a>' : '<a href="testimonials.html">Leave a Review</a>'}
        <a href="#" id="nav-logout">Log Out</a>
      </div>
    </div>`;

  // textContent so a weird email can't inject markup
  li.querySelector(".profile-name").textContent = displayName;

  document.getElementById("nav-logout").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("innostate_user");
    window.location.href = "login.html";
  });
}

// footer year so the copyright never goes stale
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// scroll reveal - IntersectionObserver fires when an element with .reveal
// enters the viewport, we add a class and CSS handles the actual animation
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target); // animate once, then stop watching
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// counter animation on the home page - counts up from 0 to data-count
document.querySelectorAll("[data-count]").forEach((el) => {
  const target = parseInt(el.dataset.count, 10);
  const counterObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    counterObserver.disconnect();
    let current = 0;
    const step = Math.max(1, Math.floor(target / 60)); // ~1 second at 60fps
    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = current + (target >= 90 && target < 100 ? "%" : "+");
      if (current < target) requestAnimationFrame(tick);
    };
    tick();
  });
  counterObserver.observe(el);
});

// ---- home page testimonials (3 highlights, full list lives on its own page) ----

const sampleReviews = [
  { name: "Priya N.", rating: 5, badge: "Verified Buyer", text: "Daniel found us a villa we'd never have seen online. Zero pressure, total honesty about a roofing issue, and he negotiated the repair into the price." },
  { name: "Marcus T.", rating: 5, badge: "Verified Renter", text: "Renting through InnoState was painless. Viewing on Tuesday, keys by Friday, and the property manager actually picks up the phone." },
  { name: "Elena V.", rating: 4, badge: "Verified Buyer", text: "Sofia talked us out of an apartment we loved because the building had issues. Six weeks later she found us something better for less. That's why we trust them." }
];

function starString(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase();
}

function reviewCardHTML(r) {
  return `
    <div class="card review-card">
      <div class="review-head">
        <div class="avatar">${initials(r.name)}</div>
        <div>
          <h4>${r.name}</h4>
          <span class="badge">${r.badge}</span>
        </div>
      </div>
      <div class="stars">${starString(r.rating)}</div>
      <blockquote>${r.text}</blockquote>
    </div>`;
}

const testimonialGrid = document.getElementById("testimonial-grid");
if (testimonialGrid) {
  testimonialGrid.innerHTML = sampleReviews.map(reviewCardHTML).join("");
}
