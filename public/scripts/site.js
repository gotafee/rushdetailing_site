const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && revealElements.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

const navToggle = document.querySelector('[data-nav-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (navToggle && mobileNav) {
  mobileNav.hidden = false;
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    mobileNav.classList.toggle('is-open', !expanded);
  });
}

const promoModal = document.querySelector('[data-promo-modal]');
const promoModalOpen = document.querySelector('[data-promo-modal-open]');
const promoModalClose = document.querySelector('[data-promo-modal-close]');

if (promoModal && promoModalOpen) {
  promoModalOpen.addEventListener('click', () => {
    if (typeof promoModal.showModal === 'function') {
      promoModal.showModal();
    } else {
      promoModal.setAttribute('open', '');
    }
  });

  promoModalClose?.addEventListener('click', () => {
    promoModal.close();
  });

  promoModal.addEventListener('click', (event) => {
    if (event.target === promoModal) {
      promoModal.close();
    }
  });
}

document.querySelectorAll('[data-case-filters]').forEach((filtersWrap) => {
  const buttons = filtersWrap.querySelectorAll('[data-filter]');
  const grid = document.querySelector('[data-case-grid]');
  if (!grid) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.getAttribute('data-filter');
      buttons.forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');

      grid.querySelectorAll('[data-category]').forEach((card) => {
        const show = value === 'Все' || card.getAttribute('data-category') === value;
        card.style.display = show ? '' : 'none';
      });
    });
  });
});

document.querySelectorAll('[data-case-gallery]').forEach((gallery) => {
  const track = gallery.querySelector('[data-case-gallery-track]');
  const prev = gallery.querySelector('[data-case-gallery-prev]');
  const next = gallery.querySelector('[data-case-gallery-next]');
  if (!track || !prev || !next) return;

  const getStep = () => {
    const firstImage = track.querySelector('img');
    if (!firstImage) return track.clientWidth;
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0');
    const visibleCount = window.matchMedia('(max-width: 780px)').matches ? 1 : 3;
    return (firstImage.getBoundingClientRect().width + gap) * visibleCount;
  };

  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= maxScroll;
  };

  prev.addEventListener('click', () => {
    track.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });

  next.addEventListener('click', () => {
    track.scrollBy({ left: getStep(), behavior: 'smooth' });
  });

  track.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();
});

document.querySelectorAll('[data-lead-form]').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = form.querySelector('[name="name"]');
    const contact = form.querySelector('[name="contact"]');
    const service = form.querySelector('[name="service"]');
    const thankYou = form.getAttribute('data-thank-you') || '/spasibo/';
    const endpoint = form.getAttribute('data-endpoint');
    const submitMode = form.getAttribute('data-submit-mode');

    if (!name.value.trim() || !contact.value.trim()) {
      form.reportValidity();
      return;
    }

    const payload = {
      name: name.value.trim(),
      contact: contact.value.trim(),
      service: service.value.trim(),
      source: window.location.pathname,
    };

    if (submitMode === 'endpoint' && endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`Lead form submit failed: ${response.status}`);
      } catch (error) {
        console.error('Lead form submit failed', error);
        alert('Не получилось отправить заявку. Пожалуйста, напишите нам в Telegram или позвоните.');
        return;
      }
    }

    window.location.href = new URL(thankYou, window.location.origin).toString();
  });
});

document.querySelectorAll('[data-faq-item]').forEach((item) => {
  const summary = item.querySelector('summary');
  const answer = item.querySelector('[data-faq-answer]');
  if (!summary || !answer) return;

  const animateOpen = () => {
    item.open = true;
    answer.style.height = '0px';
    answer.style.opacity = '0';
    requestAnimationFrame(() => {
      answer.style.height = `${answer.scrollHeight}px`;
      answer.style.opacity = '1';
    });
  };

  const animateClose = () => {
    answer.style.height = `${answer.scrollHeight}px`;
    requestAnimationFrame(() => {
      answer.style.height = '0px';
      answer.style.opacity = '0';
    });
    const onEnd = (event) => {
      if (event.propertyName !== 'height') return;
      item.open = false;
      answer.removeEventListener('transitionend', onEnd);
    };
    answer.addEventListener('transitionend', onEnd);
  };

  summary.addEventListener('click', (event) => {
    event.preventDefault();
    if (item.open) {
      animateClose();
    } else {
      animateOpen();
    }
  });

  item.addEventListener('click', (event) => {
    if (event.target.closest('summary')) return;
    event.preventDefault();
    if (item.open) {
      animateClose();
    } else {
      animateOpen();
    }
  });

  answer.addEventListener('transitionend', (event) => {
    if (event.propertyName === 'height' && item.open) {
      answer.style.height = 'auto';
    }
  });
});

const mapNode = document.querySelector('[data-yandex-map]');

if (mapNode) {
  const apiKey = mapNode.getAttribute('data-map-key');
  const address = mapNode.getAttribute('data-map-address');
  const label = mapNode.getAttribute('data-map-label') || 'Rush Detailing';

  const initYandexMap = () => {
    if (!window.ymaps || !address) return;

    window.ymaps.ready(() => {
      const map = new window.ymaps.Map(mapNode, {
        center: [55.8032, 37.4062],
        zoom: 16,
        controls: ['zoomControl', 'fullscreenControl'],
      });

      map.behaviors.disable('scrollZoom');

      window.ymaps.geocode(address).then((result) => {
        const firstGeoObject = result.geoObjects.get(0);
        if (!firstGeoObject) return;

        const coordinates = firstGeoObject.geometry.getCoordinates();
        map.setCenter(coordinates, 17, { checkZoomRange: true });

        const placemark = new window.ymaps.Placemark(
          coordinates,
          {
            balloonContent: label,
            hintContent: label,
            iconCaption: label,
          },
          {
            preset: 'islands#darkGreenDotIconWithCaption',
          },
        );

        map.geoObjects.add(placemark);
      });
    });
  };

  if (window.ymaps) {
    initYandexMap();
  } else if (apiKey) {
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.onload = initYandexMap;
    document.head.appendChild(script);
  }
}
