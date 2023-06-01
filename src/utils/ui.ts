export function scrollToBottom(delay: number = 300) {
  setTimeout(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  }, delay);
}

export function scrollToTop(delay: number = 300) {
  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, delay);
}
