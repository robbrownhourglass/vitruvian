/* Vitruvian Lime — site scripts */

// Contact form submissions go to Web3Forms (the form's action URL; the access
// key is a hidden field in contact.html), which emails them to the inbox the
// key was created for. If that request fails, the form falls back to opening
// the visitor's email app addressed to CONTACT_EMAIL.
const CONTACT_EMAIL = "info@vitruvianlime.com";

document.documentElement.classList.add("js");

// Pages live in folders (about/, contact/) so URLs stay clean. A web server
// serves each folder's index.html automatically, but opening the files straight
// from disk doesn't, so point folder links at index.html in that case only.
if (location.protocol === "file:") {
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (/^(https?:|mailto:|tel:|#)/.test(href)) return;
    const [, path, rest] = href.match(/^([^?#]*)(.*)$/);
    if (path.endsWith("/")) a.setAttribute("href", `${path}index.html${rest}`);
  });
}

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
  // Close the menu if the screen widens past the mobile layout (e.g. rotating a tablet)
  window.matchMedia("(min-width: 861px)").addEventListener("change", (e) => {
    if (e.matches) {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
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
  const subject = form.querySelector('[name="subject"]');
  const button = form.querySelector('button[type="submit"]');

  const topicLabel = () => topic.options[topic.selectedIndex].text;
  const syncSubject = () => (subject.value = `Website enquiry: ${topicLabel()}`);

  // Pre-select the enquiry type from ?topic=consultancy etc.
  const wanted = new URLSearchParams(location.search).get("topic");
  const match = wanted && [...topic.options].find((o) => o.dataset.topic === wanted);
  if (match) topic.value = match.value;
  syncSubject();
  topic.addEventListener("change", syncSubject);

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

  const openEmailApp = (data) => {
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
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject.value)}&body=${encodeURIComponent(body)}`;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    if (form.querySelector("#botcheck").checked) return; // spam trap
    if (!validate()) return;

    const data = Object.fromEntries(new FormData(form));
    button.disabled = true;
    button.textContent = "Sending…";

    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || res.statusText);
      form.reset();
      syncSubject();
      status.textContent = "Thank you, your message has been sent. We’ll be in touch soon.";
    } catch {
      status.textContent =
        "Sorry, your message couldn’t be sent just now. Your email app should open with it ready to send instead, or call us on +353 53 900 6074.";
      openEmailApp(data);
    } finally {
      button.disabled = false;
      button.textContent = "Send enquiry";
    }
  });
}
