/* Q&A의 질문/답변 카드별 독립 댓글 및 답글 UI.
   백엔드가 없는 정적 프로젝트이므로 작성 내용은 현재 브라우저의 localStorage에 보관합니다. */
(() => {
  'use strict';
  const prefix = 'kin-redesign-qna-comments-v1:';
  const storage = {
    read(key) {
      try {
        const found = JSON.parse(localStorage.getItem(prefix + key) || '[]');
        return Array.isArray(found) ? found.filter(item => item && typeof item.text === 'string') : [];
      } catch (_) { return []; }
    },
    write(key, value) {
      try { localStorage.setItem(prefix + key, JSON.stringify(value)); } catch (_) { /* 접근 불가 시 페이지 내에서 유지 */ }
    }
  };

  function textElement(tag, className, value) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = value;
    return el;
  }

  // 시안의 샘플 댓글 2개와 답글 1개. 답변 본문은 변경하지 않습니다.
  // 브라우저에 이미 작성된 댓글이 있다면 기존 댓글을 우선 보존합니다.
  const acceptedExamples = [
    {
      id: 'sample-asker', parentId: null, name: 'PSA1***',
      avatar: 'img/21_프사.png', createdLabel: '2026.04.17 | 13:24',
      text: '상세한 답변 정말 감사드립니다! 한 가지만 더 여쭤봐도 될까요? 제가 아직 부모님 집에 거주 중이라 세대주가 아닌데, 예비 세대주 자격으로 대출 신청을 하려면 은행 방문 시에 특별히 따로 챙겨야 하는 서류가 있을까요? 무작정 갔다가 헛걸음할까 봐 걱정돼서 미리 준비해두고 싶어서요 ㅠㅠ'
    },
    {
      id: 'sample-expert-reply', parentId: 'sample-asker', name: '부동산 해결사',
      avatar: 'img/29_프사부동산.png', createdLabel: '2026.04.17 | 13:24',
      text: '네, 보통 은행 방문 시에는 본인 신분증이랑 확정일자 받은 임대차계약서, 그리고 현재 살고 계신 집의 주민등록등본이 기본입니다. 나중에 대출 실행 후에 1개월 이내로 전입 완료된 등본을 다시 제출하는 조건으로 진행되는 거니까 너무 걱정 마세요. 영업점마다 요구하는 추가 서류가 다를 수 있으니 가시기 전에 해당 은행 지점에 전화 한번 해보시는 걸 추천드려요!'
    },
    {
      id: 'sample-passerby', parentId: null, name: '지나가던 선비 아닌 좀비',
      avatar: 'img/27_프사_그대는_운명을_믿소.png', createdLabel: '2026.04.17 | 13:24',
      text: '저도 이번에 독립 준비하면서 보증금 대출 알아보고 있었는데, 작성자님이랑 상황이 너무 비슷해서 댓글 남겨요! 답변자님이 알려주신 카카오나 토스 대출이 확실히 승인이 빠르다고 하더라구요. 저도 덕분에 서류 준비하는 데 큰 도움 받고 갑니다. 두 분 복 받으실 거예요~ 좋은 매물 구하시길 응원하겠습니다!'
    }
  ];

  document.querySelectorAll('[data-comment-card]').forEach(card => {
    const key = card.dataset.commentCard;
    const toggle = card.querySelector('.btn-comment');
    const panel = card.querySelector('.expandable-content');
    const textarea = panel?.querySelector('.comment-field');
    const submit = panel?.querySelector('.btn-submit');
    const counter = panel?.querySelector('.char-count');
    const list = panel?.querySelector('.qna-comment-list');
    if (!key || !toggle || !panel || !textarea || !submit || !counter || !list) return;
    let comments = storage.read(key);
    if (key === 'accepted') {
      // 이미 저장된 이용자 댓글은 보존하고, 빠진 시안 댓글만 한 번씩 추가합니다.
      const existingIds = new Set(comments.map(item => item.id));
      const missingExamples = acceptedExamples.filter(item => !existingIds.has(item.id));
      if (missingExamples.length) {
        comments = [...missingExamples, ...comments];
        storage.write(key, comments);
      }
    }
    // 채택 답변에서는 입력 상자 아래로 댓글 스레드를 배치합니다.
    if (key === 'accepted') {
      list.classList.add('qna-accepted-thread');
      panel.appendChild(list);
    }

    const updateCount = () => {
      toggle.textContent = `댓글 (${comments.length})`;
    };

    const updateEditor = () => {
      const length = textarea.value.length;
      counter.textContent = `${length}/1000`;
      submit.disabled = !textarea.value.trim() || length > 1000;
    };

    function replyForm(parentId, parentContainer) {
      const old = parentContainer.querySelector(':scope > .qna-reply-form');
      if (old) { old.remove(); return; }
      const form = document.createElement('div');
      form.className = 'qna-reply-form';
      const field = document.createElement('textarea');
      field.maxLength = 1000;
      field.placeholder = '답글을 입력해 주세요.';
      field.setAttribute('aria-label', '답글 입력');
      const send = textElement('button', '', '답글 등록');
      send.type = 'button';
      send.disabled = true;
      field.addEventListener('input', () => { send.disabled = !field.value.trim(); });
      function saveReply() {
        const value = field.value.trim();
        if (!value || value.length > 1000) return;
        comments.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, parentId, text: value, createdAt: new Date().toISOString() });
        storage.write(key, comments);
        render();
      }
      send.addEventListener('click', saveReply);
      field.addEventListener('keydown', event => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); saveReply(); }
      });
      form.append(field, send);
      parentContainer.append(form);
      field.focus();
    }

    function render() {
      list.replaceChildren();
      const byParent = parent => comments.filter(item => (item.parentId || null) === parent);
      if (key === 'accepted') {
        list.append(textElement('div', 'qna-thread-heading', `댓글 ${comments.length}개`));
      }
      const renderThread = (parent, target, depth = 0) => {
        for (const item of byParent(parent)) {
          const node = document.createElement('div');
          node.className = `qna-comment-item${depth ? ' is-reply' : ''}`;
          const meta = document.createElement('div');
          meta.className = 'qna-comment-meta';
          if (key === 'accepted') {
            const avatar = document.createElement('img');
            avatar.className = 'qna-comment-avatar';
            avatar.src = item.avatar || 'img/20_사용자프사.png';
            avatar.alt = '';
            meta.append(avatar);
          }
          const user = document.createElement('div');
          user.className = 'qna-comment-user';
          user.append(textElement('strong', '', item.name || '익명'));
          const date = new Date(item.createdAt);
          user.append(textElement('span', '', item.createdLabel || (Number.isNaN(date.getTime()) ? '' : date.toLocaleString('ko-KR'))));
          meta.append(user);
          if (key === 'accepted') {
            const dots = textElement('span', 'qna-comment-more', '⋮');
            dots.setAttribute('aria-hidden', 'true');
            meta.append(dots);
          }
          node.append(meta, textElement('p', 'qna-comment-text', item.text));
          const reply = textElement('button', 'qna-reply-trigger', '↳ 답글쓰기');
          reply.type = 'button';
          reply.addEventListener('click', () => replyForm(item.id, node));
          node.append(reply);
          target.append(node);
          if (byParent(item.id).length) {
            const children = document.createElement('div');
            children.className = 'qna-comment-children';
            node.append(children);
            renderThread(item.id, children, depth + 1);
          }
        }
      };
      renderThread(null, list);
      updateCount();
    }

    toggle.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      // 최초 펼침은 댓글 입력창에 포커스를 강제로 주지 않습니다.
      // 사용자가 직접 입력창을 클릭했을 때만 커서가 나타납니다.
    });

    function saveComment() {
      const value = textarea.value.trim();
      if (!value || value.length > 1000) return;
      comments.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, parentId: null, text: value, createdAt: new Date().toISOString() });
      storage.write(key, comments);
      textarea.value = '';
      updateEditor();
      render();
    }
    textarea.addEventListener('input', updateEditor);
    textarea.addEventListener('keydown', event => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); saveComment(); }
    });
    submit.addEventListener('click', saveComment);

    // 기존 카드의 투표·북마크 아이콘도 상호작용할 수 있도록 유지합니다.
    card.querySelectorAll('.qna-icon-button').forEach(button => {
      const action = button.dataset.action;
      if (action === 'share') {
        button.addEventListener('click', () => {
          if (navigator.share) navigator.share({ title: '지식iN Q&A', url: location.href }).catch(() => {});
          else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(() => {
            button.setAttribute('aria-label', '링크 복사 완료');
          }).catch(() => {});
        });
        return;
      }
      button.addEventListener('click', () => {
        const next = button.getAttribute('aria-pressed') !== 'true';
        const voteButtons = card.querySelectorAll('[data-action="like"], [data-action="dislike"]');
        if (next && (action === 'like' || action === 'dislike')) {
          voteButtons.forEach(other => {
            if (other !== button && other.getAttribute('aria-pressed') === 'true') other.click();
          });
        }
        button.setAttribute('aria-pressed', String(next));
        const image = button.querySelector('img');
        if (image && action === 'like') image.src = next ? 'img/02좋아요2.png' : 'img/02좋아요1.png';
        if (image && action === 'dislike') image.src = next ? 'img/03싫어요2.png' : 'img/03싫어요1.png';
        if (image && action === 'bookmark') image.src = next ? 'img/01북마크2.png' : 'img/01북마크1.png';
        const vote = button.closest('.vote-unit, .vote-unit-a');
        const count = vote?.querySelector('.vote-count');
        if (count) {
          if (!count.dataset.base) count.dataset.base = count.textContent.trim();
          const base = Number.parseInt(count.dataset.base.replace(/[^0-9]/g, ''), 10) || 0;
          count.textContent = `${base + (next ? 1 : 0)}개`;
        }
      });
    });

    render();
    updateEditor();
  });
})();
