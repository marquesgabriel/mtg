# Arquitetura e documentação técnica — MTG Token Generator

Este documento descreve como o projeto está organizado e como suas partes se
conectam, para servir de base para futuras melhorias e novas funcionalidades.

## Visão geral

`token-generator` é uma SPA (single-page application) client-side, sem
backend, feita com **Create React App + TypeScript**. O usuário preenche um
formulário e vê, em tempo real, uma prévia de um token de Magic: The
Gathering renderizada em HTML/CSS. Ao final, a carta pode ser exportada como
imagem (PNG, JPEG ou SVG) diretamente no navegador.

Deploy: publicado via `gh-pages` (script `npm run deploy`) em
`mtg.marquesgabriel.com.br` (ver `public/CNAME` e `homepage` no
`package.json`).

## Stack

| Camada              | Tecnologia |
|---------------------|------------|
| Framework           | React 18 + TypeScript, bootstrap via `react-scripts` (CRA) |
| Formulário/validação| Formik + Yup |
| UI Kit              | Material UI (MUI) + Bootstrap (grid/layout) |
| Estilos             | Sass (SCSS), um arquivo por cor de carta |
| Crop de imagem      | `react-easy-crop` |
| Exportação de imagem| `dom-to-image` |
| Ícones de mana       | `mana-font` |
| Datas               | `moment` (usado só para o ano do rodapé) |
| Deploy estático      | `gh-pages` |

Não há backend, API, banco de dados ou autenticação — todo o estado vive no
componente `App` (React state + Formik) e a "persistência" é o download do
arquivo de imagem gerado.

## Estrutura de pastas

```
src/
  App.tsx              → componente raiz: formulário completo + orquestração de estado
  App.scss             → layout geral da página
  Card/
    index.tsx           → componente TokenCard: renderiza a prévia da carta
    index.scss           → estilos estruturais da carta (moldura, campos)
    card-colors/*.scss   → um arquivo por cor/combinação de cor (white, black,
                            azorius, boros, ... multicolor) definindo a paleta
                            visual daquela cor
  DownloadAsButton.tsx  → botão "split button" (MUI) para escolher o formato
                            de exportação (svg/png/jpeg) e disparar o download
  Descriptiontooltip.tsx→ tooltip explicando a sintaxe {simbolo} da descrição
  utils/cropper.ts      → funções puras de canvas: cria <img>, calcula bounding
                            box rotacionado e recorta a imagem em um <canvas>,
                            devolvendo um blob URL
  styles/
    _colors.scss         → variáveis de cor compartilhadas
    _fonts.scss           → definições de fontes
    _textures.scss        → mapeia cada `cardTexture` (texture1..9) para uma
                            imagem de fundo em src/assets/imgs
  assets/imgs/           → texturas de fundo e efeitos (golden-eff, t7-b/t7-w)
  index.tsx              → bootstrap do React (ReactDOM.render)
```

## Fluxo de dados (App.tsx)

1. **Formulário (Formik + Yup)** guarda todos os campos da carta:
   `name`, `superType`, `type`, `subType`, `description`, `artist`, `power`,
   `toughness`, `image`, `cardBorder`, `cardTexture`, `cardColor`,
   `cardImageSize`. A validação (`yup.object`) exige nome, tipo, imagem,
   borda, textura e cor.
2. **Upload de imagem**: `handlePickedImage` cria uma URL local
   (`URL.createObjectURL`) a partir do arquivo escolhido e a usa como fonte
   para o `Cropper` (`react-easy-crop`).
3. **Crop**: o usuário ajusta zoom/posição; `onCropComplete` guarda a área
   recortada em pixels. Ao clicar em "Confirm image crop", `cropMyImage`
   chama `getCroppedImg` (`utils/cropper.ts`), que desenha a imagem em um
   `<canvas>`, aplica o recorte e devolve um blob URL armazenado em
   `croppedImage`.
4. **Descrição com símbolos de mana**: `parseDescription` roda regexes sobre
   o texto digitado, substituindo padrões como `{u}`, `{tap}`, `{5}` por
   `<i class="ms ms-...">` (ícones da lib `mana-font`). O HTML resultante é
   guardado em `description` e injetado via `dangerouslySetInnerHTML` dentro
   de `TokenCard`.
5. **Renderização**: todo o estado (`formik`, `image`, `croppedImage`,
   `crop`, `zoom`, `description`) é passado para `TokenCard`
   (`src/Card/index.tsx`), que monta a estrutura visual da carta:
   imagem/cropper, textura de fundo, nome, tipo/subtipo, descrição,
   poder/resistência e rodapé (artista + ano).
6. **Exportação**: `downloadAs(ext)` localiza o nó DOM `#card-element`
   (o wrapper renderizado por `TokenCard`) e usa `dom-to-image` para
   convertê-lo em `svg`, `jpeg` ou `png`, disparando o download via um link
   `<a download>` temporário. A escolha do formato é feita pelo componente
   `DownloadAsButton`.

O `formik.onSubmit` atual apenas dá um `alert` com o JSON dos valores — não
há submissão real a um backend (não existe backend).

## Sistema visual da carta (Card)

- **Borda** (`cardBorder`): `white` ou `black` (silver e golden existem na UI
  mas estão desabilitados no `Select`).
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
| `npm start` | Sobe o servidor de desenvolvimento (CRA) |
| `npm run build` | Build de produção em `build/` |
| `npm test` | Executa os testes (Jest/Testing Library via CRA) |
| `npm run deploy` | Faz `predeploy` (build) e publica `build/` no GitHub Pages via `gh-pages` |
| `npm run eject` | Ejeta a configuração do CRA (irreversível) |

## Limitações / pontos conhecidos

- Não há testes cobrindo a lógica real do app (`utils/cropper.ts`,
  `parseDescription`, exportação) — apenas o setup padrão do CRA.
- `description` é injetada via `dangerouslySetInnerHTML` a partir de regex
  simples sobre input do usuário; hoje o conteúdo é local (não enviado a
  nenhum servidor), mas é um ponto a considerar em qualquer evolução que
  envolva compartilhamento/backend.
- As opções "Silver" e "Golden" de borda já existem na interface mas estão
  desabilitadas — indicando funcionalidade planejada e não implementada.
- Não há persistência (localStorage, backend, etc.): recarregar a página
  perde todos os dados preenchidos.
- `formik.onSubmit` não faz nada além de um `alert` de debug.
