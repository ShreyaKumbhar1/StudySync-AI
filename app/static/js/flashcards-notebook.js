/* ==========================================================
   ORION — FLASHCARDS & REVISION ENGINE
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const notebook =
        document.querySelector('.flashcards-notebook');

    if (!notebook) return;


    /* ========================================================
       ELEMENTS
       ======================================================== */

    const frontInput =
        document.getElementById('flashcardFront');

    const backInput =
        document.getElementById('flashcardBack');

    const hintInput =
        document.getElementById('flashcardHint');

    const difficultyInput =
        document.getElementById('flashcardDifficulty');

    const addBtn =
        document.getElementById('addFlashcardBtn');

    const clearBtn =
        document.getElementById('clearFlashcardBtn');

    const list =
        document.getElementById('flashcardList');

    const emptyState =
        document.getElementById('flashcardEmptyState');

    const searchInput =
        document.getElementById('flashcardSearch');

    const filterInput =
        document.getElementById('flashcardFilter');

    const shuffleBtn =
        document.getElementById('shuffleCardsBtn');

    const startRevisionBtn =
        document.getElementById('startRevisionBtn');


    /* Preview */

    const visual =
        document.getElementById('flashcardVisual');

    const previewQuestion =
        document.getElementById('previewQuestion');

    const previewAnswer =
        document.getElementById('previewAnswer');

    const previewHint =
        document.getElementById('previewHint');

    const previewCounter =
        document.getElementById('previewCounter');

    const revealBtn =
        document.getElementById('revealCardBtn');

    const previousBtn =
        document.getElementById('previousCardBtn');

    const nextBtn =
        document.getElementById('nextCardBtn');


    /* Dashboard */

    const totalCount =
        document.getElementById('totalCardsCount');

    const reviewedCount =
        document.getElementById('reviewedCardsCount');

    const dueCount =
        document.getElementById('dueCardsCount');

    const progressPercent =
        document.getElementById('progressPercent');

    const progressFill =
        document.getElementById('flashProgressFill');


    /* Quick revision */

    const overlay =
        document.getElementById('quickRevisionOverlay');

    const closeRevisionBtn =
        document.getElementById('closeRevisionBtn');

    const quickCounter =
        document.getElementById('quickRevisionCounter');

    const quickProgressFill =
        document.getElementById('quickProgressFill');

    const quickQuestion =
        document.getElementById('quickQuestion');

    const quickAnswer =
        document.getElementById('quickAnswer');

    const quickAnswerText =
        document.getElementById('quickAnswerText');

    const quickHint =
        document.getElementById('quickHint');

    const quickHintBtn =
        document.getElementById('quickHintBtn');

    const quickRevealBtn =
        document.getElementById('quickRevealBtn');

    const quickPreviousBtn =
        document.getElementById('quickPreviousBtn');

    const quickNextBtn =
        document.getElementById('quickNextBtn');


    /* ========================================================
       STATE
       ======================================================== */

    let cards =
        Array.isArray(window.ORION_FLASHCARDS_INITIAL)
            ? window.ORION_FLASHCARDS_INITIAL
            : [];


    cards = cards
        .filter(card => card && typeof card === 'object')
        .map(card => ({
            id:
                card.id ||
                makeId(),

            front:
                String(card.front || ''),

            back:
                String(card.back || ''),

            hint:
                String(card.hint || ''),

            difficulty:
                card.difficulty || 'Medium',

            rating:
                card.rating || '',

            reviewed:
                Boolean(card.reviewed),

            reviews:
                Number(card.reviews || 0),

            lastReviewed:
                card.lastReviewed || '',

            createdAt:
                card.createdAt || Date.now()
        }));


    let editingId = null;

    let previewIndex = 0;

    let quickIndex = 0;

    let quickCards = [];

    let isPreviewFlipped = false;


    /* ========================================================
       HELPERS
       ======================================================== */

    function makeId() {

        return (
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .slice(2, 8)
        );
    }


    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }


    function markChanged() {

        if (typeof window.ORION_MARK_CHANGED === 'function') {

            window.ORION_MARK_CHANGED();

        } else {

            const event =
                new Event('input', {
                    bubbles: true
                });

            frontInput?.dispatchEvent(event);
        }
    }


    function getFilteredCards() {

        const search =
            (searchInput?.value || '')
                .trim()
                .toLowerCase();

        const difficulty =
            filterInput?.value || 'all';

        return cards.filter(card => {

            const matchesSearch =
                !search ||
                card.front.toLowerCase().includes(search) ||
                card.back.toLowerCase().includes(search) ||
                card.hint.toLowerCase().includes(search);

            const matchesDifficulty =
                difficulty === 'all' ||
                card.difficulty === difficulty;

            return (
                matchesSearch &&
                matchesDifficulty
            );
        });
    }


    /* ========================================================
       FORM
       ======================================================== */

    function clearBuilder() {

        if (frontInput) frontInput.value = '';

        if (backInput) backInput.value = '';

        if (hintInput) hintInput.value = '';

        if (difficultyInput) {
            difficultyInput.value = 'Medium';
        }

        editingId = null;

        if (addBtn) {
            addBtn.textContent =
                '＋ Add Flashcard';
        }
    }


    function loadIntoBuilder(card) {

        if (!card) return;

        frontInput.value = card.front;

        backInput.value = card.back;

        hintInput.value = card.hint;

        difficultyInput.value =
            card.difficulty || 'Medium';

        editingId = card.id;

        addBtn.textContent =
            '✓ Update Flashcard';

        frontInput.focus();

        window.scrollTo({
            top:
                frontInput.getBoundingClientRect().top +
                window.scrollY -
                120,
            behavior: 'smooth'
        });
    }


    function addOrUpdateCard() {

        const front =
            frontInput.value.trim();

        const back =
            backInput.value.trim();

        const hint =
            hintInput.value.trim();

        const difficulty =
            difficultyInput.value;


        if (!front) {

            frontInput.focus();

            alert(
                'Please enter a question or concept first.'
            );

            return;
        }


        if (!back) {

            backInput.focus();

            alert(
                'Please enter the answer or explanation.'
            );

            return;
        }


        if (editingId) {

            const card =
                cards.find(
                    item => item.id === editingId
                );

            if (card) {

                card.front = front;
                card.back = back;
                card.hint = hint;
                card.difficulty = difficulty;
            }

        } else {

            cards.push({

                id: makeId(),

                front,

                back,

                hint,

                difficulty,

                rating: '',

                reviewed: false,

                reviews: 0,

                lastReviewed: '',

                createdAt: Date.now()
            });
        }


        markChanged();

        clearBuilder();

        previewIndex =
            Math.max(0, cards.length - 1);

        renderAll();
    }


    /* ========================================================
       CARD LIBRARY
       ======================================================== */

    function renderLibrary() {

        if (!list || !emptyState) return;

        const filtered =
            getFilteredCards();

        list.innerHTML = '';

        if (!filtered.length) {

            list.hidden = true;

            emptyState.hidden = false;

            return;
        }


        list.hidden = false;

        emptyState.hidden = true;


        filtered.forEach((card, index) => {

            const originalIndex =
                cards.findIndex(
                    item => item.id === card.id
                );


            const item =
                document.createElement('div');

            item.className =
                'flash-library-item';


            const difficultyClass =
                card.difficulty.toLowerCase();


            item.innerHTML = `

                <div class="flash-library-number">
                    ${String(index + 1).padStart(2, '0')}
                </div>

                <div class="flash-library-content">

                    <div class="flash-library-question">
                        ${escapeHtml(card.front)}
                    </div>

                    <div class="flash-library-meta">

                        <span
                            class="flash-difficulty ${difficultyClass}"
                        >
                            ${escapeHtml(card.difficulty)}
                        </span>

                        <span class="flash-library-status">
                            ${
                                card.reviewed
                                    ? '✓ Reviewed'
                                    : 'Not reviewed'
                            }
                        </span>

                    </div>

                </div>

                <div class="flash-library-actions">

                    <button
                        type="button"
                        class="flash-icon-btn"
                        data-action="preview"
                        data-index="${originalIndex}"
                        title="Preview"
                    >
                        👀
                    </button>

                    <button
                        type="button"
                        class="flash-icon-btn"
                        data-action="edit"
                        data-index="${originalIndex}"
                        title="Edit"
                    >
                        ✏️
                    </button>

                    <button
                        type="button"
                        class="flash-icon-btn delete"
                        data-action="delete"
                        data-index="${originalIndex}"
                        title="Delete"
                    >
                        🗑️
                    </button>

                </div>
            `;


            list.appendChild(item);
        });
    }


    list?.addEventListener('click', event => {

        const button =
            event.target.closest(
                '[data-action]'
            );

        if (!button) return;


        const index =
            Number(button.dataset.index);

        const action =
            button.dataset.action;


        if (!cards[index]) return;


        if (action === 'preview') {

            previewIndex = index;

            renderPreview();

            document
                .getElementById(
                    'flashcardPreviewSection'
                )
                ?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });

            return;
        }


        if (action === 'edit') {

            loadIntoBuilder(
                cards[index]
            );

            return;
        }


        if (action === 'delete') {

            if (
                !confirm(
                    'Delete this flashcard?'
                )
            ) {
                return;
            }

            cards.splice(index, 1);

            if (
                previewIndex >= cards.length
            ) {
                previewIndex =
                    Math.max(
                        0,
                        cards.length - 1
                    );
            }

            markChanged();

            renderAll();
        }

    });


    /* ========================================================
       PREVIEW
       ======================================================== */

    function renderPreview() {

        if (!previewQuestion) return;


        if (!cards.length) {

            previewCounter.textContent =
                'No cards';

            previewQuestion.textContent =
                'Add a flashcard to begin.';

            previewAnswer.textContent = '';

            previewHint.hidden = true;

            visual?.classList.remove(
                'is-flipped'
            );

            return;
        }


        if (
            previewIndex < 0 ||
            previewIndex >= cards.length
        ) {
            previewIndex = 0;
        }


        const card =
            cards[previewIndex];


        previewCounter.textContent =
            `${previewIndex + 1} / ${cards.length}`;


        previewQuestion.textContent =
            card.front;


        previewAnswer.textContent =
            card.back;


        if (card.hint) {

            previewHint.textContent =
                `💡 ${card.hint}`;

            previewHint.hidden = false;

        } else {

            previewHint.hidden = true;
        }


        visual?.classList.remove(
            'is-flipped'
        );

        isPreviewFlipped = false;

        revealBtn.textContent =
            '👀 Reveal Answer';
    }


    function revealPreview() {

        if (!cards.length) return;

        isPreviewFlipped =
            !isPreviewFlipped;

        visual?.classList.toggle(
            'is-flipped',
            isPreviewFlipped
        );


        revealBtn.textContent =
            isPreviewFlipped
                ? '↩ Show Question'
                : '👀 Reveal Answer';
    }


    function movePreview(direction) {

        if (!cards.length) return;

        previewIndex += direction;


        if (previewIndex < 0) {

            previewIndex =
                cards.length - 1;
        }


        if (previewIndex >= cards.length) {

            previewIndex = 0;
        }


        renderPreview();
    }


    /* ========================================================
       RATING
       ======================================================== */

    function rateCard(rating) {

        if (!cards.length) return;

        const card =
            cards[previewIndex];

        applyRating(card, rating);

        markChanged();

        renderAll();


        if (rating === 'Again') {

            return;
        }


        movePreview(1);
    }


    function applyRating(card, rating) {

        if (!card) return;

        card.rating = rating;

        card.reviewed = true;

        card.reviews =
            Number(card.reviews || 0) + 1;

        card.lastReviewed =
            new Date().toISOString();


        /*
         * Simple revision scheduling.
         * This is intentionally lightweight for now.
         */

        const intervals = {

            Again: 1,

            Hard: 2,

            Good: 4,

            Easy: 7
        };


        card.nextReview =
            new Date(
                Date.now() +
                intervals[rating] *
                24 *
                60 *
                60 *
                1000
            ).toISOString();
    }


    document
        .querySelectorAll(
            '.rating-btn'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    rateCard(
                        button.dataset.rating
                    );
                }
            );
        });


    /* ========================================================
       SHUFFLE
       ======================================================== */

    function shuffleCards() {

        if (cards.length < 2) return;


        for (
            let i = cards.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() * (i + 1)
                );

            [
                cards[i],
                cards[j]
            ] = [
                cards[j],
                cards[i]
            ];
        }


        previewIndex = 0;

        markChanged();

        renderAll();
    }


    /* ========================================================
       DASHBOARD
       ======================================================== */

    function updateDashboard() {

        const total =
            cards.length;

        const reviewed =
            cards.filter(
                card => card.reviewed
            ).length;


        const due =
            cards.filter(card => {

                if (!card.reviewed) {
                    return true;
                }

                if (!card.nextReview) {
                    return false;
                }

                return (
                    new Date(
                        card.nextReview
                    ) <= new Date()
                );

            }).length;


        const progress =
            total
                ? Math.round(
                    (reviewed / total) * 100
                )
                : 0;


        if (totalCount)
            totalCount.textContent = total;


        if (reviewedCount)
            reviewedCount.textContent =
                reviewed;


        if (dueCount)
            dueCount.textContent = due;


        if (progressPercent)
            progressPercent.textContent =
                `${progress}%`;


        if (progressFill)
            progressFill.style.width =
                `${progress}%`;
    }


    /* ========================================================
       QUICK REVISION
       ======================================================== */

    function openQuickRevision() {

        if (!cards.length) {

            alert(
                'Create at least one flashcard before starting revision.'
            );

            return;
        }


        /*
         * Prefer cards that have not been reviewed
         * or are due for review.
         */

        const due =
            cards.filter(card => {

                if (!card.reviewed) {
                    return true;
                }

                if (!card.nextReview) {
                    return false;
                }

                return (
                    new Date(
                        card.nextReview
                    ) <= new Date()
                );
            });


        quickCards =
            due.length
                ? [...due]
                : [...cards];


        quickIndex = 0;


        overlay.hidden = false;

        document.body.classList.add(
            'orion-flashcards-revision-open'
        );


        renderQuickCard();
    }


    function closeQuickRevision() {

        overlay.hidden = true;

        document.body.classList.remove(
            'orion-flashcards-revision-open'
        );
    }


    function renderQuickCard() {

        if (!quickCards.length) return;


        if (
            quickIndex < 0
        ) {
            quickIndex =
                quickCards.length - 1;
        }


        if (
            quickIndex >= quickCards.length
        ) {
            quickIndex = 0;
        }


        const card =
            quickCards[quickIndex];


        quickCounter.textContent =
            `${quickIndex + 1} / ${quickCards.length}`;


        const percentage =
            (
                (quickIndex + 1) /
                quickCards.length
            ) * 100;


        quickProgressFill.style.width =
            `${percentage}%`;


        quickQuestion.textContent =
            card.front;


        quickAnswerText.textContent =
            card.back;


        quickAnswer.hidden = true;

        quickHint.hidden = true;

        quickRevealBtn.textContent =
            'Reveal Answer';
    }


    function revealQuickCard() {

        if (!quickCards.length) return;


        const isHidden =
            quickAnswer.hidden;


        quickAnswer.hidden =
            !isHidden;


        quickRevealBtn.textContent =
            isHidden
                ? 'Hide Answer'
                : 'Reveal Answer';
    }


    function moveQuick(direction) {

        if (!quickCards.length) return;

        quickIndex += direction;

        renderQuickCard();
    }


    function rateQuick(rating) {

        if (!quickCards.length) return;


        const card =
            quickCards[quickIndex];


        applyRating(card, rating);

        markChanged();

        updateDashboard();

        renderLibrary();


        /*
         * Move forward after rating.
         */

        if (
            quickIndex <
            quickCards.length - 1
        ) {

            quickIndex++;

            renderQuickCard();

        } else {

            renderQuickCard();
        }
    }


    /* ========================================================
       QUICK REVISION EVENTS
       ======================================================== */

    startRevisionBtn?.addEventListener(
        'click',
        openQuickRevision
    );


    closeRevisionBtn?.addEventListener(
        'click',
        closeQuickRevision
    );


    quickRevealBtn?.addEventListener(
        'click',
        revealQuickCard
    );


    quickHintBtn?.addEventListener(
        'click',
        () => {

            const card =
                quickCards[quickIndex];

            if (!card?.hint) {

                quickHint.textContent =
                    'No hint was added for this card.';

            } else {

                quickHint.textContent =
                    `💡 ${card.hint}`;
            }

            quickHint.hidden =
                !quickHint.hidden;
        }
    );


    quickPreviousBtn?.addEventListener(
        'click',
        () => moveQuick(-1)
    );


    quickNextBtn?.addEventListener(
        'click',
        () => moveQuick(1)
    );


    document
        .querySelectorAll(
            '[data-quick-rating]'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    rateQuick(
                        button.dataset.quickRating
                    );
                }
            );
        });


    /* ========================================================
       KEYBOARD SHORTCUTS
       ======================================================== */

    document.addEventListener(
        'keydown',
        event => {

            if (
                overlay &&
                !overlay.hidden
            ) {

                if (
                    event.key === 'Escape'
                ) {

                    closeQuickRevision();

                    return;
                }


                if (
                    event.key === ' '
                ) {

                    event.preventDefault();

                    revealQuickCard();

                    return;
                }


                if (
                    event.key === 'ArrowLeft'
                ) {

                    moveQuick(-1);

                    return;
                }


                if (
                    event.key === 'ArrowRight'
                ) {

                    moveQuick(1);

                    return;
                }


                if (event.key === '1') {

                    rateQuick('Again');

                    return;
                }


                if (event.key === '2') {

                    rateQuick('Hard');

                    return;
                }


                if (event.key === '3') {

                    rateQuick('Good');

                    return;
                }


                if (event.key === '4') {

                    rateQuick('Easy');

                    return;
                }


                return;
            }


            /*
             * Don't hijack typing shortcuts.
             */

            const tag =
                document.activeElement?.tagName;

            if (
                tag === 'INPUT' ||
                tag === 'TEXTAREA' ||
                tag === 'SELECT'
            ) {
                return;
            }


            if (event.key === 'ArrowLeft') {

                movePreview(-1);

            } else if (
                event.key === 'ArrowRight'
            ) {

                movePreview(1);

            } else if (
                event.key === ' '
            ) {

                event.preventDefault();

                revealPreview();
            }
        }
    );


    /* ========================================================
       SAVE INTEGRATION
       ======================================================== */

    /*
     * notebook.js handles the actual POST.
     *
     * This listener runs in CAPTURE phase so the flashcard
     * state is placed into ORION_NOTE_STATE BEFORE notebook.js
     * serializes the page data.
     */

    const notebookForm =
        document.getElementById(
            'notebookForm'
        );


    notebookForm?.addEventListener(
        'submit',
        () => {

            if (!window.ORION_NOTE_STATE) {

                window.ORION_NOTE_STATE = {};
            }


            window.ORION_NOTE_STATE.flashcards =
                cards.map(card => ({
                    ...card
                }));

        },
        true
    );


    /* ========================================================
       FILTERS / SEARCH
       ======================================================== */

    searchInput?.addEventListener(
        'input',
        renderLibrary
    );


    filterInput?.addEventListener(
        'change',
        renderLibrary
    );


    shuffleBtn?.addEventListener(
        'click',
        shuffleCards
    );


    /* ========================================================
       BUILDER EVENTS
       ======================================================== */

    addBtn?.addEventListener(
        'click',
        addOrUpdateCard
    );


    clearBtn?.addEventListener(
        'click',
        clearBuilder
    );


    frontInput?.addEventListener(
        'keydown',
        event => {

            if (
                event.key === 'Enter' &&
                !event.shiftKey
            ) {

                event.preventDefault();

                addOrUpdateCard();
            }
        }
    );


    /* ========================================================
       PREVIEW EVENTS
       ======================================================== */

    visual?.addEventListener(
        'click',
        revealPreview
    );


    revealBtn?.addEventListener(
        'click',
        revealPreview
    );


    previousBtn?.addEventListener(
        'click',
        () => movePreview(-1)
    );


    nextBtn?.addEventListener(
        'click',
        () => movePreview(1)
    );


    /* ========================================================
       RENDER ALL
       ======================================================== */

    function renderAll() {

        renderLibrary();

        renderPreview();

        updateDashboard();
    }


    renderAll();

});