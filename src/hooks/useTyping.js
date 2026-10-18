import { useEffect, useState } from 'react';

// Efek mengetik ala terminal: ketik → tahan → hapus → kata berikutnya
export default function useTyping(words, { typeSpeed = 70, deleteSpeed = 35, hold = 1600, startDelay = 1400 } = {}) {
  const [text, setText] = useState('');

  useEffect(() => {
    let wi = 0;
    let ci = 0;
    let deleting = false;
    let timer;

    const tick = () => {
      const chars = Array.from(words[wi]); // aman untuk emoji
      if (!deleting) {
        ci++;
        setText(chars.slice(0, ci).join(''));
        if (ci >= chars.length) {
          deleting = true;
          timer = setTimeout(tick, hold);
          return;
        }
        timer = setTimeout(tick, typeSpeed + Math.random() * 60);
      } else {
        ci--;
        setText(chars.slice(0, ci).join(''));
        if (ci <= 0) {
          deleting = false;
          wi = (wi + 1) % words.length;
          timer = setTimeout(tick, 350);
          return;
        }
        timer = setTimeout(tick, deleteSpeed);
      }
    };

    timer = setTimeout(tick, startDelay);
    return () => clearTimeout(timer);
  }, [words, typeSpeed, deleteSpeed, hold, startDelay]);

  return text;
}
