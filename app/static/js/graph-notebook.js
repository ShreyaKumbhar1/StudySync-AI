/* ==========================================================
   ORION GRAPH / DSA NOTEBOOK
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const canvas =
            document.getElementById(
                "graphCanvas"
            );


        if (!canvas) {
            return;
        }


        /*
         * The graph workspace is intentionally
         * prepared here without forcing a
         * graph library into Orion yet.
         *
         * Later this can become a genuine
         * interactive node/edge editor.
         */


        const tools =
            document.querySelectorAll(
                ".graph-tool"
            );


        tools.forEach(
            function (tool) {

                tool.addEventListener(
                    "click",
                    function () {

                        const action =
                            this.textContent
                                .trim()
                                .toLowerCase();


                        if (
                            action === "clear"
                        ) {

                            const confirmed =
                                confirm(
                                    "Clear the graph workspace?"
                                );


                            if (!confirmed) {
                                return;
                            }


                            canvas
                                .querySelectorAll(
                                    ".graph-node"
                                )
                                .forEach(
                                    node =>
                                        node.remove()
                                );

                        }

                    }
                );

            }
        );

    }
);