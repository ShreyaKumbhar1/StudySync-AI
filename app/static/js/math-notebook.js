document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // BASIC CALCULATOR
    // =========================================================

    const result = document.getElementById('calculatorResult');
    const expr = document.getElementById('mathExpression');


    const calc = () => {

        try {

            result.textContent = math.evaluate(expr.value);

            window.ORION_NOTE_STATE.calculator_history =
                window.ORION_NOTE_STATE.calculator_history || [];

            window.ORION_NOTE_STATE.calculator_history.push({
                expression: expr.value,
                result: result.textContent
            });

            window.ORION_MARK_CHANGED?.();

        } catch (e) {

            result.textContent = 'Error: ' + e.message;
        }
    };


    document
        .getElementById('calculateMath')
        ?.addEventListener('click', calc);


    expr?.addEventListener('keydown', e => {

        if (e.key === 'Enter') {
            calc();
        }
    });


    // =========================================================
    // MATH BUTTONS
    // =========================================================

    document
        .querySelectorAll('[data-math]')
        .forEach(b => {

            b.onclick = () => {

                expr.value +=
                    (expr.value ? ' ' : '') +
                    b.dataset.math;

                expr.focus();
            };
        });


    // =========================================================
    // CALCULUS
    // =========================================================

    const calculus =
        document.getElementById('calculusExpression');

    const variable =
        document.getElementById('calculusVariable');


    // ---------------------------------------------------------
    // Differentiation
    // ---------------------------------------------------------

    document
        .getElementById('differentiateMath')
        ?.addEventListener('click', () => {

            try {

                result.textContent =
                    nerdamer(calculus.value)
                        .diff(variable.value)
                        .toString();

            } catch (e) {

                result.textContent =
                    'Derivative error: ' + e.message;
            }
        });


    // ---------------------------------------------------------
    // Integration
    // ---------------------------------------------------------

    document
        .getElementById('integrateMath')
        ?.addEventListener('click', () => {

            try {

                result.textContent =
                    nerdamer
                        .integrate(
                            calculus.value,
                            variable.value
                        )
                        .toString() + ' + C';

            } catch (e) {

                result.textContent =
                    'Integration error: ' + e.message;
            }
        });


    // =========================================================
    // MATH WORKING / STEPS
    // =========================================================

    const steps =
        document.getElementById('mathSteps');

    const existing =
        window.ORION_NOTE_STATE?.math_steps || [];


    // ---------------------------------------------------------
    // Add Step
    // ---------------------------------------------------------

    function addStep(text = '') {

        const row = document.createElement('div');

        row.className = 'math-step';

        row.innerHTML = `
            <span>${steps.children.length + 1}</span>

            <textarea
                placeholder="Work for this step..."
            >${text}</textarea>

            <button
                type="button"
                class="remove-step"
            >×</button>
        `;


        row
            .querySelector('.remove-step')
            .onclick = () => {

                row.remove();

                renumber();

                window.ORION_MARK_CHANGED?.();
            };


        steps.appendChild(row);
    }


    // ---------------------------------------------------------
    // Renumber Steps
    // ---------------------------------------------------------

    function renumber() {

        [...steps.children].forEach((r, i) => {

            r.querySelector('span').textContent = i + 1;
        });
    }


    // ---------------------------------------------------------
    // Initialize Existing Steps
    // ---------------------------------------------------------

    (
        existing.length
            ? existing
            : ['', '', '']
    ).forEach(addStep);


    // ---------------------------------------------------------
    // Add New Step Button
    // ---------------------------------------------------------

    document
        .getElementById('addMathStep')
        ?.addEventListener('click', () => {

            addStep();

            window.ORION_MARK_CHANGED?.();
        });


    // =========================================================
    // SAVE MATH STEPS
    // =========================================================

    const originalCollect =
        window.ORION_NOTE_STATE;


    window.addEventListener('beforeunload', () => {

        window.ORION_NOTE_STATE.math_steps =
            [
                ...steps.querySelectorAll('textarea')
            ].map(x => x.value);
    });


    // =========================================================
    // FORMULA LIBRARY
    // =========================================================

    document
        .querySelectorAll('.formula-item')
        .forEach(b => {

            b.onclick = () => {

                const f =
                    document.querySelector('.formula-input');


                f.value =
                    (f.value ? f.value + '\n' : '') +
                    b.dataset.formula;


                window.ORION_MARK_CHANGED?.();
            };
        });

});