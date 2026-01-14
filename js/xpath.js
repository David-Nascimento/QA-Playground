function clearHighlights() {
  document.querySelectorAll('.highlight').forEach(el => {
    el.classList.remove('highlight');
  });
}

function testXPath() {
  const xpath = document.getElementById('xpath-input').value;
  const resultDiv = document.getElementById('xpath-result');
  
  if (!xpath) {
    resultDiv.innerHTML = '<span class="result-error">Por favor, insira um seletor XPath.</span>';
    return;
  }
  
  try {
    const result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
    const nodes = [];
    let node = result.iterateNext();
    
    while (node) {
      nodes.push(node);
      node = result.iterateNext();
    }
    
    if (nodes.length === 0) {
      resultDiv.innerHTML = '<span class="result-error">Nenhum elemento encontrado com este XPath.</span>';
    } else {
      resultDiv.innerHTML = `<span class="result-success">Encontrado(s) ${nodes.length} elemento(s):</span><br>`;
      nodes.forEach((node, index) => {
        const tag = node.tagName || node.nodeName;
        const id = node.id ? ` id="${node.id}"` : '';
        const classes = node.className ? ` class="${node.className}"` : '';
        const text = node.textContent ? node.textContent.substring(0, 50) : '';
        resultDiv.innerHTML += `<br>${index + 1}. &lt;${tag}${id}${classes}&gt; ${text}...`;
      });
    }
  } catch (e) {
    resultDiv.innerHTML = `<span class="result-error">Erro: ${e.message}</span>`;
  }
}

function highlightXPath() {
  clearHighlights();
  const xpath = document.getElementById('xpath-input').value;
  const resultDiv = document.getElementById('xpath-result');
  
  if (!xpath) {
    resultDiv.innerHTML = '<span class="result-error">Por favor, insira um seletor XPath.</span>';
    return;
  }
  
  try {
    const result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
    const nodes = [];
    let node = result.iterateNext();
    
    while (node) {
      nodes.push(node);
      node = result.iterateNext();
    }
    
    if (nodes.length === 0) {
      resultDiv.innerHTML = '<span class="result-error">Nenhum elemento encontrado com este XPath.</span>';
    } else {
      // Destacar elementos com animação
      nodes.forEach((node, index) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          setTimeout(() => {
            node.classList.add('highlight');
          }, index * 50);
        }
      });
      
      // Mensagem com contador destacado
      resultDiv.innerHTML = `<span class="result-success" style="font-size: 1.1em; font-weight: 600;">
        ✓ <strong style="color: #ffc107; font-size: 1.2em;">${nodes.length}</strong> elemento(s) encontrado(s) e destacado(s) em <strong style="color: #ffc107;">amarelo brilhante</strong>!
      </span>`;
      
      // Scroll suave para o primeiro elemento encontrado
      if (nodes.length > 0 && nodes[0].nodeType === Node.ELEMENT_NODE) {
        setTimeout(() => {
          const element = nodes[0];
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - 150;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 300);
      }
    }
  } catch (e) {
    resultDiv.innerHTML = `<span class="result-error">Erro: ${e.message}</span>`;
  }
}

function testCSS() {
  const css = document.getElementById('css-input').value;
  const resultDiv = document.getElementById('css-result');
  
  if (!css) {
    resultDiv.innerHTML = '<span class="result-error">Por favor, insira um seletor CSS.</span>';
    return;
  }
  
  try {
    const elements = document.querySelectorAll(css);
    
    if (elements.length === 0) {
      resultDiv.innerHTML = '<span class="result-error">Nenhum elemento encontrado com este seletor CSS.</span>';
    } else {
      resultDiv.innerHTML = `<span class="result-success">Encontrado(s) ${elements.length} elemento(s):</span><br>`;
      elements.forEach((el, index) => {
        const tag = el.tagName || el.nodeName;
        const id = el.id ? ` id="${el.id}"` : '';
        const classes = el.className ? ` class="${el.className}"` : '';
        const text = el.textContent ? el.textContent.substring(0, 50) : '';
        resultDiv.innerHTML += `<br>${index + 1}. &lt;${tag}${id}${classes}&gt; ${text}...`;
      });
    }
  } catch (e) {
    resultDiv.innerHTML = `<span class="result-error">Erro: ${e.message}</span>`;
  }
}

