/* =========================================================
   ORION GENERAL NOTEBOOK
   Fonts • Dynamic Tables • Functional Checklists
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    const editor = document.getElementById('generalEditor');

    if (!editor) return;


    /* =====================================================
       HELPERS
       ===================================================== */

    const markChanged = () => {

        if (typeof window.ORION_MARK_CHANGED === 'function') {
            window.ORION_MARK_CHANGED();
        }
    };


    const saveSelection = () => {

        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0) {
            return null;
        }

        return selection.getRangeAt(0);
    };


    const restoreSelection = range => {

        if (!range) return;

        const selection = window.getSelection();

        selection.removeAllRanges();
        selection.addRange(range);
    };


    const runCommand = (command, value = null) => {

        editor.focus();

        document.execCommand(
            command,
            false,
            value
        );

        markChanged();
    };


    /* =====================================================
       FONT FAMILY
       ===================================================== */

    const fontSelect =
        document.getElementById('generalFontFamily');


    if (fontSelect) {

        fontSelect.addEventListener(
            'change',
            () => {

                runCommand(
                    'fontName',
                    fontSelect.value
                );

            }
        );


        Array.from(fontSelect.options).forEach(
            option => {

                option.style.fontFamily =
                    `"${option.value}", sans-serif`;

            }
        );

    }



    /* =====================================================
       FONT SIZE
       ===================================================== */

    const fontSize =
        document.getElementById('generalFontSize');


    if (fontSize) {

        fontSize.addEventListener(
            'change',
            () => {

                runCommand(
                    'fontSize',
                    fontSize.value
                );

            }
        );

    }



    /* =====================================================
       TEXT COLOR
       ===================================================== */

    const textColor =
        document.getElementById('generalTextColor');


    if (textColor) {

        textColor.addEventListener(
            'input',
            () => {

                runCommand(
                    'foreColor',
                    textColor.value
                );

            }
        );

    }



    /* =====================================================
       HIGHLIGHT COLOR
       ===================================================== */

    const highlightColor =
        document.getElementById(
            'generalHighlightColor'
        );


    if (highlightColor) {

        highlightColor.addEventListener(
            'input',
            () => {

                editor.focus();

                document.execCommand(
                    'hiliteColor',
                    false,
                    highlightColor.value
                );

                markChanged();

            }
        );

    }



    /* =====================================================
       HEADINGS / BASIC TOOLBAR
       ===================================================== */

    document
        .querySelectorAll(
            '.general-rich-toolbar button'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    const command =
                        button.dataset.cmd;

                    if (!command) return;


                    editor.focus();


                    if (command === 'createLink') {

                        const url =
                            prompt(
                                'Enter the URL:'
                            );

                        if (!url) return;


                        document.execCommand(
                            'createLink',
                            false,
                            url
                        );

                    }

                    else if (
                        command === 'formatBlock'
                    ) {

                        document.execCommand(
                            'formatBlock',
                            false,
                            button.dataset.value
                        );

                    }

                    else {

                        document.execCommand(
                            command,
                            false,
                            null
                        );

                    }


                    markChanged();

                }
            );

        });



    /* =====================================================
       CHECKLIST
       ===================================================== */

    const checklist =
        document.getElementById('checklist');

    const addChecklist =
        document.getElementById('addChecklist');

    const checklistProgress =
        document.getElementById(
            'checklistProgress'
        );

    const checklistEmpty =
        document.getElementById(
            'checklistEmpty'
        );


    function updateChecklistProgress() {

        if (!checklist) return;


        const rows =
            checklist.querySelectorAll(
                '.check-row'
            );


        const completed =
            checklist.querySelectorAll(
                '.check-row input[type="checkbox"]:checked'
            ).length;


        if (checklistProgress) {

            checklistProgress.textContent =
                `${completed} / ${rows.length}`;

        }


        if (checklistEmpty) {

            checklistEmpty.style.display =
                rows.length === 0
                    ? 'flex'
                    : 'none';

        }


        rows.forEach(row => {

            const checkbox =
                row.querySelector(
                    'input[type="checkbox"]'
                );


            row.classList.toggle(
                'completed',
                checkbox?.checked || false
            );

        });

    }


    function createChecklistItem(
        text = 'New task',
        done = false
    ) {

        if (!checklist) return;


        const row =
            document.createElement('div');


        row.className =
            'check-row';


        row.innerHTML = `

            <input
                type="checkbox"
                class="check-item-box"
                ${done ? 'checked' : ''}
            >

            <span
                class="check-item-text"
                contenteditable="true"
                spellcheck="true"
            ></span>

            <button
                type="button"
                class="check-delete"
                title="Delete task"
                aria-label="Delete task"
            >
                ×
            </button>

        `;


        const textElement =
            row.querySelector(
                '.check-item-text'
            );


        textElement.textContent =
            text;


        const checkbox =
            row.querySelector(
                '.check-item-box'
            );


        const deleteButton =
            row.querySelector(
                '.check-delete'
            );


        checkbox.addEventListener(
            'change',
            () => {

                row.classList.toggle(
                    'completed',
                    checkbox.checked
                );

                updateChecklistProgress();

                markChanged();

            }
        );


        textElement.addEventListener(
            'input',
            markChanged
        );


        textElement.addEventListener(
            'keydown',
            event => {

                if (
                    event.key === 'Enter'
                ) {

                    event.preventDefault();

                    createChecklistItem(
                        '',
                        false
                    );

                }

            }
        );


        deleteButton.addEventListener(
            'click',
            () => {

                row.remove();

                updateChecklistProgress();

                markChanged();

            }
        );


        checklist.appendChild(row);


        updateChecklistProgress();


        if (text === '') {

            textElement.focus();

        }

    }


    if (addChecklist) {

        addChecklist.addEventListener(
            'click',
            () => {

                createChecklistItem();

                markChanged();

            }
        );

    }



    /* =====================================================
       RESTORE CHECKLIST FROM SAVED STATE
       ===================================================== */

    const savedChecklist =
        window.ORION_NOTE_STATE
            ?.fields
            ?.checklist;


    if (
        Array.isArray(savedChecklist) &&
        savedChecklist.length
    ) {

        savedChecklist.forEach(item => {

            createChecklistItem(
                item.text || '',
                Boolean(item.done)
            );

        });

    }



    /* =====================================================
       QUICK TABLE
       ===================================================== */

    const table =
        document.getElementById(
            'generalTable'
        );


    const tbody =
        table?.querySelector('tbody');


    const createTableButton =
        document.getElementById(
            'createGeneralTable'
        );


    const tableBuilder =
        document.getElementById(
            'tableBuilder'
        );


    const generateTable =
        document.getElementById(
            'generateGeneralTable'
        );


    const cancelTable =
        document.getElementById(
            'cancelTableBuilder'
        );


    const tableRows =
        document.getElementById(
            'tableRows'
        );


    const tableColumns =
        document.getElementById(
            'tableColumns'
        );


    const tableActions =
        document.getElementById(
            'generalTableActions'
        );


    const tableEmpty =
        document.getElementById(
            'tableEmpty'
        );



    function createCell(
        value = ''
    ) {

        const cell =
            document.createElement('td');


        cell.contentEditable =
            'true';


        cell.spellcheck =
            true;


        cell.textContent =
            value;


        cell.addEventListener(
            'input',
            markChanged
        );


        return cell;

    }



    function createTable(
        rows,
        columns,
        existingData = null
    ) {

        if (!tbody) return;


        rows =
            Math.max(
                1,
                Math.min(
                    30,
                    Number(rows) || 1
                )
            );


        columns =
            Math.max(
                1,
                Math.min(
                    15,
                    Number(columns) || 1
                )
            );


        tbody.innerHTML = '';


        for (
            let r = 0;
            r < rows;
            r++
        ) {

            const tr =
                document.createElement('tr');


            for (
                let c = 0;
                c < columns;
                c++
            ) {

                const value =
                    existingData?.[r]?.[c] ||
                    '';


                tr.appendChild(
                    createCell(value)
                );

            }


            tbody.appendChild(tr);

        }


        if (tableActions) {
            tableActions.hidden = false;
        }


        if (tableEmpty) {
            tableEmpty.style.display =
                'none';
        }


        markChanged();

    }



    function getTableSize() {

        const rows =
            tbody?.querySelectorAll(
                'tr'
            ).length || 0;


        const columns =
            tbody?.querySelector(
                'tr'
            )?.cells.length || 0;


        return {
            rows,
            columns
        };

    }



    if (createTableButton) {

        createTableButton.addEventListener(
            'click',
            () => {

                if (tableBuilder) {

                    tableBuilder.hidden =
                        !tableBuilder.hidden;

                }

            }
        );

    }



    if (cancelTable) {

        cancelTable.addEventListener(
            'click',
            () => {

                tableBuilder.hidden =
                    true;

            }
        );

    }



    if (generateTable) {

        generateTable.addEventListener(
            'click',
            () => {

                createTable(
                    tableRows?.value,
                    tableColumns?.value
                );


                tableBuilder.hidden =
                    true;

            }
        );

    }



    /* =====================================================
       ADD ROW
       ===================================================== */

    document
        .getElementById('addGeneralRow')
        ?.addEventListener(
            'click',
            () => {

                if (!tbody) return;


                const size =
                    getTableSize();


                if (
                    size.columns === 0
                ) {

                    createTable(1, 1);

                    return;

                }


                const tr =
                    document.createElement('tr');


                for (
                    let i = 0;
                    i < size.columns;
                    i++
                ) {

                    tr.appendChild(
                        createCell()
                    );

                }


                tbody.appendChild(tr);

                markChanged();

            }
        );



    /* =====================================================
       ADD COLUMN
       ===================================================== */

    document
        .getElementById(
            'addGeneralColumn'
        )
        ?.addEventListener(
            'click',
            () => {

                if (!tbody) return;


                const size =
                    getTableSize();


                if (size.rows === 0) {

                    createTable(1, 1);

                    return;

                }


                tbody
                    .querySelectorAll('tr')
                    .forEach(row => {

                        row.appendChild(
                            createCell()
                        );

                    });


                markChanged();

            }
        );



    /* =====================================================
       DELETE ROW
       ===================================================== */

    document
        .getElementById(
            'deleteGeneralRow'
        )
        ?.addEventListener(
            'click',
            () => {

                if (!tbody) return;


                const rows =
                    tbody.querySelectorAll(
                        'tr'
                    );


                if (!rows.length) return;


                rows[rows.length - 1]
                    .remove();


                if (!tbody.querySelector('tr')) {

                    if (tableActions) {
                        tableActions.hidden =
                            true;
                    }

                    if (tableEmpty) {
                        tableEmpty.style.display =
                            'block';
                    }

                }


                markChanged();

            }
        );



    /* =====================================================
       DELETE COLUMN
       ===================================================== */

    document
        .getElementById(
            'deleteGeneralColumn'
        )
        ?.addEventListener(
            'click',
            () => {

                if (!tbody) return;


                const rows =
                    tbody.querySelectorAll(
                        'tr'
                    );


                if (!rows.length) return;


                const columns =
                    rows[0].cells.length;


                if (columns <= 1) {

                    rows.forEach(row => {

                        row.deleteCell(0);

                    });

                }

                else {

                    rows.forEach(row => {

                        row.deleteCell(
                            columns - 1
                        );

                    });

                }


                if (
                    !tbody.querySelector(
                        'tr'
                    )?.cells.length
                ) {

                    tbody.innerHTML = '';


                    if (tableActions) {
                        tableActions.hidden =
                            true;
                    }

                    if (tableEmpty) {
                        tableEmpty.style.display =
                            'block';
                    }

                }


                markChanged();

            }
        );



    /* =====================================================
       RESTORE SAVED TABLE
       ===================================================== */

    const savedTable =
        window.ORION_NOTE_STATE?.table;


    if (
        Array.isArray(savedTable) &&
        savedTable.length
    ) {

        const columns =
            Math.max(
                1,
                ...savedTable.map(
                    row => row.length
                )
            );


        createTable(
            savedTable.length,
            columns,
            savedTable
        );


        /*
           Restoring data should not mark the
           notebook as changed.
        */

    }



    /* =====================================================
       EDITOR SHORTCUTS
       ===================================================== */

    editor.addEventListener(
        'keydown',
        event => {

            if (
                (event.ctrlKey ||
                 event.metaKey) &&
                event.key === 'b'
            ) {

                event.preventDefault();

                runCommand('bold');

            }


            if (
                (event.ctrlKey ||
                 event.metaKey) &&
                event.key === 'i'
            ) {

                event.preventDefault();

                runCommand('italic');

            }


            if (
                (event.ctrlKey ||
                 event.metaKey) &&
                event.key === 'u'
            ) {

                event.preventDefault();

                runCommand('underline');

            }

        }
    );


    /* =====================================================
       INITIAL STATE
       ===================================================== */

    updateChecklistProgress();

});