# Claude


## MUST DO
- ALWAYS use this syntax when using animejs:
```js
import { animate } from 'animejs';

animate('.square', {
  translateX: ['0rem', 0, 17, 17, 0, 0],
  translateY: ['0rem', -2.5, -2.5, 2.5, 2.5, 0],
  scale: [1, 1, .5, .5, 1, 1],
  rotate: { to: 360, ease: 'linear' },
  duration: 3000,
  ease: 'inOut', // ease applied between each keyframes if no ease defined
  playbackEase: 'ouIn(5)', // ease applied accross all keyframes
  loop: true,
});
```
- Any Localstorage MUST use the package `import { openDB, deleteDB, wrap, unwrap } from 'idb';`. WebFetch: `https://github.com/jakearchibald/idb#readme`.
- For numbers always use mono font-mono
- for text use sans-serif --font-sans
- for titles use --font-display
