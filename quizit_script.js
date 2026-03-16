(function() {
    'use strict';

    const cachedAnswers = new Map();
    let lastProcessedQuestionId = '';

    const cleanText = (text) => {
        if (!text) return '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        return tempDiv.textContent.replace(/\s+/g, ' ').trim();
    };

    function findGamePin() {
        const pinRegex = /\b(\d{2,9})\s?(\d{2,9})\b/;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while (node = walker.nextNode()) {
            const match = node.nodeValue.trim().match(pinRegex);
            if (match && node.parentElement?.offsetParent !== null) {
                return match[0].replace(/\s/g, '');
            }
        }
        return null;
    }

    async function fetchAndCacheAnswers(pin) {
        try {
            console.log(`%c Đang tải dữ liệu cho PIN: ${pin}... `, "background: #3498db; color: white; padding: 4px;");
            const response = await fetch(`https://quizit.khoa12092008.workers.dev/?pin=${pin}`);
            if (!response.ok) return false;

            const data = await response.json();
            if (!data || !data.answers) return false;

            data.answers.forEach(item => {
                const qId = item.id;
                if (!qId) return;

                let correctTexts = [];

                if (item.answers && Array.isArray(item.answers)) {
                    correctTexts = item.answers.map(ans => cleanText(ans.text)).filter(Boolean);
                } else if (item.options && Array.isArray(item.answer)) {
                    correctTexts = item.answer.map(index => cleanText(item.options[index]?.text)).filter(Boolean);
                }

                if (correctTexts.length > 0) {
                    cachedAnswers.set(qId, correctTexts);
                }
            });

            return cachedAnswers.size > 0;
        } catch (error) {
            console.error("Lỗi khi tải API:", error);
            return false;
        }
    }

    function getCurrentQuestionData() {
        const container = document.querySelector('[data-quesid]');
        if (!container) return null;

        const options = Array.from(document.querySelectorAll('.option.is-selectable, .option')).map(el => ({
            text: cleanText(el.querySelector('.option-text-inner, .text-container')?.innerHTML || el.innerText),
            element: el,
        }));

        if (options.length > 0) return { questionId: container.dataset.quesid, type: 'CHOICE', options };
        return null;
    }

    function highlightAnswer(answersToHighlight, questionData) {
        if (questionData.type === 'CHOICE') {
            questionData.options.forEach(opt => {
                opt.element.style.border = "";
                opt.element.style.boxShadow = "";
                opt.element.style.backgroundColor = "";

                const isCorrect = answersToHighlight.some(ans =>
                    ans === opt.text || ans.includes(opt.text) || opt.text.includes(ans)
                );

                if (isCorrect) {
                    opt.element.style.border = "3px solid #00c985";
                    opt.element.style.boxSizing = "border-box";
                    opt.element.style.boxShadow = '0 0 15px rgba(80, 250, 123, 0.8)';
                    opt.element.style.backgroundColor = "rgba(0, 201, 133, 0.1)";
                }
            });
        }
    }

    async function mainSolver() {
        const data = getCurrentQuestionData();
        if (!data) return;

        const ans = cachedAnswers.get(data.questionId);
        if (ans) {
            highlightAnswer(ans, data);
        }
    }

    function initialize() {
        const startAutomation = async (pin) => {
            if (await fetchAndCacheAnswers(pin)) {
                console.log("%c Quizizz Auto-Solver: HOẠT ĐỘNG! Đã lấy đủ đáp án. ", "background: #27ae60; color: white; padding: 4px; font-weight: bold;");

                setTimeout(mainSolver, 500);

                const observer = new MutationObserver(() => {
                    const qId = document.querySelector('[data-quesid]')?.dataset.quesid;
                    if (qId && qId !== lastProcessedQuestionId) {
                        lastProcessedQuestionId = qId;
                        setTimeout(mainSolver, 600);
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
            } else {
                console.log("%c Không lấy được đáp án hoặc mã PIN sai! ", "background: #c0392b; color: white; padding: 4px; font-weight: bold;");
                alert("Không lấy được đáp án từ server. Vui lòng kiểm tra lại mã PIN.");
            }
        };

        let attempts = 0;
        const maxAttempts = 3;

        const findInterval = setInterval(() => {
            const pin = findGamePin();
            if (pin) {
                clearInterval(findInterval);
                startAutomation(pin);
            } else {
                attempts++;
                if (attempts >= maxAttempts) {
                    clearInterval(findInterval);
                    let manualPin = prompt("Không quét được mã PIN. Vui lòng nhập mã Game PIN vào đây:");
                    if (manualPin && manualPin.trim() !== "") {
                        manualPin = manualPin.replace(/\s/g, '');
                        startAutomation(manualPin);
                    } else {
                        console.log("%c Đã hủy kích hoạt tự động giải. ", "background: #f39c12; color: white; padding: 4px;");
                    }
                }
            }
        }, 1000);
    }

    initialize();
})();(function() {
    'use strict';

    const cachedAnswers = new Map();
    let lastProcessedQuestionId = '';

    const cleanText = (text) => {
        if (!text) return '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        return tempDiv.textContent.replace(/\s+/g, ' ').trim();
    };

    function findGamePin() {
        const pinRegex = /\b(\d{2,9})\s?(\d{2,9})\b/;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while (node = walker.nextNode()) {
            const match = node.nodeValue.trim().match(pinRegex);
            if (match && node.parentElement?.offsetParent !== null) {
                return match[0].replace(/\s/g, '');
            }
        }
        return null;
    }

    async function fetchAndCacheAnswers(pin) {
        try {
            console.log(`%c Đang tải dữ liệu cho PIN: ${pin}... `, "background: #3498db; color: white; padding: 4px;");
            const response = await fetch(`https://quizit.khoa12092008.workers.dev/?pin=${pin}`);
            if (!response.ok) return false;

            const data = await response.json();
            if (!data || !data.answers) return false;

            data.answers.forEach(item => {
                const qId = item.id;
                if (!qId) return;

                let correctTexts = [];

                if (item.answers && Array.isArray(item.answers)) {
                    correctTexts = item.answers.map(ans => cleanText(ans.text)).filter(Boolean);
                } else if (item.options && Array.isArray(item.answer)) {
                    correctTexts = item.answer.map(index => cleanText(item.options[index]?.text)).filter(Boolean);
                }

                if (correctTexts.length > 0) {
                    cachedAnswers.set(qId, correctTexts);
                }
            });

            return cachedAnswers.size > 0;
        } catch (error) {
            console.error("Lỗi khi tải API:", error);
            return false;
        }
    }

    function getCurrentQuestionData() {
        const container = document.querySelector('[data-quesid]');
        if (!container) return null;

        const options = Array.from(document.querySelectorAll('.option.is-selectable, .option')).map(el => ({
            text: cleanText(el.querySelector('.option-text-inner, .text-container')?.innerHTML || el.innerText),
            element: el,
        }));

        if (options.length > 0) return { questionId: container.dataset.quesid, type: 'CHOICE', options };
        return null;
    }

    function highlightAnswer(answersToHighlight, questionData) {
        if (questionData.type === 'CHOICE') {
            questionData.options.forEach(opt => {
                opt.element.style.border = "";
                opt.element.style.boxShadow = "";
                opt.element.style.backgroundColor = "";

                const isCorrect = answersToHighlight.some(ans =>
                    ans === opt.text || ans.includes(opt.text) || opt.text.includes(ans)
                );

                if (isCorrect) {
                    opt.element.style.border = "3px solid #00c985";
                    opt.element.style.boxSizing = "border-box";
                    opt.element.style.boxShadow = '0 0 15px rgba(80, 250, 123, 0.8)';
                    opt.element.style.backgroundColor = "rgba(0, 201, 133, 0.1)";
                }
            });
        }
    }

    async function mainSolver() {
        const data = getCurrentQuestionData();
        if (!data) return;

        const ans = cachedAnswers.get(data.questionId);
        if (ans) {
            highlightAnswer(ans, data);
        }
    }

    function initialize() {
        const startAutomation = async (pin) => {
            if (await fetchAndCacheAnswers(pin)) {
                console.log("%c Quizizz Auto-Solver: HOẠT ĐỘNG! Đã lấy đủ đáp án. ", "background: #27ae60; color: white; padding: 4px; font-weight: bold;");

                setTimeout(mainSolver, 500);

                const observer = new MutationObserver(() => {
                    const qId = document.querySelector('[data-quesid]')?.dataset.quesid;
                    if (qId && qId !== lastProcessedQuestionId) {
                        lastProcessedQuestionId = qId;
                        setTimeout(mainSolver, 600);
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
            } else {
                console.log("%c Không lấy được đáp án hoặc mã PIN sai! ", "background: #c0392b; color: white; padding: 4px; font-weight: bold;");
                alert("Không lấy được đáp án từ server. Vui lòng kiểm tra lại mã PIN.");
            }
        };

        let attempts = 0;
        const maxAttempts = 3;

        const findInterval = setInterval(() => {
            const pin = findGamePin();
            if (pin) {
                clearInterval(findInterval);
                startAutomation(pin);
            } else {
                attempts++;
                if (attempts >= maxAttempts) {
                    clearInterval(findInterval);
                    let manualPin = prompt("Không quét được mã PIN. Vui lòng nhập mã Game PIN vào đây:");
                    if (manualPin && manualPin.trim() !== "") {
                        manualPin = manualPin.replace(/\s/g, '');
                        startAutomation(manualPin);
                    } else {
                        console.log("%c Đã hủy kích hoạt tự động giải. ", "background: #f39c12; color: white; padding: 4px;");
                    }
                }
            }
        }, 1000);
    }

    initialize();
})();
