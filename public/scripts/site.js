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

document.querySelectorAll('[data-price-card-link]').forEach((card) => {
  const href = card.getAttribute('data-price-card-link');
  if (!href) return;

  const goToService = () => {
    window.location.href = href;
  };

  card.addEventListener('click', (event) => {
    if (event.target.closest('a, button')) return;
    goToService();
  });

  card.addEventListener('keydown', (event) => {
    if (event.target.closest('a, button')) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToService();
    }
  });
});

const promoModal = document.querySelector('[data-promo-modal]');
const promoModalOpenButtons = document.querySelectorAll('[data-promo-modal-open], [data-lead-popup-open]');
const promoModalClose = document.querySelector('[data-promo-modal-close]');
const promoOffer = document.querySelector('[data-promo-offer]');
const promoOfferClose = document.querySelector('[data-promo-offer-close]');
const promoOfferDelay = 60_000;

if (promoModal) {
  let promoOfferTimer;

  const showPromoOffer = () => {
    if (!promoOffer) return;
    promoOffer.hidden = false;
    requestAnimationFrame(() => {
      promoOffer.classList.add('is-visible');
    });
  };

  const schedulePromoOffer = () => {
    if (!promoOffer) return;
    window.clearTimeout(promoOfferTimer);
    promoOfferTimer = window.setTimeout(showPromoOffer, promoOfferDelay);
  };

  const hidePromoOffer = () => {
    if (!promoOffer) return;
    promoOffer.classList.remove('is-visible');
    window.setTimeout(() => {
      promoOffer.hidden = true;
    }, 250);
    schedulePromoOffer();
  };

  const openPromoModal = () => {
    if (typeof promoModal.showModal === 'function') {
      promoModal.showModal();
    } else {
      promoModal.setAttribute('open', '');
    }
  };

  showPromoOffer();

  promoModalOpenButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openPromoModal();
    });
  });

  promoOfferClose?.addEventListener('click', hidePromoOffer);

  promoModalClose?.addEventListener('click', () => {
    promoModal.close();
  });

  promoModal.addEventListener('click', (event) => {
    if (event.target === promoModal) {
      promoModal.close();
    }
  });
}

const telegramModal = document.querySelector('[data-telegram-modal]');
const telegramModalOpenButtons = document.querySelectorAll('[data-telegram-modal-open]');
const telegramModalClose = document.querySelector('[data-telegram-modal-close]');
const estimateContactModal = document.querySelector('[data-estimate-contact-modal]');
const estimateContactModalOpenButtons = document.querySelectorAll('[data-estimate-contact-modal-open]');
const estimateContactModalClose = document.querySelector('[data-estimate-contact-modal-close]');
const telegramNudgeModal = document.querySelector('[data-telegram-nudge-modal]');
const telegramNudgeClose = document.querySelector('[data-telegram-nudge-close]');
const estimateContactNudgeAction = document.querySelector('[data-estimate-contact-nudge-action]');
const telegramNudgeInitialDelay = 3_500;
const telegramNudgeRepeatDelay = 40_000;
let telegramNudgeTimer;

const openDialog = (dialog) => {
  if (!dialog) return;

  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
};

const closeDialog = (dialog) => {
  if (!dialog) return;

  if (dialog.open) {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
};

const openTelegramModal = () => openDialog(telegramModal);
const openEstimateContactModal = () => openDialog(estimateContactModal);

if (telegramModal) {
  telegramModalOpenButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openTelegramModal();
    });
  });

  telegramModalClose?.addEventListener('click', () => {
    telegramModal.close();
  });

  telegramModal.addEventListener('click', (event) => {
    if (event.target === telegramModal) {
      telegramModal.close();
    }
  });
}

if (estimateContactModal) {
  estimateContactModalOpenButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openEstimateContactModal();
    });
  });

  estimateContactModalClose?.addEventListener('click', () => {
    closeDialog(estimateContactModal);
  });

  estimateContactModal.addEventListener('click', (event) => {
    if (event.target === estimateContactModal) {
      closeDialog(estimateContactModal);
    }
  });
}

if (telegramNudgeModal) {
  const scheduleTelegramNudge = (delay) => {
    window.clearTimeout(telegramNudgeTimer);
    telegramNudgeTimer = window.setTimeout(() => {
      if (document.querySelector('dialog[open]')) {
        scheduleTelegramNudge(telegramNudgeRepeatDelay);
        return;
      }

      if (typeof telegramNudgeModal.showModal === 'function') {
        telegramNudgeModal.showModal();
      } else {
        telegramNudgeModal.setAttribute('open', '');
      }
    }, delay);
  };

  const closeTelegramNudge = () => {
    closeDialog(telegramNudgeModal);
    scheduleTelegramNudge(telegramNudgeRepeatDelay);
  };

  telegramNudgeClose?.addEventListener('click', closeTelegramNudge);

  telegramNudgeModal.addEventListener('click', (event) => {
    if (event.target === telegramNudgeModal) {
      closeTelegramNudge();
    }
  });

  estimateContactNudgeAction?.addEventListener('click', () => {
    window.clearTimeout(telegramNudgeTimer);
    closeDialog(telegramNudgeModal);
    openEstimateContactModal();
  });

  scheduleTelegramNudge(telegramNudgeInitialDelay);
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

const leadNamePattern = /^[\p{L}\s-]+$/u;

document.querySelectorAll('[data-lead-form]').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = form.querySelector('[name="name"]');
    const contact = form.querySelector('[name="contact"]');
    const service = form.querySelector('[name="service"]');
    const leadType = form.querySelector('[name="leadType"]');
    const thankYou = form.getAttribute('data-thank-you') || '/spasibo/';
    const endpoint = form.getAttribute('data-endpoint');
    const submitMode = form.getAttribute('data-submit-mode');
    const submitButton = form.querySelector('[type="submit"]');
    const nameValue = name.value.trim();

    name.setCustomValidity('');
    if (nameValue && !leadNamePattern.test(nameValue)) {
      name.setCustomValidity('Используйте только буквы');
    }

    if (!nameValue || !contact.value.trim() || !form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitButton?.setAttribute('disabled', '');

    const payload = {
      name: nameValue,
      contact: contact.value.trim(),
      service: service.value.trim(),
      leadType: leadType?.value.trim() || '',
      source: window.location.pathname,
    };

    if (submitMode !== 'endpoint' || !endpoint) {
      alert('Приём заявок временно настраивается. Позвоните нам или напишите в Telegram.');
      submitButton?.removeAttribute('disabled');
      return;
    }

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
      submitButton?.removeAttribute('disabled');
      return;
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

      const supportsPreciseHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (supportsPreciseHover) {
        map.behaviors.enable('scrollZoom');
      } else {
        map.behaviors.disable('scrollZoom');
      }

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
