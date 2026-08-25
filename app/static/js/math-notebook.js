/* ==========================================================
   ORION MATHEMATICS NOTEBOOK
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const steps =
            document.querySelectorAll(
                ".math-step textarea"
            );


        steps.forEach(
            function (textarea, index) {

                textarea.addEventListener(
                    "keydown",
                    function (event) {

                        if (
                            event.key === "Enter"
                            && !event.shiftKey
                        ) {

                            /*
                             * Keep normal textarea
                             * behaviour for now.
                             *
                             * Future versions can
                             * automatically create
                             * mathematical steps.
                             */

                        }

                    }
                );

            }
        );

    }
);