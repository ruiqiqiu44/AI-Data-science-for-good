// This module handles the browser's requirement that a user must interact
// with the page before audio can be played. It provides a global flag
// that can be checked by any component.

export let hasUserInteracted = false;

const handleFirstInteraction = () => {
  hasUserInteracted = true;
  // Once we have interaction, we can remove the listeners.
  window.removeEventListener('click', handleFirstInteraction);
  window.removeEventListener('keydown', handleFirstInteraction);
};

export function initializeAudioInteraction() {
  if (typeof window !== 'undefined' && !hasUserInteracted) {
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
  }
}
