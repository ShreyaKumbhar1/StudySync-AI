document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('graphCanvas');

    if (!canvas) return;

    let tool = 'select';
    let nodes = [];
    let edges = [];

    const state = window.ORION_NOTE_STATE?.visual || {};

    nodes = state.nodes || [];
    edges = state.edges || [];


    // =========================================================
    // RENDER GRAPH
    // =========================================================

    function render() {

        canvas
            .querySelectorAll('.graph-node, .graph-edge-line')
            .forEach(x => x.remove());

        const ph = canvas.querySelector('.graph-placeholder');

        if (ph) {
            ph.style.display = nodes.length ? 'none' : 'flex';
        }


        // -----------------------------------------------------
        // Render Nodes
        // -----------------------------------------------------

        nodes.forEach(n => {

            const d = document.createElement('div');

            d.className = 'graph-node';
            d.textContent = n.label;

            d.style.left = n.x + 'px';
            d.style.top = n.y + 'px';

            d.dataset.id = n.id;
            d.draggable = true;


            // -------------------------------------------------
            // Node Dragging
            // -------------------------------------------------

            d.onmousedown = e => {

                if (tool !== 'select') return;

                const ox = e.clientX - n.x;
                const oy = e.clientY - n.y;


                const move = ev => {

                    n.x = Math.max(
                        0,
                        ev.clientX -
                        ox -
                        canvas.getBoundingClientRect().left
                    );

                    n.y = Math.max(
                        0,
                        ev.clientY -
                        oy -
                        canvas.getBoundingClientRect().top
                    );

                    d.style.left = n.x + 'px';
                    d.style.top = n.y + 'px';
                };


                const up = () => {

                    document.removeEventListener(
                        'mousemove',
                        move
                    );

                    document.removeEventListener(
                        'mouseup',
                        up
                    );

                    sync();
                };


                document.addEventListener(
                    'mousemove',
                    move
                );

                document.addEventListener(
                    'mouseup',
                    up
                );
            };


            // -------------------------------------------------
            // Node Click / Edge Creation
            // -------------------------------------------------

            d.onclick = () => {

                if (tool !== 'edge') return;

                const last = nodes.find(
                    x => x.selected
                );


                if (last && last.id !== n.id) {

                    edges.push({
                        from: last.id,
                        to: n.id
                    });

                    last.selected = false;

                    sync();
                    render();

                } else {

                    nodes.forEach(
                        x => x.selected = false
                    );

                    n.selected = true;

                    d.classList.add('selected');
                }
            };


            canvas.appendChild(d);
        });


        // -----------------------------------------------------
        // Render Edges
        // -----------------------------------------------------

        edges.forEach(e => {

            const a = nodes.find(
                n => n.id === e.from
            );

            const b = nodes.find(
                n => n.id === e.to
            );

            if (!a || !b) return;


            const line = document.createElement('div');

            line.className = 'graph-edge-line';


            const dx = b.x - a.x;
            const dy = b.y - a.y;

            const len = Math.hypot(dx, dy);


            line.style.width = len + 'px';

            line.style.left =
                (a.x + 20) + 'px';

            line.style.top =
                (a.y + 20) + 'px';

            line.style.transform =
                `rotate(${Math.atan2(dy, dx)}rad)`;


            canvas.appendChild(line);
        });
    }


    // =========================================================
    // SYNC STATE
    // =========================================================

    function sync() {

        if (window.ORION_NOTE_STATE) {

            window.ORION_NOTE_STATE.visual = {
                nodes,
                edges
            };

            window.ORION_MARK_CHANGED?.();
        }
    }


    // =========================================================
    // GRAPH TOOLS
    // =========================================================

    document
        .querySelectorAll('.graph-tool')
        .forEach(b => {

            b.onclick = () => {

                tool = b.dataset.tool;


                document
                    .querySelectorAll('.graph-tool')
                    .forEach(x => {
                        x.classList.remove('active');
                    });


                b.classList.add('active');


                // Clear graph
                if (tool === 'clear') {

                    nodes = [];
                    edges = [];

                    sync();
                    render();
                }
            };
        });


    // =========================================================
    // CREATE NODE
    // =========================================================

    canvas.onclick = e => {

        if (tool !== 'node') return;

        const r = canvas.getBoundingClientRect();

        const label = prompt(
            'Node label:',
            String(nodes.length + 1)
        );


        if (label !== null) {

            nodes.push({
                id: crypto.randomUUID(),
                label,
                x: e.clientX - r.left - 20,
                y: e.clientY - r.top - 20
            });


            sync();
            render();
        }
    };


    // Initial graph render
    render();


    // =========================================================
    // DSA FLOWCHART
    // =========================================================

    const src =
        document.getElementById(
            'dsaFlowchartSource'
        );

    const preview =
        document.getElementById(
            'dsaFlowchartPreview'
        );


    async function flow() {

        if (!src || !preview) return;


        try {

            mermaid.initialize({
                startOnLoad: false
            });


            preview.innerHTML = '';


            const r = await mermaid.render(
                'dsa_' + Date.now(),
                src.value
            );


            preview.innerHTML = r.svg;

        } catch (e) {

            preview.textContent = e.message;
        }


        window.ORION_MARK_CHANGED?.();
    }


    document
        .getElementById('renderDsaFlowchart')
        ?.addEventListener(
            'click',
            flow
        );


    if (src?.value) {
        flow();
    }

});