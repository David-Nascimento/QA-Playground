#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para extrair seções do accessibility-playground.html e criar páginas individuais
"""

import re
import os
from pathlib import Path

# Configurações
SOURCE_FILE = Path('pages/tools/accessibility-playground.html')
OUTPUT_DIR = Path('pages/tools/accessibility')
TEMPLATE_HEADER = '''<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>{title} — Acessibilidade Web — QA Playground</title>
    <link rel="stylesheet" href="../../../css/main.css" />
    <link rel="stylesheet" href="../../../css/accessibility-playground.css" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <header class="et-header">
      <div class="et-header-inner">
        <a href="../../../index.html" class="et-logo" aria-label="Início">
          <img src="../../../assets/icons/logo.svg" alt="Logo QA Playground" height="40" />
        </a>
        <button id="nav-toggle" class="nav-toggle" aria-label="Abrir menu de navegação" aria-expanded="false" aria-controls="main-nav">
          <span class="nav-toggle-icon" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        <nav id="main-nav" class="et-nav" aria-label="Navegação principal">
          <ul class="et-nav-list">
            <li><a href="../../../index.html">Início</a></li>
            <li><a href="../mobile-playground.html">Mobile Playground</a></li>
            <li><a href="../bdd-playground.html">BDD Playground</a></li>
            <li><a href="../nft-playground.html">NFT Playground</a></li>
            <li><a href="index.html">Acessibilidade</a></li>
            <li class="nav-dropdown">
              <button class="dropdown-toggle" aria-expanded="false" aria-haspopup="true">Desafio</button>
              <ul class="dropdown-menu">
                <li><a href="../../desafio/junior.html">Desafios Júnior</a></li>
                <li><a href="../../desafio/pleno.html">Desafios Pleno</a></li>
                <li><a href="../../desafio/senior.html">Desafios Sênior</a></li>
              </ul>
            </li>
          </ul>
        </nav>
        <div class="et-header-actions">
          <button id="theme-toggle" aria-label="Alternar tema" class="theme-toggle-btn"></button>
        </div>
      </div>
    </header>

    <main class="container">
      <div class="a11y-container">
        <!-- Breadcrumb -->
        <nav class="a11y-breadcrumb" aria-label="Breadcrumb">
          <a href="index.html">Acessibilidade Web</a> / {section_name}
        </nav>

        <!-- Header -->
        <div class="a11y-header">
          <h1>{section_title}</h1>
          <p class="a11y-subtitle">
            {subtitle}
          </p>
        </div>

        <!-- Content -->
'''

TEMPLATE_FOOTER = '''      </div>
    </main>

    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-main">QA Playground — Projeto educacional • Português</div>
        <div class="footer-secondary">
          Desenvolvido por <strong>David Nascimento</strong> • Licenciado sob <a href="../../../LICENSE">MIT License</a>
        </div>
      </div>
    </footer>

    <script type="module" src="../../../js/index.js"></script>{extra_scripts}
  </body>
</html>
'''

# Mapeamento de seções para arquivos
SECTIONS = [
    {
        'comment': '<!-- 1. Introdução -->',
        'file': 'introducao.html',
        'title': '1. Introdução à Acessibilidade Web',
        'section_name': 'Introdução',
        'subtitle': 'O que é acessibilidade digital e quem são os usuários beneficiados.'
    },
    {
        'comment': '<!-- 2. Importância Legal e Ética -->',
        'file': 'importancia-legal-etica.html',
        'title': '2. Importância Legal e Ética',
        'section_name': 'Importância Legal e Ética',
        'subtitle': 'WCAG 2.2, aspectos legais e éticos da acessibilidade web.'
    },
    {
        'comment': '<!-- 3. Playgrounds Interativos -->',
        'file': 'playgrounds.html',
        'title': '3. Playgrounds Interativos',
        'section_name': 'Playgrounds Interativos',
        'subtitle': 'Explore problemas comuns de acessibilidade e suas soluções de forma prática.',
        'extra_scripts': '\n    <script src="../../../js/accessibility-playground.js"></script>'
    },
    {
        'comment': '<!-- 4. Testes de Acessibilidade -->',
        'file': 'testes.html',
        'title': '4. Testes de Acessibilidade (Como Testar)',
        'section_name': 'Testes de Acessibilidade',
        'subtitle': 'Aprenda a testar acessibilidade manualmente e com ferramentas automatizadas.'
    },
    {
        'comment': '<!-- 5. Checklist de Acessibilidade -->',
        'file': 'checklist.html',
        'title': '5. Checklist de Acessibilidade',
        'section_name': 'Checklist de Acessibilidade',
        'subtitle': 'Use este checklist para garantir que sua aplicação web atenda aos requisitos básicos de acessibilidade WCAG 2.2 AA.'
    },
    {
        'comment': '<!-- 6. Casos de Teste Práticos -->',
        'file': 'casos-teste.html',
        'title': '6. Casos de Teste Práticos',
        'section_name': 'Casos de Teste Práticos',
        'subtitle': 'Casos de teste reais e acionáveis para validar acessibilidade em diferentes cenários de uso.'
    },
    {
        'comment': '<!-- 7. Ferramentas Úteis -->',
        'file': 'ferramentas.html',
        'title': '7. Ferramentas Úteis',
        'section_name': 'Ferramentas Úteis',
        'subtitle': 'Extensões de navegador, simuladores e leitores de tela para desenvolvimento, teste e validação de acessibilidade web.'
    },
    {
        'comment': '<!-- 8. Documentação -->',
        'file': 'documentacao.html',
        'title': '8. Documentação',
        'section_name': 'Documentação',
        'subtitle': 'Documentação oficial e recursos educacionais para aprofundar conhecimentos sobre acessibilidade web.'
    }
]


def extract_section(content, start_comment, next_comment=None):
    """Extrai o conteúdo de uma seção entre dois comentários"""
    # Encontra o início da seção
    start_idx = content.find(start_comment)
    if start_idx == -1:
        return None
    
    # Se houver próxima seção, encontra o final
    if next_comment:
        end_idx = content.find(next_comment, start_idx)
        if end_idx != -1:
            section_content = content[start_idx:end_idx]
        else:
            # Última seção - vai até o fechamento do container
            section_content = content[start_idx:]
    else:
        # Última seção
        section_content = content[start_idx:]
    
    # Remove o comentário inicial e extrai apenas o conteúdo da seção
    # Remove o comentário de abertura
    section_content = section_content.replace(start_comment, '', 1).strip()
    
    # Remove o fechamento da seção se estiver no final
    section_content = re.sub(r'</section>\s*$', '', section_content).strip()
    
    return section_content


def fix_paths(content):
    """Ajusta os caminhos relativos para funcionar no novo diretório"""
    # Substitui caminhos de CSS/JS/Assets
    content = re.sub(r'href="\.\./\.\./', r'href="../../../', content)
    content = re.sub(r'src="\.\./\.\./', r'src="../../../', content)
    
    # Mantém os caminhos que já estão corretos
    # Remove ajustes duplicados
    content = re.sub(r'href="\.\./\.\./\.\./\.\./', r'href="../../../', content)
    content = re.sub(r'src="\.\./\.\./\.\./\.\./', r'src="../../../', content)
    
    return content


def generate_pages():
    """Gera todas as páginas individuais"""
    # Lê o arquivo fonte
    if not SOURCE_FILE.exists():
        print(f"Erro: Arquivo não encontrado: {SOURCE_FILE}")
        return
    
    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        source_content = f.read()
    
    # Garante que o diretório de saída existe
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Gera cada página
    for i, section in enumerate(SECTIONS):
        print(f"Gerando {section['file']}...")
        
        # Encontra o conteúdo da seção
        start_comment = section['comment']
        next_comment = SECTIONS[i + 1]['comment'] if i + 1 < len(SECTIONS) else None
        
        section_content = extract_section(source_content, start_comment, next_comment)
        
        if not section_content:
            print(f"  Aviso: Seção não encontrada para {section['file']}")
            continue
        
        # Ajusta caminhos no conteúdo
        section_content = fix_paths(section_content)
        
        # Prepara scripts extras
        extra_scripts = section.get('extra_scripts', '')
        
        # Monta a página completa
        page_content = TEMPLATE_HEADER.format(
            title=section['title'],
            section_name=section['section_name'],
            section_title=section['title'],
            subtitle=section['subtitle']
        )
        
        # Adiciona o conteúdo da seção (sem o comentário, mas mantendo a estrutura)
        # Remove o h2 do título da seção já que já está no header
        section_content = re.sub(r'<h2 class="a11y-section-title">.*?</h2>', '', section_content, flags=re.DOTALL)
        section_content = section_content.strip()
        
        page_content += f'        {section_content}\n'
        page_content += TEMPLATE_FOOTER.format(extra_scripts=extra_scripts)
        
        # Salva o arquivo
        output_file = OUTPUT_DIR / section['file']
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(page_content)
        
        print(f"  [OK] {section['file']} criado com sucesso!")
    
    print(f"\n[SUCCESS] Todas as paginas foram geradas em {OUTPUT_DIR}")


if __name__ == '__main__':
    generate_pages()
