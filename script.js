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
