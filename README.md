# howler-plugin-effect-chain

Adds an audio effect chain to [Howler](https://github.com/goldfire/howler.js). Suitable as bridge between Howler and web audio libraries such as [Tuna](https://github.com/Theodeus/tuna).

It works by injecting a chain of nodes between `Sound`s and the `Howler.masterGain`:

```
Sound._node -> Howler._effectChain -> [Added effects] -> Howler._effectChainOut -> Howler.masterGain
```

## Installation

### Via npm

First, install it.

```js
npm i -S howler-plugin-effect-chain
```

Now import it.

```js
// ES6 imports
import { Howler, Howl } from 'howler'
import 'howler-plugin-effect-chain'

// CommonJS imports
var howler = require('howler')
require('howler-plugin-effect-chain')
```

### Via script tag

Save [`src/index.js`](https://github.com/alexanderwallin/howler-plugin-effect-chain/blob/master/src/index.js) as `howler-plugin-effect-chain.js` (or whatever you want to call it) and add a `<script>` tag after the core Howler library.

```html
<script src="howler.min.js"></script>
<script src="howler-plugin-effect-chain.js"></script>
```

## API

### `Howler.addEffect(effect)`

Adds an effect to the effect chain. The effect object must function like an [`AudioNode`](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode), exposing a `connect` and `disconnect` method.

Here's an example using the Tuna library.

```js
import { Howler } from 'howler'
import Tuna from 'tunajs'

const tuna = new Tuna(Howler.ctx)
const chorus = new tuna.Chorus({})

Howler.addEffect(chorus)
```

### `Howler.removeEffect(effect)`

Removes an effect from the effect chain. The passed effect object must have been previously added using `Howler.addEffect(effect)`.

Here's an example removing the chorus from the previous example.

```js
Howler.removeEffect(chorus)
```
