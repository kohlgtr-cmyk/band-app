# Como integrar o Character Theme Picker — EchoDome

## 1. Adicionar os arquivos

Coloque os arquivos nas pastas do projeto:
- `character-theme.js`  →  `js/modules/character-theme.js`
- `character-theme.css` →  `css/character-theme.css`

---

## 2. Importar o CSS no index.html

Adicione antes do `style.css`:

```html
<link rel="stylesheet" href="css/character-theme.css" />
<link rel="stylesheet" href="css/style.css?v=52" />
```

---

## 3. Montar o picker na topbar — app.js

No seu `app.js`, importe o módulo e chame `mountCharacterPicker` na inicialização:

```js
import { mountCharacterPicker, onThemeChange } from './modules/character-theme.js';

// Dentro da função de init do app:
const topbar = document.querySelector('.topbar');
mountCharacterPicker(topbar);

// Opcional: reagir à mudança de tema (ex: mudar cor do visualizer)
onThemeChange((char) => {
  console.log('[Theme] Personagem ativo:', char.name, char.accent);
  // Ex: atualizar cor do canvas do visualizer
  // updateVisualizerColor(char.accent);
});
```

---

## 4. Remover `--gold` fixo do :root no style.css

As variáveis `--gold`, `--gold2`, `--gold-dim` e `--border` agora são controladas dinamicamente.
Você pode manter os valores padrão no `:root` como fallback:

```css
:root {
  --gold:      #e8e8ff;   /* padrão: Trace (branco neon) */
  --gold2:     #c8c8ff;
  --gold-dim:  rgba(232,232,255,0.15);
  --border:    rgba(232,232,255,0.2);
  /* ... resto das variáveis inalterado ... */
}
```

---

## 5. Integrar com o visualizador (opcional)

No `visualizer.js`, ouça as mudanças de tema para atualizar a cor das barras:

```js
import { onThemeChange } from './character-theme.js';

onThemeChange((char) => {
  // atualiza a cor de stroke do canvas
  vizAccentColor = char.accent;
});
```

---

## Personagens e cores

| ID      | Nome  | Papel       | Cor neon        |
|---------|-------|-------------|-----------------|
| trace   | Trace | Vocalista   | #e8e8ff (branco)|
| od      | OD    | Guitarrista | #39ff14 (verde) |
| dusk    | Dusk  | Baixista    | #ff4d2e (vermelho)|
| ember   | Ember | Baterista   | #ffe44d (amarelo)|
| lyra    | Lyra  | Tecladista  | #00b4ff (azul)  |

A preferência é salva no `localStorage` com a chave `echodome_character`.
