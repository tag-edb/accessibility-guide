function stepScroll() {
  const scrollTop = document.documentElement.scrollTop;
  const scrollMax =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  if (scrollTop + 5 <= scrollMax) {
    document.documentElement.scrollTop = scrollTop + 5;
  }
}

requestAnimationFrame(t);
