// dashboard logic for the client and admin pages.
// everything is stored in localStorage for now since there is no real backend

// small helper - reads an array out of localStorage, or gives back an empty one
function loadList(key) {
  const data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data);
  }
  return [];
}

// ---- check who is logged in ----

let user = null;
const savedUser = localStorage.getItem("innostate_user");
if (savedUser) {
  user = JSON.parse(savedUser);
}

// the inbox panel only exists on the admin page, so this tells us where we are
const isAdminPage = document.getElementById("panel-inbox") !== null;

// not logged in, or a client trying to open the admin page -> send to login
if (user === null || (isAdminPage && user.role !== "admin")) {
  window.location.href = "login.html";
}

if (user !== null) {
  let displayName = user.name;
  if (!displayName) {
    displayName = user.email.split("@")[0];
  }
  document.getElementById("dash-welcome").textContent = "Welcome, " + displayName;
}

document.getElementById("logout-btn").addEventListener("click", function () {
  localStorage.removeItem("innostate_user");
  window.location.href = "login.html";
});

// ---- sidebar tabs ----

const tabButtons = document.querySelectorAll(".dash-nav button");

tabButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    // turn everything off first, then turn on the one that was clicked
    document.querySelectorAll(".dash-nav button").forEach(function (b) {
      b.classList.remove("active");
    });
    document.querySelectorAll(".dash-panel").forEach(function (p) {
      p.classList.remove("active");
    });
    btn.classList.add("active");
    document.getElementById(btn.dataset.panel).classList.add("active");
  });
});

// ================= CLIENT DASHBOARD =================

const savedGrid = document.getElementById("saved-grid");
const enquiryList = document.getElementById("enquiry-list");

if (savedGrid) {
  fetch("/api/properties")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      // include properties the admin added from their dashboard
      const allProps = data.concat(loadList("innostate_admin_props"));
      showSavedProperties(allProps);
    });
}

function showSavedProperties(allProps) {
  const savedIds = loadList("innostate_saved");

  // keep only the properties whose id was saved
  const saved = [];
  for (let i = 0; i < allProps.length; i++) {
    if (savedIds.includes(allProps[i].id)) {
      saved.push(allProps[i]);
    }
  }

  if (saved.length === 0) {
    savedGrid.innerHTML = '<p class="no-results">Nothing saved yet. Browse the properties page and tap the heart on listings you like.</p>';
    return;
  }

  let html = "";
  for (let i = 0; i < saved.length; i++) {
    const p = saved[i];
    html += '<div class="card property-card">';
    html += '<img src="' + p.image + '" alt="' + p.title + '">';
    html += '<div class="card-body">';
    html += '<span class="price">' + p.priceLabel + "</span>";
    html += "<h3>" + p.title + "</h3>";
    html += '<p class="location">' + p.location + " &middot; " + p.type + "</p>";
    html += '<a href="property-details.html?id=' + p.id + '" class="btn btn-outline">View</a> ';
    html += '<button class="btn btn-outline unsave-btn" data-id="' + p.id + '">Remove</button>';
    html += "</div></div>";
  }
  savedGrid.innerHTML = html;

  // remove buttons - take the id out of the saved list and redraw
  savedGrid.querySelectorAll(".unsave-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = Number(btn.dataset.id);
      let ids = loadList("innostate_saved");
      ids = ids.filter(function (x) {
        return x !== id;
      });
      localStorage.setItem("innostate_saved", JSON.stringify(ids));
      showSavedProperties(allProps);
    });
  });
}

if (enquiryList) {
  const allEnquiries = loadList("innostate_enquiries");

  // clients only see the enquiries they sent with their own email
  const mine = [];
  for (let i = 0; i < allEnquiries.length; i++) {
    if (allEnquiries[i].email === user.email) {
      mine.push(allEnquiries[i]);
    }
  }

  if (mine.length === 0) {
    enquiryList.innerHTML = '<p class="no-results">No enquiries yet. Open any property and use the enquiry form.</p>';
  } else {
    let html = "";
    for (let i = 0; i < mine.length; i++) {
      html += '<div class="inbox-item">';
      html += '<div class="inbox-meta"><strong>' + mine[i].propertyTitle + "</strong><span>" + mine[i].date + "</span></div>";
      html += "<p>" + mine[i].message + "</p>";
      html += "</div>";
    }
    enquiryList.innerHTML = html;
  }
}

