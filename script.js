
 // ===== CUSTOM CURSOR =====

const cursor = document.querySelector(".cursor");

if (cursor) {
  document.addEventListener("mousemove", e => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });
}


// ===== SCROLL REVEAL =====

const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  reveals.forEach(el => {
    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;

    if (elementTop < windowHeight - 100) {
      el.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

/* ===== ARTWORK LIGHTBOX ===== */

const artworkLightbox = document.getElementById('artwork-lightbox');

if (artworkLightbox) {
  const artworkImage = document.getElementById('artwork-lightbox-image');
  const artworkClose = document.getElementById('artwork-lightbox-close');

  function closeArtworkLightbox() {
    artworkLightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function(event) {
    const image = event.target.closest('.artwork-card img, .section-art img');

    if (!image) return;

    artworkImage.src = image.src;
    artworkImage.alt = image.alt;

    const card = image.closest('.artwork-card, .section-art');

    document.getElementById('artwork-name').textContent =
      card.dataset.name ||
      card.querySelector('.artwork-title')?.textContent ||
      image.alt ||
      '';

    document.getElementById('artwork-dimensions').textContent =
      card.dataset.dimensions || '—';

    document.getElementById('artwork-series').textContent =
      card.dataset.series || '—';

    document.getElementById('artwork-materials').textContent =
      card.dataset.materials || '—';

    artworkLightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  artworkClose.addEventListener('click', closeArtworkLightbox);

  artworkLightbox.addEventListener('click', function(event) {
    if (event.target === artworkLightbox) {
      closeArtworkLightbox();
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeArtworkLightbox();
    }
  });
}


/* ===== HOMEPAGE IMAGES FROM CMS ===== */
async function loadHomepageImages() {
  const categories = [
    "paintings", "digital", "posters", "sculptures",
    "installations", "illustrations", "video"
  ];

  const sections = document.querySelectorAll(".section.reveal");
  if (sections.length !== categories.length) return;

  function imageUrl(path) {
    if (!path) return "";
    if (path.startsWith("/jimmart/")) return path;
    if (path.startsWith("/")) return "." + path;
    return path;
  }

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

    categories.forEach((category, index) => {
      const section = sections[index];
      const selections = homepage[category];
      if (!selections) return;

      ["left", "right"].forEach(side => {
        const container = section.querySelector(`.section-art.${side}`);
        const image = container?.querySelector("img");
        const selected = selections[side];

        if (!image || !selected) return;

        // Find artwork by its saved reference.
        const artwork = artworks.find(item =>
          item.category === category &&
          (
            item.id === selected ||
            item.slug === selected ||
            item.image === selected
          )
        );

        if (artwork) {
          image.src = imageUrl(artwork.image);
          image.alt = artwork.name || "Artwork";

          container.dataset.name = artwork.name || "";
          container.dataset.dimensions = artwork.dimensions || "";
          container.dataset.series = artwork.series || "";
          container.dataset.materials = artwork.materials || "";
        } else if (
          selected.startsWith("/") ||
          selected.startsWith("images/") ||
          selected.startsWith("media/")
        ) {
          // Keep supporting the existing homepage image paths.
          image.src = imageUrl(selected);
        }
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

  // Εκτελείται μόνο στη σελίδα Artist Statement.
  if (!statementElement || !exhibitionsElement) return;

  try {
    const response = await fetch("content/artist-statement.json");

    if (!response.ok) {
      throw new Error("Artist Statement CMS file not found");
    }

    const data = await response.json();

    // Αλλάζουμε μόνο το κείμενο, όχι το HTML ή το CSS.
    if (typeof data.text === "string") {
      statementElement.textContent = data.text;
    }

    // Ενημερώνουμε τη λίστα των εκθέσεων.
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

  // Βρίσκουμε ποια gallery είναι ανοιχτή.
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

    // Κρατάμε μόνο τα έργα της συγκεκριμένης gallery.
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

      const image = document.createElement("img");

      // Υποστήριξη εικόνων που ανεβαίνουν από το CMS.
      const imagePath = artwork.image || "";

if (imagePath.startsWith("/jimmart/")) {
  image.src = imagePath;
} else if (imagePath.startsWith("/")) {
  image.src = "." + imagePath;
} else {
  image.src = imagePath;
}

      image.alt = artwork.name || "Artwork";
      image.loading = "lazy";

      const title = document.createElement("h3");
      title.className = "artwork-title";
      title.textContent = artwork.name || "";

      card.appendChild(image);
      card.appendChild(title);
      grid.appendChild(card);
    });

  } catch (error) {
    console.error("Artworks CMS:", error);
  }
}

loadArtworks();
