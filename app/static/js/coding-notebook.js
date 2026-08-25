document.addEventListener("DOMContentLoaded", () => {

    const code =
        document.getElementById("codingCodeEditor");

    if (!code) {
        return;
    }

    /* ==========================================================
    HELPERS
    ========================================================== */

    const markChanged = () => {
        window.ORION_MARK_CHANGED?.();
    };

    const state =
        window.ORION_NOTE_STATE || {
            version: 2,
            fields: {},
            images: []
        };

    window.ORION_NOTE_STATE = state;

    state.fields = state.fields || {};
    state.images = state.images || [];


    /* ==========================================================
    ID GENERATOR
    ========================================================== */

    const makeId = (prefix = "node") => {
        if (window.crypto?.randomUUID) {
            return `${prefix}_${crypto.randomUUID()}`;
        }

        return `${prefix}_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 9)}`;
    };


    /* ==========================================================
    COMPLEXITY ANALYSIS
    ========================================================== */

    const analyze = () => {
        const source = code.value || "";
        const lower = source.toLowerCase();

        let time = "O(1)";
        let space = "O(1)";


        /* ======================================================
        COUNT LOOPS
        ====================================================== */

        const loops =
            (
                source.match(
                    /\b(for|while|foreach)\b/gi
                ) || []
            ).length;


        /* ======================================================
        DETECT NESTED LOOPS
        ====================================================== */

        const nested =
            /for[\s\S]{0,500}for|while[\s\S]{0,500}for|for[\s\S]{0,500}while|while[\s\S]{0,500}while/i
                .test(source);


        /* ======================================================
        SORTING
        ====================================================== */

        if (
            /\b(sort|sorted|qsort|arrays\.sort|collections\.sort)\b/i.test(
                lower
            )
        ) {
            time = "O(n log n)";
        }


        /* ======================================================
        LOOPS
        ====================================================== */

        if (nested || loops >= 2) {
            time = "O(n²)";
        } else if (loops === 1) {
            time = "O(n)";
        }


        /* ======================================================
        BINARY SEARCH
        ====================================================== */

        if (
            /\b(binary\s*search|bisect)\b/i.test(lower)
        ) {
            time = "O(log n)";
        }


        /* ======================================================
        MERGE / HEAP SORT
        ====================================================== */

        if (
            /\b(merge\s*sort|heap\s*sort)\b/i.test(lower)
        ) {
            time = "O(n log n)";
        }


        /* ======================================================
        GRAPH ALGORITHMS
        ====================================================== */

        if (
            /\b(dfs|bfs|graph|adjacency|dijkstra|bellman|prim|kruskal)\b/i.test(
                lower
            )
        ) {
            time = "O(V + E)";
            space = "O(V + E)";
        }


        /* ======================================================
        RECURSION
        ====================================================== */

        if (
            /\b(recursion|recursive|factorial|fibonacci)\b/i.test(
                lower
            )
        ) {
            space = "O(n)";
        }


        /* ======================================================
        DYNAMIC MEMORY / DATA STRUCTURES
        ====================================================== */

        if (
            /\b(new|malloc|calloc|realloc|vector|array|list|map|set|dict|object|hashmap)\b/i.test(
                lower
            )
        ) {
            space = "O(n)";
        }


        /* ======================================================
        TWO POINTER
        ====================================================== */

        if (
            /\b(two[\s-]*pointer)\b/i.test(lower)
        ) {
            time = "O(n)";
            space = "O(1)";
        }


        /* ======================================================
        SLIDING WINDOW
        ====================================================== */

        if (
            /\b(sliding[\s-]*window)\b/i.test(lower)
        ) {
            time = "O(n)";
            space = "O(1)";
        }


        /* ======================================================
        UPDATE COMPLEXITY OUTPUTS
        ====================================================== */

        const outputs = document.querySelectorAll(
            ".complexity-output"
        );

        if (outputs[0]) {
            outputs[0].value = time;
        }

        if (outputs[1]) {
            outputs[1].value = space;
        }


        /* ======================================================
        SAVE TO NOTEBOOK STATE
        ====================================================== */

        state.time_complexity = time;
        state.space_complexity = space;

        markChanged();
    };


    /* ==========================================================
    CODE EDITOR EVENTS
    ========================================================== */

    code.addEventListener("input", () => {
        analyze();
        updateCodeStats();
        updateLineNumbers();
    });
    
    /* ==========================================================
       TAB INDENTATION
       ========================================================== */

    code.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Tab") {
                return;
            }

            event.preventDefault();

            const start =
                code.selectionStart;

            const end =
                code.selectionEnd;

            code.setRangeText(
                "    ",
                start,
                end,
                "end"
            );

            markChanged();
        }
    );


    /* ==========================================================
       CODE STATISTICS
       ========================================================== */

    const lineCount =
        document.getElementById(
            "codeLineCount"
        );

    const charCount =
        document.getElementById(
            "codeCharCount"
        );

    const todoCount =
        document.getElementById(
            "codeTodoCount"
        );


    function updateCodeStats() {

        const value =
            code.value || "";

        const lines =
            value
                ? value.split(/\r?\n/).length
                : 0;

        const chars =
            value.length;

        const todos =
            (
                value.match(
                    /\b(TODO|FIXME|BUG)\b/gi
                ) || []
            ).length;


        if (lineCount) {
            lineCount.textContent = lines;
        }

        if (charCount) {
            charCount.textContent = chars;
        }

        if (todoCount) {
            todoCount.textContent = todos;
        }
    }


    /* ==========================================================
       CODE LINE NUMBERS
       ========================================================== */

    const gutter =
        document.getElementById(
            "codeLineGutter"
        );


    function updateLineNumbers() {

        if (!gutter) {
            return;
        }

        const count =
            Math.max(
                1,
                (code.value || "")
                    .split(/\r?\n/)
                    .length
            );

        gutter.innerHTML = "";

        for (let i = 1; i <= count; i++) {

            const span =
                document.createElement("span");

            span.textContent = i;

            gutter.appendChild(span);
        }
    }


    code.addEventListener(
        "scroll",
        () => {

            if (gutter) {
                gutter.scrollTop =
                    code.scrollTop;
            }

        }
    );


    updateCodeStats();
    updateLineNumbers();
    analyze();


    /* ==========================================================
       COPY CODE
       ========================================================== */

    document
        .getElementById("copyCodingCode")
        ?.addEventListener(
            "click",
            async event => {

                const button =
                    event.currentTarget;

                try {

                    await navigator.clipboard.writeText(
                        code.value || ""
                    );

                    const original =
                        button.textContent;

                    button.textContent =
                        "✓ Copied";

                    setTimeout(() => {
                        button.textContent =
                            original;
                    }, 1200);

                } catch (error) {

                    code.select();

                    document.execCommand(
                        "copy"
                    );

                    button.textContent =
                        "✓ Copied";

                    setTimeout(() => {
                        button.textContent =
                            "Copy";
                    }, 1200);
                }
            }
        );


    /* ==========================================================
       FORMULA QUICK INSERT
       ========================================================== */

    document
        .querySelectorAll(
            ".formula-chip"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const formula =
                        button.dataset.formula;

                    const editor =
                        document.querySelector(
                            ".coding-formula-editor"
                        );

                    if (!editor) {
                        return;
                    }


                    editor.value =
                        editor.value.trim()
                            ? `${editor.value}\n${formula}`
                            : formula;

                    editor.focus();

                    markChanged();
                }
            );
        });


    /* ==========================================================
       TEST CASE MANAGER
       ========================================================== */

    const testContainer =
        document.getElementById(
            "codingTestCases"
        );

    const testData =
        document.getElementById(
            "codingTestCasesData"
        );


    let testCases = [];


    try {

        testCases =
            JSON.parse(
                testData?.value || "[]"
            );

        if (!Array.isArray(testCases)) {
            testCases = [];
        }

    } catch {

        testCases = [];
    }


    function syncTestCases() {

        if (testData) {

            testData.value =
                JSON.stringify(
                    testCases
                );
        }

        markChanged();
    }


    function renderTestCases() {

        if (!testContainer) {
            return;
        }

        testContainer.innerHTML = "";


        if (!testCases.length) {

            addTestCase(false);

            return;
        }


        testCases.forEach(
            (testCase, index) => {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td class="test-index">
                        ${index + 1}
                    </td>

                    <td>
                        <textarea
                            class="test-input"
                            placeholder="Input"
                        ></textarea>
                    </td>

                    <td>
                        <textarea
                            class="test-expected"
                            placeholder="Expected"
                        ></textarea>
                    </td>

                    <td>
                        <textarea
                            class="test-actual"
                            placeholder="Actual"
                        ></textarea>
                    </td>

                    <td>

                        <select class="test-status">

                            <option value="pending">
                                Pending
                            </option>

                            <option value="passed">
                                ✓ Passed
                            </option>

                            <option value="failed">
                                ✕ Failed
                            </option>

                        </select>

                    </td>

                    <td>

                        <button
                            type="button"
                            class="test-remove"
                            title="Remove test case"
                        >
                            ×
                        </button>

                    </td>

                `;


                const input =
                    row.querySelector(
                        ".test-input"
                    );

                const expected =
                    row.querySelector(
                        ".test-expected"
                    );

                const actual =
                    row.querySelector(
                        ".test-actual"
                    );

                const status =
                    row.querySelector(
                        ".test-status"
                    );


                input.value =
                    testCase.input || "";

                expected.value =
                    testCase.expected || "";

                actual.value =
                    testCase.actual || "";

                status.value =
                    testCase.status || "pending";


                [
                    input,
                    expected,
                    actual,
                    status
                ].forEach(
                    element => {

                        element.addEventListener(
                            "input",
                            syncTestsFromDOM
                        );

                        element.addEventListener(
                            "change",
                            syncTestsFromDOM
                        );

                    }
                );


                row
                    .querySelector(
                        ".test-remove"
                    )
                    .addEventListener(
                        "click",
                        () => {

                            testCases.splice(
                                index,
                                1
                            );

                            renderTestCases();
                            syncTestCases();

                        }
                    );


                testContainer.appendChild(
                    row
                );
            }
        );
    }


    function syncTestsFromDOM() {

        if (!testContainer) {
            return;
        }


        testCases =
            [...testContainer.querySelectorAll("tr")]
                .map(row => ({

                    input:
                        row.querySelector(
                            ".test-input"
                        )?.value || "",

                    expected:
                        row.querySelector(
                            ".test-expected"
                        )?.value || "",

                    actual:
                        row.querySelector(
                            ".test-actual"
                        )?.value || "",

                    status:
                        row.querySelector(
                            ".test-status"
                        )?.value || "pending"

                }));


        syncTestCases();
    }


    function addTestCase(mark = true) {

        testCases.push({

            input: "",
            expected: "",
            actual: "",
            status: "pending"

        });


        renderTestCases();


        if (mark) {
            syncTestCases();
        }
    }


    document
        .getElementById(
            "addCodingTestCase"
        )
        ?.addEventListener(
            "click",
            () => addTestCase()
        );


    renderTestCases();


    /* ==========================================================
       FLOWCHART DESIGNER
       ========================================================== */

    const canvas =
        document.getElementById(
            "codingFlowchartCanvas"
        );

    const svg =
        document.getElementById(
            "codingFlowchartSvg"
        );

    const emptyState =
        document.getElementById(
            "codingFlowchartEmpty"
        );

    const visualData =
        document.getElementById(
            "codingFlowchartVisualData"
        );


    if (!canvas || !svg) {
        return;
    }


    let flowNodes = [];
    let flowEdges = [];

    let selectedNodeId = null;
    let connectSourceId = null;

    let flowTool = "select";

    let snapEnabled = true;

    let connectorStyle = "elbow";

    let undoStack = [];


    /* ----------------------------------------------------------
       RESTORE VISUAL STATE
       ---------------------------------------------------------- */

    try {

        const saved =
            JSON.parse(
                visualData?.value ||
                '{"nodes":[],"edges":[]}'
            );

        flowNodes =
            Array.isArray(saved.nodes)
                ? saved.nodes
                : [];

        flowEdges =
            Array.isArray(saved.edges)
                ? saved.edges
                : [];

    } catch {

        flowNodes = [];
        flowEdges = [];
    }


    const shapeDefaults = {

        start: {
            label: "Start",
            width: 150,
            height: 52
        },

        process: {
            label: "Process",
            width: 150,
            height: 62
        },

        decision: {
            label: "Condition?",
            width: 160,
            height: 92
        },

        io: {
            label: "Input / Output",
            width: 160,
            height: 62
        },

        document: {
            label: "Document",
            width: 160,
            height: 70
        }

    };


    /* ----------------------------------------------------------
       SNAP
       ---------------------------------------------------------- */

    function snap(value) {

        if (!snapEnabled) {
            return value;
        }

        return Math.round(
            value / 20
        ) * 20;
    }


    /* ----------------------------------------------------------
       SAVE VISUAL DATA
       ---------------------------------------------------------- */

    function syncVisualData() {

        const payload = {

            nodes: flowNodes,
            edges: flowEdges

        };


        if (visualData) {

            visualData.value =
                JSON.stringify(
                    payload
                );
        }


        state.flowchart_visual =
            payload;

        markChanged();
    }


    /* ----------------------------------------------------------
       SNAPSHOT / UNDO
       ---------------------------------------------------------- */

    function snapshot() {

        undoStack.push(
            JSON.stringify({
                nodes: flowNodes,
                edges: flowEdges
            })
        );


        if (undoStack.length > 30) {
            undoStack.shift();
        }
    }


    function undo() {

        if (!undoStack.length) {
            return;
        }


        const previous =
            JSON.parse(
                undoStack.pop()
            );


        flowNodes =
            previous.nodes || [];

        flowEdges =
            previous.edges || [];

        selectedNodeId = null;

        renderFlowchart();

        syncVisualData();
    }


    /* ----------------------------------------------------------
       NODE CENTER
       ---------------------------------------------------------- */

    function getNodeCenter(node) {

        return {

            x:
                node.x +
                node.width / 2,

            y:
                node.y +
                node.height / 2

        };
    }


    /* ----------------------------------------------------------
       RENDER CONNECTORS
       ---------------------------------------------------------- */

    function renderConnectors() {

        svg
            .querySelectorAll(
                ".flow-connector"
            )
            .forEach(
                element =>
                    element.remove()
            );


        flowEdges.forEach(
            edge => {

                const from =
                    flowNodes.find(
                        node =>
                            node.id ===
                            edge.from
                    );

                const to =
                    flowNodes.find(
                        node =>
                            node.id ===
                            edge.to
                    );


                if (!from || !to) {
                    return;
                }


                const start =
                    getNodeCenter(
                        from
                    );

                const end =
                    getNodeCenter(
                        to
                    );


                let pathData = "";


                if (
                    connectorStyle ===
                    "straight"
                ) {

                    pathData =
                        `M ${start.x} ${start.y}
                         L ${end.x} ${end.y}`;

                } else if (
                    connectorStyle ===
                    "curved"
                ) {

                    const midX =
                        (
                            start.x +
                            end.x
                        ) / 2;

                    pathData =
                        `M ${start.x} ${start.y}
                         C ${midX} ${start.y},
                           ${midX} ${end.y},
                           ${end.x} ${end.y}`;

                } else {

                    const midY =
                        (
                            start.y +
                            end.y
                        ) / 2;

                    pathData =
                        `M ${start.x} ${start.y}
                         L ${start.x} ${midY}
                         L ${end.x} ${midY}
                         L ${end.x} ${end.y}`;
                }


                const path =
                    document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "path"
                    );


                path.setAttribute(
                    "d",
                    pathData
                );

                path.setAttribute(
                    "class",
                    "flow-connector"
                );

                path.setAttribute(
                    "marker-end",
                    "url(#codingArrow)"
                );


                svg.appendChild(
                    path
                );


                if (edge.label) {

                    const text =
                        document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "text"
                        );


                    const midX =
                        (
                            start.x +
                            end.x
                        ) / 2;

                    const midY =
                        (
                            start.y +
                            end.y
                        ) / 2;


                    text.setAttribute(
                        "x",
                        midX
                    );

                    text.setAttribute(
                        "y",
                        midY - 6
                    );

                    text.setAttribute(
                        "class",
                        "flow-connector-label"
                    );

                    text.textContent =
                        edge.label;


                    svg.appendChild(
                        text
                    );
                }

            }
        );
    }


    /* ----------------------------------------------------------
       RENDER NODES
       ---------------------------------------------------------- */

    function renderNodes() {

        canvas
            .querySelectorAll(
                ".coding-flow-node"
            )
            .forEach(
                node =>
                    node.remove()
            );


        flowNodes.forEach(
            node => {

                const element =
                    document.createElement(
                        "div"
                    );


                element.className =
                    `coding-flow-node shape-${node.type}`;


                if (
                    node.id ===
                    selectedNodeId
                ) {
                    element.classList.add(
                        "selected"
                    );
                }


                if (
                    flowTool === "connect" &&
                    node.id ===
                    connectSourceId
                ) {
                    element.classList.add(
                        "connect-source"
                    );
                }


                element.style.left =
                    `${node.x}px`;

                element.style.top =
                    `${node.y}px`;

                element.style.width =
                    `${node.width}px`;

                element.style.minHeight =
                    `${node.height}px`;


                const text =
                    document.createElement(
                        "span"
                    );

                text.textContent =
                    node.label;


                element.appendChild(
                    text
                );


                /* ------------------------------------------------
                   DRAG
                   ------------------------------------------------ */

                element.addEventListener(
                    "mousedown",
                    event => {

                        if (
                            flowTool !==
                            "select"
                        ) {
                            return;
                        }


                        event.preventDefault();

                        snapshot();

                        selectedNodeId =
                            node.id;

                        updateInspector();

                        const rect =
                            canvas.getBoundingClientRect();


                        const startX =
                            event.clientX -
                            rect.left -
                            node.x;

                        const startY =
                            event.clientY -
                            rect.top -
                            node.y;


                        const move =
                            moveEvent => {

                                node.x =
                                    snap(
                                        moveEvent.clientX -
                                        rect.left -
                                        startX
                                    );

                                node.y =
                                    snap(
                                        moveEvent.clientY -
                                        rect.top -
                                        startY
                                    );


                                node.x =
                                    Math.max(
                                        5,
                                        node.x
                                    );

                                node.y =
                                    Math.max(
                                        5,
                                        node.y
                                    );


                                renderFlowchart();
                            };


                        const up = () => {

                            document.removeEventListener(
                                "mousemove",
                                move
                            );

                            document.removeEventListener(
                                "mouseup",
                                up
                            );


                            syncVisualData();
                        };


                        document.addEventListener(
                            "mousemove",
                            move
                        );

                        document.addEventListener(
                            "mouseup",
                            up
                        );
                    }
                );


                /* ------------------------------------------------
                   CLICK / CONNECT
                   ------------------------------------------------ */

                element.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();


                        if (
                            flowTool ===
                            "connect"
                        ) {

                            if (
                                !connectSourceId
                            ) {

                                connectSourceId =
                                    node.id;

                                renderFlowchart();

                                return;
                            }


                            if (
                                connectSourceId ===
                                node.id
                            ) {

                                connectSourceId =
                                    null;

                                renderFlowchart();

                                return;
                            }


                            const duplicate =
                                flowEdges.some(
                                    edge =>
                                        edge.from ===
                                            connectSourceId &&
                                        edge.to ===
                                            node.id
                                );


                            if (!duplicate) {

                                snapshot();


                                let label = "";

                                const source =
                                    flowNodes.find(
                                        item =>
                                            item.id ===
                                            connectSourceId
                                    );


                                if (
                                    source?.type ===
                                    "decision"
                                ) {

                                    label =
                                        prompt(
                                            "Connector label (optional):",
                                            ""
                                        ) || "";
                                }


                                flowEdges.push({

                                    from:
                                        connectSourceId,

                                    to:
                                        node.id,

                                    label

                                });


                                syncVisualData();
                            }


                            connectSourceId =
                                null;

                            renderFlowchart();

                            return;
                        }


                        selectedNodeId =
                            node.id;

                        updateInspector();

                        renderFlowchart();
                    }
                );


                element.addEventListener(
                    "dblclick",
                    event => {

                        event.stopPropagation();

                        const label =
                            prompt(
                                "Shape text:",
                                node.label
                            );


                        if (
                            label !== null
                        ) {

                            snapshot();

                            node.label =
                                label.trim() ||
                                node.label;

                            updateInspector();

                            renderFlowchart();

                            syncVisualData();
                        }
                    }
                );


                canvas.appendChild(
                    element
                );
            }
        );
    }


    /* ----------------------------------------------------------
       RENDER FLOWCHART
       ---------------------------------------------------------- */

    function renderFlowchart() {

        if (emptyState) {

            emptyState.style.display =
                flowNodes.length
                    ? "none"
                    : "flex";
        }


        renderConnectors();
        renderNodes();

        updateInspector();
    }


    /* ----------------------------------------------------------
       ADD NODE
       ---------------------------------------------------------- */

    function addFlowNode(
        type,
        autoConnect = true
    ) {

        snapshot();


        const defaults =
            shapeDefaults[type] ||
            shapeDefaults.process;


        const offset =
            flowNodes.length * 20;


        const node = {

            id:
                makeId("flow"),

            type,

            label:
                defaults.label,

            x:
                snap(
                    80 +
                    (offset % 300)
                ),

            y:
                snap(
                    60 +
                    (
                        Math.floor(
                            flowNodes.length / 4
                        ) * 100
                    )
                ),

            width:
                defaults.width,

            height:
                defaults.height

        };


        flowNodes.push(
            node
        );


        if (
            autoConnect &&
            selectedNodeId
        ) {

            const exists =
                flowEdges.some(
                    edge =>
                        edge.from ===
                            selectedNodeId &&
                        edge.to ===
                            node.id
                );


            if (!exists) {

                flowEdges.push({

                    from:
                        selectedNodeId,

                    to:
                        node.id,

                    label: ""

                });
            }
        }


        selectedNodeId =
            node.id;


        renderFlowchart();
        syncVisualData();
    }


    /* ----------------------------------------------------------
       TOOLBAR
       ---------------------------------------------------------- */

    document
        .querySelectorAll(
            ".flow-shape-tool"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        addFlowNode(
                            button.dataset.flowShape,
                            true
                        );

                    }
                );
            }
        );


    document
        .getElementById(
            "flowSelectTool"
        )
        ?.addEventListener(
            "click",
            () => {

                flowTool =
                    "select";

                connectSourceId =
                    null;

                document
                    .getElementById(
                        "flowSelectTool"
                    )
                    ?.classList.add(
                        "active"
                    );

                document
                    .getElementById(
                        "flowConnectTool"
                    )
                    ?.classList.remove(
                        "active"
                    );

                renderFlowchart();
            }
        );


    document
        .getElementById(
            "flowConnectTool"
        )
        ?.addEventListener(
            "click",
            () => {

                flowTool =
                    "connect";

                document
                    .getElementById(
                        "flowConnectTool"
                    )
                    ?.classList.add(
                        "active"
                    );

                document
                    .getElementById(
                        "flowSelectTool"
                    )
                    ?.classList.remove(
                        "active"
                    );

                renderFlowchart();
            }
        );


    /* ----------------------------------------------------------
       CANVAS CLICK
       ---------------------------------------------------------- */

    canvas.addEventListener(
        "click",
        event => {

            if (
                event.target !==
                canvas
            ) {
                return;
            }


            selectedNodeId =
                null;

            connectSourceId =
                null;

            updateInspector();

            renderFlowchart();
        }
    );


    /* ----------------------------------------------------------
       SNAP OPTION
       ---------------------------------------------------------- */

    document
        .getElementById(
            "flowSnapGrid"
        )
        ?.addEventListener(
            "change",
            event => {

                snapEnabled =
                    event.target.checked;

            }
        );


    /* ----------------------------------------------------------
       CONNECTOR STYLE
       ---------------------------------------------------------- */

    document
        .getElementById(
            "flowConnectorStyle"
        )
        ?.addEventListener(
            "change",
            event => {

                connectorStyle =
                    event.target.value;

                renderFlowchart();

            }
        );


    /* ----------------------------------------------------------
       UNDO
       ---------------------------------------------------------- */

    document
        .getElementById(
            "flowchartUndo"
        )
        ?.addEventListener(
            "click",
            undo
        );


    /* ----------------------------------------------------------
       CLEAR
       ---------------------------------------------------------- */

    document
        .getElementById(
            "flowchartClear"
        )
        ?.addEventListener(
            "click",
            () => {

                if (!flowNodes.length) {
                    return;
                }


                if (
                    !confirm(
                        "Clear this entire flowchart?"
                    )
                ) {
                    return;
                }


                snapshot();

                flowNodes = [];
                flowEdges = [];

                selectedNodeId =
                    null;

                connectSourceId =
                    null;

                renderFlowchart();

                syncVisualData();
            }
        );


    /* ----------------------------------------------------------
       AUTO LAYOUT
       ---------------------------------------------------------- */

    document
        .getElementById(
            "flowchartAutoLayout"
        )
        ?.addEventListener(
            "click",
            () => {

                if (
                    flowNodes.length <
                    2
                ) {
                    return;
                }


                snapshot();


                const columns =
                    Math.max(
                        1,
                        Math.min(
                            3,
                            Math.ceil(
                                Math.sqrt(
                                    flowNodes.length
                                )
                            )
                        )
                    );


                const columnGap = 240;
                const rowGap = 130;


                flowNodes.forEach(
                    (node, index) => {

                        const column =
                            index %
                            columns;

                        const row =
                            Math.floor(
                                index /
                                columns
                            );


                        node.x =
                            80 +
                            column *
                            columnGap;

                        node.y =
                            60 +
                            row *
                            rowGap;

                        node.x =
                            snap(node.x);

                        node.y =
                            snap(node.y);
                    }
                );


                renderFlowchart();
                syncVisualData();
            }
        );


    /* ==========================================================
       INSPECTOR
       ========================================================== */

    const inspector =
        document.getElementById(
            "flowInspector"
        );

    const inspectorEmpty =
        document.getElementById(
            "flowInspectorEmpty"
        );

    const nodeType =
        document.getElementById(
            "flowNodeType"
        );

    const nodeText =
        document.getElementById(
            "flowNodeText"
        );


    function updateInspector() {

        const node =
            flowNodes.find(
                item =>
                    item.id ===
                    selectedNodeId
            );


        if (!node) {

            if (inspector) {
                inspector.hidden = true;
            }

            if (inspectorEmpty) {
                inspectorEmpty.hidden = false;
            }

            return;
        }


        if (inspector) {
            inspector.hidden = false;
        }

        if (inspectorEmpty) {
            inspectorEmpty.hidden = true;
        }


        if (nodeType) {
            nodeType.value =
                node.type;
        }

        if (nodeText) {
            nodeText.value =
                node.label;
        }
    }


    document
        .getElementById(
            "flowApplyNode"
        )
        ?.addEventListener(
            "click",
            () => {

                const node =
                    flowNodes.find(
                        item =>
                            item.id ===
                            selectedNodeId
                    );


                if (!node) {
                    return;
                }


                snapshot();


                node.type =
                    nodeType.value;

                node.label =
                    nodeText.value.trim() ||
                    "Process";


                const defaults =
                    shapeDefaults[
                        node.type
                    ];


                if (defaults) {

                    node.width =
                        defaults.width;

                    node.height =
                        defaults.height;
                }


                renderFlowchart();
                syncVisualData();
            }
        );


    document
        .getElementById(
            "flowDeleteNode"
        )
        ?.addEventListener(
            "click",
            () => {

                if (!selectedNodeId) {
                    return;
                }


                snapshot();


                flowNodes =
                    flowNodes.filter(
                        node =>
                            node.id !==
                            selectedNodeId
                    );


                flowEdges =
                    flowEdges.filter(
                        edge =>
                            edge.from !==
                                selectedNodeId &&
                            edge.to !==
                                selectedNodeId
                    );


                selectedNodeId =
                    null;


                renderFlowchart();
                syncVisualData();
            }
        );


    document
        .getElementById(
            "flowDuplicateNode"
        )
        ?.addEventListener(
            "click",
            () => {

                const original =
                    flowNodes.find(
                        node =>
                            node.id ===
                            selectedNodeId
                    );


                if (!original) {
                    return;
                }


                snapshot();


                const copy = {

                    ...original,

                    id:
                        makeId("flow"),

                    x:
                        original.x + 40,

                    y:
                        original.y + 40

                };


                flowNodes.push(
                    copy
                );


                selectedNodeId =
                    copy.id;


                renderFlowchart();
                syncVisualData();
            }
        );


    /* ==========================================================
       FLOWCHART TEMPLATES
       ========================================================== */

    function createTemplate(
        template
    ) {

        snapshot();


        flowNodes = [];
        flowEdges = [];


        if (
            template ===
            "linear"
        ) {

            flowNodes = [

                {
                    id: makeId(),
                    type: "start",
                    label: "Start",
                    x: 260,
                    y: 40,
                    width: 150,
                    height: 52
                },

                {
                    id: makeId(),
                    type: "io",
                    label: "Read Input",
                    x: 255,
                    y: 140,
                    width: 160,
                    height: 62
                },

                {
                    id: makeId(),
                    type: "process",
                    label: "Process Data",
                    x: 255,
                    y: 260,
                    width: 160,
                    height: 62
                },

                {
                    id: makeId(),
                    type: "io",
                    label: "Display Output",
                    x: 255,
                    y: 380,
                    width: 160,
                    height: 62
                },

                {
                    id: makeId(),
                    type: "start",
                    label: "End",
                    x: 260,
                    y: 490,
                    width: 150,
                    height: 52
                }

            ];

        } else if (
            template ===
            "decision"
        ) {

            flowNodes = [

                {
                    id: makeId(),
                    type: "start",
                    label: "Start",
                    x: 250,
                    y: 30,
                    width: 150,
                    height: 52
                },

                {
                    id: makeId(),
                    type: "io",
                    label: "Read Input",
                    x: 245,
                    y: 130,
                    width: 160,
                    height: 62
                },

                {
                    id: makeId(),
                    type: "decision",
                    label: "Condition?",
                    x: 245,
                    y: 250,
                    width: 160,
                    height: 92
                },

                {
                    id: makeId(),
                    type: "process",
                    label: "Yes → Process",
                    x: 50,
                    y: 410,
                    width: 160,
                    height: 62
                },

                {
                    id: makeId(),
                    type: "process",
                    label: "No → Process",
                    x: 440,
                    y: 410,
                    width: 160,
                    height: 62
                },

                {
                    id: makeId(),
                    type: "start",
                    label: "End",
                    x: 250,
                    y: 540,
                    width: 150,
                    height: 52
                }

            ];

        } else if (
            template ===
            "loop"
        ) {

            flowNodes = [

                {
                    id: makeId(),
                    type: "start",
                    label: "Start",
                    x: 250,
                    y: 30,
                    width: 150,
                    height: 52
                },

                {
                    id: makeId(),
                    type: "process",
                    label: "Initialize",
                    x: 245,
                    y: 130,
                    width: 160,
                    height: 62
                },

                {
                    id: makeId(),
                    type: "decision",
                    label: "Condition?",
                    x: 245,
                    y: 250,
                    width: 160,
                    height: 92
                },

                {
                    id: makeId(),
                    type: "process",
                    label: "Loop Body",
                    x: 245,
                    y: 400,
                    width: 160,
                    height: 62
                },

                {
                    id: makeId(),
                    type: "process",
                    label: "Update",
                    x: 245,
                    y: 500,
                    width: 160,
                    height: 62
                },

                {
                    id: makeId(),
                    type: "start",
                    label: "End",
                    x: 250,
                    y: 650,
                    width: 150,
                    height: 52
                }

            ];
        }


        /* Sequential template connections */

        for (
            let i = 0;
            i <
            flowNodes.length - 1;
            i++
        ) {

            flowEdges.push({

                from:
                    flowNodes[i].id,

                to:
                    flowNodes[i + 1].id,

                label:
                    ""

            });
        }


        if (
            template ===
            "decision"
        ) {

            flowEdges = [

                {
                    from:
                        flowNodes[0].id,

                    to:
                        flowNodes[1].id,

                    label: ""

                },

                {
                    from:
                        flowNodes[1].id,

                    to:
                        flowNodes[2].id,

                    label: ""

                },

                {
                    from:
                        flowNodes[2].id,

                    to:
                        flowNodes[3].id,

                    label: "Yes"

                },

                {
                    from:
                        flowNodes[2].id,

                    to:
                        flowNodes[4].id,

                    label: "No"

                },

                {
                    from:
                        flowNodes[3].id,

                    to:
                        flowNodes[5].id,

                    label: ""

                },

                {
                    from:
                        flowNodes[4].id,

                    to:
                        flowNodes[5].id,

                    label: ""

                }

            ];
        }


        if (
            template ===
            "loop"
        ) {

            flowEdges = [

                {
                    from:
                        flowNodes[0].id,

                    to:
                        flowNodes[1].id,

                    label: ""

                },

                {
                    from:
                        flowNodes[1].id,

                    to:
                        flowNodes[2].id,

                    label: ""

                },

                {
                    from:
                        flowNodes[2].id,

                    to:
                        flowNodes[3].id,

                    label: "Yes"

                },

                {
                    from:
                        flowNodes[3].id,

                    to:
                        flowNodes[4].id,

                    label: ""

                },

                {
                    from:
                        flowNodes[4].id,

                    to:
                        flowNodes[2].id,

                    label: "Repeat"

                },

                {
                    from:
                        flowNodes[2].id,

                    to:
                        flowNodes[5].id,

                    label: "No"

                }

            ];
        }


        selectedNodeId =
            flowNodes[0]?.id ||
            null;


        renderFlowchart();
        syncVisualData();
    }


    document
        .querySelectorAll(
            ".flow-template"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        createTemplate(
                            button.dataset.flowTemplate
                        );

                    }
                );
            }
        );


    /* ==========================================================
       KEYBOARD DELETE
       ========================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Delete"
            ) {
                return;
            }


            const active =
                document.activeElement;


            if (
                active &&
                (
                    active.tagName ===
                        "TEXTAREA" ||
                    active.tagName ===
                        "INPUT" ||
                    active.tagName ===
                        "SELECT"
                )
            ) {
                return;
            }


            if (
                !selectedNodeId
            ) {
                return;
            }


            snapshot();


            flowNodes =
                flowNodes.filter(
                    node =>
                        node.id !==
                        selectedNodeId
                );


            flowEdges =
                flowEdges.filter(
                    edge =>
                        edge.from !==
                            selectedNodeId &&
                        edge.to !==
                            selectedNodeId
                );


            selectedNodeId =
                null;


            renderFlowchart();
            syncVisualData();
        }
    );


    /* ==========================================================
       MERMAID RENDERER
       ========================================================== */

    const source =
        document.getElementById(
            "codingFlowchartSource"
        );

    const preview =
        document.getElementById(
            "codingFlowchartPreview"
        );


    async function renderMermaid() {

        if (
            !source ||
            !preview ||
            !window.mermaid
        ) {
            return;
        }


        try {

            mermaid.initialize({

                startOnLoad:
                    false,

                theme:
                    "base",

                securityLevel:
                    "loose",

                flowchart: {

                    curve:
                        "basis",

                    htmlLabels:
                        true

                }

            });


            preview.innerHTML = "";


            const diagram =
                source.value.trim() ||
                `flowchart TD
A([Start]) --> B[Write Code]
B --> C([End])`;


            const result =
                await mermaid.render(
                    "coding_flow_" +
                    Date.now(),
                    diagram
                );


            preview.innerHTML =
                result.svg;


        } catch (error) {

            preview.textContent =
                "Flowchart syntax error: " +
                error.message;
        }
    }


    document
        .getElementById(
            "renderCodingFlowchart"
        )
        ?.addEventListener(
            "click",
            renderMermaid
        );


    if (
        source?.value.trim()
    ) {
        renderMermaid();
    }


    /* ==========================================================
       INITIAL RENDER
       ========================================================== */

    renderFlowchart();

});