/* =========================================================
   ORION — GENERAL NOTEBOOK ENGINE
   Fonts / Checklist / Dynamic Tables
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const root =
        document.querySelector(".general-notebook");

    if (!root) return;


    const editor =
        document.getElementById("generalEditor");

    const checklist =
        document.getElementById("checklist");

    const checklistEmpty =
        document.getElementById("checklistEmpty");

    const checklistCount =
        document.getElementById("checklistCount");

    const table =
        document.getElementById("generalTable");

    const tableEmpty =
        document.getElementById("tableEmpty");

    const builder =
        document.getElementById("tableBuilder");


    const markChanged = () => {

        if (typeof window.ORION_MARK_CHANGED === "function") {
            window.ORION_MARK_CHANGED();
        }

    };


    /* =====================================================
       RICH TEXT
       ===================================================== */

    const toolbar =
        root.querySelector(".rich-toolbar");


    if (toolbar && editor) {

        const font =
            toolbar.querySelector(".general-font-family");

        const size =
            toolbar.querySelector(".general-font-size");

        const textColor =
            toolbar.querySelector(".general-text-color");

        const highlightColor =
            toolbar.querySelector(
                ".general-highlight-color"
            );


        font?.addEventListener("change", () => {

            editor.focus();

            document.execCommand(
                "fontName",
                false,
                font.value
            );

            markChanged();

        });


        size?.addEventListener("change", () => {

            editor.focus();

            document.execCommand(
                "fontSize",
                false,
                "7"
            );


            editor
                .querySelectorAll('font[size="7"]')
                .forEach(el => {

                    el.removeAttribute("size");

                    el.style.fontSize =
                        `${size.value}px`;

                });


            markChanged();

        });


        textColor?.addEventListener("input", () => {

            editor.focus();

            document.execCommand(
                "foreColor",
                false,
                textColor.value
            );

            markChanged();

        });


        highlightColor?.addEventListener(
            "input",
            () => {

                editor.focus();

                document.execCommand(
                    "hiliteColor",
                    false,
                    highlightColor.value
                );

                markChanged();

            }
        );


        toolbar
            .querySelectorAll("button")
            .forEach(button => {

                button.addEventListener(
                    "mousedown",
                    event => {

                        event.preventDefault();

                    }
                );

            });

    }


    /* =====================================================
       CHECKLIST
       ===================================================== */

    function updateChecklistStatus() {

        if (!checklist) return;

        const rows =
            [...checklist.querySelectorAll(".check-row")];

        const total =
            rows.length;

        const completed =
            rows.filter(
                row =>
                    row.querySelector(
                        'input[type="checkbox"]'
                    )?.checked
            ).length;


        if (checklistCount) {

            checklistCount.textContent =
                `${completed} / ${total}`;

        }


        if (checklistEmpty) {

            checklistEmpty.style.display =
                total === 0
                    ? "flex"
                    : "none";

        }

    }


    /* =====================================================
       REMOVE OLD "NEW TASK" PLACEHOLDERS

       This removes the unwanted automatic row that was
       appearing underneath the new empty task.
       ===================================================== */

    function removeNewTaskPlaceholders() {

        if (!checklist) return;

        checklist
            .querySelectorAll(".check-row")
            .forEach(row => {

                const text =
                    row
                        .querySelector(".check-text")
                        ?.innerText
                        ?.trim();

                if (
                    text &&
                    text.toLowerCase() === "new task"
                ) {

                    row.remove();

                }

            });

    }


    /* =====================================================
       CREATE CHECKLIST ITEM
       ===================================================== */

    function createChecklistItem(
        text = "",
        done = false
    ) {

        if (!checklist) return null;


        const row =
            document.createElement("div");

        row.className =
            "check-row";


        /* CHECKBOX */

        const checkbox =
            document.createElement("input");

        checkbox.type =
            "checkbox";

        checkbox.checked =
            Boolean(done);


        /* TASK FIELD */

        const textElement =
            document.createElement("span");

        textElement.className =
            "check-text";

        textElement.contentEditable =
            "true";

        textElement.spellcheck =
            true;

        textElement.textContent =
            text;


        /* DELETE */

        const deleteButton =
            document.createElement("button");

        deleteButton.type =
            "button";

        deleteButton.className =
            "check-delete";

        deleteButton.textContent =
            "×";

        deleteButton.title =
            "Remove task";


        row.append(
            checkbox,
            textElement,
            deleteButton
        );


        checklist.appendChild(row);


        /* CHECK / UNCHECK */

        checkbox.addEventListener(
            "change",
            () => {

                row.classList.toggle(
                    "completed",
                    checkbox.checked
                );

                updateChecklistStatus();

                markChanged();

            }
        );


        /* TYPE TASK */

        textElement.addEventListener(
            "input",
            () => {

                markChanged();

            }
        );


        /* DELETE */

        deleteButton.addEventListener(
            "click",
            () => {

                row.remove();

                updateChecklistStatus();

                markChanged();

            }
        );


        row.classList.toggle(
            "completed",
            checkbox.checked
        );


        updateChecklistStatus();


        return textElement;

    }


    /* =====================================================
       ADD CHECKLIST ITEM

       ONE CLICK = ONE EMPTY TASK ONLY
       ===================================================== */

    const addChecklist =
        document.getElementById("addChecklist");


    if (addChecklist) {

        /*
         * Replace the button so old click handlers from
         * other scripts cannot create another "New task".
         */

        const cleanButton =
            addChecklist.cloneNode(true);

        addChecklist.replaceWith(cleanButton);


        cleanButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                /*
                 * Stop any other checklist handler from
                 * responding to this click.
                 */

                event.stopPropagation();
                event.stopImmediatePropagation();


                /*
                 * Remove the unwanted "New task" row
                 * before creating our task.
                 */

                removeNewTaskPlaceholders();


                /*
                 * Create EXACTLY ONE empty task.
                 */

                const task =
                    createChecklistItem(
                        "",
                        false
                    );


                /*
                 * Focus the empty task immediately.
                 */

                if (task) {

                    task.focus();

                    const range =
                        document.createRange();

                    range.selectNodeContents(task);

                    range.collapse(false);

                    const selection =
                        window.getSelection();

                    selection.removeAllRanges();

                    selection.addRange(range);

                }


                updateChecklistStatus();

            }
        );

    }


    /* =====================================================
       RESTORE SAVED CHECKLIST
       ===================================================== */

    const savedChecklist =
        window.ORION_NOTE_STATE
            ?.fields
            ?.checklist;


    if (
        Array.isArray(savedChecklist)
        && savedChecklist.length
    ) {

        savedChecklist.forEach(item => {

            const savedText =
                typeof item.text === "string"
                    ? item.text.trim()
                    : "";


            /*
             * Do NOT restore empty placeholders or
             * the old "New task" placeholder.
             */

            if (!savedText) return;

            if (
                savedText.toLowerCase() ===
                "new task"
            ) {
                return;
            }


            createChecklistItem(
                savedText,
                Boolean(item.done)
            );

        });

    }


    /*
     * Clean up any old placeholder that may already
     * have been inserted by another script.
     */

    removeNewTaskPlaceholders();

    updateChecklistStatus();


    /* =====================================================
       QUICK TABLE
       ===================================================== */

    function clearTable() {

        if (!table) return;

        table
            .querySelector("tbody")
            .innerHTML = "";

    }


    function createTable(
        rows,
        columns,
        savedData = null
    ) {

        if (!table) return;


        rows =
            Math.max(
                1,
                Math.min(30, Number(rows) || 1)
            );

        columns =
            Math.max(
                1,
                Math.min(15, Number(columns) || 1)
            );


        clearTable();


        const tbody =
            table.querySelector("tbody");


        for (
            let r = 0;
            r < rows;
            r++
        ) {

            const tr =
                document.createElement("tr");


            for (
                let c = 0;
                c < columns;
                c++
            ) {

                const td =
                    document.createElement("td");


                td.contentEditable =
                    "true";


                if (
                    savedData
                    && savedData[r]
                    && savedData[r][c] !== undefined
                ) {

                    td.textContent =
                        savedData[r][c];

                }


                td.addEventListener(
                    "input",
                    markChanged
                );


                tr.appendChild(td);

            }


            tbody.appendChild(tr);

        }


        if (tableEmpty) {

            tableEmpty.style.display =
                "none";

        }


        markChanged();

    }


    /* =====================================================
       OPEN TABLE BUILDER
       ===================================================== */

    document
        .getElementById("openTableBuilder")
        ?.addEventListener(
            "click",
            () => {

                if (!builder) return;

                builder.hidden =
                    false;

                document
                    .getElementById("tableRows")
                    ?.focus();

            }
        );


    /* =====================================================
       CANCEL TABLE BUILDER
       ===================================================== */

    document
        .getElementById("cancelTableBuilder")
        ?.addEventListener(
            "click",
            () => {

                if (builder) {

                    builder.hidden =
                        true;

                }

            }
        );


    /* =====================================================
       CREATE TABLE
       ===================================================== */

    document
        .getElementById("createGeneralTable")
        ?.addEventListener(
            "click",
            () => {

                const rows =
                    Number(
                        document
                            .getElementById(
                                "tableRows"
                            )?.value
                    );


                const columns =
                    Number(
                        document
                            .getElementById(
                                "tableColumns"
                            )?.value
                    );


                if (
                    !rows ||
                    !columns ||
                    rows < 1 ||
                    columns < 1
                ) {

                    alert(
                        "Please enter a valid number of rows and columns."
                    );

                    return;

                }


                if (
                    rows > 30 ||
                    columns > 15
                ) {

                    alert(
                        "Please keep the table within 30 rows and 15 columns."
                    );

                    return;

                }


                createTable(
                    rows,
                    columns
                );


                if (builder) {

                    builder.hidden =
                        true;

                }

            }
        );


    /* =====================================================
       RESTORE SAVED TABLE
       ===================================================== */

    const savedTable =
        window.ORION_NOTE_STATE?.table;


    if (
        Array.isArray(savedTable)
        && savedTable.length
    ) {

        const savedRows =
            savedTable.length;


        const savedColumns =
            Math.max(
                ...savedTable.map(
                    row => row.length
                )
            );


        createTable(
            savedRows,
            savedColumns,
            savedTable
        );

    } else {

        if (tableEmpty) {

            tableEmpty.style.display =
                "flex";

        }

    }


    /* =====================================================
       UPDATE STATE BEFORE SUBMIT
       ===================================================== */

    const form =
        document.getElementById("notebookForm");


    form?.addEventListener(
        "submit",
        () => {

            if (!window.ORION_NOTE_STATE) return;


            /* CHECKLIST */

            if (checklist) {

                window.ORION_NOTE_STATE
                    .fields
                    .checklist =
                    [
                        ...checklist
                            .querySelectorAll(
                                ".check-row"
                            )
                    ].map(row => ({

                        done:
                            row.querySelector(
                                'input[type="checkbox"]'
                            )?.checked || false,

                        text:
                            row.querySelector(
                                ".check-text"
                            )?.innerText
                            ?.trim() || ""

                    }));

            }


            /* TABLE */

            if (table) {

                window.ORION_NOTE_STATE.table =
                    [
                        ...table
                            .querySelectorAll(
                                "tbody tr"
                            )
                    ].map(row =>
                        [
                            ...row.cells
                        ].map(
                            cell =>
                                cell.innerText
                        )
                    );

            }

        }
    );


});