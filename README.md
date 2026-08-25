# Miragio 204 — Estúdio 3D

Protótipo web estático para visualização e personalização do apartamento da planta em `raw/Plantas 204 T3.pdf`.

## Recursos

- Maquete 3D navegável com vistas 3D, planta e interior
- Seleção de ambientes, pisos, paredes e móveis
- Aplicação de materiais de piso e parede
- Remoção visual de divisórias internas
- Adição, movimentação, rotação e exclusão de móveis
- Histórico de desfazer, persistência local e exportação de imagem
- Layout responsivo para desktop e celular

## Executar localmente

O projeto não possui etapa de build. Como usa módulos ES, sirva a pasta por HTTP:

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Adicionar texturas

Coloque a imagem otimizada em `textures/` e adicione uma entrada ao array `MATERIALS` no início de `app.js`. Consulte `textures/README.md`.

## Publicar no GitHub Pages

O workflow `.github/workflows/pages.yml` publica automaticamente pushes para `main` ou `master`. No repositório GitHub, abra **Settings → Pages** e escolha **GitHub Actions** como fonte. Também é possível iniciar o workflow manualmente em **Actions → Deploy to GitHub Pages**.

## Limitações

Este é um modelo conceitual baseado visualmente na primeira folha arquitetônica do PDF. Ele não substitui levantamento, projeto executivo ou validação estrutural. A remoção de paredes é apenas uma simulação visual.
