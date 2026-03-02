// =====================================================
// EDITE AQUI: coloque suas músicas e álbuns
// =====================================================

const BAND_NAME = "EchoDome Band"; // ← troque pelo nome da sua banda

const albums = [
  {
    id: "album1",
    name: "Echo",
    year: 2026,
    cover: "assets/img/full-band-logo.jpg", // ← coloque a capa (ou deixe null para emoji)
    coverEmoji: "🎸",               // ← emoji de fallback se não tiver capa
  },

];

const songs = [
  {
    id: 1,
    title: "Love Story",
    albumId: "album1",
    track: 1,
    file: "assets/music/love-story.mp3", // ← caminho do seu MP3
    duration: "4:05",
    lyrics: `Aqui vai a letra da música
Verso por verso
Cada linha numa linha nova

Refrão aqui
Refrão aqui

Segunda estrofe
Continue assim...`
  },
  {
    id: 2,
    title: "Between The Lines",
    albumId: "album1",
    track: 2,
    file: "assets/music/between-the-lines.mp3",
    duration: "4:30",
    lyrics: null // ← null se não tiver letra
  },
  {
    id: 3,
    title: "Eu Não Queria Sentir Assim",
    albumId: "album1",
    track: 3,
    file: "assets/music/eu-nao-queria-sentir-assim.mp3",
    duration: "4:15",
    lyrics: `Letra da terceira música aqui...`
  },
  {
    id: 4,
    title: "Echoes Of Yesterday",
    albumId: "album1",
    track: 4,
    file: "assets/music/echos.mp3",
    duration: "4:22",
    lyrics: null,
  },

  {
    id: 5,
    title: "I Feel Stuck",
    albumId: "album1",
    track: 5,
    file: "assets/music/i-feel-stuck.mp3",
    duration: "4:20",
    lyrics: null,
  },
];