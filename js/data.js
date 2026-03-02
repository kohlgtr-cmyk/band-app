// =====================================================
// EDITE AQUI: coloque suas músicas e álbuns
// =====================================================

const BAND_NAME = "Minha Banda"; // ← troque pelo nome da sua banda

const albums = [
  {
    id: "album1",
    name: "Primeiro Álbum",
    year: 2023,
    cover: "assets/img/album1.jpg", // ← coloque a capa (ou deixe null para emoji)
    coverEmoji: "🎸",               // ← emoji de fallback se não tiver capa
  },
  {
    id: "album2",
    name: "Segundo Álbum",
    year: 2024,
    cover: null,
    coverEmoji: "🔥",
  }
];

const songs = [
  {
    id: 1,
    title: "Nome da Música 1",
    albumId: "album1",
    track: 1,
    file: "assets/music/musica1.mp3", // ← caminho do seu MP3
    duration: "3:45",
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
    title: "Nome da Música 2",
    albumId: "album1",
    track: 2,
    file: "assets/music/musica2.mp3",
    duration: "4:10",
    lyrics: null // ← null se não tiver letra
  },
  {
    id: 3,
    title: "Nome da Música 3",
    albumId: "album2",
    track: 1,
    file: "assets/music/musica3.mp3",
    duration: "3:22",
    lyrics: `Letra da terceira música aqui...`
  }
];