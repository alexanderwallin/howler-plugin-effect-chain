(function() {

// ---------- Core extensions ----------- //


/**
 * Sets up the effects chain intermediary.
 *
 * _setup() is called form within the private method setupAudioContext(),
 * which itself is only called once, plus once after every HowlerGlobal.unload().
 */
HowlerGlobal.prototype._setup = (function(_super) {
  return function(o) {
    var self = this || Howler;

    self.effectChain = {
      debug: false
    };

    // List of effects
    self._effects = [];

    // Input and output nodes
    self._effectChain = createGain();
    self._effectChainOut = createGain();

    // Connect nodes to master gain
    if (self.masterGain) {
      self._effectChain.connect(self._effectChainOut);
      self._effectChainOut.connect(self.masterGain);
    }

    return _super.call(self, o);
  }
})(HowlerGlobal.prototype._setup);

/**
 * Warns about unload() invalidating all added effects.
 */
HowlerGlobal.prototype.unload = (function(_super) {
  return function() {
    var self = this || Howler;

    if (self.effectChain.debug) {
      console.warn('[Howler Effects Chain] Calling Howler.unload() creates a '
        + 'new audio context, which will invalidate the effects you have created '
        + 'with the old context.');
    }

    return _super.call(self);
  }
})(HowlerGlobal.prototype.unload);

/**
 * Rewires a created sound from being connected directly to
 * Howler.masterGain to being connect to the effect chain's
 * input node.
 */
Sound.prototype.create = (function(_super) {
  return function() {
    var self = _super.call(this);

    if (self._parent._webAudio && Howler._effectChain) {
      self._node.disconnect(Howler.masterGain);
      self._node.connect(Howler._effectChain);
    }

    return self;
  }
})(Sound.prototype.create)


// ---------- Effect chain methods ----------- //


/**
 * Adds an effect to the effects chain
 *
 * @param  {AudioNode} An effect node
 * @return {Howler}    Self
 */
HowlerGlobal.prototype.addEffect = function(node) {
  var self = this || Howler;

  var lastEffect = self._effects[self._effects.length - 1];
  if (lastEffect) {
    lastEffect.disconnect();
    lastEffect.connect(node);
  }
  else {
    self._effectChain.disconnect();
    self._effectChain.connect(node);
  }

  node.connect(self._effectChainOut);
  self._effects.push(node);

  return self;
}

/**
 * Removes an effect from the effects chain.
 *
 * @param  {AudioNode} A previously added effect
 * @return {Howler}    Self
 */
HowlerGlobal.prototype.removeEffect = function(node) {
  var self = this || Howler;

  var effectIndex = self._effects.indexOf(node);

  // If the effect doesn't exist, print a warning and exit early
  if (effectIndex === -1) {
    console.warn(
      '[Howler effects chain] Cannot remove the effect as ' +
      'it is not added to the chain:', node);
    return self;
  }

  var preceedingNode = effectIndex === 0 ? self._effectChain : self._effects[effectIndex - 1];
  var succeedingNode = effectIndex === self._effects.length - 1 ? self._effectChainOut : self._effects[effectIndex + 1];

  node.disconnect();
  preceedingNode.disconnect();
  preceedingNode.connect(succeedingNode);

  self._effects = self._effects.filter(function(effect) {
    return effect !== node;
  });

  return self;
}


// ---------- Helpers ----------- //

/**
 * Creates and returns a gain node.
 */
function createGain() {
  return typeof Howler.ctx.createGain === 'undefined'
    ? Howler.ctx.createGainNode()
    : Howler.ctx.createGain();
}

})()