function highlightCSS() {
  clearHighlights();
  const css = document.getElementById('css-input').value;
  const resultDiv = document.getElementById('css-result');
  
  if (!css) {
    resultDiv.innerHTML = '<span class="result-error">Por favor, insira um seletor CSS.</span>';
    return;
  }
  
  try {
    const elements = document.querySelectorAll(css);
    
    if (elements.length === 0) {
      resultDiv.innerHTML = '<span class="result-error">Nenhum elemento encontrado com este seletor CSS.</span>';
    } else {
      // Destacar elementos com animação
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('highlight');
        }, index * 50);
      });
      
      // Mensagem com contador destacado
      resultDiv.innerHTML = `<span class="result-success" style="font-size: 1.1em; font-weight: 600;">
        ✓ <strong style="color: #ffc107; font-size: 1.2em;">${elements.length}</strong> elemento(s) encontrado(s) e destacado(s) em <strong style="color: #ffc107;">amarelo brilhante</strong>!
      </span>`;
      
      // Scroll suave para o primeiro elemento encontrado
      if (elements.length > 0) {
        setTimeout(() => {
          const element = elements[0];
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - 150;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 300);
      }
    }
  } catch (e) {
    resultDiv.innerHTML = `<span class="result-error">Erro: ${e.message}</span>`;
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Permitir Enter para testar
  const xpathInput = document.getElementById('xpath-input');
  const cssInput = document.getElementById('css-input');
  
  if (xpathInput) {
    xpathInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        testXPath();
      }
    });
  }

  if (cssInput) {
    cssInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        testCSS();
      }
    });
  }

  // Atualizar valor do range
  const rangeInput = document.getElementById('demo-range');
  const rangeValue = document.getElementById('range-value');
  if (rangeInput && rangeValue) {
    rangeInput.addEventListener('input', function() {
      rangeValue.textContent = this.value;
    });
    rangeValue.textContent = rangeInput.value;
  }

  // Funcionalidade dos botões do formulário
  const submitBtn = document.getElementById('btn-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const form = document.getElementById('demo-form');
      if (form) {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
          data[key] = value;
        }
        console.log('Dados do formulário:', data);
        if (window.showToast) {
          window.showToast('Formulário enviado! (veja o console)');
        }
      }
    });
  }

  const cancelBtn = document.getElementById('btn-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (window.showToast) {
        window.showToast('Ação cancelada');
      }
    });
  }

  const actionBtn = document.querySelector('[data-testid="action-btn"]');
  if (actionBtn) {
    actionBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (window.showToast) {
        window.showToast('Ação executada');
      }
    });
  }

  // Funcionalidade de toggle para habilitar/desabilitar elementos
  const toggleEnabledBtn = document.getElementById('toggle-enabled-btn');
  const toggleDisabledBtn = document.getElementById('toggle-disabled-btn');
  const toggleEnabledInput = document.getElementById('toggle-enabled-input');
  const toggleDisabledInput = document.getElementById('toggle-disabled-input');
  const demoToggleBtn = document.getElementById('demo-toggle-btn');
  const demoToggleInput = document.getElementById('demo-toggle-input');
  const btnStatus = document.getElementById('btn-status');
  const inputStatus = document.getElementById('input-status');

  function updateButtonStatus() {
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
  }

  function updateInputStatus() {
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
  }

  if (toggleEnabledBtn && demoToggleBtn) {
    toggleEnabledBtn.addEventListener('click', function() {
      demoToggleBtn.disabled = false;
      demoToggleBtn.removeAttribute('disabled');
      updateButtonStatus();
      if (window.showToast) {
        window.showToast('Botão habilitado!');
      }
    });
  }

  if (toggleDisabledBtn && demoToggleBtn) {
    toggleDisabledBtn.addEventListener('click', function() {
      demoToggleBtn.disabled = true;
      demoToggleBtn.setAttribute('disabled', 'disabled');
      updateButtonStatus();
      if (window.showToast) {
        window.showToast('Botão desabilitado!');
      }
    });
  }

  if (toggleEnabledInput && demoToggleInput) {
    toggleEnabledInput.addEventListener('click', function() {
      demoToggleInput.disabled = false;
      demoToggleInput.readOnly = false;
      demoToggleInput.removeAttribute('disabled');
      demoToggleInput.removeAttribute('readonly');
      updateInputStatus();
      if (window.showToast) {
        window.showToast('Input habilitado!');
      }
    });
  }

  if (toggleDisabledInput && demoToggleInput) {
    toggleDisabledInput.addEventListener('click', function() {
      demoToggleInput.disabled = true;
      demoToggleInput.setAttribute('disabled', 'disabled');
      updateInputStatus();
      if (window.showToast) {
        window.showToast('Input desabilitado!');
      }
    });
  }

  if (demoToggleBtn) {
    demoToggleBtn.addEventListener('click', function(e) {
      if (this.disabled) {
        e.preventDefault();
        e.stopPropagation();
        if (window.showToast) {
          window.showToast('Botão está desabilitado e não pode ser clicado!');
        }
        return false;
      }
      if (window.showToast) {
        window.showToast('Botão toggle clicado!');
      }
    });
    updateButtonStatus();
  }

  if (demoToggleInput) {
    demoToggleInput.addEventListener('focus', function() {
      if (this.disabled || this.readOnly) {
        this.blur();
        if (window.showToast) {
          window.showToast('Input está desabilitado e não pode ser editado!');
        }
      }
    });
    demoToggleInput.addEventListener('input', function() {
      if (this.disabled || this.readOnly) {
        this.value = 'Campo habilitado';
      }
    });
    updateInputStatus();
  }

  const resetBtn = document.querySelector('[data-testid="reset-btn"]');
  if (resetBtn) {
    resetBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const form = document.getElementById('demo-form');
      if (form) {
        form.reset();
        if (rangeValue) {
          rangeValue.textContent = rangeInput ? rangeInput.value : '5';
        }
        if (window.showToast) {
          window.showToast('Formulário limpo');
        }
      }
    });
  }

  // Funcionalidade dos botões de compra
  document.querySelectorAll('[data-testid^="buy-btn"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const card = this.closest('[data-product-id]');
      const productId = card ? (card.dataset.productId || 'desconhecido') : 'desconhecido';
      if (window.showToast) {
        window.showToast(`Produto ${productId} adicionado ao carrinho!`);
      }
    });
  });

  // Funcionalidade dos links
  document.querySelectorAll('[data-link-type]').forEach(link => {
    link.addEventListener('click', function(e) {
      const linkType = this.dataset.linkType;
      if (linkType === 'internal' || linkType === 'anchor') {
        e.preventDefault();
        if (window.showToast) {
          window.showToast(`Link ${linkType} clicado`);
        }
      }
    });
  });

  // Funcionalidade dos checkboxes e radios
  document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
    input.addEventListener('change', function() {
      const testId = this.dataset.testid;
      if (testId && window.showToast) {
        const type = this.type;
        const action = this.checked ? 'marcado' : 'desmarcado';
        window.showToast(`${type} ${testId} ${action}`);
      }
    });
  });

  // Funcionalidade dos selects
  const countrySelect = document.getElementById('demo-select');
  if (countrySelect) {
    countrySelect.addEventListener('change', function() {
      if (window.showToast) {
        window.showToast(`País selecionado: ${this.options[this.selectedIndex].text}`);
      }
    });
  }

  // Funcionalidade dos inputs
  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('blur', function() {
      if (this.value && window.showToast) {
        const testId = this.getAttribute('data-testid');
        if (testId) {
          console.log(`Campo ${testId} preenchido com: ${this.value}`);
        }
      }
    });
  });
});
