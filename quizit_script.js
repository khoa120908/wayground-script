(function() {
    'use strict';

    const cachedAnswers = new Map();
    let lastProcessedQuestionId = '';

    const cleanText = (text) => {
        if (!text) return '';
        return text.replace(/(<([^>]+)>)/gi, '').trim().replace(/\s+/g, ' ');
    };

    function findGamePin() {
        const pinRegex = /\b(\d{2,9})\s(\d{2,9})\b/;
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
            const response = await fetch(`https://quizit.khoa12092008.workers.dev/?pin=${pin}`);
            if (!response.ok) return false;
            
            const data = await response.json();
            if (!data || !data.answers) return false;

            data.answers.forEach(item => {
                const qId = item.id;
                if (!qId) return;

                if (item.options && Array.isArray(item.answer)) {
                    const correctTexts = item.answer.map(index => {
                        return cleanText(item.options[index]?.text);
                    }).filter(Boolean);

                    if (correctTexts.length > 0) {
                        cachedAnswers.set(qId, correctTexts);
                    }
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
            text: cleanText(el.querySelector('.option-text-inner, .text-container')?.innerText),
            element: el,
        }));

        if (options.length > 0) return { questionId: container.dataset.quesid, type: 'CHOICE', options };
        return null;
    }

    async function highlightAnswer(answersToHighlight, questionData) {
        if (questionData.type === 'CHOICE') {
            questionData.options.forEach(opt => {
                opt.element.style.border = "";
                opt.element.style.boxShadow = "";
                
                if (answersToHighlight.includes(opt.text)) {
                    opt.element.style.border = "2px solid #00c985"; 
                    opt.element.style.boxSizing = "border-box";
                    opt.element.style.boxShadow = '0 0 15px rgba(80, 250, 123, 0.6)'; 
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
            console.log(`%c Đang lấy đáp án cho PIN: ${pin}... `, "background: #f39c12; color: white; padding: 4px; font-weight: bold;");
            
            if (await fetchAndCacheAnswers(pin)) {
                console.log("%c Quizizz Auto-Solver: HOẠT ĐỘNG! ", "background: #27ae60; color: white; padding: 4px; font-weight: bold;");
                
                const observer = new MutationObserver(() => {
                    const qId = document.querySelector('[data-quesid]')?.dataset.quesid;
                    if (qId && qId !== lastProcessedQuestionId) {
                        lastProcessedQuestionId = qId;
                        setTimeout(mainSolver, 800);
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
            } else {
                console.log("%c Không lấy được đáp án! ", "background: #c0392b; color: white; padding: 4px; font-weight: bold;");
            }
        };

        const findInterval = setInterval(() => {
            const pin = findGamePin();
            if (pin) {
                clearInterval(findInterval);
                startAutomation(pin);
            }
        }, 1000);
        
        setTimeout(() => clearInterval(findInterval), 30000);
    }

    initialize();
})();