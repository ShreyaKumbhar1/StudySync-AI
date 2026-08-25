document.addEventListener("DOMContentLoaded", () => {

    const code = document.querySelector(".code-editor");
    const lang = document.querySelector(".language-select");

    if (!code) {
        return;
    }


    /* ==========================================================
       COMPLEXITY ANALYSIS
       ========================================================== */

    const analyze = () => {

        const s = code.value;
        const lower = s.toLowerCase();

        let time = "O(1)";
        let space = "O(1)";

        const loops =
            (s.match(/\b(for|while|foreach)\b/gi) || []).length;

        const nested =
    /for[\s\S]{0,500}for|while[\s\S]{0,500}for|for[\s\S]{0,500}while/i.test(s);


        /* ---------- Sorting ---------- */

        if (
            /\b(sort|sorted|qsort|Arrays\.sort|Collections\.sort)\b/i.test(s)
        ) {
            time = "O(n log n)";
        }


        /* ---------- Loops ---------- */

        if (nested || loops >= 2) {

            time = "O(n²)";

        } else if (loops === 1) {

            time = "O(n)";
        }


        /* ---------- Binary Search ---------- */

        if (
            /\b(binary search|bisect)\b/i.test(lower)
        ) {
            time = "O(log n)";
        }


        /* ---------- Advanced Sorting ---------- */

        if (
            /\b(merge sort|heap sort)\b/i.test(lower)
        ) {
            time = "O(n log n)";
        }


        /* ---------- Graph Algorithms ---------- */

        if (
            /\b(dfs|bfs|graph|adjacency)\b/i.test(lower)
        ) {

            time = "O(V + E)";
            space = "O(V + E)";
        }


        /* ---------- Recursion ---------- */

        if (
            /\b(recurs|factorial|fibonacci)\b/i.test(lower)
        ) {

            space = loops
                ? "O(n)"
                : "O(n)";
        }


        /* ---------- Dynamic Memory / Data Structures ---------- */

        if (
            /\b(new |malloc|calloc|realloc|vector|array|list|map|set|dict|object)\b/i.test(lower)
        ) {

            space = "O(n)";
        }


        /* ---------- Two Pointer ---------- */

        if (
            /\b(two pointer|two-pointer)\b/i.test(lower)
        ) {

            time = "O(n)";
            space = "O(1)";
        }


        /* ======================================================
           UPDATE COMPLEXITY OUTPUTS
           ====================================================== */

        document
            .querySelector(".complexity-output")
            ?.setAttribute("value", time);

        const outs =
            document.querySelectorAll(".complexity-output");

        if (outs[0]) {
            outs[0].value = time;
        }

        if (outs[1]) {
            outs[1].value = space;
        }


        /* ======================================================
           SAVE / CHANGE TRACKING
           ====================================================== */

        window.ORION_MARK_CHANGED?.();
    };


    /* ==========================================================
       CODE EDITOR EVENTS
       ========================================================== */

    code.addEventListener("input", analyze);


    code.addEventListener("keydown", (e) => {

        if (e.key === "Tab") {

            e.preventDefault();

            const s = code.selectionStart;

            code.setRangeText(
                "    ",
                s,
                code.selectionEnd,
                "end"
            );
        }
    });


    /* ==========================================================
       LANGUAGE SELECTOR
       ========================================================== */

    lang?.addEventListener("change", () => {

        code.dataset.language = lang.value;

        analyze();
    });


    /* ==========================================================
       INITIAL ANALYSIS
       ========================================================== */

    analyze();


    /* ==========================================================
       CODING FLOWCHART
       ========================================================== */

    const src =
        document.getElementById("codingFlowchartSource");

    const preview =
        document.getElementById("codingFlowchartPreview");


    async function render() {

        if (
            !src ||
            !preview ||
            !window.mermaid
        ) {
            return;
        }


        try {

            mermaid.initialize({
                startOnLoad: false,
                theme: "base"
            });


            preview.innerHTML = "";


            const id =
                "flow_" + Date.now();


            const r =
                await mermaid.render(
                    id,
                    src.value ||
                    `flowchart TD
A[Start] --> B[Write code]
B --> C[End]`
                );


            preview.innerHTML = r.svg;

        } catch (e) {

            preview.textContent =
                "Flowchart syntax error: " + e.message;
        }


        window.ORION_MARK_CHANGED?.();
    }


    document
        .getElementById("renderCodingFlowchart")
        ?.addEventListener("click", render);


    if (src?.value) {
        render();
    }

});