document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // GRAPH BUILDER
    // =========================================================

    const canvas =
        document.getElementById('graphCanvas');

    /*
     * The graph builder should not prevent the flowchart
     * from working if the graph canvas is absent.
     */
    if (canvas) {

        let tool = 'select';

        let nodes = [];

        let edges = [];

        let selectedNodeId = null;

        let selectedEdge = null;

        let edgeSourceId = null;

        const structureType =
            document.getElementById('structureType');

        const graphSetup =
            document.getElementById('graphSetup');

        const nodeInput =
            document.getElementById('nodeInput');

        const edgeInput =
            document.getElementById('edgeInput');

        const directedToggle =
            document.getElementById('directedToggle');

        const weightedToggle =
            document.getElementById('weightedToggle');

        const directedOption =
            document.getElementById('directedOption');

        const weightedOption =
            document.getElementById('weightedOption');

        const buildGraphButton =
            document.getElementById('buildGraph');

        const closeGraphSetup =
            document.getElementById('closeGraphSetup');

        const nodeCount =
            document.getElementById('nodeCount');

        const edgeCount =
            document.getElementById('edgeCount');

        const state =
            window.ORION_NOTE_STATE?.visual || {};

        nodes =
            Array.isArray(state.nodes)
                ? state.nodes
                : [];

        edges =
            Array.isArray(state.edges)
                ? state.edges
                : [];


        // -----------------------------------------------------
        // Helpers
        // -----------------------------------------------------

        function makeId(prefix = 'node') {

            if (
                window.crypto &&
                typeof window.crypto.randomUUID ===
                    'function'
            ) {
                return (
                    prefix +
                    '_' +
                    window.crypto.randomUUID()
                );
            }

            return (
                prefix +
                '_' +
                Date.now() +
                '_' +
                Math.random()
                    .toString(36)
                    .slice(2)
            );
        }


        function sync() {

            if (window.ORION_NOTE_STATE) {

                window.ORION_NOTE_STATE.visual = {
                    nodes,
                    edges
                };

                window.ORION_MARK_CHANGED?.();
            }
        }


        function updateCounts() {

            if (nodeCount) {
                nodeCount.textContent =
                    nodes.length;
            }

            if (edgeCount) {
                edgeCount.textContent =
                    edges.length;
            }
        }


        function getStructureFlags() {

            const type =
                structureType?.value ||
                'graph';

            const directedTypes = [
                'directed-graph',
                'directed-weighted-graph',
                'dag'
            ];

            const weightedTypes = [
                'weighted-graph',
                'directed-weighted-graph'
            ];

            return {
                directed:
                    directedTypes.includes(type) ||
                    Boolean(
                        directedToggle?.checked
                    ),

                weighted:
                    weightedTypes.includes(type) ||
                    Boolean(
                        weightedToggle?.checked
                    )
            };
        }


        function isGraphStructure() {

            const type =
                structureType?.value ||
                'graph';

            return [
                'graph',
                'directed-graph',
                'weighted-graph',
                'directed-weighted-graph',
                'dag',
                'adjacency-list',
                'adjacency-matrix'
            ].includes(type);
        }


        function openGraphSetup() {

            if (!graphSetup) {
                return;
            }

            graphSetup.hidden = false;

            updateStructureOptions();
        }


        function closeGraphSetupPanel() {

            if (!graphSetup) {
                return;
            }

            graphSetup.hidden = true;
        }


        function updateStructureOptions() {

            const flags =
                getStructureFlags();

            const type =
                structureType?.value ||
                'graph';

            const forceDirected =
                [
                    'directed-graph',
                    'directed-weighted-graph',
                    'dag'
                ].includes(type);

            const forceWeighted =
                [
                    'weighted-graph',
                    'directed-weighted-graph'
                ].includes(type);

            if (directedToggle) {
                directedToggle.checked =
                    forceDirected ||
                    directedToggle.checked;
            }

            if (weightedToggle) {
                weightedToggle.checked =
                    forceWeighted ||
                    weightedToggle.checked;
            }

            if (
                directedOption
            ) {

                directedOption.style.display =
                    isGraphStructure()
                        ? 'flex'
                        : 'none';
            }

            if (
                weightedOption
            ) {

                weightedOption.style.display =
                    isGraphStructure()
                        ? 'flex'
                        : 'none';
            }

            /*
             * Keep DAG directed.
             */
            if (
                type === 'dag' &&
                directedToggle
            ) {

                directedToggle.checked =
                    true;

                directedToggle.disabled =
                    true;

            } else if (directedToggle) {

                directedToggle.disabled =
                    false;
            }

            /*
             * Keep weighted structures weighted.
             */
            if (
                forceWeighted &&
                weightedToggle
            ) {

                weightedToggle.checked =
                    true;

                weightedToggle.disabled =
                    true;

            } else if (weightedToggle) {

                weightedToggle.disabled =
                    false;
            }

            /*
             * Avoid unused variable warnings while
             * preserving the helper.
             */
            void flags;
        }


        function findNodeByLabel(label) {

            const normalized =
                String(label)
                    .trim()
                    .toLowerCase();

            return nodes.find(
                node =>
                    String(node.label)
                        .trim()
                        .toLowerCase() ===
                    normalized
            );
        }


        function getNodeLabelList() {

            return nodes
                .map(node => node.label)
                .join(', ');
        }


        function createNode(
            label,
            index = nodes.length
        ) {

            const canvasWidth =
                Math.max(
                    canvas.clientWidth || 800,
                    500
                );

            const spacingX =
                130;

            const spacingY =
                100;

            const columns =
                Math.max(
                    1,
                    Math.floor(
                        canvasWidth /
                        spacingX
                    )
                );

            const column =
                index % columns;

            const row =
                Math.floor(
                    index / columns
                );

            return {

                id:
                    makeId(),

                label:
                    String(label).trim() ||
                    String(index + 1),

                x:
                    50 +
                    column *
                    spacingX,

                y:
                    50 +
                    row *
                    spacingY,

                width:
                    40,

                height:
                    40
            };
        }


        function parseEdgeString(
            edgeString,
            directed,
            weighted
        ) {

            const value =
                String(edgeString || '')
                    .trim();

            if (!value) {
                return null;
            }

            /*
             * Supports:
             *
             * A-B
             * A -> B
             * A-B-5
             * A -> B : 5
             * A-B:5
             */

            let parts = [];

            if (
                value.includes('->')
            ) {

                parts =
                    value
                        .split('->')
                        .map(
                            item =>
                                item.trim()
                        );

            } else {

                parts =
                    value
                        .split(/\s*-\s*/)
                        .map(
                            item =>
                                item.trim()
                        );
            }

            if (parts.length < 2) {
                return null;
            }

            const fromLabel =
                parts[0];

            let toLabel =
                parts[1];

            let weight =
                '';

            if (
                parts.length >= 3
            ) {

                weight =
                    parts
                        .slice(2)
                        .join('-')
                        .trim();
            }

            /*
             * Also support:
             * A-B:10
             */
            if (
                toLabel.includes(':')
            ) {

                const split =
                    toLabel.split(':');

                toLabel =
                    split[0].trim();

                weight =
                    split
                        .slice(1)
                        .join(':')
                        .trim();
            }

            const from =
                findNodeByLabel(
                    fromLabel
                );

            const to =
                findNodeByLabel(
                    toLabel
                );

            if (!from || !to) {

                alert(
                    `Could not find node in edge "${value}".\n\nAvailable nodes: ${getNodeLabelList()}`
                );

                return null;
            }

            if (
                from.id ===
                to.id
            ) {

                alert(
                    `A node cannot connect to itself: ${from.label}`
                );

                return null;
            }

            /*
             * Prevent duplicate connections.
             */
            const duplicate =
                edges.some(
                    edge => {

                        if (
                            directed
                        ) {

                            return (
                                edge.from ===
                                    from.id &&
                                edge.to ===
                                    to.id
                            );
                        }

                        return (
                            (
                                edge.from ===
                                    from.id &&
                                edge.to ===
                                    to.id
                            ) ||
                            (
                                edge.from ===
                                    to.id &&
                                edge.to ===
                                    from.id
                            )
                        );
                    }
                );

            if (duplicate) {
                return null;
            }

            return {

                from:
                    from.id,

                to:
                    to.id,

                directed:
                    Boolean(directed),

                weighted:
                    Boolean(weighted),

                label:
                    weighted
                        ? weight
                        : ''
            };
        }


        function buildFromInputs() {

            const rawNodes =
                nodeInput?.value
                    ?.split(',')
                    .map(
                        item =>
                            item.trim()
                    )
                    .filter(Boolean) ||
                [];

            if (!rawNodes.length) {

                alert(
                    'Please enter at least one node.'
                );

                return;
            }

            /*
             * Remove duplicate node labels.
             */
            const uniqueLabels = [];

            rawNodes.forEach(
                label => {

                    const exists =
                        uniqueLabels.some(
                            item =>
                                item.toLowerCase() ===
                                label.toLowerCase()
                        );

                    if (!exists) {
                        uniqueLabels.push(
                            label
                        );
                    }
                }
            );

            const flags =
                getStructureFlags();

            nodes =
                uniqueLabels.map(
                    (
                        label,
                        index
                    ) =>
                        createNode(
                            label,
                            index
                        )
                );

            edges = [];

            const rawEdges =
                edgeInput?.value
                    ?.split(',')
                    .map(
                        item =>
                            item.trim()
                    )
                    .filter(Boolean) ||
                [];

            rawEdges.forEach(
                edgeString => {

                    const edge =
                        parseEdgeString(
                            edgeString,
                            flags.directed,
                            flags.weighted
                        );

                    if (edge) {
                        edges.push(
                            edge
                        );
                    }
                }
            );

            selectedNodeId =
                null;

            selectedEdge =
                null;

            edgeSourceId =
                null;

            closeGraphSetupPanel();

            sync();

            render();
        }


        function promptForNodeLabel() {

            const label =
                prompt(
                    'Enter the node data / label:',
                    String(
                        nodes.length + 1
                    )
                );

            if (
                label ===
                null
            ) {
                return null;
            }

            const trimmed =
                label.trim();

            if (!trimmed) {

                alert(
                    'Node data cannot be empty.'
                );

                return null;
            }

            if (
                findNodeByLabel(
                    trimmed
                )
            ) {

                alert(
                    'A node with this label already exists.'
                );

                return null;
            }

            return trimmed;
        }


        function addNodeAtPosition(
            x,
            y
        ) {

            const label =
                promptForNodeLabel();

            if (
                label ===
                null
            ) {
                return;
            }

            const node =
                createNode(
                    label,
                    nodes.length
                );

            node.x =
                Math.max(
                    0,
                    x -
                    node.width / 2
                );

            node.y =
                Math.max(
                    0,
                    y -
                    node.height / 2
                );

            nodes.push(
                node
            );

            selectedNodeId =
                node.id;

            selectedEdge =
                null;

            sync();

            render();
        }


        function addNodeFromButton() {

            const label =
                promptForNodeLabel();

            if (
                label ===
                null
            ) {
                return;
            }

            const index =
                nodes.length;

            const node =
                createNode(
                    label,
                    index
                );

            /*
             * Place newly added nodes near
             * the visible center.
             */
            const width =
                canvas.clientWidth ||
                800;

            const height =
                canvas.clientHeight ||
                500;

            node.x =
                Math.max(
                    20,
                    width / 2 -
                    20 +
                    (
                        index % 3
                    ) * 20
                );

            node.y =
                Math.max(
                    20,
                    height / 2 -
                    20 +
                    Math.floor(
                        index / 3
                    ) * 70
                );

            nodes.push(
                node
            );

            selectedNodeId =
                node.id;

            selectedEdge =
                null;

            sync();

            render();
        }


        function deleteSelectedNode() {

            if (
                !selectedNodeId
            ) {

                alert(
                    'Select a node first.'
                );

                return;
            }

            const node =
                nodes.find(
                    item =>
                        item.id ===
                        selectedNodeId
                );

            if (!node) {
                return;
            }

            if (
                !confirm(
                    `Delete node "${node.label}" and all of its connections?`
                )
            ) {
                return;
            }

            nodes =
                nodes.filter(
                    item =>
                        item.id !==
                        selectedNodeId
                );

            edges =
                edges.filter(
                    edge =>
                        edge.from !==
                            selectedNodeId &&
                        edge.to !==
                            selectedNodeId
                );

            selectedNodeId =
                null;

            selectedEdge =
                null;

            edgeSourceId =
                null;

            sync();

            render();
        }


        function deleteSelectedEdge() {

            if (
                !selectedEdge
            ) {

                alert(
                    'Select an edge first.'
                );

                return;
            }

            const index =
                edges.indexOf(
                    selectedEdge
                );

            if (
                index ===
                -1
            ) {
                selectedEdge =
                    null;

                render();

                return;
            }

            edges.splice(
                index,
                1
            );

            selectedEdge =
                null;

            edgeSourceId =
                null;

            sync();

            render();
        }


        function connectNodes(
            fromId,
            toId
        ) {

            if (
                fromId ===
                toId
            ) {
                return;
            }

            const flags =
                getStructureFlags();

            const duplicate =
                edges.some(
                    edge => {

                        if (
                            flags.directed
                        ) {

                            return (
                                edge.from ===
                                    fromId &&
                                edge.to ===
                                    toId
                            );
                        }

                        return (
                            (
                                edge.from ===
                                    fromId &&
                                edge.to ===
                                    toId
                            ) ||
                            (
                                edge.from ===
                                    toId &&
                                edge.to ===
                                    fromId
                            )
                        );
                    }
                );

            if (duplicate) {

                alert(
                    'That connection already exists.'
                );

                return;
            }

            let label = '';

            if (
                flags.weighted
            ) {

                label =
                    prompt(
                        'Enter edge weight:',
                        '1'
                    );

                if (
                    label ===
                    null
                ) {
                    return;
                }
            }

            edges.push({

                from:
                    fromId,

                to:
                    toId,

                directed:
                    flags.directed,

                weighted:
                    flags.weighted,

                label:
                    label || ''
            });

            selectedNodeId =
                toId;

            selectedEdge =
                null;

            edgeSourceId =
                null;

            sync();

            render();
        }


        function getEdgePoint(
            event
        ) {

            const rect =
                canvas.getBoundingClientRect();

            return {

                x:
                    event.clientX -
                    rect.left,

                y:
                    event.clientY -
                    rect.top
            };
        }


        // -----------------------------------------------------
        // Render graph
        // -----------------------------------------------------

        function render() {

            canvas
                .querySelectorAll(
                    '.graph-node, .graph-edge-line, .graph-edge-label'
                )
                .forEach(
                    element =>
                        element.remove()
                );


            const placeholder =
                canvas.querySelector(
                    '.graph-placeholder'
                );


            if (placeholder) {

                placeholder.style.display =
                    nodes.length
                        ? 'none'
                        : 'flex';
            }


            // -------------------------------------------------
            // Edges FIRST
            // -------------------------------------------------

            edges.forEach(edge => {

                const a =
                    nodes.find(
                        n =>
                            n.id ===
                            edge.from
                    );

                const b =
                    nodes.find(
                        n =>
                            n.id ===
                            edge.to
                    );


                if (!a || !b) return;


                const ax =
                    a.x +
                    (a.width || 40) / 2;

                const ay =
                    a.y +
                    (a.height || 40) / 2;

                const bx =
                    b.x +
                    (b.width || 40) / 2;

                const by =
                    b.y +
                    (b.height || 40) / 2;


                const dx =
                    bx - ax;

                const dy =
                    by - ay;

                const length =
                    Math.hypot(
                        dx,
                        dy
                    );


                const line =
                    document.createElement(
                        'div'
                    );


                line.className =
                    'graph-edge-line';


                if (
                    selectedEdge ===
                    edge
                ) {

                    line.classList.add(
                        'selected'
                    );
                }


                line.style.width =
                    length + 'px';

                line.style.left =
                    ax + 'px';

                line.style.top =
                    ay + 'px';

                line.style.transform =
                    `rotate(${Math.atan2(
                        dy,
                        dx
                    )}rad)`;


                if (
                    edge.directed
                ) {

                    line.dataset.directed =
                        'true';
                }


                if (
                    edge.weighted
                ) {

                    line.dataset.weighted =
                        'true';
                }


                line.addEventListener(
                    'click',
                    event => {

                        event.stopPropagation();

                        selectedEdge =
                            edge;

                        selectedNodeId =
                            null;

                        render();
                    }
                );


                line.addEventListener(
                    'dblclick',
                    event => {

                        event.stopPropagation();

                        selectedEdge =
                            edge;

                        deleteSelectedEdge();
                    }
                );


                canvas.appendChild(
                    line
                );


                if (
                    edge.label
                ) {

                    const label =
                        document.createElement(
                            'span'
                        );

                    label.className =
                        'graph-edge-label';

                    if (
                        selectedEdge ===
                        edge
                    ) {

                        label.classList.add(
                            'selected'
                        );
                    }

                    label.textContent =
                        edge.label;

                    label.style.left =
                        (
                            (ax + bx) / 2
                        ) + 'px';

                    label.style.top =
                        (
                            (ay + by) / 2
                        ) + 'px';


                    label.addEventListener(
                        'click',
                        event => {

                            event.stopPropagation();

                            selectedEdge =
                                edge;

                            selectedNodeId =
                                null;

                            render();
                        }
                    );


                    canvas.appendChild(
                        label
                    );
                }

            });


            // -------------------------------------------------
            // Nodes
            // -------------------------------------------------

            nodes.forEach(node => {

                const element =
                    document.createElement(
                        'div'
                    );


                element.className =
                    'graph-node';


                if (
                    node.id ===
                    selectedNodeId
                ) {

                    element.classList.add(
                        'selected'
                    );
                }


                if (
                    edgeSourceId ===
                    node.id
                ) {

                    element.classList.add(
                        'edge-source'
                    );
                }


                element.textContent =
                    node.label;


                element.dataset.id =
                    node.id;


                element.style.left =
                    node.x + 'px';

                element.style.top =
                    node.y + 'px';


                if (node.width) {

                    element.style.width =
                        node.width + 'px';
                }


                if (node.height) {

                    element.style.height =
                        node.height + 'px';
                }


                // ---------------------------------------------
                // Drag
                // ---------------------------------------------

                element.addEventListener(
                    'mousedown',
                    event => {

                        if (
                            tool !==
                            'select'
                        ) {
                            return;
                        }


                        event.preventDefault();

                        event.stopPropagation();


                        selectedNodeId =
                            node.id;

                        selectedEdge =
                            null;

                        render();


                        const rect =
                            canvas.getBoundingClientRect();


                        const offsetX =
                            event.clientX -
                            rect.left -
                            node.x;


                        const offsetY =
                            event.clientY -
                            rect.top -
                            node.y;


                        function move(
                            moveEvent
                        ) {

                            node.x =
                                Math.max(
                                    0,
                                    moveEvent.clientX -
                                    rect.left -
                                    offsetX
                                );


                            node.y =
                                Math.max(
                                    0,
                                    moveEvent.clientY -
                                    rect.top -
                                    offsetY
                                );


                            element.style.left =
                                node.x + 'px';

                            element.style.top =
                                node.y + 'px';


                            /*
                             * Edges need to move while dragging.
                             */
                            renderEdgesOnly();
                        }


                        function up() {

                            document
                                .removeEventListener(
                                    'mousemove',
                                    move
                                );

                            document
                                .removeEventListener(
                                    'mouseup',
                                    up
                                );

                            sync();
                        }


                        document
                            .addEventListener(
                                'mousemove',
                                move
                            );

                        document
                            .addEventListener(
                                'mouseup',
                                up
                            );
                    }
                );


                // ---------------------------------------------
                // Click / connect
                // ---------------------------------------------

                element.addEventListener(
                    'click',
                    event => {

                        event.stopPropagation();


                        if (
                            tool ===
                            'edge'
                        ) {

                            if (
                                !edgeSourceId
                            ) {

                                edgeSourceId =
                                    node.id;

                                selectedNodeId =
                                    node.id;

                                selectedEdge =
                                    null;

                                render();

                                return;
                            }


                            if (
                                edgeSourceId ===
                                node.id
                            ) {

                                edgeSourceId =
                                    null;

                                render();

                                return;
                            }


                            connectNodes(
                                edgeSourceId,
                                node.id
                            );

                            return;
                        }


                        if (
                            tool ===
                            'select'
                        ) {

                            selectedNodeId =
                                node.id;

                            selectedEdge =
                                null;

                            render();
                        }
                    }
                );


                /*
                 * Double-click a node to delete it.
                 */
                element.addEventListener(
                    'dblclick',
                    event => {

                        event.stopPropagation();

                        selectedNodeId =
                            node.id;

                        deleteSelectedNode();
                    }
                );


                canvas.appendChild(
                    element
                );
            });


            updateCounts();
        }


        function renderEdgesOnly() {

            canvas
                .querySelectorAll(
                    '.graph-edge-line, .graph-edge-label'
                )
                .forEach(
                    element =>
                        element.remove()
                );


            edges.forEach(edge => {

                const a =
                    nodes.find(
                        n =>
                            n.id ===
                            edge.from
                    );

                const b =
                    nodes.find(
                        n =>
                            n.id ===
                            edge.to
                    );


                if (!a || !b) return;


                const ax =
                    a.x +
                    (a.width || 40) / 2;

                const ay =
                    a.y +
                    (a.height || 40) / 2;

                const bx =
                    b.x +
                    (b.width || 40) / 2;

                const by =
                    b.y +
                    (b.height || 40) / 2;


                const dx =
                    bx - ax;

                const dy =
                    by - ay;

                const length =
                    Math.hypot(
                        dx,
                        dy
                    );


                const line =
                    document.createElement(
                        'div'
                    );


                line.className =
                    'graph-edge-line';


                if (
                    selectedEdge ===
                    edge
                ) {

                    line.classList.add(
                        'selected'
                    );
                }


                line.style.width =
                    length + 'px';

                line.style.left =
                    ax + 'px';

                line.style.top =
                    ay + 'px';

                line.style.transform =
                    `rotate(${Math.atan2(
                        dy,
                        dx
                    )}rad)`;


                if (
                    edge.directed
                ) {

                    line.dataset.directed =
                        'true';
                }


                canvas.appendChild(
                    line
                );
            });
        }


        // -----------------------------------------------------
        // Graph tools
        // -----------------------------------------------------

        document
            .querySelectorAll(
                '.graph-tool'
            )
            .forEach(button => {

                button.addEventListener(
                    'click',
                    () => {

                        tool =
                            button.dataset.tool;

                        edgeSourceId =
                            null;

                        selectedEdge =
                            null;


                        document
                            .querySelectorAll(
                                '.graph-tool'
                            )
                            .forEach(
                                item =>
                                    item.classList
                                        .remove(
                                            'active'
                                        )
                            );


                        button.classList.add(
                            'active'
                        );


                        if (
                            tool ===
                            'clear'
                        ) {

                            if (
                                nodes.length ||
                                edges.length
                            ) {

                                if (
                                    confirm(
                                        'Clear the entire structure?'
                                    )
                                ) {

                                    nodes = [];

                                    edges = [];

                                    selectedNodeId =
                                        null;

                                    selectedEdge =
                                        null;

                                    sync();

                                    render();
                                }
                            }

                            tool =
                                'select';

                            document
                                .querySelector(
                                    '.graph-tool[data-tool="select"]'
                                )
                                ?.classList.add(
                                    'active'
                                );
                        }


                        if (
                            tool ===
                            'node'
                        ) {

                            /*
                             * The actual node is added by
                             * clicking the canvas.
                             */
                        }


                        if (
                            tool ===
                            'edge'
                        ) {

                            /*
                             * User clicks the first node,
                             * then the second node.
                             */
                        }
                    }
                );
            });


        // -----------------------------------------------------
        // Canvas click
        // -----------------------------------------------------

        canvas.addEventListener(
            'click',
            event => {

                /*
                 * Ignore clicks directly on nodes/edges.
                 */
                if (
                    event.target.closest(
                        '.graph-node, .graph-edge-line, .graph-edge-label'
                    )
                ) {
                    return;
                }


                if (
                    tool !==
                    'node'
                ) {

                    selectedNodeId =
                        null;

                    selectedEdge =
                        null;

                    edgeSourceId =
                        null;

                    render();

                    return;
                }


                const point =
                    getEdgePoint(
                        event
                    );


                addNodeAtPosition(
                    point.x,
                    point.y
                );
            }
        );


        // -----------------------------------------------------
        // Keyboard deletion
        // -----------------------------------------------------

        document.addEventListener(
            'keydown',
            event => {

                /*
                 * Don't delete while typing into
                 * an input/textarea.
                 */
                const tag =
                    event.target?.tagName;

                if (
                    tag === 'INPUT' ||
                    tag === 'TEXTAREA' ||
                    tag === 'SELECT'
                ) {
                    return;
                }


                if (
                    event.key ===
                        'Delete' ||
                    event.key ===
                        'Backspace'
                ) {

                    if (
                        selectedEdge
                    ) {

                        deleteSelectedEdge();

                    } else if (
                        selectedNodeId
                    ) {

                        deleteSelectedNode();
                    }
                }
            }
        );


        // -----------------------------------------------------
        // Structure setup
        // -----------------------------------------------------

        structureType
            ?.addEventListener(
                'change',
                () => {

                    updateStructureOptions();

                    openGraphSetup();
                }
            );


        directedToggle
            ?.addEventListener(
                'change',
                () => {

                    /*
                     * Existing edges should follow the
                     * currently selected structure.
                     */
                    const flags =
                        getStructureFlags();

                    edges.forEach(
                        edge => {

                            edge.directed =
                                flags.directed;

                            edge.weighted =
                                flags.weighted;
                        }
                    );

                    sync();

                    render();
                }
            );


        weightedToggle
            ?.addEventListener(
                'change',
                () => {

                    const flags =
                        getStructureFlags();

                    edges.forEach(
                        edge => {

                            edge.weighted =
                                flags.weighted;
                        }
                    );

                    sync();

                    render();
                }
            );


        buildGraphButton
            ?.addEventListener(
                'click',
                buildFromInputs
            );


        closeGraphSetup
            ?.addEventListener(
                'click',
                closeGraphSetupPanel
            );


        // -----------------------------------------------------
        // Add node button
        // -----------------------------------------------------

        /*
         * Clicking + Node directly asks for node data.
         * Clicking the canvas while + Node is active also
         * asks for node data and places the node there.
         */
        document
            .querySelector(
                '.graph-tool[data-tool="node"]'
            )
            ?.addEventListener(
                'dblclick',
                event => {

                    event.preventDefault();

                    addNodeFromButton();
                }
            );


        // -----------------------------------------------------
        // Initial setup
        // -----------------------------------------------------

        updateStructureOptions();

        render();
    }


    // =========================================================
    // CODING & LOGIC STYLE ALGORITHM FLOWCHART
    // =========================================================

    const flowCanvas =
        document.getElementById(
            'codingFlowchartCanvas'
        );


    const flowSvg =
        document.getElementById(
            'codingFlowchartSvg'
        );


    if (!flowCanvas || !flowSvg) {

        /*
         * No flowchart on this page.
         * Graph functionality above remains unaffected.
         */
        return;
    }


    // ---------------------------------------------------------
    // State
    // ---------------------------------------------------------

    const visualData =
        document.getElementById(
            'codingFlowchartVisualData'
        );


    let flowNodes = [];

    let flowEdges = [];

    let selectedFlowNode = null;

    let connectSource = null;

    let flowTool = 'select';

    let snapGrid = true;

    let connectorStyle = 'elbow';

    let history = [];


    // ---------------------------------------------------------
    // Load saved visual flowchart
    // ---------------------------------------------------------

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

    } catch (error) {

        console.warn(
            'Could not load saved DSA flowchart:',
            error
        );

        flowNodes = [];

        flowEdges = [];
    }


    // ---------------------------------------------------------
    // Defaults
    // ---------------------------------------------------------

    const defaults = {

        start: {

            label:
                'Start',

            width:
                150,

            height:
                52
        },


        process: {

            label:
                'Process',

            width:
                150,

            height:
                62
        },


        decision: {

            label:
                'Condition?',

            width:
                160,

            height:
                92
        },


        io: {

            label:
                'Input / Output',

            width:
                160,

            height:
                62
        },


        document: {

            label:
                'Document',

            width:
                160,

            height:
                70
        }
    };


    // =========================================================
    // Helpers
    // =========================================================

    function createFlowId() {

        if (
            window.crypto &&
            typeof window.crypto.randomUUID ===
                'function'
        ) {

            return (
                'flow_' +
                window.crypto.randomUUID()
            );
        }


        return (
            'flow_' +
            Date.now() +
            '_' +
            Math.random()
                .toString(36)
                .slice(2)
        );
    }


    function snap(value) {

        if (!snapGrid) {
            return value;
        }

        return (
            Math.round(
                value / 20
            ) * 20
        );
    }


    function saveHistory() {

        history.push(
            JSON.stringify({
                nodes:
                    flowNodes,
                edges:
                    flowEdges
            })
        );


        if (
            history.length >
            30
        ) {

            history.shift();
        }
    }


    function syncFlow() {

        const payload = {

            nodes:
                flowNodes,

            edges:
                flowEdges
        };


        if (visualData) {

            visualData.value =
                JSON.stringify(
                    payload
                );
        }


        if (
            window.ORION_NOTE_STATE
        ) {

            window.ORION_NOTE_STATE.flowchart_visual =
                payload;
        }


        window.ORION_MARK_CHANGED?.();
    }


    function nodeCenter(node) {

        return {

            x:
                node.x +
                node.width / 2,

            y:
                node.y +
                node.height / 2
        };
    }


    // =========================================================
    // CONNECTORS
    // =========================================================

    function renderConnectors() {

        flowSvg
            .querySelectorAll(
                '.flow-connector, .flow-connector-label'
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


                if (
                    !from ||
                    !to
                ) {
                    return;
                }


                const a =
                    nodeCenter(
                        from
                    );

                const b =
                    nodeCenter(
                        to
                    );


                let pathData;


                // ---------------------------------------------
                // Straight
                // ---------------------------------------------

                if (
                    connectorStyle ===
                    'straight'
                ) {

                    pathData =
                        `M ${a.x} ${a.y}
                         L ${b.x} ${b.y}`;
                }


                // ---------------------------------------------
                // Curved
                // ---------------------------------------------

                else if (
                    connectorStyle ===
                    'curved'
                ) {

                    const middleX =
                        (
                            a.x +
                            b.x
                        ) / 2;


                    pathData =
                        `M ${a.x} ${a.y}
                         C ${middleX} ${a.y},
                           ${middleX} ${b.y},
                           ${b.x} ${b.y}`;
                }


                // ---------------------------------------------
                // Elbow
                // ---------------------------------------------

                else {

                    const middleY =
                        (
                            a.y +
                            b.y
                        ) / 2;


                    pathData =
                        `M ${a.x} ${a.y}
                         L ${a.x} ${middleY}
                         L ${b.x} ${middleY}
                         L ${b.x} ${b.y}`;
                }


                const path =
                    document.createElementNS(
                        'http://www.w3.org/2000/svg',
                        'path'
                    );


                path.setAttribute(
                    'd',
                    pathData
                );


                path.setAttribute(
                    'class',
                    'flow-connector'
                );


                path.setAttribute(
                    'marker-end',
                    'url(#codingArrow)'
                );


                path.addEventListener(
                    'click',
                    event => {

                        event.stopPropagation();


                        if (
                            !confirm(
                                'Delete this connection?'
                            )
                        ) {
                            return;
                        }


                        saveHistory();


                        flowEdges =
                            flowEdges.filter(
                                item =>
                                    item !==
                                    edge
                            );


                        renderFlowchart();

                        syncFlow();
                    }
                );


                flowSvg.appendChild(
                    path
                );


                // ---------------------------------------------
                // Connection label
                // ---------------------------------------------

                if (
                    edge.label
                ) {

                    const label =
                        document.createElementNS(
                            'http://www.w3.org/2000/svg',
                            'text'
                        );


                    label.setAttribute(
                        'x',
                        (
                            a.x +
                            b.x
                        ) / 2
                    );


                    label.setAttribute(
                        'y',
                        (
                            a.y +
                            b.y
                        ) / 2 -
                        7
                    );


                    label.setAttribute(
                        'class',
                        'flow-connector-label'
                    );


                    label.textContent =
                        edge.label;


                    flowSvg.appendChild(
                        label
                    );
                }

            }
        );
    }


    // =========================================================
    // NODES
    // =========================================================

    function renderFlowNodes() {

        flowCanvas
            .querySelectorAll(
                '.flow-node'
            )
            .forEach(
                element =>
                    element.remove()
            );


        flowNodes.forEach(
            node => {

                const element =
                    document.createElement(
                        'div'
                    );


                element.className =
                    `flow-node flow-node-${node.type}`;


                if (
                    node.id ===
                    selectedFlowNode
                ) {

                    element.classList.add(
                        'selected'
                    );
                }


                element.style.left =
                    node.x + 'px';


                element.style.top =
                    node.y + 'px';


                element.style.width =
                    node.width + 'px';


                element.style.height =
                    node.height + 'px';


                const text =
                    document.createElement(
                        'span'
                    );


                text.textContent =
                    node.label;


                element.appendChild(
                    text
                );


                // -------------------------------------------------
                // Mouse interaction
                // -------------------------------------------------

                element.addEventListener(
                    'mousedown',
                    event => {

                        event.stopPropagation();


                        // -----------------------------------------
                        // Connecting
                        // -----------------------------------------

                        if (
                            flowTool ===
                            'connect'
                        ) {

                            if (
                                !connectSource
                            ) {

                                connectSource =
                                    node.id;

                                selectedFlowNode =
                                    node.id;

                                renderFlowchart();

                                return;
                            }


                            if (
                                connectSource ===
                                node.id
                            ) {

                                connectSource =
                                    null;

                                renderFlowchart();

                                return;
                            }


                            saveHistory();


                            const sourceNode =
                                flowNodes.find(
                                    item =>
                                        item.id ===
                                        connectSource
                                );


                            let label =
                                '';


                            if (
                                sourceNode?.type ===
                                'decision'
                            ) {

                                label =
                                    prompt(
                                        'Connection label:',
                                        ''
                                    ) || '';
                            }


                            const alreadyExists =
                                flowEdges.some(
                                    edge =>
                                        edge.from ===
                                            connectSource &&
                                        edge.to ===
                                            node.id
                                );


                            if (
                                !alreadyExists
                            ) {

                                flowEdges.push({

                                    from:
                                        connectSource,

                                    to:
                                        node.id,

                                    label
                                });
                            }


                            connectSource =
                                null;


                            selectedFlowNode =
                                node.id;


                            renderFlowchart();

                            syncFlow();

                            return;
                        }


                        // -----------------------------------------
                        // Selection + dragging
                        // -----------------------------------------

                        selectedFlowNode =
                            node.id;


                        if (
                            flowTool !==
                            'select'
                        ) {

                            renderFlowchart();

                            return;
                        }


                        event.preventDefault();


                        const rect =
                            flowCanvas.getBoundingClientRect();


                        const offsetX =
                            event.clientX -
                            rect.left -
                            node.x;


                        const offsetY =
                            event.clientY -
                            rect.top -
                            node.y;


                        function move(
                            moveEvent
                        ) {

                            node.x =
                                Math.max(
                                    0,
                                    snap(
                                        moveEvent.clientX -
                                        rect.left -
                                        offsetX
                                    )
                                );


                            node.y =
                                Math.max(
                                    0,
                                    snap(
                                        moveEvent.clientY -
                                        rect.top -
                                        offsetY
                                    )
                                );


                            element.style.left =
                                node.x + 'px';


                            element.style.top =
                                node.y + 'px';


                            renderConnectors();
                        }


                        function up() {

                            document
                                .removeEventListener(
                                    'mousemove',
                                    move
                                );


                            document
                                .removeEventListener(
                                    'mouseup',
                                    up
                                );


                            syncFlow();
                        }


                        document
                            .addEventListener(
                                'mousemove',
                                move
                            );


                        document
                            .addEventListener(
                                'mouseup',
                                up
                            );


                        updateInspector();
                    }
                );


                flowCanvas.appendChild(
                    element
                );
            }
        );
    }


    // =========================================================
    // COMPLETE FLOWCHART RENDER
    // =========================================================

    function renderFlowchart() {

        renderConnectors();

        renderFlowNodes();

        updateInspector();


        const emptyState =
            document.getElementById(
                'codingFlowchartEmpty'
            );


        if (emptyState) {

            emptyState.style.display =
                flowNodes.length
                    ? 'none'
                    : 'flex';
        }
    }


    // =========================================================
    // ADD SHAPE
    // =========================================================

    function addFlowShape(type) {

        const preset =
            defaults[type] ||
            defaults.process;


        saveHistory();


        const offset =
            flowNodes.length *
            20;


        const node = {

            id:
                createFlowId(),

            type:

                type,

            label:
                preset.label,

            x:
                snap(
                    70 +
                    offset
                ),

            y:
                snap(
                    60 +
                    offset
                ),

            width:
                preset.width,

            height:
                preset.height
        };


        flowNodes.push(
            node
        );


        selectedFlowNode =
            node.id;


        renderFlowchart();

        syncFlow();
    }


    document
        .querySelectorAll(
            '.flow-shape-tool'
        )
        .forEach(
            button => {

                button.addEventListener(
                    'click',
                    () => {

                        addFlowShape(
                            button.dataset
                                .flowShape
                        );
                    }
                );
            }
        );


    // =========================================================
    // SELECT TOOL
    // =========================================================

    document
        .getElementById(
            'flowSelectTool'
        )
        ?.addEventListener(
            'click',
            () => {

                flowTool =
                    'select';

                connectSource =
                    null;


                document
                    .querySelectorAll(
                        '.flow-special-tool'
                    )
                    .forEach(
                        item =>
                            item.classList
                                .remove(
                                    'active'
                                )
                    );


                document
                    .getElementById(
                        'flowSelectTool'
                    )
                    ?.classList.add(
                        'active'
                    );
            }
        );


    // =========================================================
    // CONNECT TOOL
    // =========================================================

    document
        .getElementById(
            'flowConnectTool'
        )
        ?.addEventListener(
            'click',
            () => {

                flowTool =
                    'connect';

                connectSource =
                    null;


                document
                    .querySelectorAll(
                        '.flow-special-tool'
                    )
                    .forEach(
                        item =>
                            item.classList
                                .remove(
                                    'active'
                                )
                    );


                document
                    .getElementById(
                        'flowConnectTool'
                    )
                    ?.classList.add(
                        'active'
                    );
            }
        );


    // =========================================================
    // SNAP GRID
    // =========================================================

    document
        .getElementById(
            'flowSnapGrid'
        )
        ?.addEventListener(
            'change',
            event => {

                snapGrid =
                    event.target.checked;
            }
        );


    // =========================================================
    // CONNECTOR STYLE
    // =========================================================

    document
        .getElementById(
            'flowConnectorStyle'
        )
        ?.addEventListener(
            'change',
            event => {

                connectorStyle =
                    event.target.value;


                renderConnectors();
            }
        );


    // =========================================================
    // UNDO
    // =========================================================

    document
        .getElementById(
            'flowchartUndo'
        )
        ?.addEventListener(
            'click',
            () => {

                if (
                    !history.length
                ) {
                    return;
                }


                const previous =
                    JSON.parse(
                        history.pop()
                    );


                flowNodes =
                    previous.nodes ||
                    [];


                flowEdges =
                    previous.edges ||
                    [];


                selectedFlowNode =
                    null;


                connectSource =
                    null;


                renderFlowchart();

                syncFlow();
            }
        );


    // =========================================================
    // CLEAR
    // =========================================================

    document
        .getElementById(
            'flowchartClear'
        )
        ?.addEventListener(
            'click',
            () => {

                if (
                    !flowNodes.length &&
                    !flowEdges.length
                ) {
                    return;
                }


                saveHistory();


                flowNodes = [];

                flowEdges = [];

                selectedFlowNode =
                    null;

                connectSource =
                    null;


                renderFlowchart();

                syncFlow();
            }
        );


    // =========================================================
    // AUTO LAYOUT
    // =========================================================

    document
        .getElementById(
            'flowchartAutoLayout'
        )
        ?.addEventListener(
            'click',
            () => {

                if (
                    flowNodes.length <
                    1
                ) {
                    return;
                }


                saveHistory();


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


                flowNodes.forEach(
                    (
                        node,
                        index
                    ) => {

                        const column =
                            index %
                            columns;


                        const row =
                            Math.floor(
                                index /
                                columns
                            );


                        node.x =
                            snap(
                                70 +
                                column *
                                230
                            );


                        node.y =
                            snap(
                                60 +
                                row *
                                135
                            );
                    }
                );


                renderFlowchart();

                syncFlow();
            }
        );


    // =========================================================
    // INSPECTOR
    // =========================================================

    const inspector =
        document.getElementById(
            'flowInspector'
        );


    const inspectorEmpty =
        document.getElementById(
            'flowInspectorEmpty'
        );


    const typeInput =
        document.getElementById(
            'flowNodeType'
        );


    const textInput =
        document.getElementById(
            'flowNodeText'
        );


    function updateInspector() {

        const node =
            flowNodes.find(
                item =>
                    item.id ===
                    selectedFlowNode
            );


        if (!node) {

            if (inspector) {
                inspector.hidden =
                    true;
            }


            if (inspectorEmpty) {
                inspectorEmpty.hidden =
                    false;
            }


            return;
        }


        if (inspector) {
            inspector.hidden =
                false;
        }


        if (inspectorEmpty) {
            inspectorEmpty.hidden =
                true;
        }


        if (typeInput) {

            typeInput.value =
                node.type;
        }


        if (textInput) {

            textInput.value =
                node.label;
        }
    }


    // =========================================================
    // APPLY INSPECTOR
    // =========================================================

    document
        .getElementById(
            'flowApplyNode'
        )
        ?.addEventListener(
            'click',
            () => {

                const node =
                    flowNodes.find(
                        item =>
                            item.id ===
                            selectedFlowNode
                    );


                if (!node) {
                    return;
                }


                saveHistory();


                node.type =
                    typeInput?.value ||
                    node.type;


                node.label =
                    textInput?.value
                        ?.trim() ||
                    'Process';


                const preset =
                    defaults[
                        node.type
                    ];


                if (preset) {

                    node.width =
                        preset.width;

                    node.height =
                        preset.height;
                }


                renderFlowchart();

                syncFlow();
            }
        );


    // =========================================================
    // DELETE NODE
    // =========================================================

    document
        .getElementById(
            'flowDeleteNode'
        )
        ?.addEventListener(
            'click',
            () => {

                if (
                    !selectedFlowNode
                ) {
                    return;
                }


                saveHistory();


                flowNodes =
                    flowNodes.filter(
                        node =>
                            node.id !==
                            selectedFlowNode
                    );


                flowEdges =
                    flowEdges.filter(
                        edge =>
                            edge.from !==
                                selectedFlowNode &&
                            edge.to !==
                                selectedFlowNode
                    );


                selectedFlowNode =
                    null;


                connectSource =
                    null;


                renderFlowchart();

                syncFlow();
            }
        );


    // =========================================================
    // DUPLICATE NODE
    // =========================================================

    document
        .getElementById(
            'flowDuplicateNode'
        )
        ?.addEventListener(
            'click',
            () => {

                const original =
                    flowNodes.find(
                        node =>
                            node.id ===
                            selectedFlowNode
                    );


                if (!original) {
                    return;
                }


                saveHistory();


                const copy = {

                    ...original,

                    id:
                        createFlowId(),

                    x:
                        original.x +
                        40,

                    y:
                        original.y +
                        40
                };


                flowNodes.push(
                    copy
                );


                selectedFlowNode =
                    copy.id;


                renderFlowchart();

                syncFlow();
            }
        );


    // =========================================================
    // TEMPLATES
    // =========================================================

    function makeTemplateNode(
        type,
        label,
        x,
        y
    ) {

        const preset =
            defaults[type] ||
            defaults.process;


        return {

            id:
                createFlowId(),

            type,

            label,

            x,

            y,

            width:
                preset.width,

            height:
                preset.height
        };
    }


    function loadTemplate(
        name
    ) {

        saveHistory();


        flowNodes = [];

        flowEdges = [];


        if (
            name ===
            'linear'
        ) {

            const start =
                makeTemplateNode(
                    'start',
                    'Start',
                    250,
                    30
                );


            const input =
                makeTemplateNode(
                    'io',
                    'Read Input',
                    245,
                    130
                );


            const process =
                makeTemplateNode(
                    'process',
                    'Process Data',
                    245,
                    250
                );


            const output =
                makeTemplateNode(
                    'io',
                    'Display Output',
                    245,
                    370
                );


            const end =
                makeTemplateNode(
                    'start',
                    'End',
                    250,
                    490
                );


            flowNodes = [

                start,
                input,
                process,
                output,
                end
            ];


            flowEdges = [

                {
                    from:
                        start.id,

                    to:
                        input.id
                },

                {
                    from:
                        input.id,

                    to:
                        process.id
                },

                {
                    from:
                        process.id,

                    to:
                        output.id
                },

                {
                    from:
                        output.id,

                    to:
                        end.id
                }
            ];
        }


        else if (
            name ===
            'decision'
        ) {

            const start =
                makeTemplateNode(
                    'start',
                    'Start',
                    250,
                    30
                );


            const input =
                makeTemplateNode(
                    'process',
                    'Read Input',
                    245,
                    130
                );


            const decision =
                makeTemplateNode(
                    'decision',
                    'Condition?',
                    245,
                    245
                );


            const yes =
                makeTemplateNode(
                    'process',
                    'Yes → Process',
                    45,
                    400
                );


            const no =
                makeTemplateNode(
                    'process',
                    'No → Process',
                    445,
                    400
                );


            const end =
                makeTemplateNode(
                    'start',
                    'End',
                    250,
                    530
                );


            flowNodes = [

                start,
                input,
                decision,
                yes,
                no,
                end
            ];


            flowEdges = [

                {
                    from:
                        start.id,

                    to:
                        input.id
                },

                {
                    from:
                        input.id,

                    to:
                        decision.id
                },

                {
                    from:
                        decision.id,

                    to:
                        yes.id,

                    label:
                        'Yes'
                },

                {
                    from:
                        decision.id,

                    to:
                        no.id,

                    label:
                        'No'
                },

                {
                    from:
                        yes.id,

                    to:
                        end.id
                },

                {
                    from:
                        no.id,

                    to:
                        end.id
                }
            ];
        }


        else {

            const start =
                makeTemplateNode(
                    'start',
                    'Start',
                    250,
                    30
                );


            const init =
                makeTemplateNode(
                    'process',
                    'Initialize',
                    245,
                    130
                );


            const decision =
                makeTemplateNode(
                    'decision',
                    'Condition?',
                    245,
                    250
                );


            const body =
                makeTemplateNode(
                    'process',
                    'Loop Body',
                    245,
                    410
                );


            const end =
                makeTemplateNode(
                    'start',
                    'End',
                    250,
                    550
                );


            flowNodes = [

                start,
                init,
                decision,
                body,
                end
            ];


            flowEdges = [

                {
                    from:
                        start.id,

                    to:
                        init.id
                },

                {
                    from:
                        init.id,

                    to:
                        decision.id
                },

                {
                    from:
                        decision.id,

                    to:
                        body.id,

                    label:
                        'Yes'
                },

                {
                    from:
                        body.id,

                    to:
                        decision.id,

                    label:
                        'Repeat'
                },

                {
                    from:
                        decision.id,

                    to:
                        end.id,

                    label:
                        'No'
                }
            ];
        }


        selectedFlowNode =
            null;

        connectSource =
            null;


        renderFlowchart();

        syncFlow();
    }


    document
        .querySelectorAll(
            '.flow-template'
        )
        .forEach(
            button => {

                button.addEventListener(
                    'click',
                    () => {

                        loadTemplate(
                            button.dataset
                                .flowTemplate
                        );
                    }
                );
            }
        );


    // =========================================================
    // CANVAS CLICK
    // =========================================================

    flowCanvas.addEventListener(
        'click',
        event => {

            /*
             * Clicking empty canvas deselects the node.
             */
            if (
                event.target ===
                flowCanvas
            ) {

                selectedFlowNode =
                    null;

                connectSource =
                    null;

                renderFlowchart();
            }
        }
    );


    // =========================================================
    // MERMAID ADVANCED PREVIEW
    // =========================================================

    const source =
        document.getElementById(
            'codingFlowchartSource'
        );


    const preview =
        document.getElementById(
            'codingFlowchartPreview'
        );


    async function renderMermaid() {

        if (
            !source ||
            !preview
        ) {
            return;
        }


        if (
            !window.mermaid
        ) {

            preview.textContent =
                'Mermaid is not available on this page.';

            return;
        }


        const code =
            source.value.trim();


        if (!code) {

            preview.innerHTML = '';

            return;
        }


        try {

            mermaid.initialize({

                startOnLoad:
                    false,

                securityLevel:
                    'loose'
            });


            preview.innerHTML =
                '';


            const result =
                await mermaid.render(
                    'dsa_flow_' +
                    Date.now(),
                    code
                );


            preview.innerHTML =
                result.svg;


        } catch (error) {

            console.error(
                'Mermaid rendering failed:',
                error
            );


            preview.textContent =
                error?.message ||
                'Unable to render Mermaid flowchart.';
        }
    }


    document
        .getElementById(
            'renderCodingFlowchart'
        )
        ?.addEventListener(
            'click',
            renderMermaid
        );


    // =========================================================
    // INITIAL FLOWCHART
    // =========================================================

    renderFlowchart();


    if (
        source?.value.trim()
    ) {

        renderMermaid();
    }

});
