try {
  if (typeof window !== 'undefined') {
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (desc && !desc.set) {
      Object.defineProperty(window, 'fetch', {
        get: desc.get,
        set: function(val) {
          console.warn("Ignored attempt to set window.fetch");
        },
        configurable: true,
        enumerable: desc.enumerable
      });
    }
  }
} catch (e) {
  console.error("Could not patch window.fetch", e);
}
