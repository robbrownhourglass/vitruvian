/* Vitruvian Lime — site scripts */

// Where contact-form enquiries are sent. GitHub Pages is static, so the form
// opens the visitor's email app with the message pre-filled (mailto:).
// Set this before going live. To use a form service instead (e.g. Formspree),
// set FORM_ENDPOINT and leave CONTACT_EMAIL as the fallback.
const CONTACT_EMAIL = "info@vitruvianlime.com";
const FORM_ENDPOINT = "";

document.documentElement.classList.add("js");

// Mobile navigation
const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");

if (toggle) {
  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".nav a").forEach((link) =>
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  });
}

// Header shadow once the page scrolls
const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Footer year
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Fade sections in as they enter the viewport
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }),
    { rootMargin: "0px 0px -8% 0px" }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-visible"));
}

// Email links: fill in any element marked data-email once the address is set
document.querySelectorAll("[data-email]").forEach((el) => {
  if (!CONTACT_EMAIL) {
    el.closest("[data-email-row]")?.remove();
    return;
  }
  el.textContent = CONTACT_EMAIL;
  el.href = `mailto:${CONTACT_EMAIL}`;
});

// Contact form
const form = document.querySelector("#contact-form");

if (form) {
  const status = form.querySelector(".form-status");
  const topic = form.querySelector("#topic");

  // Pre-select the enquiry type from ?topic=consultancy etc.
  const wanted = new URLSearchParams(location.search).get("topic");
  if (wanted && topic.querySelector(`option[value="${CSS.escape(wanted)}"]`)) topic.value = wanted;

  const validate = () => {
    let ok = true;
    form.querySelectorAll("[required]").forEach((input) => {
      const field = input.closest(".field");
      const valid = input.value.trim() !== "" && input.checkValidity();
      field.classList.toggle("invalid", !valid);
      if (!valid && ok) {
        input.focus();
        ok = false;
      }
    });
    return ok;
  };

  form.querySelectorAll("input, textarea").forEach((input) =>
    input.addEventListener("input", () => input.closest(".field")?.classList.remove("invalid"))
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    if (form.querySelector(".hp input").value) return; // spam trap
    if (!validate()) return;

    const data = Object.fromEntries(new FormData(form));

    if (FORM_ENDPOINT) {
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        if (!res.ok) throw new Error(res.statusText);
        form.reset();
        status.textContent = "Thank you — your message has been sent. We'll be in touch soon.";
        return;
      } catch {
        if (!CONTACT_EMAIL) {
          status.textContent = "Sorry, your message couldn't be sent. Please phone us instead.";
          return;
        }
      }
    }

    if (!CONTACT_EMAIL) {
      status.textContent = "Online enquiries aren't available just yet. Please phone us on +353 53 900 6074.";
      return;
    }

    const subject = `Website enquiry: ${topic.options[topic.selectedIndex].text}`;
    const body = [
      data.message,
      "",
      "—",
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      data.phone ? `Phone: ${data.phone}` : "",
    ]
      .filter((line, i, arr) => line !== "" || arr[i + 1] !== "")
      .join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = "Your email app should open with your message ready to send.";
  });
}
