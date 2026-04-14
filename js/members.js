// js/members.js — EchoDome
// ═══════════════════════════════════════════════════════════════
//  DADOS DOS MEMBROS DA BANDA
//  Edite este arquivo para atualizar informações dos membros.
//
//  Campos de cada membro:
//  ┌─────────────────┬────────────────────────────────────────────────────────┐
//  │ id              │ Identificador interno. Use o mesmo que o tema do       │
//  │                 │ personagem: 'trace' | 'od' | 'dusk' | 'ember' | 'lyra'│
//  │ name            │ Nome exibido no card e no painel                       │
//  │ role            │ Função na banda (ex: "Vocalista", "Guitarrista")       │
//  │ instrument      │ Instrumento(s) principal(is), exibido no badge         │
//  │ photo           │ Caminho da imagem (ex: 'assets/membros/trace.jpg')     │
//  │                 │ Use null para mostrar o emoji no lugar da foto         │
//  │ photoEmoji      │ Emoji usado quando photo é null                        │
//  │ lore            │ Texto de história/biografia. Pode usar múltiplos       │
//  │                 │ parágrafos — separe com uma linha em branco             │
//  │ facts           │ Lista de curiosidades. Cada item é uma string.         │
//  │                 │ Adicione ou remova itens à vontade.                    │
//  └─────────────────┴────────────────────────────────────────────────────────┘
// ═══════════════════════════════════════════════════════════════

const BAND_MEMBERS = [

  // ── TRACE ─────────────────────────────────────────────────────
  {
    id:          'trace',
    name:        'Trace',
    role:        'Vocalista',
    instrument:  'Voz',
    photo:       null,           // ex: 'assets/membros/trace.jpg'
    photoEmoji:  '🎤',

    lore: `Trace é a voz e o rosto da banda. Cresceu ouvindo punk e new wave em fitas cassete velhas que encontrava em sebos, e aprendeu a cantar sozinho — por necessidade, não por escolha.

Antes do EchoDome, passou anos tocando em bares vazios com bandas que se desfaziam antes de gravar qualquer coisa. Quando a banda se formou, finalmente encontrou o som que sempre quis fazer: urgente, honesto, sem filtro.

Escreve todas as letras à mão antes de passá-las para o papel digital. Diz que o erro de digitação faz parte da música.`,

    facts: [
      'Nunca fez aula de canto — tudo foi aprendido na prática.',
      'Coleciona fitas cassete de bandas que nunca existiram (compra sem ouvir).',
      'O nome "Trace" vem de um apelido da infância que nunca explicou direito.',
      'Todas as letras do primeiro álbum foram escritas em uma única semana sem dormir.',
    ],
  },

  // ── OD ────────────────────────────────────────────────────────
  {
    id:          'od',
    name:        'OD',
    role:        'Guitarrista',
    instrument:  'Guitarra Elétrica',
    photo:       null,           // ex: 'assets/membros/od.jpg'
    photoEmoji:  '🎸',

    lore: `OD é o tipo de guitarrista que você ouve antes de ver. Seus riffs chegam antes de qualquer apresentação — graves, distorcidos, e com aquela urgência que faz as pessoas pararem o que estão fazendo.

Começou a tocar guitarra aos 11 anos numa guitarra quebrada com duas cordas a menos. Dizia que assim aprendia "o essencial". Essa lógica permanece: cada solo tem exatamente o que precisa, sem uma nota a mais.

É o mais técnico da banda mas o que menos gosta de falar sobre teoria musical. Prefere mostrar.`,

    facts: [
      'Possui mais de 20 guitarras mas toca ao vivo sempre com a mesma — uma Jazzmaster surrada de 1994.',
      'Nunca usa a mesma afinação duas vezes no estúdio.',
      'O apelido "OD" é referência ao overdrive, o efeito que nunca desliga.',
      'Já quebrou 3 headstocks em shows e sempre repara com fita crepe colorida.',
    ],
  },

  // ── DUSK ──────────────────────────────────────────────────────
  {
    id:          'dusk',
    name:        'Dusk',
    role:        'Baixista',
    instrument:  'Baixo Elétrico',
    photo:       null,           // ex: 'assets/membros/dusk.jpg'
    photoEmoji:  '🎵',

    lore: `Dusk é a fundação da banda — literalmente. O baixo de Dusk não apenas segura o ritmo, ele conta a segunda história da música: a que você sente antes de entender.

Começou como guitarrista mas foi convencido a migrar para o baixo quando percebeu que era aquele instrumento que sempre ouvia primeiro nas músicas que amava. "Você não pensa no baixo, você sente", disse uma vez numa entrevista.

Tem uma abordagem minimalista, mas cada nota escolhida é cirúrgica. Nada é acidente.`,

    facts: [
      'Leva horas escolhendo a nota de abertura de cada música.',
      'Já recusou convites de outras bandas maiores três vezes — sem arrependimento.',
      'Tem um ritual pré-show: 20 minutos em silêncio total, sem celular.',
      'O nome "Dusk" vem do horário favorito para escrever: o anoitecer.',
    ],
  },

  // ── EMBER ─────────────────────────────────────────────────────
  {
    id:          'ember',
    name:        'Ember',
    role:        'Baterista',
    instrument:  'Bateria Acústica',
    photo:       null,           // ex: 'assets/membros/ember.jpg'
    photoEmoji:  '🥁',

    lore: `Ember toca como se cada show pudesse ser o último. Há uma intensidade física nos seus grooves que é difícil de ignorar — não é violência, é presença.

Começou tocando em bandas de hardcore mas foi migrando para sonoridades mais abertas conforme a banda evoluía. O EchoDome foi o primeiro projeto onde sentiu que podia respirar entre as batidas.

A bateria de Ember nunca está apenas marcando o tempo. Está conversando.`,

    facts: [
      'Pratica pelo menos 2 horas por dia, mesmo em dia de show.',
      'Usa baquetas artesanais feitas por um luthier local.',
      'O nome "Ember" (brasa) é autoexplicativo para quem já assistiu a um show ao vivo.',
      'Tem pavor de palcos muito silenciosos — diz que o silêncio antes do primeiro acorde é o momento mais tenso da vida.',
    ],
  },

  // ── LYRA ──────────────────────────────────────────────────────
  {
    id:          'lyra',
    name:        'Lyra',
    role:        'Tecladista',
    instrument:  'Teclados & Sintetizadores',
    photo:       null,           // ex: 'assets/membros/lyra.jpg'
    photoEmoji:  '🎹',

    lore: `Lyra é a camada que você não percebe que está sentindo falta até que ela some. Os teclados e synths do EchoDome criam a atmosfera que envolve tudo — às vezes quase imperceptíveis, às vezes o centro de tudo.

Estudou música clássica por 8 anos antes de descobrir que o que amava mesmo era o estranho, o eletrônico, o que não seguia regras. A síntese entre esses dois mundos é o que define o som dela.

Coleciona sintetizadores vintage com a mesma seriedade de quem coleciona arte.`,

    facts: [
      'Possui um sintetizador de 1978 que ainda usa em estúdio — "tem alma", justifica.',
      'Compõe camadas de teclado que muitas vezes nunca aparecem na versão final — "elas sustentam as que aparecem".',
      'O nome "Lyra" é uma referência à constelação, não ao instrumento.',
      'É a única da banda que lê partituras — mas raramente as escreve.',
    ],
  },

];
