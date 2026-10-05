(() => {
  document.documentElement.classList.add("js");
  const config = window.TRENTECH_CONFIG || {};
  const dataLayer = (window.dataLayer = window.dataLayer || []);
  const emit = (event, detail = {}) => {
    dataLayer.push({ event, ...detail });
    window.dispatchEvent(new CustomEvent("trentech:analytics", { detail: { event, ...detail } }));
  };

  const params = new URLSearchParams(location.search);
  const attribution = {};
  for (const key of ["ref", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const value = params.get(key);
    if (value) attribution[key] = value;
  }
  if (Object.keys(attribution).length) {
    try {
      sessionStorage.setItem("trentech_attribution", JSON.stringify({ ...attribution, captured_at: new Date().toISOString() }));
    } catch {}
  }

  const whatsapp = String(config.whatsapp || "").replace(/\D/g, "");
  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    if (!whatsapp) return;
    link.href = `https://wa.me/${whatsapp}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.addEventListener("click", () => emit("whatsapp_click", attribution));
  });

  document.querySelectorAll("[data-email]").forEach((link) => {
    if (!config.email) return;
    link.href = `mailto:${config.email}`;
    link.addEventListener("click", () => emit("email_click", attribution));
  });

  document.querySelectorAll("[data-linkedin]").forEach((link) => {
    if (!config.linkedin) return;
    link.href = config.linkedin;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.hidden = false;
  });

  document.querySelectorAll("[data-contact-cta]").forEach((link) => {
    link.addEventListener("click", () => {
      emit("cta_contact_click", attribution);
    });
  });
  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    if (whatsapp) return;
    link.hidden = true;
  });
  document.querySelectorAll("[data-email]").forEach((link) => {
    if (!config.email) link.hidden = true;
  });
  if (!whatsapp || !config.email) document.querySelector(".contact-setup").hidden = false;

  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const hero = document.querySelector(".hero");
  const heroArt = hero.querySelector(".hero-art");
  const heroMotion = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  const resetHero = () => {
    for (const property of ["--art-x", "--art-y", "--art-rx", "--art-ry"]) {
      heroArt.style.removeProperty(property);
    }
  };
  hero.addEventListener("pointermove", (event) => {
    if (!heroMotion.matches) return;
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroArt.style.setProperty("--art-x", `${x * 58}px`);
    heroArt.style.setProperty("--art-y", `${y * 42}px`);
    heroArt.style.setProperty("--art-rx", `${-y * 16}deg`);
    heroArt.style.setProperty("--art-ry", `${x * 20}deg`);
  }, { passive: true });
  hero.addEventListener("pointerleave", resetHero);
  heroMotion.addEventListener("change", resetHero);

  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    mobileNav.hidden = !open;
  });
  mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
    mobileNav.hidden = true;
  }));

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else revealItems.forEach((item) => item.classList.add("is-visible"));

  const serviceSection = document.querySelector("#services");
  if ("IntersectionObserver" in window) {
    const serviceObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        emit("services_scroll", attribution);
        serviceObserver.disconnect();
      }
    }, { threshold: 0.2 });
    serviceObserver.observe(serviceSection);
  }

  const depths = new Set();
  window.addEventListener("scroll", () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const depth = Math.floor((window.scrollY / scrollable) * 100);
    for (const threshold of [50, 90]) {
      if (depth >= threshold && !depths.has(threshold)) {
        depths.add(threshold);
        emit(`scroll_${threshold}`, attribution);
      }
    }
  }, { passive: true });
})();
