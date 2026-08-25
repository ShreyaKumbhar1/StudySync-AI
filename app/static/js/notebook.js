/* ==========================================================
   ORION NOTEBOOK WORKSPACE
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "notebookForm"
            );

        const saveStatus =
            document.getElementById(
                "saveStatus"
            );


        if (!form) {
            return;
        }


        let changed = false;


        const editableElements =
            form.querySelectorAll(
                "input, textarea, select"
            );


        editableElements.forEach(
            function (element) {

                element.addEventListener(
                    "input",
                    function () {

                        changed = true;

                        if (saveStatus) {

                            saveStatus.textContent =
                                "● Unsaved changes";

                            saveStatus.classList.remove(
                                "saved"
                            );

                        }

                    }
                );

            }
        );


        form.addEventListener(
            "submit",
            function () {

                changed = false;

                if (saveStatus) {

                    saveStatus.textContent =
                        "● Saving...";

                }

            }
        );


        window.addEventListener(
            "beforeunload",
            function (event) {

                if (!changed) {
                    return;
                }

                event.preventDefault();

                event.returnValue = "";

            }
        );


        /* ==================================================
           GRAPH TOOL UI
           ================================================== */

        const graphTools =
            document.querySelectorAll(
                ".graph-tool"
            );


        graphTools.forEach(
            function (tool) {

                tool.addEventListener(
                    "click",
                    function () {

                        graphTools.forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        tool.classList.add(
                            "active"
                        );

                    }
                );

            }
        );


        /* ==================================================
           PAGE TITLE AUTO FOCUS
           ================================================== */

        const titleInput =
            document.querySelector(
                ".page-title-input"
            );


        if (
            titleInput
            && titleInput.value === "Untitled Page"
        ) {

            titleInput.focus();

            titleInput.select();

        }

    }
);