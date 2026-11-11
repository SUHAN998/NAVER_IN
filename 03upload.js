/* 37차: 토글형 굵게/글머리 기호 · 기존 질문 작성 동작 유지 */
(() => {
    const title = document.querySelector('#upload-title');
    const content = document.querySelector('#upload-content');
    const titleCounter = document.querySelector('#title-counter');
    const contentCounter = document.querySelector('#content-counter');
    const tagInput = document.querySelector('#tag-input');
    const addTagButton = document.querySelector('#add-tag-btn');
    const tagContainer = document.querySelector('#tag-container');
    const expandTrigger = document.querySelector('#expand-trigger');
    const expandLabel = document.querySelector('.upload-compose-card .expand-label');
    const expandButton = document.querySelector('.upload-compose-card .expand-btn');
    const imageInput = document.querySelector('#upload-image-input');
    const fileInput = document.querySelector('#upload-file-input');
    const attachments = document.querySelector('#upload-attachments');
    const boldButton = document.querySelector('#insert-bold');
    const bulletButton = document.querySelector('#insert-bullet');
    if (!title || !content || !tagContainer) return;

    let measureFrame = 0;
    let savedEditorRange = null;
    const editorLimit = 10000;
    const textLength = () => content.textContent.replace(/\u200b/g, '').length;
    function updateCounters() {
        titleCounter.textContent = `${title.value.length}/50`;
        contentCounter.textContent = `${textLength().toLocaleString('en-US')}/10,000`;
        const hasElement = Boolean(content.querySelector('img, ul, ol'));
        content.dataset.empty = String(!hasElement && !content.textContent.trim());
    }
    title.addEventListener('input', updateCounters);
    content.addEventListener('input', () => { updateCounters(); queueHeightMeasure(); });
    content.addEventListener('beforeinput', event => {
        if (!event.inputType?.startsWith('insert')) return;
        const insertion = event.data || '';
        if (!insertion) return;
        const selected = window.getSelection()?.toString().length || 0;
        if (textLength() - selected + insertion.length > editorLimit) event.preventDefault();
    });
    // 외부 HTML을 그대로 붙이지 않고 일반 텍스트로 붙여넣어 기존 서식과 충돌 방지.
    content.addEventListener('paste', event => {
        const plain = event.clipboardData?.getData('text/plain');
        if (plain == null) return;
        event.preventDefault();
        const selected = window.getSelection()?.toString().length || 0;
        const allowed = Math.max(0, editorLimit - textLength() + selected);
        content.focus();
        document.execCommand('insertText', false, plain.slice(0, allowed));
        updateCounters();
    });
    updateCounters();

    const tags = [];
    function renderTags() {
        tagContainer.replaceChildren();
        tagContainer.hidden = tags.length === 0;
        tags.forEach(tag => {
            const chip = document.createElement('span');
            chip.className = 'tag-item';
            const label = document.createElement('span');
            label.textContent = `#${tag}`;
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'tag-remove';
            remove.setAttribute('aria-label', `${tag} 태그 삭제`);
            remove.title = '태그 삭제';
            remove.textContent = '×';
            remove.addEventListener('click', () => {
                const index = tags.indexOf(tag);
                if (index !== -1) tags.splice(index, 1);
                renderTags();
            });
            chip.append(label, remove);
            tagContainer.appendChild(chip);
        });
        queueHeightMeasure();
    }
    function addTag() {
        // 스페이스는 허용하지 않으며 여러 단어 구분에는 '_'를 사용합니다.
        const tag = tagInput.value.replace(/^#+/, '').replace(/\s/g, '');
        if (!tag) return;
        if (!tags.includes(tag)) tags.push(tag);
        renderTags();
        tagInput.value = '';
        tagInput.focus();
    }
    tagInput.addEventListener('keydown', event => {
        if (event.key === ' ' || event.code === 'Space') event.preventDefault();
        if (event.key === 'Enter') {
            event.preventDefault();
            addTag();
        }
    });
    tagInput.addEventListener('beforeinput', event => {
        if (event.data && /\s/.test(event.data)) event.preventDefault();
    });
    tagInput.addEventListener('input', () => {
        if (/\s/.test(tagInput.value)) {
            const pos = tagInput.selectionStart;
            const before = tagInput.value.slice(0, pos);
            tagInput.value = tagInput.value.replace(/\s/g, '');
            const cursor = before.replace(/\s/g, '').length;
            tagInput.setSelectionRange(cursor, cursor);
        }
    });
    addTagButton.addEventListener('click', addTag);
    renderTags();

    function updateExpansion() {
        const expanded = expandTrigger.checked;
        expandLabel.textContent = expanded ? '접기' : '추가설정';
        expandButton.setAttribute('aria-expanded', String(expanded));
        // 패널 열고 닫는 중에는 높이를 다시 측정하지 않아 HUD 리플로를 방지합니다.
    }
    expandTrigger.addEventListener('change', updateExpansion);
    expandButton.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            expandTrigger.click();
        }
    });
    updateExpansion();

    const reserveSwitch = document.querySelector('#reserve-upload');
    const reserveDate = document.querySelector('#upload-reserve-date');
    const reserveDateField = document.querySelector('.reserve-date-field');
    const reservePeriod = document.querySelector('#upload-reserve-period');
    const reserveHour = document.querySelector('#upload-reserve-hour');
    const reserveMinute = document.querySelector('#upload-reserve-minute');
    // 24시간제로 오해되지 않도록 시각을 오전/오후, 1~12시, 00~59분으로 분리합니다.
    for (let hour = 1; hour <= 12; hour++) {
        const opt = document.createElement('option');
        opt.value = String(hour).padStart(2, '0');
        opt.textContent = opt.value;
        reserveHour.append(opt);
    }
    for (let minute = 0; minute <= 59; minute++) {
        const opt = document.createElement('option');
        opt.value = String(minute).padStart(2, '0');
        opt.textContent = opt.value;
        reserveMinute.append(opt);
    }
    reserveHour.value = '03';
    reserveMinute.value = '30';
    const updateDateHint = () => {
        reserveDateField.classList.toggle('is-empty', !reserveDate.value);
        const hint = reserveDateField.querySelector('.reserve-date-hint');
        if (hint) {
            const parts = reserveDate.value.split('-');
            hint.textContent = parts.length === 3
                ? `${parts[0]}년 ${Number(parts[1])}월 ${Number(parts[2])}일`
                : '년 · 월 · 일';
        }
    };
    reserveDate.addEventListener('input', updateDateHint);
    reserveDate.addEventListener('change', updateDateHint);
    updateDateHint();
    const reservationInputs = [reserveDate, reservePeriod, reserveHour, reserveMinute];
    document.querySelectorAll('.upload-compose-card .switch input[type="checkbox"]').forEach(input => {
        const item = input.closest('.toggle-item');
        const status = item?.querySelector('.status-text');
        const update = () => {
            if (status) status.textContent = input.checked ? input.dataset.on : input.dataset.off;
            if (input === reserveSwitch) reservationInputs.forEach(field => { field.disabled = !input.checked; });
        };
        input.addEventListener('change', update);
        update();
    });

    // contenteditable 안에서 실제 굵게 쓰기(Ctrl+B와 동일한 편집 명령)를 적용합니다.
    function rangeWithinEditor(range) {
        return range && content.contains(range.commonAncestorContainer);
    }
    function rememberEditorSelection() {
        const selection = window.getSelection();
        if (selection?.rangeCount && rangeWithinEditor(selection.getRangeAt(0))) {
            savedEditorRange = selection.getRangeAt(0).cloneRange();
        }
    }
    // 두 서식 모두 브라우저의 실제 contenteditable 명령을 사용하므로
    // 다시 누르면 꺼지고, 글머리 기호는 Enter로 계속 / 빈 항목 Enter로 종료됩니다.
    function updateToolbarState() {
        const selection = window.getSelection();
        if (!selection?.rangeCount || !rangeWithinEditor(selection.getRangeAt(0))) return;
        boldButton.setAttribute('aria-pressed', String(document.queryCommandState('bold')));
        bulletButton.setAttribute('aria-pressed', String(document.queryCommandState('insertUnorderedList')));
    }
    content.addEventListener('mouseup', () => { rememberEditorSelection(); updateToolbarState(); });
    content.addEventListener('keyup', () => { rememberEditorSelection(); updateToolbarState(); });
    content.addEventListener('input', updateToolbarState);
    document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        if (selection?.rangeCount && rangeWithinEditor(selection.getRangeAt(0))) {
            rememberEditorSelection();
            updateToolbarState();
        }
    });
    function restoreEditorSelection() {
        content.focus();
        const selection = window.getSelection();
        if (!selection) return;
        if (savedEditorRange && rangeWithinEditor(savedEditorRange)) {
            selection.removeAllRanges();
            selection.addRange(savedEditorRange);
        } else {
            const range = document.createRange();
            range.selectNodeContents(content);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    // 툴바 클릭 시 입력 커서와 선택 영역을 그대로 보존합니다.
    document.querySelectorAll('.upload-tool').forEach(btn => {
        btn.addEventListener('mousedown', event => {
            rememberEditorSelection();
            if (btn === boldButton || btn === bulletButton) event.preventDefault();
        });
    });
    boldButton.addEventListener('click', () => {
        restoreEditorSelection();
        document.execCommand('bold', false, null);
        updateToolbarState();
        rememberEditorSelection();
        updateCounters();
    });
    bulletButton.addEventListener('click', () => {
        restoreEditorSelection();
        document.execCommand('insertUnorderedList', false, null);
        updateToolbarState();
        rememberEditorSelection();
        updateCounters();
    });

    document.querySelector('#insert-image').addEventListener('click', () => {
        rememberEditorSelection();
        imageInput.click();
    });
    document.querySelector('#insert-file').addEventListener('click', () => fileInput.click());

    // 이미지는 본문 편집 영역의 커서 위치에 직접 들어갑니다.
    imageInput.addEventListener('change', () => {
        const file = imageInput.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => {
            restoreEditorSelection();
            const figure = document.createElement('span');
            figure.className = 'upload-inline-image';
            figure.contentEditable = 'false';
            const img = document.createElement('img');
            img.src = reader.result;
            img.alt = file.name;
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'upload-image-remove';
            remove.setAttribute('aria-label', `${file.name} 이미지 삭제`);
            remove.title = '이미지 삭제';
            remove.textContent = '×';
            remove.addEventListener('click', () => {
                figure.remove();
                updateCounters();
                queueHeightMeasure();
            });
            figure.append(img, remove);
            const following = document.createElement('span');
            following.appendChild(document.createElement('br'));
            const selection = window.getSelection();
            const range = selection.rangeCount ? selection.getRangeAt(0) : null;
            if (range && rangeWithinEditor(range)) {
                range.deleteContents();
                range.insertNode(following);
                range.insertNode(figure);
            } else {
                content.append(figure, following);
            }
            const after = document.createRange();
            after.selectNodeContents(following);
            after.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(after);
            savedEditorRange = after.cloneRange();
            content.focus();
            updateCounters();
            queueHeightMeasure();
        };
        reader.readAsDataURL(file);
        imageInput.value = '';
    });

    // 일반 파일 첨부는 기존처럼 편집창 아래에 파일명 칩으로 표시합니다.
    fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        attachments.hidden = false;
        const chip = document.createElement('span');
        chip.className = 'upload-file-pill';
        const name = document.createElement('span');
        name.textContent = file.name;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'upload-file-remove';
        remove.textContent = '×';
        remove.setAttribute('aria-label', `${file.name} 첨부 삭제`);
        remove.addEventListener('click', () => {
            chip.remove();
            attachments.hidden = !attachments.childElementCount;
            queueHeightMeasure();
        });
        chip.append(name, remove);
        attachments.appendChild(chip);
        fileInput.value = '';
        queueHeightMeasure();
    });

    // 접히거나 펴져도 document의 높이가 같도록 예약 공간을 확보합니다.
    // 35차처럼 실제 체크 상태를 잠깐 바꾸지 않으므로 HUD/스크롤바 리플로가 없습니다.
    const main = document.querySelector('body.kin-upload .main-content');
    const innerMain = main?.querySelector('.container_m');
    const expandTarget = document.querySelector('#upload-extra-settings');
    const expandInner = expandTarget?.querySelector('.expand-inner');
    function measureExpandedHeight() {
        if (!main || !innerMain || !expandInner) return;
        // panel은 0fr에서도 scrollHeight로 실제 내용 높이를 얻을 수 있습니다.
        const availableHeight = expandInner.scrollHeight;
        const visibleHeight = expandTarget.getBoundingClientRect().height;
        const trailing = parseFloat(getComputedStyle(innerMain.lastElementChild).marginBottom) || 0;
        const total = innerMain.getBoundingClientRect().height + trailing;
        const required = Math.ceil(total + Math.max(0, availableHeight - visibleHeight) + 6);
        // 열리고 닫힐 때의 미세한 측정 편차가 기존 높이를 줄이지 않게 처리.
        const previous = parseFloat(main.style.minHeight) || 0;
        main.style.minHeight = `${Math.max(required, previous)}px`;
    }
    function queueHeightMeasure() {
        cancelAnimationFrame(measureFrame);
        measureFrame = requestAnimationFrame(() => {
            measureFrame = 0;
            measureExpandedHeight();
        });
    }
    queueHeightMeasure();
    window.addEventListener('resize', () => {
        if (main) main.style.minHeight = '0px';
        queueHeightMeasure();
    });
    document.fonts?.ready.then(queueHeightMeasure);
    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(queueHeightMeasure).observe(content);
    }
})();
