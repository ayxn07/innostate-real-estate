// property details page - reads ?id= from the URL, finds the matching
// listing from the API and fills in the page

const params = new URLSearchParams(window.location.search);
const propertyId = parseInt(params.get("id"), 10);

// admin-added listings only exist in localStorage, so merge before lookup
function adminProperties() {
  try {
    return JSON.parse(localStorage.getItem("innostate_admin_props")) || [];
  } catch {
    return [];
  }
}

let currentProperty = null;

fetch("/api/properties")
  .then((res) => res.json())
  .then((data) => {
    const property = data.concat(adminProperties()).find((p) => p.id === propertyId);
    if (!property) {
      showNotFound();
      return;
    }
    currentProperty = property;
    render(property);
  })
  .catch(showNotFound);

function showNotFound() {
  document.getElementById("details-wrap").style.display = "none";
  document.getElementById("not-found").style.display = "block";
}

function render(p) {
  document.title = `${p.title} | InnoState Real Estate`;
  document.getElementById("detail-location").textContent = `${p.location} · ${p.type} · For ${p.purpose === "Buy" ? "Sale" : "Rent"}`;
  document.getElementById("detail-title").textContent = p.title;
  document.getElementById("detail-price").textContent = p.priceLabel;
  document.getElementById("detail-description").textContent = p.description;

  const specs = [
    ["Bedrooms", p.beds],
    ["Bathrooms", p.baths],
    ["Area", p.sqft.toLocaleString() + " sq ft"],
    ["Year Built", p.yearBuilt]
  ];
  document.getElementById("detail-specs").innerHTML = specs
    .map(([label, value]) => `<div class="spec-box"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");

  document.getElementById("detail-amenities").innerHTML = p.amenities
    .map((a) => `<li>${a}</li>`)
    .join("");

  setupGallery(p);
}

// the slideshow reuses the listing photo plus two other property images
// as stand-ins for interior/exterior shots of the same home
function setupGallery(p) {
  const gallery = document.getElementById("gallery");
  const altA = (p.id % 8) + 1;
  const altB = ((p.id + 3) % 8) + 1;
  const images = [p.image, `images/property-${altA}.jpg`, `images/property-${altB}.jpg`];
  let current = 0;

  const nav = gallery.querySelector(".gallery-nav");
  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `${p.title} - photo ${i + 1}`;
    if (i === 0) img.classList.add("visible");
    gallery.insertBefore(img, nav); // keep the prev/next buttons last in the DOM
  });

  const slides = gallery.querySelectorAll("img");

  function show(i) {
    current = (i + slides.length) % slides.length; // wraps around both directions
    slides.forEach((img, idx) => img.classList.toggle("visible", idx === current));
  }

  document.getElementById("gallery-prev").addEventListener("click", () => show(current - 1));
  document.getElementById("gallery-next").addEventListener("click", () => show(current + 1));
}

// enquiry form - frontend only, just validates and confirms
const enquiryForm = document.getElementById("enquiry-form");
enquiryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = document.getElementById("enquiry-msg");
  const name = document.getElementById("enq-name").value.trim();
  const email = document.getElementById("enq-email").value.trim();
  const text = document.getElementById("enq-message").value.trim();

  if (!name || !email.includes("@") || !text) {
    msg.className = "form-msg error";
    msg.textContent = "Please fill in all fields with a valid email address.";
    return;
  }

  // keep a copy so it shows up in the client dashboard and admin inbox
  try {
    const enquiries = JSON.parse(localStorage.getItem("innostate_enquiries")) || [];
    enquiries.unshift({
      propertyId,
      propertyTitle: currentProperty ? currentProperty.title : "Unknown property",
      name,
      email,
      message: text,
      date: new Date().toLocaleDateString()
    });
    localStorage.setItem("innostate_enquiries", JSON.stringify(enquiries));
  } catch {}

  msg.className = "form-msg success";
  msg.textContent = "Thank you! An agent will contact you about this property within one working day.";
  enquiryForm.reset();
});
