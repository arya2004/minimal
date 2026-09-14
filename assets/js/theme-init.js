(() => {
  document.documentElement.dataset.mode = 'dark';
  try {
    const savedMode = localStorage.getItem('ap-mode');
    if (savedMode === 'dark' || savedMode === 'light') {
      document.documentElement.dataset.mode = savedMode;
    }
  } catch {
    // Storage can be unavailable in strict privacy contexts.
  }
})();
