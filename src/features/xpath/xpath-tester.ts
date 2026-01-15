// ========================================
// XPath & CSS Tester - Funcionalidade Principal
// ========================================

/**
 * Classe para gerenciar teste de seletores XPath e CSS
 */
export class XPathCSSTester {
  private xpathInput: HTMLInputElement | null = null;
  private cssInput: HTMLInputElement | null = null;
  private xpathResult: HTMLElement | null = null;
  private cssResult: HTMLElement | null = null;

  /**
   * Inicializa o tester
   */
  init(): void {
    this.xpathInput = document.getElementById('xpath-input') as HTMLInputElement;
    this.cssInput = document.getElementById('css-input') as HTMLInputElement;
    this.xpathResult = document.getElementById('xpath-result');
    this.cssResult = document.getElementById('css-result');

    this.setupXPathInput();
    this.setupCSSInput();
    this.setupDemoForm();
    this.setupDemoElements();
  }

  /**
   * Configura input XPath
   */
  private setupXPathInput(): void {
    if (!this.xpathInput) return;

    this.xpathInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.testXPath();
      }
    });
  }

  /**
   * Configura input CSS
   */
  private setupCSSInput(): void {
    if (!this.cssInput) return;

    this.cssInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.testCSS();
      }
    });
  }

  /**
   * Limpa highlights anteriores
   */
  clearHighlights(): void {
    document.querySelectorAll('.highlight').forEach((el) => {
      el.classList.remove('highlight');
    });
  }

  /**
   * Testa seletor XPath
   */
  testXPath(): void {
    if (!this.xpathInput || !this.xpathResult) return;

    const xpath = this.xpathInput.value.trim();
    if (!xpath) {
      this.xpathResult.innerHTML =
        '<span class="result-error">Por favor, insira um seletor XPath.</span>';
      return;
    }

    try {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ANY_TYPE,
        null
      );
      const nodes: Node[] = [];
      let node = result.iterateNext();

      while (node) {
        nodes.push(node);
        node = result.iterateNext();
      }

      if (nodes.length === 0) {
        this.xpathResult.innerHTML =
          '<span class="result-error">Nenhum elemento encontrado com este XPath.</span>';
      } else {
        this.xpathResult.innerHTML = `<span class="result-success">Encontrado(s) ${nodes.length} elemento(s):</span><br>`;
        nodes.forEach((node, index) => {
          const element = node as Element;
          const tag = element.tagName || node.nodeName;
          const id = element.id ? ` id="${element.id}"` : '';
          const classes = element.className ? ` class="${element.className}"` : '';
          const text = node.textContent ? node.textContent.substring(0, 50) : '';
          this.xpathResult!.innerHTML += `<br>${index + 1}. &lt;${tag}${id}${classes}&gt; ${text}...`;
        });
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Erro desconhecido';
      this.xpathResult.innerHTML = `<span class="result-error">Erro: ${error}</span>`;
    }
  }

  /**
   * Destaca elementos XPath
   */
  highlightXPath(): void {
    this.clearHighlights();
    if (!this.xpathInput || !this.xpathResult) return;

    const xpath = this.xpathInput.value.trim();
    if (!xpath) {
      this.xpathResult.innerHTML =
        '<span class="result-error">Por favor, insira um seletor XPath.</span>';
      return;
    }

    try {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ANY_TYPE,
        null
      );
      const nodes: Node[] = [];
      let node = result.iterateNext();

      while (node) {
        nodes.push(node);
        node = result.iterateNext();
      }

      if (nodes.length === 0) {
        this.xpathResult.innerHTML =
          '<span class="result-error">Nenhum elemento encontrado com este XPath.</span>';
      } else {
        // Destacar elementos com animação
        nodes.forEach((node, index) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            setTimeout(() => {
              (node as Element).classList.add('highlight');
            }, index * 50);
          }
        });

        this.xpathResult.innerHTML = `<span class="result-success" style="font-size: 1.1em; font-weight: 600;">
        ✓ <strong style="color: #ffc107; font-size: 1.2em;">${nodes.length}</strong> elemento(s) encontrado(s) e destacado(s) em <strong style="color: #ffc107;">amarelo brilhante</strong>!
      </span>`;

        // Scroll suave para o primeiro elemento
        if (nodes.length > 0 && nodes[0].nodeType === Node.ELEMENT_NODE) {
          setTimeout(() => {
            const element = nodes[0] as Element;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - 150;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            });
          }, 300);
        }
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Erro desconhecido';
      this.xpathResult.innerHTML = `<span class="result-error">Erro: ${error}</span>`;
    }
  }

  /**
   * Testa seletor CSS
   */
  testCSS(): void {
    if (!this.cssInput || !this.cssResult) return;

    const css = this.cssInput.value.trim();
    if (!css) {
      this.cssResult.innerHTML =
        '<span class="result-error">Por favor, insira um seletor CSS.</span>';
      return;
    }

    try {
      const elements = document.querySelectorAll(css);

      if (elements.length === 0) {
        this.cssResult.innerHTML =
          '<span class="result-error">Nenhum elemento encontrado com este seletor CSS.</span>';
      } else {
        this.cssResult.innerHTML = `<span class="result-success">Encontrado(s) ${elements.length} elemento(s):</span><br>`;
        elements.forEach((el, index) => {
          const tag = el.tagName || el.nodeName;
          const id = el.id ? ` id="${el.id}"` : '';
          const classes = el.className ? ` class="${el.className}"` : '';
          const text = el.textContent ? el.textContent.substring(0, 50) : '';
          this.cssResult!.innerHTML += `<br>${index + 1}. &lt;${tag}${id}${classes}&gt; ${text}...`;
        });
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Erro desconhecido';
      this.cssResult.innerHTML = `<span class="result-error">Erro: ${error}</span>`;
    }
  }

  /**
   * Destaca elementos CSS
   */
  highlightCSS(): void {
    this.clearHighlights();
    if (!this.cssInput || !this.cssResult) return;

    const css = this.cssInput.value.trim();
    if (!css) {
      this.cssResult.innerHTML =
        '<span class="result-error">Por favor, insira um seletor CSS.</span>';
      return;
    }

    try {
      const elements = document.querySelectorAll(css);

      if (elements.length === 0) {
        this.cssResult.innerHTML =
          '<span class="result-error">Nenhum elemento encontrado com este seletor CSS.</span>';
      } else {
        // Destacar elementos com animação
        elements.forEach((el, index) => {
          setTimeout(() => {
            el.classList.add('highlight');
          }, index * 50);
        });

        this.cssResult.innerHTML = `<span class="result-success" style="font-size: 1.1em; font-weight: 600;">
        ✓ <strong style="color: #ffc107; font-size: 1.2em;">${elements.length}</strong> elemento(s) encontrado(s) e destacado(s) em <strong style="color: #ffc107;">amarelo brilhante</strong>!
      </span>`;

        // Scroll suave para o primeiro elemento
        if (elements.length > 0) {
          setTimeout(() => {
            const element = elements[0];
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - 150;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            });
          }, 300);
        }
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Erro desconhecido';
      this.cssResult.innerHTML = `<span class="result-error">Erro: ${error}</span>`;
    }
  }

  /**
   * Configura formulário de demonstração
   */
  private setupDemoForm(): void {
    // Range input
    const rangeInput = document.getElementById('demo-range') as HTMLInputElement;
    const rangeValue = document.getElementById('range-value');
    if (rangeInput && rangeValue) {
      rangeInput.addEventListener('input', () => {
        rangeValue.textContent = rangeInput.value;
      });
      rangeValue.textContent = rangeInput.value;
    }

    // Submit button
    const submitBtn = document.getElementById('btn-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const form = document.getElementById('demo-form') as HTMLFormElement;
        if (form) {
          const formData = new FormData(form);
          const data: Record<string, string> = {};
          for (const [key, value] of formData.entries()) {
            data[key] = value.toString();
          }
          console.log('Dados do formulário:', data);
          if (typeof window.showToast === 'function') {
            window.showToast('Formulário enviado! (veja o console)');
          }
        }
      });
    }

    // Cancel button
    const cancelBtn = document.getElementById('btn-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof window.showToast === 'function') {
          window.showToast('Ação cancelada');
        }
      });
    }

    // Reset button
    const resetBtn = document.querySelector<HTMLButtonElement>('[data-testid="reset-btn"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const form = document.getElementById('demo-form') as HTMLFormElement;
        if (form) {
          form.reset();
          if (rangeValue) {
            rangeValue.textContent = rangeInput ? rangeInput.value : '5';
          }
          if (typeof window.showToast === 'function') {
            window.showToast('Formulário limpo');
          }
        }
      });
    }
  }

  /**
   * Configura elementos de demonstração
   */
  private setupDemoElements(): void {
    // Action button
    const actionBtn = document.querySelector<HTMLButtonElement>('[data-testid="action-btn"]');
    if (actionBtn) {
      actionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof window.showToast === 'function') {
          window.showToast('Ação executada');
        }
      });
    }

    // Buy buttons
    document.querySelectorAll<HTMLButtonElement>('[data-testid^="buy-btn"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest<HTMLElement>('[data-product-id]');
        const productId = card ? card.dataset.productId || 'desconhecido' : 'desconhecido';
        if (typeof window.showToast === 'function') {
          window.showToast(`Produto ${productId} adicionado ao carrinho!`);
        }
      });
    });

    // Links
    document.querySelectorAll<HTMLAnchorElement>('[data-link-type]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const linkType = link.dataset.linkType;
        if (linkType === 'internal' || linkType === 'anchor') {
          e.preventDefault();
          if (typeof window.showToast === 'function') {
            window.showToast(`Link ${linkType} clicado`);
          }
        }
      });
    });

    // Toggle buttons e inputs
    this.setupToggleElements();

    // Checkboxes e radios
    document
      .querySelectorAll<HTMLInputElement>('input[type="checkbox"], input[type="radio"]')
      .forEach((input) => {
        input.addEventListener('change', () => {
          const testId = input.dataset.testid;
          if (testId && typeof window.showToast === 'function') {
            const type = input.type;
            const action = input.checked ? 'marcado' : 'desmarcado';
            window.showToast(`${type} ${testId} ${action}`);
          }
        });
      });

    // Select
    const countrySelect = document.getElementById('demo-select') as HTMLSelectElement;
    if (countrySelect) {
      countrySelect.addEventListener('change', () => {
        if (typeof window.showToast === 'function') {
          window.showToast(
            `País selecionado: ${countrySelect.options[countrySelect.selectedIndex].text}`
          );
        }
      });
    }

    // Inputs
    document.querySelectorAll<HTMLInputElement>('.form-input').forEach((input) => {
      input.addEventListener('blur', () => {
        if (input.value) {
          const testId = input.getAttribute('data-testid');
          if (testId) {
            console.log(`Campo ${testId} preenchido com: ${input.value}`);
          }
        }
      });
    });
  }

  /**
   * Configura elementos toggle (habilitar/desabilitar)
   */
  private setupToggleElements(): void {
    const toggleEnabledBtn = document.getElementById('toggle-enabled-btn') as HTMLButtonElement;
    const toggleDisabledBtn = document.getElementById('toggle-disabled-btn') as HTMLButtonElement;
    const toggleEnabledInput = document.getElementById('toggle-enabled-input') as HTMLButtonElement;
    const toggleDisabledInput = document.getElementById('toggle-disabled-input') as HTMLButtonElement;
    const demoToggleBtn = document.getElementById('demo-toggle-btn') as HTMLButtonElement;
    const demoToggleInput = document.getElementById('demo-toggle-input') as HTMLInputElement;
    const btnStatus = document.getElementById('btn-status');
    const inputStatus = document.getElementById('input-status');

    const updateButtonStatus = (): void => {
      if (demoToggleBtn) {
        const isDisabled = demoToggleBtn.disabled;
        if (btnStatus) {
          btnStatus.textContent = isDisabled ? 'Desabilitado' : 'Habilitado';
          btnStatus.style.color = isDisabled ? 'var(--danger)' : 'var(--success)';
        }
        if (toggleEnabledBtn) {
          toggleEnabledBtn.disabled = !isDisabled;
        }
        if (toggleDisabledBtn) {
          toggleDisabledBtn.disabled = isDisabled;
        }
      }
    };

    const updateInputStatus = (): void => {
      if (demoToggleInput) {
        const isDisabled = demoToggleInput.disabled || demoToggleInput.readOnly;
        if (inputStatus) {
          inputStatus.textContent = isDisabled ? 'Desabilitado' : 'Habilitado';
          inputStatus.style.color = isDisabled ? 'var(--danger)' : 'var(--success)';
        }
        if (toggleEnabledInput) {
          toggleEnabledInput.disabled = !isDisabled;
        }
        if (toggleDisabledInput) {
          toggleDisabledInput.disabled = isDisabled;
        }
      }
    };

    if (toggleEnabledBtn && demoToggleBtn) {
      toggleEnabledBtn.addEventListener('click', () => {
        demoToggleBtn.disabled = false;
        demoToggleBtn.removeAttribute('disabled');
        updateButtonStatus();
        if (typeof window.showToast === 'function') {
          window.showToast('Botão habilitado!');
        }
      });
    }

    if (toggleDisabledBtn && demoToggleBtn) {
      toggleDisabledBtn.addEventListener('click', () => {
        demoToggleBtn.disabled = true;
        demoToggleBtn.setAttribute('disabled', 'disabled');
        updateButtonStatus();
        if (typeof window.showToast === 'function') {
          window.showToast('Botão desabilitado!');
        }
      });
    }

    if (toggleEnabledInput && demoToggleInput) {
      toggleEnabledInput.addEventListener('click', () => {
        demoToggleInput.disabled = false;
        demoToggleInput.readOnly = false;
        demoToggleInput.removeAttribute('disabled');
        demoToggleInput.removeAttribute('readonly');
        updateInputStatus();
        if (typeof window.showToast === 'function') {
          window.showToast('Input habilitado!');
        }
      });
    }

    if (toggleDisabledInput && demoToggleInput) {
      toggleDisabledInput.addEventListener('click', () => {
        demoToggleInput.disabled = true;
        demoToggleInput.setAttribute('disabled', 'disabled');
        updateInputStatus();
        if (typeof window.showToast === 'function') {
          window.showToast('Input desabilitado!');
        }
      });
    }

    if (demoToggleBtn) {
      demoToggleBtn.addEventListener('click', (e) => {
        if (demoToggleBtn.disabled) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof window.showToast === 'function') {
            window.showToast('Botão está desabilitado e não pode ser clicado!');
          }
          return;
        }
        if (typeof window.showToast === 'function') {
          window.showToast('Botão toggle clicado!');
        }
      });
      updateButtonStatus();
    }

    if (demoToggleInput) {
      demoToggleInput.addEventListener('focus', () => {
        if (demoToggleInput.disabled || demoToggleInput.readOnly) {
          demoToggleInput.blur();
          if (typeof window.showToast === 'function') {
            window.showToast('Input está desabilitado e não pode ser editado!');
          }
        }
      });
      demoToggleInput.addEventListener('input', () => {
        if (demoToggleInput.disabled || demoToggleInput.readOnly) {
          demoToggleInput.value = 'Campo habilitado';
        }
      });
      updateInputStatus();
    }
  }
}

/**
 * Expõe funções globais para compatibilidade (se necessário)
 */
declare global {
  interface Window {
    testXPath?: () => void;
    testCSS?: () => void;
    highlightXPath?: () => void;
    highlightCSS?: () => void;
    clearHighlights?: () => void;
  }
}

/**
 * Expõe funções globais para compatibilidade
 */
export function exposeXPathFunctions(tester: XPathCSSTester): void {
  window.testXPath = () => tester.testXPath();
  window.testCSS = () => tester.testCSS();
  window.highlightXPath = () => tester.highlightXPath();
  window.highlightCSS = () => tester.highlightCSS();
  window.clearHighlights = () => tester.clearHighlights();
}
