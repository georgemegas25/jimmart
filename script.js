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
