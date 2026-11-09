// ===== CUSTOM CURSOR =====

const cursor = document.querySelector(".cursor");

document.addEventListener("mousemove", e => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});

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
  const sections = [
    "paintings",
    "digital",
    "posters",
    "sculptures",
    "installations",
    "illustrations",
    "video"
  ];

  const homepageSections = document.querySelectorAll(
    ".section.reveal"
  );

  if (homepageSections.length !== sections.length) return;

  try {
    const response = await fetch("content/homepage.json");

    if (!response.ok) {
      throw new Error("Homepage CMS file not found");
    }

    const data = await response.json();

    sections.forEach((category, index) => {
      const section = homepageSections[index];
      const images = data[category];

      if (!images) return;

      const leftImage = section.querySelector(".section-art.left img");
      const rightImage = section.querySelector(".section-art.right img");

      function getImagePath(path) {
        if (!path) return null;

        // Υποστηρίζει εικόνες από CMS και από το repository.
        return path.startsWith("/")
          ? "." + path
          : path;
      }

      if (leftImage && images.left) {
        leftImage.src = getImagePath(images.left);
      }

      if (rightImage && images.right) {
        rightImage.src = getImagePath(images.right);
      }
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
      image.src = imagePath.startsWith("/")
        ? "." + imagePath
        : imagePath;

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
