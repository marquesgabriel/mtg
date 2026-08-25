# Arquitetura e documentação técnica — MTG Token Generator

Este documento descreve como o projeto está organizado e como suas partes se
conectam, para servir de base para futuras melhorias e novas funcionalidades.

## Visão geral

`token-generator` é uma SPA (single-page application) client-side, sem
backend, feita com **React + TypeScript + Vite** (migrada de Create React
App em #20). O usuário preenche um formulário e vê, em tempo real, uma
prévia de um token de Magic: The Gathering renderizada em HTML/CSS. Ao final,
a carta pode ser exportada como imagem (PNG, JPEG ou SVG) diretamente no
navegador.

Deploy: publicado via `gh-pages` (script `yarn deploy`, automatizado em
`.github/workflows/deploy.yml` a cada push em `main`) em
`mtg.marquesgabriel.com.br` (ver `public/CNAME` e `homepage` no
`package.json`).

## Stack

| Camada              | Tecnologia |
|---------------------|------------|
| Framework           | React 18 + TypeScript, bundlado com Vite (`@vitejs/plugin-react`) |
| Formulário/validação| Formik + Yup |
| UI Kit              | Material UI (MUI) + Bootstrap (grid/layout) |
| Estilos             | Sass (SCSS) — cores de carta (`Card/card-colors`) + temas visuais do app shell (`styles/_win98.scss` e afins) |
| Crop de imagem      | `react-easy-crop` |
| Exportação de imagem| `dom-to-image` |
| Ícones de mana       | `mana-font` |
| Datas               | `moment` (usado só para o ano do rodapé) |
| Testes              | Vitest/Testing Library |
| Deploy estático      | `gh-pages` |
| Monetização          | AdSense com consentimento de cookies (`SupportSidebar.tsx`) — mesma conta usada em marquesgabriel.github.io |

Não há backend, API, banco de dados ou autenticação — todo o estado vive no
componente `App` (React state + Formik). O rascunho do formulário e o
consentimento de cookies são persistidos em `localStorage`; a galeria de
tokens salvos (`utils/gallery.ts`) usa IndexedDB (`utils/idbGallery.ts`)
desde #80, já que cada entrada carrega uma imagem em base64 e ultrapassa
facilmente a quota de `localStorage` com poucos tokens salvos (ver Fluxo de
dados abaixo).

## Estrutura de pastas

```
src/
  App.tsx                → componente raiz: orquestra estado/efeitos (formik, crop,
                            draft persistence) e compõe as seções abaixo
  App.scss               → layout geral da página
  Container.tsx           → wrapper visual reutilizável (janela com título/botões,
                            usado por todas as seções do form + preview + support)
  CardStyleSection.tsx    → seção "Card border and color" (borda/cor/textura)
  ImageUploadSection.tsx  → seção de upload + crop de imagem
  CardDataSection.tsx     → seção "Card data" (nome, tipo, mana cost, descrição,
                            power/toughness, artista, botões download/reset)
  SupportSidebar.tsx/.scss→ doação (Buy Me a Coffee) + slot de anúncio AdSense
                            com gate de consentimento de cookies
  Card/
    index.tsx             → componente TokenCard: renderiza a prévia da carta
    index.scss            → estilos estruturais da carta (moldura, campos)
    card-colors/*.scss     → um arquivo por cor/combinação de cor (white, black,
                             azorius, boros, ... multicolor) definindo a paleta
                             visual daquela cor
  DownloadAsButton.tsx   → botão "split button" (MUI) para escolher o formato
                            de exportação (svg/png/jpeg) e disparar o download
  Descriptiontooltip.tsx → tooltip explicando a sintaxe {simbolo} da descrição
  utils/
    cropper.ts             → funções puras de canvas: cria <img>, calcula bounding
                             box rotacionado e recorta a imagem em um <canvas>,
                             devolvendo um blob URL
    manaSymbols.ts          → substitui padrões `{simbolo}` por `<i class="ms ...">`
  styles/
    _colors.scss            → variáveis de cor compartilhadas
    _fonts.scss              → definições de fontes
    _textures.scss           → mapeia cada `cardTexture` (texture1..9) para uma
                             imagem de fundo em src/assets/imgs
    _win98.scss               → tema visual "Windows 98" do app shell (formulário,
                             botões, inputs) — não toca no visual da carta em si
  assets/imgs/             → texturas de fundo e efeitos (golden-eff, t7-b/t7-w)
  index.tsx                → bootstrap do React + expõe window.APP_VERSION
  reportWebVitals.ts        → hook opcional de métricas (não wired a nenhum backend)
```

## Fluxo de dados (App.tsx)

1. **Formulário (Formik + Yup)** guarda todos os campos da carta:
   `name`, `superType`, `type`, `subType`, `description`, `artist`, `manaCost`,
   `power`, `toughness`, `image`, `cardBorder`, `cardTexture`, `cardColor`,
   `cardImageSize`. A validação (`yup.object`) exige nome, tipo, imagem,
   borda, textura e cor.
2. **Persistência do rascunho**: os campos de texto/seleção (não a
   imagem/crop, que é um blob URL e não sobrevive a reload) são salvos em
   `localStorage` com debounce de 400ms (`loadDraft`/`saveDraft`) e
   restaurados como `initialValues` do Formik ao carregar a página.
3. **Upload de imagem**: `handlePickedImage` cria uma URL local
   (`URL.createObjectURL`) a partir do arquivo escolhido e a usa como fonte
   para o `Cropper` (`react-easy-crop`).
4. **Crop**: o usuário ajusta zoom/posição; `onCropComplete` guarda a área
   recortada em pixels. Ao clicar em "Confirm image crop", `cropMyImage`
   chama `getCroppedImg` (`utils/cropper.ts`), que desenha a imagem em um
   `<canvas>`, aplica o recorte e devolve um blob URL armazenado em
   `croppedImage`.
5. **Descrição com símbolos de mana**: `parseDescription` (via
   `utils/manaSymbols.ts`) roda regexes sobre o texto digitado,
   substituindo padrões como `{u}`, `{tap}`, `{5}` por
   `<i class="ms ms-...">` (ícones da lib `mana-font`). O HTML resultante é
   guardado em `description` e injetado via `dangerouslySetInnerHTML` dentro
   de `TokenCard`.
6. **Renderização**: todo o estado (`formik`, `image`, `croppedImage`,
   `crop`, `zoom`, `description`) é passado para `TokenCard`
   (`src/Card/index.tsx`), que monta a estrutura visual da carta:
   imagem/cropper, textura de fundo, nome, tipo/subtipo, descrição,
   poder/resistência e rodapé (artista + ano).
7. **Exportação**: `downloadAs(ext)` localiza o nó DOM `#card-element`
   (o wrapper renderizado por `TokenCard`) e usa `dom-to-image` para
   convertê-lo em `svg`, `jpeg` ou `png`, disparando o download via um link
   `<a download>` temporário. A escolha do formato é feita pelo componente
   `DownloadAsButton`.

O `formik.onSubmit` é um no-op intencional (a exportação real acontece via
`DownloadAsButton`/`downloadAs`, não via submit do form) — existe só para que
`formik.handleSubmit` faça `preventDefault` num Enter dentro de um campo de
texto, evitando reload de página.

## Sistema visual da carta (Card)

- **Borda** (`cardBorder`): `white`, `black`, `silver` ou `golden`.
- **Cor** (`cardColor`): mono-cores (`white`, `black`, `green`, `blue`,
  `red`), pares de guilda (`azorius`, `boros`, `dimir`, `gruul`, `izzet`,
  `orzhov`, `rakdos`, `selesnya`, `simic`), `colorless` e `multicolor`. Cada
  uma tem seu próprio arquivo em `src/Card/card-colors/*.scss`.
- **Textura** (`cardTexture`): `texture1`..`texture9`, mapeadas em
  `src/styles/_textures.scss` para imagens em `src/assets/imgs`.
- **Tamanho de arte** (`cardImageSize`): `full-art` (imagem ocupa a carta
  inteira) ou `classic` (janela de arte menor, como cartas tradicionais);
  isso também muda o aspect ratio passado ao `Cropper` (63.5/85.5 vs
  54/43.5).

## Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `yarn start` | Sobe o servidor de desenvolvimento (Vite) |
| `yarn build` | `tsc --noEmit` (type-check — Vite/esbuild não checa tipos) + build de produção (Vite) em `build/` |
| `yarn test` | Executa os testes em modo watch (Vitest/Testing Library) |
| `yarn test:ci` | Executa os testes uma vez, não-interativo (usado no CI) |
| `yarn lint` | ESLint sobre `src` |
| `yarn format` | Prettier sobre `src/**/*.{ts,tsx,scss}` e os arquivos de config na raiz |
| `yarn deploy` | Faz `predeploy` (build) e publica `build/` no GitHub Pages via `gh-pages` |

## Limitações / pontos conhecidos

- Migração de CRA para Vite (#20) concluída — ver `vite.config.ts`.
  `envPrefix` mantém o prefixo `REACT_APP_` das env vars (pedido explícito
  da issue, não `VITE_`); `build.outDir: 'build'` preserva `yarn deploy`
  sem precisar mexer em `deploy.yml`. Testes migraram para Vitest junto
  (obrigatório: `import.meta.env`, usado pelas env vars agora, não é
  sintaxe que o Jest do CRA consegue processar). Do débito
  `project-scaffold` cross-project (#47): ESLint flat config
  (`eslint.config.js`, via `FlatCompat` sobre `eslint-config-react-app`),
  Prettier no CI (`yarn format:check` em `ci.yml`) e um hook de pre-commit
  (husky + lint-staged, roda ESLint `--fix` e Prettier nos arquivos
  staged) já foram feitos; o `eslintConfig` legado no `package.json` foi
  removido junto com a migração para Vite, já que só existia para o lint
  interno do `react-scripts` (que não reconhecia flat config). Restante
  do #47, agora desbloqueado pela migração: reestruturar `src/` em
  `types`/`components` com barrel exports.
- `description` é injetada via `dangerouslySetInnerHTML` a partir de regex
  simples sobre input do usuário; hoje o conteúdo é local (não enviado a
  nenhum servidor), mas é um ponto a considerar em qualquer evolução que
  envolva compartilhamento/backend.
- Salvar/carregar token como JSON (#6) está temporariamente desativado na
  UI enquanto uma distorção na exportação da carta é investigada — o
  formato/utilitários (`utils/tokenFields.ts`, `utils/tokenFile.ts`)
  continuam no código, já que a galeria (#7) depende deles também.
