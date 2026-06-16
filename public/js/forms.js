// contact form + login/signup form. Frontend only for now -
// validation runs locally and shows a styled message instead of posting

// ---- contact page ----

const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = document.getElementById("contact-msg");
    const name = document.getElementById("ct-name").value.trim();
    const email = document.getElementById("ct-email").value.trim();
    const message = document.getElementById("ct-message").value.trim();

    if (!name || !email.includes("@") || !message) {
      msg.className = "form-msg error";
      msg.textContent = "Please fill in your name, a valid email, and a message.";
      return;
    }

    msg.className = "form-msg success";
    msg.textContent = "Message sent! We'll get back to you within one working day.";
    contactForm.reset();
  });
}

// ---- login / sign up page ----

const authForm = document.getElementById("auth-form");
if (authForm) {
  let isSignup = false;

  const title = document.getElementById("auth-title");
  const sub = document.getElementById("auth-sub");
  const nameGroup = document.getElementById("name-group");
  const submitBtn = document.getElementById("auth-submit");
  const switchText = document.getElementById("auth-switch");
  const msg = document.getElementById("auth-msg");

  // one form does both jobs - clicking the switch link swaps the
  // labels and shows/hides the name field instead of loading a new page
  function setMode(signup) {
    isSignup = signup;
    title.textContent = signup ? "Create an Account" : "Welcome Back";
    sub.textContent = signup ? "Sign up to list and manage properties." : "Log in to manage your listings.";
    nameGroup.style.display = signup ? "block" : "none";
    submitBtn.textContent = signup ? "Sign Up" : "Login";
    switchText.innerHTML = signup
      ? 'Already have an account? <a href="#" id="switch-link">Login</a>'
      : 'Don\'t have an account? <a href="#" id="switch-link">Sign Up</a>';
    document.getElementById("switch-link").addEventListener("click", (e) => {
      e.preventDefault();
      setMode(!isSignup);
    });
    msg.className = "form-msg";
  }

  document.getElementById("switch-link").addEventListener("click", (e) => {
    e.preventDefault();
    setMode(true);
  });

  document.getElementById("forgot-link").addEventListener("click", (e) => {
    e.preventDefault();
    msg.className = "form-msg success";
    msg.textContent = "If that email exists in our system, a reset link has been sent.";
  });

  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    const name = document.getElementById("auth-name").value.trim();

    if (isSignup && !name) {
      msg.className = "form-msg error";
      msg.textContent = "Please enter your full name.";
      return;
    }
    if (!email.includes("@")) {
      msg.className = "form-msg error";
      msg.textContent = "Please enter a valid email address.";
      return;
    }
    if (password.length < 6) {
      msg.className = "form-msg error";
      msg.textContent = "Password must be at least 6 characters.";
      return;
    }

    // no backend yet - role comes from the email: anything starting
    // with "admin" goes to the admin dashboard, everyone else is a client
    const role = email.toLowerCase().startsWith("admin") ? "admin" : "client";
    localStorage.setItem("innostate_user", JSON.stringify({ email, name, role }));

    msg.className = "form-msg success";
    msg.textContent = isSignup ? "Account created! Redirecting..." : "Login successful. Redirecting...";

    setTimeout(() => {
      window.location.href = role === "admin" ? "admin-dashboard.html" : "client-dashboard.html";
    }, 800);
  });
}
