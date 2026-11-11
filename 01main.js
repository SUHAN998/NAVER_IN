/* 메인 페이지 게임 분야 고수: 화면에 도달했을 때 한 번만 순차 등장 */
(() => {
    const section = document.querySelector('.expert-section');
    const stage = section?.querySelector('.expert-rank');
    if (!section || !stage) return;

    // 모션 감소 설정 또는 옵저버 미지원 환경에서는 콘텐츠를 항상 표시합니다.
    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    document.documentElement.classList.add('js-expert-animation');

    const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
            stage.classList.add('is-visible');
            observer.disconnect(); // 최초 1회만 재생
        }
    }, {
        rootMargin: '0px 0px -15% 0px',
        threshold: 0.2
    });

    observer.observe(section);
})();


/* 17차: 메인 질문 카드의 북마크/추천 상태를 Q&A 컨트롤과 동일하게 적용.
   원래의 상세 페이지 링크 및 포디움 애니메이션과 독립적으로 동작합니다. */
(() => {
    'use strict';
    document.querySelectorAll('.main-content .question-card').forEach(card => {
        card.querySelectorAll('.kin-main-icon-button, .react-btn[data-action]').forEach(button => {
            const action = button.dataset.action;
            if (action === 'share') {
                button.addEventListener('click', async () => {
                    try {
                        if (navigator.share) await navigator.share({ title: '지식iN 질문', url: location.href });
                        else if (navigator.clipboard) await navigator.clipboard.writeText(location.href);
                    } catch (_) { /* 공유 취소 및 권한 미허용 시 화면은 유지 */ }
                });
                return;
            }
            if (action !== 'like' && action !== 'dislike' && action !== 'bookmark') return;
            button.addEventListener('click', () => {
                const active = button.getAttribute('aria-pressed') !== 'true';
                if (active && (action === 'like' || action === 'dislike')) {
                    card.querySelectorAll('.react-btn[aria-pressed="true"]').forEach(other => {
                        if (other !== button) other.click();
                    });
                }
                button.setAttribute('aria-pressed', String(active));
                const image = button.querySelector('img');
                const imageFiles = {
                    like: ['02좋아요1.png', '02좋아요2.png'],
                    dislike: ['03싫어요1.png', '03싫어요2.png'],
                    bookmark: ['01북마크1.png', '01북마크2.png']
                };
                if (image) image.src = `img/${imageFiles[action][active ? 1 : 0]}`;
                const count = button.querySelector('.count');
                if (count) {
                    if (!count.dataset.base) count.dataset.base = count.textContent;
                    const base = Number.parseInt(count.dataset.base.replace(/[^0-9]/g, ''), 10) || 0;
                    count.textContent = `${base + (active ? 1 : 0)}개`;
                }
            });
        });
    });
})();
