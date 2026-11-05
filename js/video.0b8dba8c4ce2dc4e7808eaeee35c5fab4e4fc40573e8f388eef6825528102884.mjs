// The demo video: nothing is requested from YouTube until the visitor presses play (or a chapter).
// Then a privacy-enhanced player (youtube-nocookie.com) replaces the button. Without JavaScript the links go to YouTube.
const ID = /^[A-Za-z0-9_-]{11}$/;

export function embedUrl(id, start = 0) {
  if (!ID.test(id)) throw new Error('Not a YouTube video id');
  const seconds = Math.max(0, Math.floor(Number(start) || 0));
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&start=${seconds}`;
}

export function play(box, start = 0, doc = document) {
  const frame = doc.createElement('iframe');
  frame.src = embedUrl(box.dataset.videoId, start);
  frame.title = box.dataset.videoTitle || 'Video';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.className = 'video-frame';
  box.replaceChildren(frame);
  box.classList.add('playing');
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', event => {
    const button = event.target?.closest?.('button.video-play');
    const chapter = event.target?.closest?.('a[data-start]');
    const box = button ? button.closest('.video') : chapter ? document.querySelector('.video') : null;
    if (!box) return;
    event.preventDefault();
    play(box, chapter ? chapter.dataset.start : 0);
    box.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  });
}
