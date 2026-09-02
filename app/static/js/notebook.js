/* =========================================================
   ORION NOTEBOOK ENGINE
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // INITIAL SETUP
    // =========================================================

    const form = document.getElementById('notebookForm');

    if (!form) return;

    const root = document.querySelector('.notebook-page');
    const status = document.getElementById('saveStatus');
    const dataInput = document.getElementById('pageDataInput');

    let changed = false;

    let state = window.ORION_PAGE_DATA || {
        version: 2,
        content: '',
        fields: {},
        images: [],
        flowchart: '',
        visual: {
            nodes: [],
            edges: []
        }
    };


    state.fields = state.fields || {};
    state.images = state.images || [];

    state.visual = state.visual || {
        nodes: [],
        edges: []
    };


    /*
       =========================================================
       FLASHCARD STATE
       =========================================================

       Flashcards are stored INSIDE the page's JSON state.

       Every notebook page therefore gets its own independent
       collection of flashcards.

       Maximum:
       10 cards per page.
       =========================================================
    */

    if (!Array.isArray(state.flashcards)) {
        state.flashcards = [];
    }

    // Never allow more than 10 saved cards.
    state.flashcards = state.flashcards
        .slice(0, 10);


    if (!state.flashcardStats ||
        typeof state.flashcardStats !== 'object') {

        state.flashcardStats = {
            reviewed: 0,
            correct: 0,
            incorrect: 0
        };
    }


    window.ORION_NOTE_STATE = state;


    // =========================================================
    // COLLECT NOTEBOOK DATA
    // =========================================================

    function collect() {

        document
            .querySelectorAll('[data-note-field]')
            .forEach(el => {

                const key = el.dataset.noteField;


                if (el.matches('[contenteditable="true"]')) {

                    state.fields[key] =
                        el.innerHTML;

                } else if (el.type === 'checkbox') {

                    state.fields[key] =
                        el.checked;

                } else if (el.type !== 'file') {

                    state[key] =
                        el.value;
                }
            });


        state.version = 2;


        // -----------------------------------------------------
        // Flashcards
        // -----------------------------------------------------

        if (Array.isArray(state.flashcards)) {

            state.flashcards =
                state.flashcards
                    .slice(0, 10)
                    .map(card => ({
                        id:
                            card.id ||
                            createFlashcardId(),

                        front:
                            String(card.front || '').trim(),

                        back:
                            String(card.back || '').trim(),

                        hint:
                            String(card.hint || '').trim(),

                        difficulty:
                            card.difficulty ||
                            'Medium',

                        tags:
                            String(card.tags || '').trim(),

                        mastered:
                            Boolean(card.mastered),

                        reviews:
                            Number(card.reviews) || 0,

                        correct:
                            Number(card.correct) || 0,

                        incorrect:
                            Number(card.incorrect) || 0,

                        lastReviewedAt:
                            card.lastReviewedAt ||
                            null
                    }))
                    .filter(card =>
                        card.front ||
                        card.back
                    );
        }


        if (!state.flashcardStats ||
            typeof state.flashcardStats !== 'object') {

            state.flashcardStats = {
                reviewed: 0,
                correct: 0,
                incorrect: 0
            };
        }


        // -----------------------------------------------------
        // Collect Table Data
        // -----------------------------------------------------

        const collectTable = (id) => {

            const t =
                document.getElementById(id);

            return t
                ? [...t.querySelectorAll('tbody tr')]
                    .map(row =>
                        [...row.cells]
                            .map(cell =>
                                cell.innerText
                            )
                    )
                : [];
        };


        if (document.getElementById('theoryTable')) {

            state.table =
                collectTable('theoryTable');
        }


        if (document.getElementById('dsaTable')) {

            state.table =
                collectTable('dsaTable');
        }


        if (document.getElementById('generalTable')) {

            state.table =
                collectTable('generalTable');
        }


        // -----------------------------------------------------
        // Math Steps
        // -----------------------------------------------------

        const steps =
            document.getElementById('mathSteps');

        if (steps) {

            state.math_steps =
                [...steps.querySelectorAll('textarea')]
                    .map(x => x.value);
        }


        // -----------------------------------------------------
        // Checklist
        // -----------------------------------------------------

        const checklist =
            document.getElementById('checklist');

        if (checklist) {

            state.fields.checklist =
                [...checklist.querySelectorAll('.check-row')]
                    .map(row => ({
                        done:
                            row.querySelector('input')?.checked ||
                            false,

                        text:
                            row.querySelector('span')?.innerText ||
                            ''
                    }));
        }


        // -----------------------------------------------------
        // Milestones
        // -----------------------------------------------------

        const milestones =
            document.getElementById('milestones');

        if (milestones) {

            state.fields.milestones =
                [...milestones.querySelectorAll('.milestone-row')]
                    .map(row => ({
                        done:
                            row.querySelector(
                                'input[type=checkbox]'
                            )?.checked ||
                            false,

                        title:
                            row.querySelectorAll('input')[1]?.value ||
                            '',

                        date:
                            row.querySelector(
                                'input[type=date]'
                            )?.value ||
                            ''
                    }));
        }


        return state;
    }


    // =========================================================
    // FLASHCARD ID GENERATOR
    // =========================================================

    function createFlashcardId() {

        if (
            window.crypto &&
            typeof window.crypto.randomUUID === 'function'
        ) {
            return window.crypto.randomUUID();
        }

        return (
            'card-' +
            Date.now() +
            '-' +
            Math.random()
                .toString(36)
                .slice(2)
        );
    }


    // =========================================================
    // CHANGE / SAVE STATUS
    // =========================================================

    function markChanged() {

        changed = true;

        if (status) {

            status.textContent =
                '● Unsaved changes';

            status.classList.remove('saved');
        }
    }


    // ---------------------------------------------------------
    // Detect Changes
    // ---------------------------------------------------------

    form
        .querySelectorAll(
            'input, textarea, select, [contenteditable="true"]'
        )
        .forEach(el => {

            el.addEventListener(
                'input',
                markChanged
            );

            el.addEventListener(
                'change',
                markChanged
            );
        });


    // =========================================================
    // FORM SUBMIT
    // =========================================================

    /*
       IMPORTANT:

       This listener uses CAPTURE mode.

       Flashcard-specific JavaScript can therefore update
       window.ORION_NOTE_STATE.flashcards before this notebook
       engine serializes the state into pageDataInput.
    */

    form.addEventListener(
        'submit',
        () => {

            collect();

            dataInput.value =
                JSON.stringify(state);

            changed = false;

            if (status) {

                status.textContent =
                    '● Saving...';
            }
        },
        true
    );


    // =========================================================
    // UNSAVED CHANGES WARNING
    // =========================================================

    window.addEventListener(
        'beforeunload',
        e => {

            if (changed) {

                e.preventDefault();

                e.returnValue = '';
            }
        }
    );


    // =========================================================
    // IMAGE MANAGEMENT
    // =========================================================

    const imageInput =
        document.getElementById(
            'noteImageInput'
        );

    const imageBtn =
        document.getElementById(
            'insertImageBtn'
        );

    const gallery =
        document.getElementById(
            'imageGallery'
        );


    // ---------------------------------------------------------
    // Render Images
    // ---------------------------------------------------------

    function renderImages() {

        if (!gallery) return;

        gallery.innerHTML = '';


        state.images.forEach(
            (img, i) => {

                const wrap =
                    document.createElement(
                        'figure'
                    );

                wrap.className =
                    'note-image-item';


                const im =
                    document.createElement(
                        'img'
                    );

                im.src =
                    img.data;

                im.alt =
                    img.name ||
                    'Notebook image';


                const cap =
                    document.createElement(
                        'figcaption'
                    );

                cap.textContent =
                    img.name ||
                    'Image';


                const del =
                    document.createElement(
                        'button'
                    );

                del.type =
                    'button';

                del.textContent =
                    '×';

                del.title =
                    'Remove';


                del.onclick = () => {

                    state.images.splice(
                        i,
                        1
                    );

                    renderImages();

                    markChanged();
                };


                wrap.append(
                    im,
                    cap,
                    del
                );

                gallery.appendChild(
                    wrap
                );
            }
        );
    }


    // ---------------------------------------------------------
    // Image Upload
    // ---------------------------------------------------------

    if (
        imageBtn &&
        imageInput
    ) {

        imageBtn.onclick = () => {

            imageInput.click();
        };


        imageInput.onchange = () => {

            [
                ...imageInput.files
            ].forEach(file => {

                const reader =
                    new FileReader();


                reader.onload = e => {

                    state.images.push({

                        name:
                            file.name,

                        data:
                            e.target.result
                    });


                    renderImages();

                    markChanged();
                };


                reader.readAsDataURL(
                    file
                );
            });


            imageInput.value = '';
        };
    }


    renderImages();


    // =========================================================
    // SETTINGS PANELS
    // =========================================================

    document
        .querySelectorAll('.panel-close')
        .forEach(b => {

            b.onclick = () => {

                b
                    .closest(
                        '.notebook-settings-panel'
                    )
                    .hidden = true;
            };
        });


    const settings =
        document.getElementById(
            'notebookSettingsPanel'
        );


    const share =
        document.getElementById(
            'shareSettingsPanel'
        );


    document
        .getElementById(
            'openNotebookSettings'
        )
        ?.addEventListener(
            'click',
            () => {

                if (settings) {
                    settings.hidden = false;
                }
            }
        );


    document
        .getElementById(
            'openShareSettings'
        )
        ?.addEventListener(
            'click',
            () => {

                if (share) {
                    share.hidden = false;
                }
            }
        );


    // =========================================================
    // DELETE PAGE
    // =========================================================

    document
        .getElementById(
            'deletePageButton'
        )
        ?.addEventListener(
            'click',
            () => {

                if (
                    confirm(
                        'Delete this page?'
                    )
                ) {

                    document
                        .getElementById(
                            'deletePageForm'
                        )
                        .submit();
                }
            }
        );


    // =========================================================
    // RICH TEXT TOOLBAR
    // =========================================================

    document
        .querySelectorAll(
            '.rich-toolbar'
        )
        .forEach(toolbar => {

            const editor =
                document.getElementById(
                    toolbar.dataset.editor
                );


            if (!editor) return;


            toolbar
                .querySelectorAll('button')
                .forEach(btn => {

                    btn.addEventListener(
                        'click',
                        () => {

                            editor.focus();


                            const cmd =
                                btn.dataset.cmd;


                            if (
                                cmd ===
                                'createLink'
                            ) {

                                const u =
                                    prompt(
                                        'Link URL'
                                    );


                                if (u) {

                                    document.execCommand(
                                        'createLink',
                                        false,
                                        u
                                    );
                                }

                            } else if (
                                cmd ===
                                'formatBlock'
                            ) {

                                document.execCommand(
                                    cmd,
                                    false,
                                    btn.dataset.value
                                );

                            } else {

                                document.execCommand(
                                    cmd,
                                    false,
                                    null
                                );
                            }


                            markChanged();
                        }
                    );
                });
        });


    // =========================================================
    // GENERIC TABLE HELPERS
    // =========================================================

    function addRow(
        table,
        cells = 3
    ) {

        if (!table) return;


        const tr =
            document.createElement(
                'tr'
            );


        for (
            let i = 0;
            i < cells;
            i++
        ) {

            const td =
                document.createElement(
                    'td'
                );

            td.contentEditable =
                'true';


            if (
                i === 0 &&
                table.id ===
                    'dsaTable'
            ) {

                td.textContent =
                    table
                        .tBodies[0]
                        .rows
                        .length +
                    1;
            }


            tr.appendChild(td);
        }


        table
            .tBodies[0]
            .appendChild(tr);


        markChanged();
    }


    document
        .getElementById(
            'addTheoryRow'
        )
        ?.addEventListener(
            'click',
            () => {

                addRow(
                    document.getElementById(
                        'theoryTable'
                    ),
                    3
                );
            }
        );


    document
        .getElementById(
            'addDsaRow'
        )
        ?.addEventListener(
            'click',
            () => {

                addRow(
                    document.getElementById(
                        'dsaTable'
                    ),
                    4
                );
            }
        );


    document
        .getElementById(
            'addGeneralRow'
        )
        ?.addEventListener(
            'click',
            () => {

                addRow(
                    document.getElementById(
                        'generalTable'
                    ),
                    3
                );
            }
        );


    // =========================================================
    // CHECKLIST
    // =========================================================

    document
        .getElementById(
            'addChecklist'
        )
        ?.addEventListener(
            'click',
            () => {

                const c =
                    document.getElementById(
                        'checklist'
                    );


                if (!c) return;


                const row =
                    document.createElement(
                        'label'
                    );

                row.className =
                    'check-row';


                row.innerHTML =
                    '<input type="checkbox">' +
                    '<span contenteditable="true">' +
                    'New task' +
                    '</span>';


                c.appendChild(
                    row
                );


                markChanged();
            }
        );


    // =========================================================
    // MILESTONES
    // =========================================================

    document
        .getElementById(
            'addMilestone'
        )
        ?.addEventListener(
            'click',
            () => {

                const c =
                    document.getElementById(
                        'milestones'
                    );


                if (!c) return;


                const row =
                    document.createElement(
                        'div'
                    );

                row.className =
                    'milestone-row';


                row.innerHTML =
                    '<input type="checkbox">' +
                    '<input placeholder="Milestone title">' +
                    '<input type="date">';


                c.appendChild(
                    row
                );


                markChanged();
            }
        );


    // =========================================================
    // THEORY CHART
    // =========================================================

    const chartCanvas =
        document.getElementById(
            'theoryChart'
        );


    let theoryChart =
        null;


    document
        .getElementById(
            'renderTheoryChart'
        )
        ?.addEventListener(
            'click',
            () => {

                if (
                    !chartCanvas ||
                    !window.Chart
                ) {
                    return;
                }


                const labels =
                    (
                        document
                            .getElementById(
                                'chartLabels'
                            )
                            ?.value ||
                        ''
                    )
                        .split(',')
                        .map(
                            x =>
                                x.trim()
                        )
                        .filter(Boolean);


                const values =
                    (
                        document
                            .getElementById(
                                'chartValues'
                            )
                            ?.value ||
                        ''
                    )
                        .split(',')
                        .map(Number)
                        .filter(
                            x =>
                                !Number.isNaN(
                                    x
                                )
                        );


                if (theoryChart) {

                    theoryChart.destroy();
                }


                theoryChart =
                    new Chart(
                        chartCanvas,
                        {

                            type:
                                document
                                    .getElementById(
                                        'theoryChartType'
                                    )
                                    ?.value ||
                                'bar',


                            data: {

                                labels,

                                datasets: [
                                    {
                                        label:
                                            'Data',

                                        data:
                                            values
                                    }
                                ]
                            },


                            options: {

                                responsive:
                                    true,

                                maintainAspectRatio:
                                    false
                            }
                        }
                    );


                window.ORION_NOTE_STATE.chart = {

                    type:
                        document
                            .getElementById(
                                'theoryChartType'
                            )
                            ?.value ||
                        'bar',

                    labels,

                    values
                };


                markChanged();
            }
        );


    // ---------------------------------------------------------
    // Restore Saved Chart Inputs
    // ---------------------------------------------------------

    if (
        window.ORION_NOTE_STATE?.chart &&
        chartCanvas &&
        window.Chart
    ) {

        const c =
            window.ORION_NOTE_STATE.chart;


        if (
            document.getElementById(
                'chartLabels'
            )
        ) {

            document
                .getElementById(
                    'chartLabels'
                )
                .value =
                c.labels.join(
                    ', '
                );
        }


        if (
            document.getElementById(
                'chartValues'
            )
        ) {

            document
                .getElementById(
                    'chartValues'
                )
                .value =
                c.values.join(
                    ', '
                );
        }
    }


    // =========================================================
    // GLOBAL ORION HELPERS
    // =========================================================

    window.ORION_COLLECT_TABLE =
        (id) => {

            const t =
                document.getElementById(
                    id
                );


            return t
                ? [
                    ...t
                        .tBodies[0]
                        .rows
                ]
                    .map(row =>
                        [
                            ...row.cells
                        ]
                            .map(
                                cell =>
                                    cell.innerText
                            )
                    )
                : [];
        };


    window.ORION_MARK_CHANGED =
        markChanged;


    // =========================================================
    // FLASHCARD HELPERS
    // =========================================================

    /*
       These helpers are exposed globally so the dedicated
       flashcards JavaScript can use the same notebook state.
    */


    window.ORION_FLASHCARD_LIMIT =
        10;


    window.ORION_GET_FLASHCARDS =
        () => {

            if (
                !Array.isArray(
                    state.flashcards
                )
            ) {

                state.flashcards = [];
            }


            return state.flashcards;
        };


    window.ORION_SET_FLASHCARDS =
        cards => {

            if (!Array.isArray(cards)) {

                state.flashcards = [];

                markChanged();

                return;
            }


            state.flashcards =
                cards
                    .slice(0, 10)
                    .map(card => ({

                        id:
                            card.id ||
                            createFlashcardId(),

                        front:
                            String(
                                card.front ||
                                ''
                            ).trim(),

                        back:
                            String(
                                card.back ||
                                ''
                            ).trim(),

                        hint:
                            String(
                                card.hint ||
                                ''
                            ).trim(),

                        difficulty:
                            card.difficulty ||
                            'Medium',

                        tags:
                            String(
                                card.tags ||
                                ''
                            ).trim(),

                        mastered:
                            Boolean(
                                card.mastered
                            ),

                        reviews:
                            Number(
                                card.reviews
                            ) || 0,

                        correct:
                            Number(
                                card.correct
                            ) || 0,

                        incorrect:
                            Number(
                                card.incorrect
                            ) || 0,

                        lastReviewedAt:
                            card.lastReviewedAt ||
                            null
                    }))
                    .filter(
                        card =>
                            card.front ||
                            card.back
                    );


            markChanged();
        };


    window.ORION_UPDATE_FLASHCARD =
        (id, updates) => {

            if (
                !Array.isArray(
                    state.flashcards
                )
            ) {
                state.flashcards = [];
            }


            const index =
                state.flashcards.findIndex(
                    card =>
                        card.id === id
                );


            if (index === -1) {
                return;
            }


            state.flashcards[index] = {

                ...state.flashcards[index],

                ...updates
            };


            markChanged();
        };


    window.ORION_DELETE_FLASHCARD =
        id => {

            if (
                !Array.isArray(
                    state.flashcards
                )
            ) {
                return;
            }


            state.flashcards =
                state.flashcards.filter(
                    card =>
                        card.id !== id
                );


            markChanged();
        };


    window.ORION_FLASHCARD_STATS =
        () => {

            if (
                !state.flashcardStats ||
                typeof state.flashcardStats !==
                    'object'
            ) {

                state.flashcardStats = {

                    reviewed: 0,

                    correct: 0,

                    incorrect: 0
                };
            }


            return state.flashcardStats;
        };


    window.ORION_UPDATE_FLASHCARD_STATS =
        updates => {

            if (
                !state.flashcardStats ||
                typeof state.flashcardStats !==
                    'object'
            ) {

                state.flashcardStats = {

                    reviewed: 0,

                    correct: 0,

                    incorrect: 0
                };
            }


            state.flashcardStats = {

                ...state.flashcardStats,

                ...updates
            };


            markChanged();
        };


    // =========================================================
    // NOTEBOOK ACCENT COLOR
    // =========================================================

    if (root) {

        root.style.setProperty(
            '--notebook-accent',
            root.dataset.notebookColor ||
            '#9b8ddd'
        );
    }

});