// ================= ADMIN DASHBOARD =================

const propTable = document.querySelector("#admin-prop-table tbody");
let apiProps = [];

if (propTable) {
  fetch("/api/properties")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      apiProps = data;
      showPropertyTable();
    });

  const addForm = document.getElementById("add-form");
  addForm.addEventListener("submit", function (e) {
    e.preventDefault();
    addNewProperty();
  });
}

function showPropertyTable() {
  const allProps = apiProps.concat(loadList("innostate_admin_props"));

  let html = "";
  for (let i = 0; i < allProps.length; i++) {
    const p = allProps[i];
    html += "<tr>";
    html += "<td>" + p.title + "</td>";
    html += "<td>" + p.location + "</td>";
    html += "<td>" + p.type + "</td>";
    html += "<td>" + p.purpose + "</td>";
    html += "<td>" + p.priceLabel + "</td>";
    html += "</tr>";
  }
  propTable.innerHTML = html;
}

function addNewProperty() {
  const msg = document.getElementById("add-msg");
  const title = document.getElementById("add-title").value.trim();
  const price = Number(document.getElementById("add-price").value);
  const desc = document.getElementById("add-desc").value.trim();

  if (title === "" || !price || desc === "") {
    msg.className = "form-msg error";
    msg.textContent = "Title, price and description are required.";
    return;
  }

  const purpose = document.getElementById("add-purpose").value;
  const adminProps = loadList("innostate_admin_props");

  // price shows as monthly for rentals
  let priceLabel = "$" + price.toLocaleString();
  if (purpose === "Rent") {
    priceLabel += "/mo";
  }

  // custom image if a url was typed, otherwise reuse one of the bundled photos
  let image = document.getElementById("add-image").value.trim();
  if (image === "") {
    image = "images/property-" + ((adminProps.length % 8) + 1) + ".jpg";
  }

  const property = {
    id: 100 + adminProps.length, // ids start at 100 so they never clash with the JSON file ones
    title: title,
    location: document.getElementById("add-location").value,
    type: document.getElementById("add-type").value,
    purpose: purpose,
    price: price,
    priceLabel: priceLabel,
    beds: Number(document.getElementById("add-beds").value),
    baths: Number(document.getElementById("add-baths").value),
    sqft: Number(document.getElementById("add-sqft").value),
    yearBuilt: new Date().getFullYear(),
    image: image,
    amenities: ["Newly Listed"],
    description: desc
  };

  adminProps.push(property);
  localStorage.setItem("innostate_admin_props", JSON.stringify(adminProps));

  showPropertyTable();
  document.getElementById("add-form").reset();
  msg.className = "form-msg success";
  msg.textContent = '"' + title + '" added. It is now live on the properties page.';
}

const inboxList = document.getElementById("inbox-list");

if (inboxList) {
  showInbox();
}

function showInbox() {
  const enquiries = loadList("innostate_enquiries");

  if (enquiries.length === 0) {
    inboxList.innerHTML = '<p class="no-results">No client enquiries yet.</p>';
    return;
  }

  let html = "";
  for (let i = 0; i < enquiries.length; i++) {
    const e = enquiries[i];
    html += '<div class="inbox-item">';
    html += '<div class="inbox-meta"><strong>' + e.name + " &middot; " + e.propertyTitle + "</strong><span>" + e.date + "</span></div>";
    html += '<p class="inbox-email">' + e.email + "</p>";
    html += "<p>" + e.message + "</p>";
    html += '<button class="btn btn-outline inbox-delete" data-i="' + i + '">Delete</button>';
    html += "</div>";
  }
  inboxList.innerHTML = html;

  // delete buttons - remove that enquiry and redraw the list
  inboxList.querySelectorAll(".inbox-delete").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const enquiries = loadList("innostate_enquiries");
      enquiries.splice(Number(btn.dataset.i), 1);
      localStorage.setItem("innostate_enquiries", JSON.stringify(enquiries));
      showInbox();
    });
  });
}
