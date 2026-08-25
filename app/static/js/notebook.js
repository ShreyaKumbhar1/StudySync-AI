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

                    state.fields[key] = el.innerHTML;

                } else if (el.type === 'checkbox') {

                    state.fields[key] = el.checked;

                } else if (el.type !== 'file') {

                    state[key] = el.value;
                }
            });


        state.version = 2;


        // -----------------------------------------------------
        // Collect Table Data
        // -----------------------------------------------------

        const collectTable = (id) => {

            const t = document.getElementById(id);

            return t
                ? [...t.querySelectorAll('tbody tr')]
                    .map(row =>
                        [...row.cells]
                            .map(cell => cell.innerText)
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
                            )?.checked || false,

                        title:
                            row.querySelectorAll('input')[1]?.value ||
                            '',

                        date:
                            row.querySelector(
                                'input[type=date]'
                            )?.value || ''
                    }));
        }


        return state;
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


    // ---------------------------------------------------------
    // Form Submit
    // ---------------------------------------------------------

    form.addEventListener('submit', () => {

        collect();

        dataInput.value =
            JSON.stringify(state);

        changed = false;

        if (status) {
            status.textContent =
                '● Saving...';
        }
    });


    // ---------------------------------------------------------
    // Unsaved Changes Warning
    // ---------------------------------------------------------

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
        document.getElementById('noteImageInput');

    const imageBtn =
        document.getElementById('insertImageBtn');

    const gallery =
        document.getElementById('imageGallery');


    // ---------------------------------------------------------
    // Render Images
    // ---------------------------------------------------------

    function renderImages() {

        if (!gallery) return;

        gallery.innerHTML = '';


        state.images.forEach((img, i) => {

            const wrap =
                document.createElement('figure');

            wrap.className =
                'note-image-item';


            const im =
                document.createElement('img');

            im.src = img.data;

            im.alt =
                img.name || 'Notebook image';


            const cap =
                document.createElement('figcaption');

            cap.textContent =
                img.name || 'Image';


            const del =
                document.createElement('button');

            del.type = 'button';
            del.textContent = '×';
            del.title = 'Remove';


            del.onclick = () => {

                state.images.splice(i, 1);

                renderImages();

                markChanged();
            };


            wrap.append(
                im,
                cap,
                del
            );

            gallery.appendChild(wrap);
        });
    }


    // ---------------------------------------------------------
    // Image Upload
    // ---------------------------------------------------------

    if (imageBtn && imageInput) {

        imageBtn.onclick = () => {
            imageInput.click();
        };


        imageInput.onchange = () => {

            [...imageInput.files].forEach(file => {

                const reader =
                    new FileReader();


                reader.onload = e => {

                    state.images.push({
                        name: file.name,
                        data: e.target.result
                    });


                    renderImages();

                    markChanged();
                };


                reader.readAsDataURL(file);
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
                    .closest('.notebook-settings-panel')
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
        .getElementById('openNotebookSettings')
        ?.addEventListener(
            'click',
            () => {
                settings.hidden = false;
            }
        );


    document
        .getElementById('openShareSettings')
        ?.addEventListener(
            'click',
            () => {
                share.hidden = false;
            }
        );


    // ---------------------------------------------------------
    // Delete Page
    // ---------------------------------------------------------

    document
        .getElementById('deletePageButton')
        ?.addEventListener(
            'click',
            () => {

                if (confirm('Delete this page?')) {

                    document
                        .getElementById('deletePageForm')
                        .submit();
                }
            }
        );


    // =========================================================
    // RICH TEXT TOOLBAR
    // =========================================================

    document
        .querySelectorAll('.rich-toolbar')
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


                            if (cmd === 'createLink') {

                                const u =
                                    prompt('Link URL');


                                if (u) {

                                    document.execCommand(
                                        'createLink',
                                        false,
                                        u
                                    );
                                }

                            } else if (
                                cmd === 'formatBlock'
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

    function addRow(table, cells = 3) {

        const tr =
            document.createElement('tr');


        for (let i = 0; i < cells; i++) {

            const td =
                document.createElement('td');

            td.contentEditable = 'true';


            if (
                i === 0 &&
                table.id === 'dsaTable'
            ) {

                td.textContent =
                    table.tBodies[0].rows.length + 1;
            }


            tr.appendChild(td);
        }


        table
            .tBodies[0]
            .appendChild(tr);


        markChanged();
    }


    document
        .getElementById('addTheoryRow')
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
        .getElementById('addDsaRow')
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
        .getElementById('addGeneralRow')
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
        .getElementById('addChecklist')
        ?.addEventListener(
            'click',
            () => {

                const c =
                    document.getElementById(
                        'checklist'
                    );


                const row =
                    document.createElement('label');

                row.className =
                    'check-row';


                row.innerHTML =
                    '<input type="checkbox">' +
                    '<span contenteditable="true">' +
                    'New task' +
                    '</span>';


                c.appendChild(row);

                markChanged();
            }
        );


    // =========================================================
    // MILESTONES
    // =========================================================

    document
        .getElementById('addMilestone')
        ?.addEventListener(
            'click',
            () => {

                const c =
                    document.getElementById(
                        'milestones'
                    );


                const row =
                    document.createElement('div');

                row.className =
                    'milestone-row';


                row.innerHTML =
                    '<input type="checkbox">' +
                    '<input placeholder="Milestone title">' +
                    '<input type="date">';


                c.appendChild(row);

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

    let theoryChart = null;


    document
        .getElementById('renderTheoryChart')
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
                        document.getElementById(
                            'chartLabels'
                        )?.value || ''
                    )
                        .split(',')
                        .map(x => x.trim())
                        .filter(Boolean);


                const values =
                    (
                        document.getElementById(
                            'chartValues'
                        )?.value || ''
                    )
                        .split(',')
                        .map(Number)
                        .filter(
                            x => !Number.isNaN(x)
                        );


                if (theoryChart) {
                    theoryChart.destroy();
                }


                theoryChart =
                    new Chart(
                        chartCanvas,
                        {
                            type:
                                document.getElementById(
                                    'theoryChartType'
                                )?.value || 'bar',

                            data: {
                                labels,

                                datasets: [
                                    {
                                        label: 'Data',
                                        data: values
                                    }
                                ]
                            },

                            options: {
                                responsive: true,
                                maintainAspectRatio: false
                            }
                        }
                    );


                window.ORION_NOTE_STATE.chart = {
                    type:
                        document.getElementById(
                            'theoryChartType'
                        )?.value || 'bar',

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

            document.getElementById(
                'chartLabels'
            ).value =
                c.labels.join(', ');
        }


        if (
            document.getElementById(
                'chartValues'
            )
        ) {

            document.getElementById(
                'chartValues'
            ).value =
                c.values.join(', ');
        }
    }


    // =========================================================
    // GLOBAL ORION HELPERS
    // =========================================================

    window.ORION_COLLECT_TABLE = (id) => {

        const t =
            document.getElementById(id);


        return t
            ? [...t.tBodies[0].rows]
                .map(row =>
                    [...row.cells]
                        .map(cell => cell.innerText)
                )
            : [];
    };


    window.ORION_MARK_CHANGED =
        markChanged;


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