import { mediaQueryLarge, isMobileBreakpoint } from '@theme/utilities';

class AccordionCustom extends HTMLElement {
  get details() {
    const details = this.querySelector('details');
    if (!(details instanceof HTMLDetailsElement)) throw new Error('Details element not found');
    return details;
  }

  get summary() {
    const summary = this.details.querySelector('summary');
    if (!(summary instanceof HTMLElement)) throw new Error('Summary element not found');
    return summary;
  }

  get content() {
    return this.details.querySelector('.accordion-content');
  }

  get #disableOnMobile() {
    return this.dataset.disableOnMobile === 'true';
  }

  get #disableOnDesktop() {
    return this.dataset.disableOnDesktop === 'true';
  }

  get #closeWithEscape() {
    return this.dataset.closeWithEscape === 'true';
  }

  #controller = new AbortController();

  connectedCallback() {
    const { signal } = this.#controller;

    this.#setDefaultOpenState();

    this.addEventListener('keydown', this.#handleKeyDown, { signal });
    this.summary.addEventListener('click', this.handleClick, { signal });
    mediaQueryLarge.addEventListener('change', this.#handleMediaQueryChange, { signal });

    this.details.addEventListener('toggle', () => this.#animate());
  }

  disconnectedCallback() {
    this.#controller.abort();
  }

  handleClick = (event) => {
    const isMobile = isMobileBreakpoint();
    const isDesktop = !isMobile;

    if ((isMobile && this.#disableOnMobile) || (isDesktop && this.#disableOnDesktop)) {
      event.preventDefault();
      return;
    }
  };

  #handleMediaQueryChange = () => {
    this.#setDefaultOpenState();
  };

  #setDefaultOpenState() {
    const isMobile = isMobileBreakpoint();

    this.details.open =
      (isMobile && this.hasAttribute('open-by-default-on-mobile')) ||
      (!isMobile && this.hasAttribute('open-by-default-on-desktop'));
  }

  #handleKeyDown(event) {
    if (event.key === 'Escape' && this.#closeWithEscape) {
      event.preventDefault();
      this.details.open = false;
      this.summary.focus();
    }
  }

  // 🔥 NUEVO: Animación suave
  #animate() {
    const content = this.content;
    if (!content) return;

    if (this.details.open) {
      content.style.height = '0px';
      content.style.opacity = '0';

      requestAnimationFrame(() => {
        content.style.transition = 'all 0.3s ease';
        content.style.height = content.scrollHeight + 'px';
        content.style.opacity = '1';
      });
    } else {
      content.style.height = content.scrollHeight + 'px';

      requestAnimationFrame(() => {
        content.style.transition = 'all 0.25s ease';
        content.style.height = '0px';
        content.style.opacity = '0';
      });
    }
  }
}

if (!customElements.get('accordion-custom')) {
  customElements.define('accordion-custom', AccordionCustom);
}
