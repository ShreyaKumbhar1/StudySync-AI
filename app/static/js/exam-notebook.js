/* =========================================================
   ORION — EXAM NOTEBOOK
   Interactive exam preparation dashboard
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    const root = document.getElementById('examNotebook');

    if (!root) {
        return;
    }


    /* =====================================================
       ORION NOTEBOOK STATE
       ===================================================== */

    const state = window.ORION_NOTE_STATE || {
        version: 2,
        content: '',
        fields: {}
    };

    state.fields = state.fields || {};


    const saved = state.fields.exam_dashboard || {};


    const examState = {

        examDate: saved.examDate || '',

        topics: Array.isArray(saved.topics)
            ? saved.topics
            : [],

        questions: Array.isArray(saved.questions)
            ? saved.questions
            : [],

        mistakes: Array.isArray(saved.mistakes)
            ? saved.mistakes
            : [],

        vault: Array.isArray(saved.vault)
            ? saved.vault
            : []

    };


    /* =====================================================
       HELPERS
       ===================================================== */

    function makeId(prefix) {

        if (
            window.crypto &&
            typeof window.crypto.randomUUID === 'function'
        ) {
            return `${prefix}-${window.crypto.randomUUID()}`;
        }

        return `${prefix}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`;

    }


    function escapeHTML(value) {

        const div = document.createElement('div');

        div.textContent = value == null ? '' : String(value);

        return div.innerHTML;

    }


    function markChanged() {

        if (
            typeof window.ORION_MARK_CHANGED === 'function'
        ) {
            window.ORION_MARK_CHANGED();
        }

    }


    function saveState() {

        state.fields.exam_dashboard = {
            examDate: examState.examDate,

            topics: examState.topics,

            questions: examState.questions,

            mistakes: examState.mistakes,

            vault: examState.vault
        };

        markChanged();

        updateAll();

    }


    function getTopicStatusLabel(status) {

        const labels = {
            not_started: 'Not Started',
            learning: 'Learning',
            revised: 'Revised',
            mastered: 'Mastered'
        };

        return labels[status] || 'Not Started';

    }


    function getPriorityLabel(priority) {

        const labels = {
            critical: 'Critical',
            important: 'Important',
            low: 'Low'
        };

        return labels[priority] || 'Important';

    }


    function getImportanceLabel(importance) {

        const labels = {
            must: 'Must Know',
            important: 'Important',
            practice: 'Practice'
        };

        return labels[importance] || 'Important';

    }


    function getVaultTypeLabel(type) {

        const labels = {
            formula: 'Formula',
            definition: 'Definition',
            concept: 'Concept',
            shortcut: 'Shortcut'
        };

        return labels[type] || 'Concept';

    }


    /* =====================================================
       EXAM DATE
       ===================================================== */

    const examDateInput =
        document.getElementById('examDate');


    function renderCountdown() {

        const daysElement =
            document.getElementById('daysRemaining');

        const textElement =
            document.getElementById('countdownText');

        if (!daysElement || !textElement) {
            return;
        }


        if (!examState.examDate) {

            daysElement.textContent = '—';

            textElement.textContent =
                'Set an exam date';

            return;
        }


        const today = new Date();

        today.setHours(0, 0, 0, 0);


        const target = new Date(
            `${examState.examDate}T00:00:00`
        );

        target.setHours(0, 0, 0, 0);


        const difference =
            target.getTime() - today.getTime();


        const days =
            Math.ceil(
                difference / (1000 * 60 * 60 * 24)
            );


        if (days > 0) {

            daysElement.textContent = days;

            textElement.textContent =
                days === 1
                    ? 'day remaining'
                    : 'days remaining';

        } else if (days === 0) {

            daysElement.textContent = '0';

            textElement.textContent =
                'Exam is today';

        } else {

            daysElement.textContent =
                Math.abs(days);

            textElement.textContent =
                Math.abs(days) === 1
                    ? 'day since exam'
                    : 'days since exam';

        }

    }


    if (examDateInput) {

        examDateInput.value =
            examState.examDate;

        examDateInput.addEventListener(
            'change',
            () => {

                examState.examDate =
                    examDateInput.value;

                saveState();

            }
        );

    }


    /* =====================================================
       SYLLABUS TRACKER
       ===================================================== */

    const topicInput =
        document.getElementById('topicInput');

    const topicPriority =
        document.getElementById('topicPriority');

    const addTopicButton =
        document.getElementById('addTopic');

    const topicList =
        document.getElementById('topicList');


    function addTopic() {

        const title =
            topicInput?.value.trim();

        if (!title) {

            topicInput?.focus();

            return;
        }


        examState.topics.push({

            id: makeId('topic'),

            title,

            priority:
                topicPriority?.value ||
                'important',

            status: 'not_started'

        });


        if (topicInput) {
            topicInput.value = '';
        }


        saveState();

        topicInput?.focus();

    }


    addTopicButton?.addEventListener(
        'click',
        addTopic
    );


    topicInput?.addEventListener(
        'keydown',
        event => {

            if (event.key === 'Enter') {

                event.preventDefault();

                addTopic();

            }

        }
    );


    function renderTopics() {

        if (!topicList) {
            return;
        }


        if (!examState.topics.length) {

            topicList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <strong>Your syllabus starts here</strong>
                    <span>
                        Add your first chapter or topic above.
                    </span>
                </div>
            `;

            return;
        }


        topicList.innerHTML =
            examState.topics
                .map((topic, index) => {

                    return `
                        <div class="topic-row"
                             data-topic-id="${escapeHTML(topic.id)}">

                            <div class="topic-number">
                                ${index + 1}
                            </div>

                            <div class="topic-title"
                                 title="${escapeHTML(topic.title)}">
                                ${escapeHTML(topic.title)}
                            </div>

                            <div class="topic-meta">
                                <span class="topic-priority">
                                    <i
                                        class="priority-dot ${escapeHTML(topic.priority)}"
                                    ></i>

                                    ${escapeHTML(
                                        getPriorityLabel(
                                            topic.priority
                                        )
                                    )}
                                </span>
                            </div>

                            <select
                                class="topic-status-select"
                                data-topic-status="${escapeHTML(topic.id)}">

                                <option value="not_started"
                                    ${topic.status === 'not_started' ? 'selected' : ''}>
                                    Not Started
                                </option>

                                <option value="learning"
                                    ${topic.status === 'learning' ? 'selected' : ''}>
                                    Learning
                                </option>

                                <option value="revised"
                                    ${topic.status === 'revised' ? 'selected' : ''}>
                                    Revised
                                </option>

                                <option value="mastered"
                                    ${topic.status === 'mastered' ? 'selected' : ''}>
                                    Mastered
                                </option>

                            </select>

                            <button
                                type="button"
                                class="delete-small"
                                data-delete-topic="${escapeHTML(topic.id)}"
                                title="Delete topic">

                                ×

                            </button>

                        </div>
                    `;

                })
                .join('');

    }


    topicList?.addEventListener(
        'change',
        event => {

            const select =
                event.target.closest(
                    '[data-topic-status]'
                );

            if (!select) {
                return;
            }


            const id =
                select.dataset.topicStatus;


            const topic =
                examState.topics.find(
                    item => item.id === id
                );


            if (!topic) {
                return;
            }


            topic.status =
                select.value;


            saveState();

        }
    );


    topicList?.addEventListener(
        'click',
        event => {

            const button =
                event.target.closest(
                    '[data-delete-topic]'
                );

            if (!button) {
                return;
            }


            const id =
                button.dataset.deleteTopic;


            examState.topics =
                examState.topics.filter(
                    item => item.id !== id
                );


            saveState();

        }
    );


    /* =====================================================
       QUESTION BANK
       ===================================================== */

    const questionInput =
        document.getElementById('questionInput');

    const questionImportance =
        document.getElementById(
            'questionImportance'
        );

    const addQuestionButton =
        document.getElementById(
            'addQuestion'
        );

    const questionList =
        document.getElementById(
            'questionList'
        );


    let activeQuestionFilter = 'all';


    function addQuestion() {

        const text =
            questionInput?.value.trim();

        if (!text) {

            questionInput?.focus();

            return;
        }


        examState.questions.push({

            id: makeId('question'),

            text,

            importance:
                questionImportance?.value ||
                'important',

            practiced: false

        });


        if (questionInput) {
            questionInput.value = '';
        }


        saveState();

        questionInput?.focus();

    }


    addQuestionButton?.addEventListener(
        'click',
        addQuestion
    );


    questionInput?.addEventListener(
        'keydown',
        event => {

            if (event.key === 'Enter') {

                event.preventDefault();

                addQuestion();

            }

        }
    );


    function questionMatchesFilter(question) {

        if (activeQuestionFilter === 'unpracticed') {
            return !question.practiced;
        }


        if (activeQuestionFilter === 'must') {
            return question.importance === 'must';
        }


        return true;

    }


    function renderQuestions() {

        if (!questionList) {
            return;
        }


        const filtered =
            examState.questions.filter(
                questionMatchesFilter
            );


        if (!filtered.length) {

            questionList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">❓</div>
                    <strong>
                        ${
                            examState.questions.length
                                ? 'Nothing matches this filter'
                                : 'No questions added yet'
                        }
                    </strong>
                    <span>
                        ${
                            examState.questions.length
                                ? 'Try another filter.'
                                : 'Add questions that deserve extra attention.'
                        }
                    </span>
                </div>
            `;

            return;
        }


        questionList.innerHTML =
            filtered
                .map(question => {

                    return `
                        <div
                            class="question-row"
                            data-question-id="${escapeHTML(question.id)}">

                            <input
                                type="checkbox"
                                class="question-check"
                                data-question-check="${escapeHTML(question.id)}"
                                ${question.practiced ? 'checked' : ''}
                                aria-label="Mark question as practiced">

                            <div
                                class="question-text ${question.practiced ? 'practiced' : ''}">

                                ${escapeHTML(question.text)}

                            </div>

                            <span class="importance-badge">
                                ${escapeHTML(
                                    getImportanceLabel(
                                        question.importance
                                    )
                                )}
                            </span>

                            <span></span>

                            <button
                                type="button"
                                class="delete-small"
                                data-delete-question="${escapeHTML(question.id)}"
                                title="Delete question">

                                ×

                            </button>

                        </div>
                    `;

                })
                .join('');

    }


    questionList?.addEventListener(
        'change',
        event => {

            const checkbox =
                event.target.closest(
                    '[data-question-check]'
                );

            if (!checkbox) {
                return;
            }


            const id =
                checkbox.dataset.questionCheck;


            const question =
                examState.questions.find(
                    item => item.id === id
                );


            if (!question) {
                return;
            }


            question.practiced =
                checkbox.checked;


            saveState();

        }
    );


    questionList?.addEventListener(
        'click',
        event => {

            const button =
                event.target.closest(
                    '[data-delete-question]'
                );

            if (!button) {
                return;
            }


            const id =
                button.dataset.deleteQuestion;


            examState.questions =
                examState.questions.filter(
                    item => item.id !== id
                );


            saveState();

        }
    );


    document
        .querySelectorAll(
            '[data-question-filter]'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    activeQuestionFilter =
                        button.dataset.questionFilter;


                    document
                        .querySelectorAll(
                            '[data-question-filter]'
                        )
                        .forEach(item => {

                            item.classList.toggle(
                                'active',
                                item === button
                            );

                        });


                    renderQuestions();

                }
            );

        });


    /* =====================================================
       MISTAKE JOURNAL
       ===================================================== */

    const mistakeQuestion =
        document.getElementById(
            'mistakeQuestion'
        );

    const mistakeWhat =
        document.getElementById(
            'mistakeWhat'
        );

    const mistakeCorrect =
        document.getElementById(
            'mistakeCorrect'
        );

    const mistakeLesson =
        document.getElementById(
            'mistakeLesson'
        );

    const addMistakeButton =
        document.getElementById(
            'addMistake'
        );

    const mistakeList =
        document.getElementById(
            'mistakeList'
        );


    function addMistake() {

        const question =
            mistakeQuestion?.value.trim();

        const what =
            mistakeWhat?.value.trim();

        const correct =
            mistakeCorrect?.value.trim();

        const lesson =
            mistakeLesson?.value.trim();


        if (!question) {

            mistakeQuestion?.focus();

            return;
        }


        examState.mistakes.push({

            id: makeId('mistake'),

            question,

            what,

            correct,

            lesson,

            reviewed: false

        });


        if (mistakeQuestion) {
            mistakeQuestion.value = '';
        }

        if (mistakeWhat) {
            mistakeWhat.value = '';
        }

        if (mistakeCorrect) {
            mistakeCorrect.value = '';
        }

        if (mistakeLesson) {
            mistakeLesson.value = '';
        }


        saveState();

        mistakeQuestion?.focus();

    }


    addMistakeButton?.addEventListener(
        'click',
        addMistake
    );


    function renderMistakes() {

        if (!mistakeList) {
            return;
        }


        if (!examState.mistakes.length) {

            mistakeList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠</div>
                    <strong>No mistakes logged</strong>
                    <span>
                        Your mistake journal will appear here.
                    </span>
                </div>
            `;

            return;
        }


        mistakeList.innerHTML =
            examState.mistakes
                .map(mistake => {

                    return `
                        <article
                            class="mistake-card ${mistake.reviewed ? 'reviewed' : ''}"
                            data-mistake-id="${escapeHTML(mistake.id)}">

                            <div class="mistake-card-top">

                                <h4>
                                    ${escapeHTML(
                                        mistake.question
                                    )}
                                </h4>

                                ${
                                    mistake.reviewed
                                        ? `
                                            <span class="reviewed-badge">
                                                ✓ Reviewed
                                            </span>
                                        `
                                        : ''
                                }

                            </div>


                            <div class="mistake-card-grid">

                                <div class="mistake-detail">

                                    <span>
                                        What went wrong
                                    </span>

                                    <p>
                                        ${escapeHTML(
                                            mistake.what ||
                                            'Not recorded'
                                        )}
                                    </p>

                                </div>


                                <div class="mistake-detail">

                                    <span>
                                        Correct approach
                                    </span>

                                    <p>
                                        ${escapeHTML(
                                            mistake.correct ||
                                            'Not recorded'
                                        )}
                                    </p>

                                </div>


                                <div class="mistake-detail">

                                    <span>
                                        Lesson learned
                                    </span>

                                    <p>
                                        ${escapeHTML(
                                            mistake.lesson ||
                                            'Not recorded'
                                        )}
                                    </p>

                                </div>

                            </div>


                            <div class="mistake-actions">

                                <button
                                    type="button"
                                    class="mini-button"
                                    data-toggle-mistake="${escapeHTML(mistake.id)}">

                                    ${
                                        mistake.reviewed
                                            ? 'Mark Unreviewed'
                                            : '✓ Mark Reviewed'
                                    }

                                </button>


                                <button
                                    type="button"
                                    class="mini-button"
                                    data-delete-mistake="${escapeHTML(mistake.id)}">

                                    Delete

                                </button>

                            </div>

                        </article>
                    `;

                })
                .join('');

    }


    mistakeList?.addEventListener(
        'click',
        event => {

            const toggle =
                event.target.closest(
                    '[data-toggle-mistake]'
                );


            if (toggle) {

                const id =
                    toggle.dataset.toggleMistake;


                const mistake =
                    examState.mistakes.find(
                        item => item.id === id
                    );


                if (mistake) {

                    mistake.reviewed =
                        !mistake.reviewed;

                    saveState();

                }

                return;
            }


            const deleteButton =
                event.target.closest(
                    '[data-delete-mistake]'
                );


            if (deleteButton) {

                const id =
                    deleteButton.dataset.deleteMistake;


                examState.mistakes =
                    examState.mistakes.filter(
                        item => item.id !== id
                    );


                saveState();

            }

        }
    );


    /* =====================================================
       FORMULA / DEFINITION VAULT
       ===================================================== */

    const vaultTitle =
        document.getElementById(
            'vaultTitle'
        );

    const vaultType =
        document.getElementById(
            'vaultType'
        );

    const vaultBody =
        document.getElementById(
            'vaultBody'
        );

    const addVaultButton =
        document.getElementById(
            'addVaultItem'
        );

    const vaultSearch =
        document.getElementById(
            'vaultSearch'
        );

    const vaultList =
        document.getElementById(
            'vaultList'
        );


    function addVaultItem() {

        const title =
            vaultTitle?.value.trim();

        const body =
            vaultBody?.value.trim();

        const type =
            vaultType?.value ||
            'formula';


        if (!title) {

            vaultTitle?.focus();

            return;
        }


        examState.vault.push({

            id: makeId('vault'),

            title,

            body,

            type

        });


        if (vaultTitle) {
            vaultTitle.value = '';
        }

        if (vaultBody) {
            vaultBody.value = '';
        }


        saveState();

        vaultTitle?.focus();

    }


    addVaultButton?.addEventListener(
        'click',
        addVaultItem
    );


    function renderVault() {

        if (!vaultList) {
            return;
        }


        const query =
            vaultSearch?.value
                .trim()
                .toLowerCase() || '';


        const filtered =
            examState.vault.filter(item => {

                if (!query) {
                    return true;
                }


                return (
                    item.title
                        .toLowerCase()
                        .includes(query) ||

                    item.body
                        .toLowerCase()
                        .includes(query) ||

                    item.type
                        .toLowerCase()
                        .includes(query)
                );

            });


        if (!filtered.length) {

            vaultList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">Σ</div>
                    <strong>
                        ${
                            examState.vault.length
                                ? 'Nothing found'
                                : 'Your knowledge vault is empty'
                        }
                    </strong>
                    <span>
                        ${
                            examState.vault.length
                                ? 'Try another search.'
                                : 'Save formulas, definitions and shortcuts here.'
                        }
                    </span>
                </div>
            `;

            return;
        }


        vaultList.innerHTML =
            filtered
                .map(item => {

                    return `
                        <article
                            class="vault-card"
                            data-vault-id="${escapeHTML(item.id)}">

                            <div class="vault-card-top">

                                <div class="vault-title">

                                    <span class="vault-type-badge">
                                        ${escapeHTML(
                                            getVaultTypeLabel(
                                                item.type
                                            )
                                        )}
                                    </span>

                                    <strong>
                                        ${escapeHTML(
                                            item.title
                                        )}
                                    </strong>

                                </div>


                                <button
                                    type="button"
                                    class="delete-small"
                                    data-delete-vault="${escapeHTML(item.id)}"
                                    title="Delete">

                                    ×

                                </button>

                            </div>


                            <p>
                                ${escapeHTML(
                                    item.body ||
                                    'No additional content.'
                                )}
                            </p>

                        </article>
                    `;

                })
                .join('');

    }


    vaultSearch?.addEventListener(
        'input',
        renderVault
    );


    vaultList?.addEventListener(
        'click',
        event => {

            const button =
                event.target.closest(
                    '[data-delete-vault]'
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.deleteVault;


            examState.vault =
                examState.vault.filter(
                    item => item.id !== id
                );


            saveState();

        }
    );


    /* =====================================================
       ANALYTICS
       ===================================================== */

    function percentage(done, total) {

        if (!total) {
            return 0;
        }

        return Math.round(
            (done / total) * 100
        );

    }


    function updateProgressBar(
        barId,
        labelId,
        value
    ) {

        const bar =
            document.getElementById(barId);

        const label =
            document.getElementById(labelId);


        if (bar) {
            bar.style.width =
                `${Math.max(0, Math.min(100, value))}%`;
        }


        if (label) {
            label.textContent =
                `${value}%`;
        }

    }


    function updateAnalytics() {

        const totalTopics =
            examState.topics.length;


        const mastered =
            examState.topics.filter(
                topic =>
                    topic.status === 'mastered'
            ).length;


        const revisedOrBetter =
            examState.topics.filter(
                topic =>
                    topic.status === 'revised' ||
                    topic.status === 'mastered'
            ).length;


        const practicedQuestions =
            examState.questions.filter(
                question =>
                    question.practiced
            ).length;


        const reviewedMistakes =
            examState.mistakes.filter(
                mistake =>
                    mistake.reviewed
            ).length;


        const syllabusProgress =
            percentage(
                mastered,
                totalTopics
            );


        const revisionProgress =
            percentage(
                revisedOrBetter,
                totalTopics
            );


        const questionProgress =
            percentage(
                practicedQuestions,
                examState.questions.length
            );


        const mistakeProgress =
            percentage(
                reviewedMistakes,
                examState.mistakes.length
            );


        /*
         * Overall preparation uses four areas.
         * Empty categories are treated as neutral rather
         * than forcing the percentage downward.
         */

        const progressValues = [];


        if (totalTopics) {
            progressValues.push(
                syllabusProgress
            );
        }


        if (examState.questions.length) {
            progressValues.push(
                questionProgress
            );
        }


        if (totalTopics) {
            progressValues.push(
                revisionProgress
            );
        }


        if (examState.mistakes.length) {
            progressValues.push(
                mistakeProgress
            );
        }


        const overall =
            progressValues.length
                ? Math.round(
                    progressValues.reduce(
                        (sum, value) =>
                            sum + value,
                        0
                    ) /
                    progressValues.length
                )
                : 0;


        const totalTopicsElement =
            document.getElementById(
                'totalTopics'
            );

        const masteredElement =
            document.getElementById(
                'masteredTopics'
            );

        const overallElement =
            document.getElementById(
                'overallProgress'
            );

        const overallNumber =
            document.getElementById(
                'overallProgressNumber'
            );

        const overallText =
            document.getElementById(
                'overallProgressText'
            );


        if (totalTopicsElement) {
            totalTopicsElement.textContent =
                totalTopics;
        }


        if (masteredElement) {
            masteredElement.textContent =
                mastered;
        }


        if (overallElement) {
            overallElement.textContent =
                `${overall}%`;
        }


        if (overallNumber) {
            overallNumber.textContent =
                `${overall}%`;
        }


        if (overallText) {
            overallText.textContent =
                `${overall}% complete`;
        }


        const overallBar =
            document.getElementById(
                'overallProgressBar'
            );


        if (overallBar) {
            overallBar.style.width =
                `${overall}%`;
        }


        updateProgressBar(
            'syllabusProgressBar',
            'syllabusProgressLabel',
            syllabusProgress
        );


        updateProgressBar(
            'questionProgressBar',
            'questionProgressLabel',
            questionProgress
        );


        updateProgressBar(
            'revisionProgressBar',
            'revisionProgressLabel',
            revisionProgress
        );


        updateProgressBar(
            'mistakeProgressBar',
            'mistakeProgressLabel',
            mistakeProgress
        );


        const syllabusCounter =
            document.getElementById(
                'syllabusCounter'
            );


        if (syllabusCounter) {

            syllabusCounter.textContent =
                `${mastered} / ${totalTopics}`;

        }


        const questionCounter =
            document.getElementById(
                'questionCounter'
            );


        if (questionCounter) {

            questionCounter.textContent =
                practicedQuestions;

        }


        const mistakeCounter =
            document.getElementById(
                'mistakeCounter'
            );


        if (mistakeCounter) {

            mistakeCounter.textContent =
                reviewedMistakes;

        }


        const vaultCounter =
            document.getElementById(
                'vaultCounter'
            );


        if (vaultCounter) {

            vaultCounter.textContent =
                examState.vault.length;

        }

    }


    /* =====================================================
       RAPID REVISION MODE
       ===================================================== */

    const rapidModal =
        document.getElementById(
            'rapidRevisionModal'
        );

    const openRapidButton =
        document.getElementById(
            'openRapidRevision'
        );

    const closeRapidButton =
        document.getElementById(
            'closeRapidRevision'
        );

    const closeRapidBackdrop =
        document.getElementById(
            'closeRapidRevisionBackdrop'
        );

    const rapidSearch =
        document.getElementById(
            'rapidSearch'
        );


    function openRapidRevision() {

        if (!rapidModal) {
            return;
        }


        rapidModal.classList.add('open');

        rapidModal.setAttribute(
            'aria-hidden',
            'false'
        );


        renderRapidRevision();

        setTimeout(
            () => rapidSearch?.focus(),
            80
        );


        document.body.style.overflow =
            'hidden';

    }


    function closeRapidRevision() {

        if (!rapidModal) {
            return;
        }


        rapidModal.classList.remove('open');

        rapidModal.setAttribute(
            'aria-hidden',
            'true'
        );


        document.body.style.overflow =
            '';

    }


    openRapidButton?.addEventListener(
        'click',
        openRapidRevision
    );


    closeRapidButton?.addEventListener(
        'click',
        closeRapidRevision
    );


    closeRapidBackdrop?.addEventListener(
        'click',
        closeRapidRevision
    );


    document.addEventListener(
        'keydown',
        event => {

            if (
                event.key === 'Escape' &&
                rapidModal?.classList.contains('open')
            ) {

                closeRapidRevision();

            }

        }
    );


    function createRapidItem(
        title,
        body = ''
    ) {

        return `
            <div class="rapid-item">

                <strong>
                    ${escapeHTML(title)}
                </strong>

                ${
                    body
                        ? `<span>${escapeHTML(body)}</span>`
                        : ''
                }

            </div>
        `;

    }


    function renderRapidRevision() {

        const query =
            rapidSearch?.value
                .trim()
                .toLowerCase() || '';


        const rapidTopics =
            document.getElementById(
                'rapidTopics'
            );

        const rapidQuestions =
            document.getElementById(
                'rapidQuestions'
            );

        const rapidVault =
            document.getElementById(
                'rapidVault'
            );

        const rapidMistakes =
            document.getElementById(
                'rapidMistakes'
            );


        /* ---------------------------------------------
           TOPICS
           --------------------------------------------- */

        const topics =
            examState.topics.filter(
                topic => {

                    if (!query) {
                        return true;
                    }


                    return (
                        topic.title
                            .toLowerCase()
                            .includes(query) ||

                        topic.status
                            .toLowerCase()
                            .includes(query)
                    );

                }
            );


        if (rapidTopics) {

            rapidTopics.innerHTML =
                topics.length
                    ? topics
                        .map(topic =>
                            createRapidItem(
                                topic.title,
                                getTopicStatusLabel(
                                    topic.status
                                )
                            )
                        )
                        .join('')
                    : `
                        <div class="rapid-empty">
                            No matching topics.
                        </div>
                    `;

        }


        /* ---------------------------------------------
           QUESTIONS
           --------------------------------------------- */

        const questions =
            examState.questions.filter(
                question => {

                    if (question.importance !== 'must') {
                        return false;
                    }


                    if (!query) {
                        return true;
                    }


                    return question.text
                        .toLowerCase()
                        .includes(query);

                }
            );


        if (rapidQuestions) {

            rapidQuestions.innerHTML =
                questions.length
                    ? questions
                        .map(question =>
                            createRapidItem(
                                question.text,
                                question.practiced
                                    ? '✓ Practiced'
                                    : 'Needs practice'
                            )
                        )
                        .join('')
                    : `
                        <div class="rapid-empty">
                            No matching must-know questions.
                        </div>
                    `;

        }


        /* ---------------------------------------------
           VAULT
           --------------------------------------------- */

        const vault =
            examState.vault.filter(
                item => {

                    if (!query) {
                        return true;
                    }


                    return (
                        item.title
                            .toLowerCase()
                            .includes(query) ||

                        item.body
                            .toLowerCase()
                            .includes(query) ||

                        item.type
                            .toLowerCase()
                            .includes(query)
                    );

                }
            );


        if (rapidVault) {

            rapidVault.innerHTML =
                vault.length
                    ? vault
                        .map(item =>
                            createRapidItem(
                                item.title,
                                item.body
                            )
                        )
                        .join('')
                    : `
                        <div class="rapid-empty">
                            No matching vault entries.
                        </div>
                    `;

        }


        /* ---------------------------------------------
           MISTAKES
           --------------------------------------------- */

        const mistakes =
            examState.mistakes.filter(
                mistake => {

                    if (!query) {
                        return true;
                    }


                    return (
                        mistake.question
                            .toLowerCase()
                            .includes(query) ||

                        mistake.what
                            .toLowerCase()
                            .includes(query) ||

                        mistake.lesson
                            .toLowerCase()
                            .includes(query)
                    );

                }
            );


        if (rapidMistakes) {

            rapidMistakes.innerHTML =
                mistakes.length
                    ? mistakes
                        .map(mistake =>
                            createRapidItem(
                                mistake.question,
                                mistake.lesson ||
                                mistake.correct ||
                                'Review this mistake'
                            )
                        )
                        .join('')
                    : `
                        <div class="rapid-empty">
                            No matching mistakes.
                        </div>
                    `;

        }

    }


    rapidSearch?.addEventListener(
        'input',
        renderRapidRevision
    );


    /* =====================================================
       QUICK ACTION SCROLLING
       ===================================================== */

    document
        .querySelectorAll(
            '[data-scroll-target]'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    const targetId =
                        button.dataset.scrollTarget;


                    const target =
                        document.getElementById(
                            targetId
                        );


                    if (!target) {
                        return;
                    }


                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });


                    setTimeout(
                        () => {

                            const input =
                                target.querySelector(
                                    'input'
                                );

                            input?.focus();

                        },
                        500
                    );

                }
            );

        });


    /* =====================================================
       KEYBOARD SHORTCUT
       ===================================================== */

    document.addEventListener(
        'keydown',
        event => {

            /*
             * Ctrl/Cmd + Shift + R
             * opens Rapid Revision Mode.
             */

            if (
                (event.ctrlKey || event.metaKey) &&
                event.shiftKey &&
                event.key.toLowerCase() === 'r'
            ) {

                event.preventDefault();

                openRapidRevision();

            }

        }
    );


    /* =====================================================
       INITIAL RENDER
       ===================================================== */

    function updateAll() {

        renderCountdown();

        renderTopics();

        renderQuestions();

        renderMistakes();

        renderVault();

        updateAnalytics();

    }


    updateAll();


    /* =====================================================
       PERIODIC COUNTDOWN REFRESH
       ===================================================== */

    setInterval(
        renderCountdown,
        60 * 1000
    );

});