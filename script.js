
 
/* ===== CUSTOM CURSOR ===== */

const cursor = document.querySelector(".cursor");

if (cursor) {
  document.addEventListener("mousemove", event => {
    cursor.style.left = event.clientX + "px";
    cursor.style.top = event.clientY + "px";
  });
}


/* ===== SCROLL REVEAL ===== */

const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  reveals.forEach(element => {
    const windowHeight = window.innerHeight;
    const elementTop = element.getBoundingClientRect().top;

    if (elementTop < windowHeight - 100) {
      element.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();


/* ===== IMAGE PATHS ===== */

function artworkImageUrl(path) {
  if (!path || typeof path !== "string") return "";

  // Absolute external URLs.
  if (/^https?:\/\//i.test(path)) return path;

  // Already includes the GitHub Pages project prefix.
  if (path.startsWith("/jimmart/")) return path;

  // Paths saved by Decap or the original website.
  if (path.startsWith("/")) return "." + path;

  return path;
}


/* ===== ARTWORK LIGHTBOX ===== */

const artworkLightbox = document.getElementById("artwork-lightbox");

if (artworkLightbox) {
  const artworkImage = document.getElementById("artwork-lightbox-image");
  const artworkClose = document.getElementById("artwork-lightbox-close");

  function closeArtworkLightbox() {
    artworkLightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  document.addEventListener("click", event => {
    const image = event.target.closest(
      ".artwork-card img, .section-art img"
    );

    if (!image) return;

    const card = image.closest(".artwork-card, .section-art");
    if (!card) return;

    artworkImage.src = image.src;
    artworkImage.alt = image.alt;

    document.getElementById("artwork-name").textContent =
      card.dataset.name ||
      card.querySelector(".artwork-title")?.textContent ||
      image.alt ||
      "";

    document.getElementById("artwork-dimensions").textContent =
      card.dataset.dimensions || "—";

    document.getElementById("artwork-series").textContent =
      card.dataset.series || "—";

    document.getElementById("artwork-materials").textContent =
      card.dataset.materials || "—";

    artworkLightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  artworkClose.addEventListener("click", closeArtworkLightbox);

  artworkLightbox.addEventListener("click", event => {
    if (event.target === artworkLightbox) {
      closeArtworkLightbox();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeArtworkLightbox();
    }
  });
}


/* ===== HOMEPAGE IMAGES FROM CMS ===== */

async function loadHomepageImages() {
  const categories = [
    "paintings",
    "digital",
    "posters",
    "sculptures",
    "installations",
    "illustrations",
    "video"
  ];

  const sections = document.querySelectorAll(".section.reveal");

  if (sections.length !== categories.length) return;

  // Original homepage images, used when no artwork is selected.
  const fallbackImages = {
    paintings: {
      left: "/media/creature (5)-1.jpg",
      right: "/images/paintings_p/brand.jpg"
    },
    digital: {
      left: "/images/digital/bloom.png",
      right: "/images/digital/blue s.jpg"
    },
    posters: {
      left: "/images/posters/antropocene (1).jpg",
      right: "/images/posters/antropocene (3).jpg"
    },
    sculptures: {
      left: "/media/hands escaping (1).bmp",
      right: "/media/capturing plastic (1).jpeg"
    },
    installations: {
      left: "/media/P1040335.jpg",
      right: "/media/P1040338.jpg"
    },
    illustrations: {
      left: "/images/illustration/map.jpg",
      right: "/images/illustration/mock up.jpg"
    },
    video: {
      left: "/Film.png",
      right: "/Chalk.png"
    }
  };

  // Show original images before CMS data finishes loading.
  categories.forEach((category, index) => {
    const section = sections[index];

    ["left", "right"].forEach(side => {
      const image = section.querySelector(
        `.section-art.${side} img`
      );

      if (image) {
        image.src = artworkImageUrl(
          fallbackImages[category][side]
        );
      }
    });
  });

  try {
    const [homepageResponse, artworksResponse] = await Promise.all([
      fetch("content/homepage.json"),
      fetch("content/artworks-index.json")
    ]);

    if (!homepageResponse.ok || !artworksResponse.ok) {
      throw new Error("Homepage or artworks data not found");
    }

    const homepage = await homepageResponse.json();
    const artworks = await artworksResponse.json();

    if (!Array.isArray(artworks)) {
      throw new Error("Invalid artworks index");
    }

    categories.forEach((category, index) => {
      const section = sections[index];
      const selections = homepage[category] || {};

      ["left", "right"].forEach(side => {
        const container = section.querySelector(
          `.section-art.${side}`
        );

        const image = container?.querySelector("img");

        if (!container || !image) return;

        const selected = selections[side];

        // Start with the original image for this position.
        const fallback = fallbackImages[category][side];

        image.src = artworkImageUrl(fallback);

        // Reset metadata when no artwork has been selected.
        container.dataset.name = "";
        container.dataset.dimensions = "";
        container.dataset.series = "";
        container.dataset.materials = "";

        if (
          typeof selected !== "string" ||
          !selected.trim()
        ) {
          return;
        }

        // Match an existing artwork by its file ID,
        // slug, or original image path.
        const artwork = artworks.find(item =>
          item.category === category &&
          (
            item.id === selected ||
            item.slug === selected ||
            item.image === selected
          )
        );

        if (artwork && artwork.image) {
          image.src = artworkImageUrl(artwork.image);
          image.alt = artwork.name || "Artwork";

          container.dataset.name = artwork.name || "";
          container.dataset.dimensions = artwork.dimensions || "";
          container.dataset.series = artwork.series || "";
          container.dataset.materials = artwork.materials || "";

          return;
        }

        // Support old homepage.json image paths.
        if (
          selected.startsWith("/") ||
          selected.startsWith("images/") ||
          selected.startsWith("media/") ||
          /^https?:\/\//i.test(selected)
        ) {
          image.src = artworkImageUrl(selected);
          return;
        }

        // Unknown artwork reference: keep the original image.
        console.warn(
          `Homepage artwork not found: ${category}/${side}`,
          selected
        );
      });
    });

  } catch (error) {
    console.error("Homepage CMS:", error);
  }
}

loadHomepageImages();


/* ===== ARTIST STATEMENT FROM CMS ===== */

async function loadArtistStatement() {
  const statementElement = document.getElementById("cms-statement");
  const exhibitionsElement = document.getElementById("cms-exhibitions");

  if (!statementElement || !exhibitionsElement) return;

  try {
    const response = await fetch("content/artist-statement.json");

    if (!response.ok) {
      throw new Error("Artist Statement CMS file not found");
    }

    const data = await response.json();

    if (typeof data.text === "string") {
      statementElement.textContent = data.text;
    }

    if (Array.isArray(data.exhibitions)) {
      exhibitionsElement.replaceChildren();

      data.exhibitions.forEach(exhibition => {
        const item = document.createElement("li");

        item.textContent =
          `${exhibition.year} — ${exhibition.description}`;

        exhibitionsElement.appendChild(item);
      });
    }

  } catch (error) {
    console.error("Artist Statement CMS:", error);
  }
}

loadArtistStatement();


/* ===== ARTWORKS FROM CMS ===== */

async function loadArtworks() {
  const categories = [
    "paintings",
    "digital",
    "posters",
    "sculptures",
    "installations",
    "illustrations",
    "video"
  ];

  const category = categories.find(name =>
    document.getElementById(`${name}-grid`)
  );

  if (!category) return;

  const grid = document.getElementById(`${category}-grid`);

  try {
    const response = await fetch("content/artworks-index.json");

    if (!response.ok) {
      throw new Error("Artworks index not found");
    }

    const artworks = await response.json();

    const filteredArtworks = artworks.filter(
      artwork => artwork.category === category
    );

    grid.replaceChildren();

    filteredArtworks.forEach(artwork => {
      const card = document.createElement("div");
      card.className = "artwork-card";

      card.dataset.name = artwork.name || "";
      card.dataset.dimensions = artwork.dimensions || "";
      card.dataset.series = artwork.series || "";
      card.dataset.materials = artwork.materials || "";

      
if (category === "video" && artwork.video_file) {
  // Video player for Videography
  const video = document.createElement("video");

  video.src = artworkImageUrl(artwork.video_file);
  video.controls = true;
  video.preload = "metadata";
  video.playsInline = true;
  video.className = "artwork-video";

  card.appendChild(video);

} else if (artwork.image) {
  // Keep existing images for all other artworks
  const image = document.createElement("img");

  image.src = artworkImageUrl(artwork.image);
  image.alt = artwork.name || "Artwork";
  image.loading = "lazy";

  card.appendChild(image);
}

const title = document.createElement("h3");
title.className = "artwork-title";
title.textContent = artwork.name || "";

card.appendChild(title);
grid.appendChild(card);

    });

  } catch (error) {
    console.error("Artworks CMS:", error);
  }
}

loadArtworks();
