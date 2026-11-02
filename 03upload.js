document.querySelectorAll('.switch input').forEach(input => {
    input.addEventListener('change', function() {
        // 부모 요소(.toggle-item)를 찾고, 그 안의 .status-text를 찾음
        const statusText = this.closest('.toggle-item').querySelector('.status-text');
        if (!statusText) return; // 텍스트 요소가 없으면 무시

        const isChecked = this.checked;
        const currentText = statusText.innerText;

        // 1. 허용 / 비허용 케이스
        if (currentText.includes('허용') || currentText.includes('비허용')) {
            statusText.innerText = isChecked ? '허용' : '비허용';
        } 
        // 2. 공개 / 비공개 케이스
        else if (currentText.includes('공개') || currentText.includes('비공개')) {
            statusText.innerText = isChecked ? '공개' : '비공개';
        } 
        // 3. 설정 / 신청 / 미신청 케이스 (시안의 '신청' 기준)
        else if (currentText.includes('설정') || currentText.includes('비설정') || currentText.includes('신청')) {
            statusText.innerText = isChecked ? '설정' : '비설정'; 
            // 만약 시안처럼 '신청'으로 나오게 하고 싶다면 isChecked ? '신청' : '비신청'으로 바꾸세요!
        }
    });
});