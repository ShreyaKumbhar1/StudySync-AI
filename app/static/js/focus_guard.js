/* ==========================================================
   ORION • FOCUS SESSION TAB GUARD
   ========================================================== */

(function () {

    "use strict";

    const FOCUS_SESSION_KEY = "orion_focus_session_active";

    let warningVisible = false;
    let leavingPage = false;


    /* ======================================================
       CHECK WHETHER A FOCUS SESSION IS ACTIVE
       ====================================================== */

    function focusSessionIsActive() {

        return (
            document.body &&
            document.body.dataset &&
            document.body.dataset.focusSession === "active"
        ) || (
            localStorage.getItem(
                FOCUS_SESSION_KEY
            ) === "true"
        );

    }


    /* ======================================================
       CREATE ORION-STYLE WARNING
       ====================================================== */

    function createWarning() {

        if (
            document.getElementById(
                "orion-focus-tab-warning"
            )
        ) {
            return;
        }

        const overlay =
            document.createElement("div");

        overlay.id =
            "orion-focus-tab-warning";

        overlay.innerHTML = `
            <div class="orion-focus-warning-card">

                <div class="orion-focus-warning-icon">
                    🌳
                </div>

                <span class="orion-focus-warning-label">
                    FOCUS SESSION ACTIVE
                </span>

                <h2>
                    Stay locked in.
                </h2>

                <p>
                    Your focus session is still running.
                    If you leave Orion, your tree will be
                    distorted and planted in your grove.
                </p>

                <button
                    type="button"
                    id="orion-focus-return"
                >
                    Return to Focus
                </button>

            </div>
        `;

        const style =
            document.createElement("style");

        style.id =
            "orion-focus-warning-style";

        style.textContent = `
            #orion-focus-tab-warning {
                position: fixed;
                inset: 0;
                z-index: 999999;

                display: flex;
                align-items: center;
                justify-content: center;

                padding: 24px;

                background:
                    rgba(
                        38,
                        34,
                        58,
                        0.42
                    );

                backdrop-filter:
                    blur(10px);
            }

            .orion-focus-warning-card {
                width: min(
                    430px,
                    calc(100vw - 48px)
                );

                padding: 34px 30px;

                text-align: center;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.97
                    );

                border:
                    1px solid
                    rgba(
                        108,
                        99,
                        255,
                        0.14
                    );

                border-radius: 24px;

                box-shadow:
                    0 25px 70px
                    rgba(
                        44,
                        37,
                        82,
                        0.22
                    );

                font-family:
                    'Poppins',
                    sans-serif;
            }

            .orion-focus-warning-icon {
                width: 62px;
                height: 62px;

                display: grid;
                place-items: center;

                margin:
                    0 auto 18px;

                border-radius: 18px;

                background:
                    linear-gradient(
                        135deg,
                        #eeeaff,
                        #f5f1ff
                    );

                font-size: 29px;

                box-shadow:
                    0 10px 25px
                    rgba(
                        108,
                        99,
                        255,
                        0.12
                    );
            }

            .orion-focus-warning-label {
                display: block;

                margin-bottom: 8px;

                color: #7b6bdc;

                font-size: 10px;
                font-weight: 700;

                letter-spacing: 1.8px;

                text-transform: uppercase;
            }

            .orion-focus-warning-card h2 {
                margin: 0 0 10px;

                color: #292442;

                font-size: 24px;
                font-weight: 700;
            }

            .orion-focus-warning-card p {
                margin:
                    0 auto 24px;

                max-width: 350px;

                color: #817b91;

                font-size: 13px;
                line-height: 1.65;
            }

            #orion-focus-return {
                width: 100%;

                padding: 12px 18px;

                border: none;
                border-radius: 12px;

                background:
                    linear-gradient(
                        135deg,
                        #6c63ff,
                        #897cff
                    );

                color: #ffffff;

                font-family:
                    'Poppins',
                    sans-serif;

                font-size: 12px;
                font-weight: 600;

                cursor: pointer;

                box-shadow:
                    0 9px 20px
                    rgba(
                        108,
                        99,
                        255,
                        0.18
                    );
            }

            #orion-focus-return:hover {
                transform:
                    translateY(-1px);
            }
        `;

        document.head.appendChild(style);

        document.body.appendChild(
            overlay
        );

        document
            .getElementById(
                "orion-focus-return"
            )
            .addEventListener(
                "click",
                function () {

                    hideWarning();

                    window.focus();

                }
            );

    }


    /* ======================================================
       SHOW WARNING
       ====================================================== */

    function showWarning() {

        if (
            !focusSessionIsActive()
        ) {
            return;
        }

        createWarning();

        const warning =
            document.getElementById(
                "orion-focus-tab-warning"
            );

        if (!warning) {
            return;
        }

        warning.style.display =
            "flex";

        warningVisible = true;

    }


    /* ======================================================
       HIDE WARNING
       ====================================================== */

    function hideWarning() {

        const warning =
            document.getElementById(
                "orion-focus-tab-warning"
            );

        if (warning) {

            warning.style.display =
                "none";

        }

        warningVisible = false;

    }


    /* ======================================================
       TAB VISIBILITY
       ====================================================== */

    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                !focusSessionIsActive()
            ) {
                return;
            }

            if (
                document.visibilityState ===
                "hidden"
            ) {

                showWarning();

            }

            else {

                hideWarning();

            }

        }
    );


    /* ======================================================
       NEW TAB / WINDOW BLUR
       ====================================================== */

    window.addEventListener(
        "blur",
        function () {

            if (
                !focusSessionIsActive()
            ) {
                return;
            }

            showWarning();

        }
    );


    window.addEventListener(
        "focus",
        function () {

            if (
                !focusSessionIsActive()
            ) {
                return;
            }

            hideWarning();

        }
    );


    /* ======================================================
       CLOSE / RELOAD WARNING
       ====================================================== */

    window.addEventListener(
        "beforeunload",
        function (event) {

            if (
                !focusSessionIsActive()
            ) {
                return;
            }

            if (leavingPage) {
                return;
            }

            event.preventDefault();

            event.returnValue = "";

        }
    );


    /* ======================================================
       MARK INTERNAL ORION NAVIGATION
       ====================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const link =
                event.target.closest(
                    "a"
                );

            if (!link) {
                return;
            }

            const href =
                link.getAttribute(
                    "href"
                );

            if (!href) {
                return;
            }

            if (
                href.startsWith("#") ||
                href.startsWith("javascript:")
            ) {
                return;
            }

            let destination;

            try {

                destination =
                    new URL(
                        href,
                        window.location.href
                    );

            }

            catch (error) {
                return;
            }

            if (
                destination.origin ===
                window.location.origin
            ) {

                /*
                 * Internal Orion navigation
                 * is allowed.
                 */
                return;

            }

        }
    );


    /* ======================================================
       SESSION STATE LISTENER
       ====================================================== */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key !==
                FOCUS_SESSION_KEY
            ) {
                return;
            }

            if (
                event.newValue !==
                "true"
            ) {

                hideWarning();

            }

        }
    );


})();