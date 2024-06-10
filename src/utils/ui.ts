export function scrollToBottom(
  delay: number = 100,
  behavior: 'smooth' | 'instant' | 'auto' = 'smooth',
) {
  setTimeout(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior,
    });
  }, delay);
}

export function scrollToTop(
  delay: number = 100,
  behavior: 'smooth' | 'instant' | 'auto' = 'smooth',
) {
  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior,
    });
  }, delay);
}
