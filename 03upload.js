document.querySelectorAll('.switch input').forEach(input => {
    input.addEventListener('change', function() {
        const statusText = this.closest('.toggle-item').querySelector('.status-text');
        if(this.checked) {
            // 체크되었을 때 텍스트 로직 (예: 허용)
            if(statusText.innerText.includes('허용')) statusText.innerText = '허용';
        } else {
            if(statusText.innerText.includes('허용')) statusText.innerText = '비허용';
        }
    });
});