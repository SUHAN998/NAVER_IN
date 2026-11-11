/* 세 페이지 공통: 실제 헤더 높이를 측정해 사이드바의 초기 여백과 sticky 여백을 동일하게 합니다. */
(() => {
    const header = document.querySelector('.header');
    if (!header) return;
    const update = () => {
        document.documentElement.style.setProperty(
            '--kin-header-height', `${header.getBoundingClientRect().height}px`
        );
    };
    update();
    window.addEventListener('resize', update, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(header);
})();
