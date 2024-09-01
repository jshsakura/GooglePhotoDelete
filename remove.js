// 구글 포토 대량 삭제 스크립트

// 설정
const CONFIG = {
    // 삭제할 최대 이미지 수. "ALL_PHOTOS"로 설정하면 모든 사진 삭제
    maxImageCount: "ALL_PHOTOS",
    
    // 요소 선택자
    selectors: {
        checkboxClass: '.ckGgle',
        deleteButton: 'button[aria-label="Delete"]',
        languageAgnosticDeleteButton: 'div[data-delete-origin] > button'
    },
    
    // 시간 설정 (밀리초)
    timing: {
        deleteCycle: 10000,      // 각 삭제 사이클 간격
        buttonClickDelay: 2000   // 버튼 클릭 후 대기 시간
    },
    
    // 최대 시도 횟수
    maxRetries: 10
};

// 전역 변수
let imageCount = 0;

/**
 * 주어진 버튼을 클릭하고 로그를 출력합니다.
 * @param {HTMLElement} button - 클릭할 버튼 요소
 */
function clickButton(button) {
    if (button) {
        button.click();
        console.log("[INFO] Button clicked:", button.textContent.trim());
    } else {
        console.log("[ERROR] Button not found");
    }
}

/**
 * 주어진 선택자로 버튼을 찾아 클릭합니다.
 * @param {string} selector - 버튼을 찾기 위한 CSS 선택자
 * @returns {boolean} 버튼을 찾아 클릭했으면 true, 그렇지 않으면 false
 */
function findAndClickButton(selector) {
    const button = document.querySelector(selector);
    if (button) {
        clickButton(button);
        return true;
    }
    return false;
}

/**
 * "Move to trash" 버튼을 찾습니다.
 * @returns {HTMLElement|null} "Move to trash" 버튼 요소 또는 null
 */
function findMoveToTrashButton() {
    const buttons = document.querySelectorAll('button');
    for (let button of buttons) {
        if (button.textContent.trim() === 'Move to trash') {
            return button;
        }
    }
    return null;
}

/**
 * 사진 삭제 프로세스를 실행합니다.
 */
function runDeletionProcess() {
    let checkboxes;
    let attemptCount = 1;
    
    // 체크박스 찾기
    do {
        checkboxes = document.querySelectorAll(CONFIG.selectors.checkboxClass);
    } while (checkboxes.length <= 0 && attemptCount++ < CONFIG.maxRetries);

    // 더 이상 삭제할 사진이 없으면 종료
    if (checkboxes.length <= 0) {
        console.log("[INFO] No more images to delete.");
        clearInterval(deleteTask);
        console.log("[SUCCESS] Tool exited.");
        return;
    }

    // 체크박스 선택
    imageCount += checkboxes.length;
    checkboxes.forEach((checkbox) => { checkbox.click() });
    console.log("[INFO] Selecting", checkboxes.length, "images");

    // 삭제 버튼 클릭
    setTimeout(() => {
        if (!findAndClickButton(CONFIG.selectors.languageAgnosticDeleteButton) &&
            !findAndClickButton(CONFIG.selectors.deleteButton)) {
            console.log("[ERROR] Delete button not found");
            return;
        }

        // "Move to trash" 버튼 클릭
        setTimeout(() => {
            const moveToTrashButton = findMoveToTrashButton();
            if (moveToTrashButton) {
                console.log("[INFO] 'Move to trash' button found. Clicking...");
                clickButton(moveToTrashButton);
                
                console.log(`[INFO] ${imageCount}/${CONFIG.maxImageCount} Moved to trash`);
                
                // 목표 달성 시 종료
                if (CONFIG.maxImageCount !== "ALL_PHOTOS" && imageCount >= parseInt(CONFIG.maxImageCount)) {
                    console.log(`${imageCount} photos moved to trash as requested`);
                    clearInterval(deleteTask);
                    console.log("[SUCCESS] Tool exited.");
                }
            } else {
                console.log("[ERROR] 'Move to trash' button not found. Skipping...");
            }
        }, CONFIG.timing.buttonClickDelay);
    }, CONFIG.timing.buttonClickDelay);
}

// 주기적으로 삭제 프로세스 실행
const deleteTask = setInterval(runDeletionProcess, CONFIG.timing.deleteCycle);

console.log("[INFO] Google Photos deletion script started. Press Ctrl+C to stop.");
