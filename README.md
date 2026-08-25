# Miragio 204 — Estúdio 3D

Protótipo web estático para visualização e personalização do apartamento da planta em `raw/Plantas 204 T3.pdf`.

## Recursos

- Planta navegável com câmera superior e visualização de paredes
- Seleção direta de ambientes, pisos e paredes
- Biblioteca unificada: qualquer acabamento pode ser aplicado ao piso ou à parede selecionada
- Rotação da textura selecionada em incrementos de 90°
- Catálogo pesquisável com 84 padrões oficiais ARAUCO Melamina, carregados sob demanda
- Acabamentos agrupados por marca, categoria/coleção e tipo de textura
- Sobreposições alinhadas das plantas de Arquitetura, Elétrica e Ar Condicionado/Gás/Prumadas
- Bandeja de eletrodomésticos com arrastar e soltar na planta
- Remoção visual de divisórias internas
- Histórico de desfazer, persistência local e exportação de imagem
- Layout responsivo para desktop e celular

## Executar localmente

O projeto não possui etapa de build. Como usa módulos ES, sirva a pasta por HTTP:

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Catálogo de texturas

O catálogo ARAUCO é alimentado automaticamente por `textures/arauco/source-manifest.json`. Consulte `textures/README.md`.

## Publicar no GitHub Pages

O workflow `.github/workflows/pages.yml` publica automaticamente pushes para `main` ou `master`. No repositório GitHub, abra **Settings → Pages** e escolha **GitHub Actions** como fonte. Também é possível iniciar o workflow manualmente em **Actions → Deploy to GitHub Pages**.

## Limitações

Este é um modelo conceitual traçado a partir da primeira folha arquitetônica do PDF. Ele não substitui levantamento, projeto executivo ou validação estrutural. A remoção de paredes é apenas uma simulação visual.
