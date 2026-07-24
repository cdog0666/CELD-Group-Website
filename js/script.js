// Coolen Group Global Script

// Smooth scroll for anchor links (future-proofing)
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Simple nav active state fix (ensures correct page highlight on refresh)
const currentPage = window.location.pathname.split("/").pop();

document.querySelectorAll(".nav-links a").forEach((link) => {
  const linkPage = link.getAttribute("href");

  if (linkPage === currentPage) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }
});

// Subtle fade-in animation on load
window.addEventListener("load", () => {
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.6s ease";
  requestAnimationFrame(() => {
    document.body.style.opacity = "1";
  });
});

// Per-section theme switch: copy CSS variables from the active section to :root
// Smooth scroll-driven interpolation between black and white themes
(function () {
  const SECTION_SELECTOR = "section.section, section.hero";
  const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
  if (!sections.length) return;

  // Target dark and light roots to interpolate between
  const lightVars = {
    "--bg": "#ffffff",
    "--text": "#0b1220",
    "--muted": "rgba(11,18,32,0.6)",
    "--nav-bg": "rgba(255,255,255,0.95)",
    "--nav-border": "rgba(11,18,32,0.06)",
    "--card-bg": "#ffffff",
    "--card-border": "rgba(11,18,32,0.06)",
    "--btn-primary-bg": "#0b1220",
    "--btn-primary-color": "#ffffff",
  };

  const darkVars = {
    "--bg": "#0b0b0b",
    "--text": "#ffffff",
    "--muted": "rgba(255,255,255,0.7)",
    "--nav-bg": "rgba(11,11,11,0.95)",
    "--nav-border": "rgba(255,255,255,0.04)",
    "--card-bg": "#0b0b0b",
    "--card-border": "rgba(255,255,255,0.06)",
    "--btn-primary-bg": "#ffffff",
    "--btn-primary-color": "#0b0b0b",
  };

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const bigint = parseInt(
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h,
      16,
    );
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpHex(h1, h2, t) {
    const c1 = hexToRgb(h1);
    const c2 = hexToRgb(h2);
    const r = Math.round(lerp(c1.r, c2.r, t));
    const g = Math.round(lerp(c1.g, c2.g, t));
    const b = Math.round(lerp(c1.b, c2.b, t));
    return `rgb(${r}, ${g}, ${b})`;
  }

  function setVarsInterpolated(t) {
    // background and text interpolate as full color
    document.documentElement.style.setProperty(
      "--bg",
      lerpHex(lightVars["--bg"], darkVars["--bg"], t),
    );
    document.documentElement.style.setProperty(
      "--text",
      lerpHex(lightVars["--text"], darkVars["--text"], t),
    );

    // muted is rgba alpha interpolation
    const alpha = lerp(0.6, 0.7, t);
    if (t < 0.5) {
      document.documentElement.style.setProperty(
        "--muted",
        `rgba(11,18,32,${0.6 - t * 0.2})`,
      );
    } else {
      document.documentElement.style.setProperty(
        "--muted",
        `rgba(255,255,255,${0.4 + t * 0.6})`,
      );
    }

    // nav bg interpolate via rgba mix
    document.documentElement.style.setProperty(
      "--nav-bg",
      t < 0.5 ? `rgba(255,255,255,${1 - t})` : `rgba(11,11,11,${t})`,
    );

    // card bg and borders
    document.documentElement.style.setProperty(
      "--card-bg",
      lerpHex(lightVars["--card-bg"], darkVars["--card-bg"], t),
    );
    document.documentElement.style.setProperty(
      "--card-border",
      t < 0.5 ? "rgba(11,18,32,0.06)" : "rgba(255,255,255,0.06)",
    );

    // buttons
    document.documentElement.style.setProperty(
      "--btn-primary-bg",
      lerpHex(lightVars["--btn-primary-bg"], darkVars["--btn-primary-bg"], t),
    );
    document.documentElement.style.setProperty(
      "--btn-primary-color",
      lerpHex(
        lightVars["--btn-primary-color"],
        darkVars["--btn-primary-color"],
        t,
      ),
    );
  }

  // compute scroll progress between sections and interpolate
  function onScroll() {
    const viewportY = window.scrollY + window.innerHeight / 2;
    // Find nearest section center
    let nearest = sections[0];
    let minDist = Infinity;
    sections.forEach((s) => {
      const rect = s.getBoundingClientRect();
      const center = window.scrollY + rect.top + rect.height / 2;
      const dist = Math.abs(center - viewportY);
      if (dist < minDist) {
        minDist = dist;
        nearest = s;
      }
    });

    // progress between the previous section and next section (simple normalized t)
    // find index of nearest
    const idx = sections.indexOf(nearest);
    const prev = sections[idx - 1] || nearest;
    const next = sections[idx + 1] || nearest;

    const prevCenter =
      window.scrollY +
      prev.getBoundingClientRect().top +
      prev.getBoundingClientRect().height / 2;
    const nextCenter =
      window.scrollY +
      next.getBoundingClientRect().top +
      next.getBoundingClientRect().height / 2;
    const span = Math.max(Math.abs(nextCenter - prevCenter), 1);
    const t = Math.min(Math.max((viewportY - prevCenter) / span, 0), 1);

    // For simplicity interpolate between light (0) and dark (1) based on position relative to Vision section
    // If nearest section has dark bg variable set to dark color, bias t higher
    const isVisionDark =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--bg")
        .trim() === "";
    // We'll just map t in [0,1] to interpolation factor
    setVarsInterpolated(t);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  requestAnimationFrame(onScroll);
})();
