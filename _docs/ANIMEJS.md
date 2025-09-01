# AnimeJS version 4.0


## Dragging and Snapping

```js
import { createDraggable } from 'animejs';

createDraggable('.square', {
  container: '.grid',
  snap: 56, // Global to both x and y
  x: { snap: [0, 200] }, // Specific to x
});
```
```html
<div class="large grid square-grid">
  <div class="square draggable"></div>
</div>
```

```css
#draggable-draggable-axes-parameters-snap .demo {
  width: 300px;
}

#draggable-draggable-axes-parameters-snap .grid::after {
  background-size: 100px 56px;
}

#draggable-draggable-axes-parameters-snap .grid::before {
  content: "";
  display: block;
  position: absolute;
  top: 1px;
  left: 100px;
  width: 100px;
  height: calc(100% - 1px);
  background-image: repeating-linear-gradient(
    45deg,
    currentColor 0,
    currentColor 1px,
    transparent 1px,
    transparent 6px
  );
  background-size: 8px 8px;
}

#draggable-draggable-axes-parameters-snap .square {
  width: 100px;
  height: 56px;
}

```

