/* ==========================================================
   ORION CODING NOTEBOOK
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const codeEditor =
            document.querySelector(
                ".code-editor"
            );

        const languageSelect =
            document.querySelector(
                ".language-select"
            );


        if (!codeEditor) {
            return;
        }


        /* -----------------------------------------------
           TAB KEY SUPPORT
           ----------------------------------------------- */

        codeEditor.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Tab"
                ) {

                    event.preventDefault();


                    const start =
                        this.selectionStart;

                    const end =
                        this.selectionEnd;


                    this.value =
                        this.value.substring(
                            0,
                            start
                        )
                        + "    "
                        + this.value.substring(
                            end
                        );


                    this.selectionStart =
                        this.selectionEnd =
                            start + 4;

                }

            }
        );


        /* -----------------------------------------------
           LANGUAGE REMINDER
           ----------------------------------------------- */

        if (languageSelect) {

            languageSelect.addEventListener(
                "change",
                function () {

                    codeEditor.dataset.language =
                        this.value.toLowerCase();

                }
            );

        }

    }
);