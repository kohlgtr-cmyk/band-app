// js/modules/share.js
// Web Share API integration - Lazy loaded module

export async function shareSong(song, bandName) {
  if (!song) return;

  const shareData = {
    title: `${song.title} - ${bandName}`,
    text: `Ouça "${song.title}" no app EchoDome`,
    url: window.location.href
  };

  // Check if Web Share API is available
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      console.log('[Share] Shared successfully');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[Share] Error:', err);
        fallbackShare(shareData);
      }
    }
  } else {
    fallbackShare(shareData);
  }
}

function fallbackShare(shareData) {
  // Copy to clipboard as fallback
  const textToCopy = `${shareData.title}\n${shareData.text}\n${shareData.url}`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Link copiado para a área de transferência!');
    }).catch(() => {
      console.log('[Share] Clipboard failed');
    });
  } else {
    // Final fallback: open native share dialog on mobile
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|ipod|android/.test(ua);

    if (isMobile) {
      const sms = `sms:?body=${encodeURIComponent(textToCopy)}`;
      window.location.href = sms;
    }
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

// Export playlist
export function exportPlaylist(playlistName, songs) {
  const playlist = {
    name: playlistName,
    created: new Date().toISOString(),
    songs: songs.map(s => ({
      id: s.id,
      title: s.title,
      album: s.albumId
    }))
  };

  const blob = new Blob([JSON.stringify(playlist, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${playlistName}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
