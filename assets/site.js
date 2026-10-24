(() => {
  "use strict";

  function setupImageViewer(dialog, links) {
    if (!dialog || typeof dialog.showModal !== "function") return;

    const image = dialog.querySelector("#viewer-image");
    const title = dialog.querySelector("#viewer-title");
    const canvas = dialog.querySelector("#viewer-canvas");
    const zoomButton = dialog.querySelector("#viewer-zoom");
    const closeButton = dialog.querySelector("#viewer-close");
    let opener = null;

    function resetZoom() {
      canvas.classList.remove("is-actual-size");
      canvas.scrollTo(0, 0);
      zoomButton.setAttribute("aria-pressed", "false");
      zoomButton.textContent = "原寸で表示";
    }

    function openImage(event) {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = event.currentTarget;
      const sourceImage = opener.querySelector("img");
      image.src = opener.href;
      image.alt = sourceImage.alt;
      title.textContent = opener.dataset.imageTitle;
      resetZoom();
      dialog.showModal();
      document.body.classList.add("viewer-open");
      closeButton.focus();
    }

    function toggleZoom() {
      const isActualSize = canvas.classList.toggle("is-actual-size");
      zoomButton.setAttribute("aria-pressed", String(isActualSize));
      zoomButton.textContent = isActualSize ? "全体を表示" : "原寸で表示";
      canvas.scrollTo(0, 0);
    }

    function closeOnBackdrop(event) {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      const isOutside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
      if (isOutside) dialog.close();
    }

    function restorePage() {
      document.body.classList.remove("viewer-open");
      resetZoom();
      if (opener) opener.focus({ preventScroll: true });
    }

    for (const link of links) link.addEventListener("click", openImage);
    zoomButton.addEventListener("click", toggleZoom);
    closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", closeOnBackdrop);
    dialog.addEventListener("close", restorePage);
  }

  function setupReadingNavigation(chapters, navigationLinks) {
    if (!("IntersectionObserver" in window)) return;
    const visibleChapters = new Set();

    function markCurrentChapter(chapterId) {
      for (const link of navigationLinks) {
        if (link.hash === `#${chapterId}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleChapters.add(entry.target.id);
        else visibleChapters.delete(entry.target.id);
      }
      const currentChapter = Array.from(chapters).find(chapter => visibleChapters.has(chapter.id));
      if (currentChapter) markCurrentChapter(currentChapter.id);
    }, { rootMargin: "-8% 0px -55% 0px", threshold: 0 });

    for (const chapter of chapters) observer.observe(chapter);
  }

  function initializePage() {
    setupImageViewer(document.querySelector("#image-viewer"), document.querySelectorAll(".puzzle-image"));
    setupReadingNavigation(document.querySelectorAll(".chapter"), document.querySelectorAll(".reading-nav a"));
  }

  initializePage();
})();
