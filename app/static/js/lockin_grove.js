/* ==========================================================
   ORION • LOCK-IN GROVE
   ========================================================== */


/* ==========================================================
   TEMPORARY FOREST COMPARTMENTS
   ========================================================== */

const FOREST_DEBUG_SLOTS = {
    week: [
        [35, 28], [47, 28], [59, 28], [71, 28], [82, 28],
        [31, 39], [43, 39], [55, 39], [67, 39], [79, 39],
        [35, 50], [47, 50], [59, 50], [71, 50], [82, 50],
        [40, 61], [50, 61], [60, 61], [70, 61], [79, 61]
    ],

    month: [
        [37, 25], [46, 25], [55, 25], [64, 25], [73, 25], [82, 25], [88, 25],
        [33, 31], [42, 31], [51, 31], [60, 31], [69, 31], [78, 31], [86, 31],
        [31, 37], [40, 37], [49, 37], [58, 37], [67, 37], [76, 37], [84, 37],
        [29, 43], [38, 43], [47, 43], [56, 43], [65, 43], [74, 43], [82, 43],
        [30, 49], [39, 49], [48, 49], [57, 49], [66, 49], [75, 49], [83, 49],
        [32, 55], [41, 55], [50, 55], [59, 55], [68, 55], [77, 55], [85, 55],
        [35, 61], [44, 61], [53, 61], [62, 61], [71, 61], [80, 61], [86, 61],
        [39, 67], [48, 67], [57, 67], [66, 67], [75, 67], [83, 67], [88, 67],
        [43, 73], [52, 73], [61, 73], [70, 73], [79, 73], [86, 73], [90, 73],
        [47, 79], [56, 79], [65, 79], [74, 79], [82, 79], [88, 79], [92, 79]
    ],

    year: []
};


/* 150 year slots */

[
    [24, [34, 40, 46, 52, 58, 64, 70, 76, 82, 87]],
    [29, [31, 37, 43, 49, 55, 61, 67, 73, 79, 85]],
    [34, [29, 35, 41, 47, 53, 59, 65, 71, 77, 83]],
    [39, [28, 34, 40, 46, 52, 58, 64, 70, 76, 82]],
    [44, [27, 33, 39, 45, 51, 57, 63, 69, 75, 81]],
    [49, [28, 34, 40, 46, 52, 58, 64, 70, 76, 82]],
    [54, [29, 35, 41, 47, 53, 59, 65, 71, 77, 83]],
    [59, [31, 37, 43, 49, 55, 61, 67, 73, 79, 85]],
    [64, [33, 39, 45, 51, 57, 63, 69, 75, 81, 87]],
    [69, [35, 41, 47, 53, 59, 65, 71, 77, 83, 89]],
    [74, [38, 44, 50, 56, 62, 68, 74, 80, 86, 91]],
    [79, [41, 47, 53, 59, 65, 71, 77, 83, 88, 93]],
    [84, [44, 50, 56, 62, 68, 74, 80, 86, 91, 94]],
    [88, [47, 53, 59, 65, 71, 77, 83, 89, 93, 95]],
    [92, [50, 56, 62, 68, 74, 80, 86, 91, 94, 96]]
].forEach(function (row) {
    const y = row[0];

    row[1].forEach(function (x) {
        FOREST_DEBUG_SLOTS.year.push([x, y]);
    });
});


function createDebugSlots(view) {
    if (!view) {
        return;
    }

    const layer =
        view.querySelector(
            ".forest-compartment-debug-layer"
        );

    if (!layer) {
        return;
    }

    if (layer.dataset.created === "true") {
        return;
    }

    const period =
        view.dataset.period;

    const slots =
        FOREST_DEBUG_SLOTS[period] || [];

    slots.forEach(function (slot, index) {
        const element =
            document.createElement("div");

        element.className =
            "forest-compartment-debug-slot";

        element.dataset.x =
            String(slot[0]);

        element.dataset.y =
            String(slot[1]);

        element.textContent =
            String(index + 1);

        layer.appendChild(element);
    });

    layer.dataset.created = "true";
}


/* ==========================================================
   INITIALIZE
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupModals();
        setupForestSwitcher();
        setupTreeCollection();
        setupDurationFlow();
        setupMusicCollection();
        setupDailyGoal();

        const focusMode =
            document.getElementById(
                "focus-mode"
            );

        if (focusMode) {
            setupFocusMode(focusMode);
        }
    }
);


/* ==========================================================
   MODALS
   ========================================================== */

function openModal(id) {
    const modal =
        document.getElementById(id);

    if (modal) {
        modal.classList.remove("hidden");
    }
}


function closeModal(id) {
    const modal =
        document.getElementById(id);

    if (modal) {
        modal.classList.add("hidden");
    }
}


function setupModals() {

    document.addEventListener(
        "click",
        function (event) {

            const closeButton =
                event.target.closest(
                    "[data-close-modal]"
                );

            if (closeButton) {

                event.preventDefault();

                event.stopPropagation();

                closeModal(
                    closeButton.dataset.closeModal
                );

                return;
            }


            if (
                event.target.classList.contains(
                    "site-modal"
                )
            ) {

                if (
                    event.target.id !==
                    "daily-goal-modal"
                ) {
                    event.target.classList.add(
                        "hidden"
                    );
                }
            }
        }
    );
}


/* ==========================================================
   FOREST SWITCHER
   ========================================================== */

function setupForestSwitcher() {

    const buttons =
        document.querySelectorAll(
            ".forest-period-button"
        );

    const views =
        document.querySelectorAll(
            ".forest-view"
        );

    const title =
        document.getElementById(
            "forest-period-title"
        );

    const description =
        document.getElementById(
            "forest-period-description"
        );

    const previousButton =
        document.getElementById(
            "forest-page-prev"
        );

    const nextButton =
        document.getElementById(
            "forest-page-next"
        );

    const pageLabel =
        document.getElementById(
            "forest-page-label"
        );


    if (!buttons.length) {
        return;
    }


    const state = {
        period: "week",
        page: 1
    };


    const descriptions = {
        week: "Up to 20 trees per island.",
        month: "Up to 70 trees per island.",
        year: "Up to 150 trees per island."
    };


    function getPages(period) {
        return [
            ...document.querySelectorAll(
                `.forest-view[data-period="${period}"]`
            )
        ];
    }


    function positionTrees(view) {

        if (!view) {
            return;
        }


        const land =
            view.querySelector(
                ".forest-land"
            );


        if (!land) {
            return;
        }


        createDebugSlots(view);


        function applyPositions() {

            const landRect =
                land.getBoundingClientRect();

            const viewRect =
                view.getBoundingClientRect();


            if (
                !landRect.width ||
                !landRect.height
            ) {
                return;
            }


            /* --------------------------------------------------
               REAL TREES
               -------------------------------------------------- */

            view
                .querySelectorAll(
                    ".planted-tree"
                )
                .forEach(
                    function (tree) {

                        const x =
                            Number(
                                tree.dataset.x || 50
                            );

                        const y =
                            Number(
                                tree.dataset.y || 50
                            );


                        tree.style.left =
                            `${
                                (
                                    landRect.left -
                                    viewRect.left
                                )
                                +
                                (
                                    landRect.width *
                                    x /
                                    100
                                )
                            }px`;


                        tree.style.top =
                            `${
                                (
                                    landRect.top -
                                    viewRect.top
                                )
                                +
                                (
                                    landRect.height *
                                    y /
                                    100
                                )
                            }px`;


                        tree.style.zIndex =
                            String(
                                1000 +
                                Math.round(
                                    y * 10
                                )
                            );
                    }
                );


            /* --------------------------------------------------
               DEBUG COMPARTMENTS
               -------------------------------------------------- */

            view
                .querySelectorAll(
                    ".forest-compartment-debug-slot"
                )
                .forEach(
                    function (slot) {

                        const x =
                            Number(
                                slot.dataset.x || 50
                            );

                        const y =
                            Number(
                                slot.dataset.y || 50
                            );


                        slot.style.left =
                            `${
                                (
                                    landRect.left -
                                    viewRect.left
                                )
                                +
                                (
                                    landRect.width *
                                    x /
                                    100
                                )
                            }px`;


                        slot.style.top =
                            `${
                                (
                                    landRect.top -
                                    viewRect.top
                                )
                                +
                                (
                                    landRect.height *
                                    y /
                                    100
                                )
                            }px`;


                        slot.style.zIndex =
                            "9000";
                    }
                );
        }


        if (land.complete) {

            requestAnimationFrame(
                applyPositions
            );

        } else {

            land.addEventListener(
                "load",
                applyPositions,
                {
                    once: true
                }
            );
        }
    }


    function renderForest() {

        const pages =
            getPages(
                state.period
            );


        if (!pages.length) {
            return;
        }


        state.page =
            Math.max(
                1,
                Math.min(
                    state.page,
                    pages.length
                )
            );


        views.forEach(
            function (view) {
                view.classList.remove(
                    "active"
                );
            }
        );


        const activePage =
            pages[
                state.page - 1
            ];


        if (!activePage) {
            return;
        }


        activePage.classList.add(
            "active"
        );


        buttons.forEach(
            function (button) {

                button.classList.toggle(
                    "active",
                    button.dataset.period ===
                    state.period
                );
            }
        );


        if (title) {

            title.textContent =
                state.period === "week"
                    ? "Weekly Grove"
                    : state.period === "month"
                        ? "Monthly Grove"
                        : "Yearly Grove";
        }


        if (description) {

            description.textContent =
                descriptions[
                    state.period
                ];
        }


        if (pageLabel) {

            const name =
                state.period
                    .charAt(0)
                    .toUpperCase()
                +
                state.period.slice(1);


            pageLabel.textContent =
                pages.length > 1
                    ? `${name} ${state.page} of ${pages.length}`
                    : `${name} 1`;
        }


        if (previousButton) {

            previousButton.disabled =
                state.page <= 1;
        }


        if (nextButton) {

            nextButton.disabled =
                state.page >=
                pages.length;
        }


        positionTrees(
            activePage
        );
    }


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    state.period =
                        button.dataset.period;

                    state.page = 1;

                    renderForest();
                }
            );
        }
    );


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            function () {

                if (state.page > 1) {

                    state.page -= 1;

                    renderForest();
                }
            }
        );
    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function () {

                const pages =
                    getPages(
                        state.period
                    );


                if (
                    state.page <
                    pages.length
                ) {

                    state.page += 1;

                    renderForest();
                }
            }
        );
    }


    window.addEventListener(
        "resize",
        function () {

            const active =
                document.querySelector(
                    `.forest-view[data-period="${state.period}"].active`
                );

            positionTrees(active);
        }
    );


    renderForest();
}


/* ==========================================================
   TREE COLLECTION
   ========================================================== */

function setupTreeCollection() {

    document
        .querySelectorAll(
            ".tree-option"
        )
        .forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function () {

                        openTreeInfo(
                            card.dataset
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".all-tree-option"
        )
        .forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        event.stopPropagation();

                        openTreeInfo(
                            card.dataset
                        );
                    }
                );
            }
        );


    const moreButton =
        document.getElementById(
            "more-trees-button"
        );


    if (moreButton) {

        moreButton.addEventListener(
            "click",
            function () {

                openModal(
                    "more-trees-modal"
                );
            }
        );
    }


    let pendingTreeId = null;


    window.currentLockedTree =
        function (treeId) {

            pendingTreeId =
                treeId;
        };


    const unlockButton =
        document.getElementById(
            "tree-modal-unlock"
        );


    if (unlockButton) {

        unlockButton.addEventListener(
            "click",
            async function () {

                if (!pendingTreeId) {
                    return;
                }


                try {

                    const response =
                        await fetch(
                            `/lock-in-grove/unlock-tree/${encodeURIComponent(
                                pendingTreeId
                            )}`,
                            {
                                method:
                                    "POST"
                            }
                        );


                    const result =
                        await response.json();


                    if (
                        result.success
                    ) {

                        window.location.reload();
                    }

                } catch (error) {

                    console.error(
                        "Tree unlock error:",
                        error
                    );
                }
            }
        );
    }
}


/* ==========================================================
   TREE POPUP
   ========================================================== */

function openTreeInfo(data) {

    const modal =
        document.getElementById(
            "tree-info-modal"
        );


    if (!modal) {
        return;
    }


    const image =
        document.getElementById(
            "tree-modal-image"
        );

    const status =
        document.getElementById(
            "tree-modal-status"
        );

    const name =
        document.getElementById(
            "tree-modal-name"
        );

    const description =
        document.getElementById(
            "tree-modal-description"
        );

    const costArea =
        document.getElementById(
            "tree-modal-cost-area"
        );

    const cost =
        document.getElementById(
            "tree-modal-cost"
        );


    if (image) {

        image.src =
            data.image || "";

        image.alt =
            data.name || "Tree";
    }


    if (name) {

        name.textContent =
            data.name || "Tree";
    }


    if (description) {

        description.textContent =
            data.description ||
            "A beautiful addition to your focus forest.";
    }


    const unlocked =
        String(
            data.unlocked
        ) === "true";


    if (unlocked) {

        if (status) {

            status.textContent =
                "UNLOCKED TREE";
        }


        if (costArea) {

            costArea.classList.add(
                "hidden"
            );
        }

    } else {

        if (status) {

            status.textContent =
                "LOCKED TREE";
        }


        if (cost) {

            cost.textContent =
                `${data.cost || 0} 📡`;
        }


        if (costArea) {

            costArea.classList.remove(
                "hidden"
            );
        }


        if (
            typeof window.currentLockedTree ===
            "function"
        ) {

            window.currentLockedTree(
                data.tree || ""
            );
        }
    }


    modal.classList.remove(
        "hidden"
    );
}


/* ==========================================================
   FOCUS SESSION SELECTION
   ========================================================== */

function setupDurationFlow() {

    const durationButtons =
        document.querySelectorAll(
            ".duration-option"
        );

    const durationInput =
        document.getElementById(
            "selected-duration"
        );

    const treeInput =
        document.getElementById(
            "selected-tree"
        );

    const musicInput =
        document.getElementById(
            "selected-music"
        );

    const startForm =
        document.getElementById(
            "focus-start-form"
        );

    const noMusic =
        document.getElementById(
            "focus-no-music"
        );


    if (
        !durationButtons.length ||
        !durationInput ||
        !treeInput ||
        !musicInput ||
        !startForm ||
        !noMusic
    ) {

        return;
    }


    let selectedDuration =
        null;

    let previewAudio =
        null;


    durationButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    selectedDuration =
                        Number(
                            button.dataset.duration
                        );


                    durationInput.value =
                        selectedDuration;


                    musicInput.value =
                        "";


                    openModal(
                        "focus-tree-modal"
                    );
                }
            );
        }
    );


    document
        .querySelectorAll(
            ".focus-choice-card"
        )
        .forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function () {

                        treeInput.value =
                            card.dataset.tree ||
                            "";


                        closeModal(
                            "focus-tree-modal"
                        );


                        openModal(
                            "focus-music-modal"
                        );
                    }
                );
            }
        );


    noMusic.addEventListener(
        "click",
        function () {

            musicInput.value =
                "";


            closeModal(
                "focus-music-modal"
            );


            if (selectedDuration) {

                startForm.requestSubmit();
            }
        }
    );


    document
        .querySelectorAll(
            "[data-focus-music]"
        )
        .forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function () {

                        const musicId =
                            card.dataset.focusMusic ||
                            "";


                        const file =
                            card.dataset.file ||
                            "";


                        if (previewAudio) {

                            previewAudio.pause();

                            previewAudio.currentTime =
                                0;
                        }


                        if (file) {

                            previewAudio =
                                new Audio(file);

                            previewAudio.volume =
                                0.55;


                            previewAudio
                                .play()
                                .catch(
                                    function () {}
                                );
                        }


                        musicInput.value =
                            musicId;


                        closeModal(
                            "focus-music-modal"
                        );


                        if (
                            selectedDuration
                        ) {

                            startForm.requestSubmit();
                        }
                    }
                );
            }
        );
}


/* ==========================================================
   MUSIC
   ========================================================== */

function setupMusicCollection() {

    const moreButton =
        document.getElementById(
            "more-music-button"
        );


    if (moreButton) {

        moreButton.addEventListener(
            "click",
            function () {

                openModal(
                    "more-music-modal"
                );
            }
        );
    }


    let previewAudio =
        null;


    document
        .querySelectorAll(
            ".music-item"
        )
        .forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function () {

                        if (previewAudio) {

                            previewAudio.pause();

                            previewAudio.currentTime =
                                0;
                        }


                        if (card.dataset.file) {

                            previewAudio =
                                new Audio(
                                    card.dataset.file
                                );

                            previewAudio.volume =
                                0.55;


                            previewAudio
                                .play()
                                .catch(
                                    function () {}
                                );
                        }


                        openMusicInfo(
                            card.dataset
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".all-music-option"
        )
        .forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        event.stopPropagation();

                        openMusicInfo(
                            card.dataset
                        );
                    }
                );
            }
        );


    const unlockButton =
        document.getElementById(
            "music-modal-unlock"
        );


    let pendingMusicId =
        null;


    function getCurrentAntennas() {

        const element =
            document.querySelector(
                ".antenna-counter strong"
            );


        if (!element) {
            return 0;
        }


        const value =
            Number(
                element.textContent.replace(
                    /[^0-9]/g,
                    ""
                )
            );


        return Number.isFinite(value)
            ? value
            : 0;
    }


    function openMusicInfo(data) {

        const modal =
            document.getElementById(
                "music-info-modal"
            );


        if (!modal) {
            return;
        }


        const name =
            document.getElementById(
                "music-modal-name"
            );

        const description =
            document.getElementById(
                "music-modal-description"
            );

        const player =
            document.getElementById(
                "music-preview-player"
            );

        const costArea =
            document.getElementById(
                "music-modal-cost-area"
            );

        const cost =
            document.getElementById(
                "music-modal-cost"
            );


        if (costArea) {

            costArea.classList.add(
                "hidden"
            );
        }


        if (unlockButton) {

            unlockButton.classList.add(
                "hidden"
            );
        }


        pendingMusicId =
            null;


        if (name) {

            name.textContent =
                data.name || "Music";
        }


        if (description) {

            description.textContent =
                data.description ||
                "A focus atmosphere for your study session.";
        }


        if (player) {

            player.pause();

            player.src =
                data.file || "";

            player.load();
        }


        const unlocked =
            String(
                data.unlocked
            ) === "true";


        if (!unlocked) {

            pendingMusicId =
                data.music || "";


            const required =
                Number(
                    data.cost || 0
                );


            const current =
                getCurrentAntennas();


            const remaining =
                Math.max(
                    required -
                    current,
                    0
                );


            if (cost) {

                cost.textContent =
                    remaining > 0
                        ? `${remaining} more antennas needed`
                        : `${required} antennas required`;
            }


            if (costArea) {

                costArea.classList.remove(
                    "hidden"
                );
            }


            if (unlockButton) {

                unlockButton.classList.remove(
                    "hidden"
                );
            }
        }


        modal.classList.remove(
            "hidden"
        );
    }


    if (unlockButton) {

        unlockButton.addEventListener(
            "click",
            async function () {

                if (!pendingMusicId) {
                    return;
                }


                try {

                    const response =
                        await fetch(
                            `/lock-in-grove/unlock-music/${encodeURIComponent(
                                pendingMusicId
                            )}`,
                            {
                                method:
                                    "POST"
                            }
                        );


                    const result =
                        await response.json();


                    if (
                        result.success
                    ) {

                        window.location.reload();
                    }

                } catch (error) {

                    console.error(
                        "Music unlock error:",
                        error
                    );
                }
            }
        );
    }
}


/* ==========================================================
   DAILY GOAL
   ========================================================== */

function setupDailyGoal() {

    const modal =
        document.getElementById(
            "daily-goal-modal"
        );


    if (!modal) {
        return;
    }


    const options =
        modal.querySelectorAll(
            ".goal-option"
        );

    const saveButton =
        document.getElementById(
            "save-daily-goal"
        );


    if (!saveButton) {
        return;
    }


    let selectedGoal =
        null;


    options.forEach(
        function (option) {

            option.addEventListener(
                "click",
                function () {

                    options.forEach(
                        function (item) {

                            item.classList.remove(
                                "selected"
                            );
                        }
                    );


                    option.classList.add(
                        "selected"
                    );


                    selectedGoal =
                        Number(
                            option.dataset.goal
                        );
                }
            );
        }
    );


    saveButton.addEventListener(
        "click",
        async function () {

            if (!selectedGoal) {
                return;
            }


            const body =
                new URLSearchParams();


            body.append(
                "daily_goal",
                selectedGoal
            );


            try {

                const response =
                    await fetch(
                        "/lock-in-grove/daily-goal",
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/x-www-form-urlencoded"
                            },

                            body:
                                body.toString()
                        }
                    );


                const result =
                    await response.json();


                if (
                    result.success
                ) {

                    window.location.reload();
                }

            } catch (error) {

                console.error(
                    "Daily goal error:",
                    error
                );
            }
        }
    );
}


/* ==========================================================
   FOCUS TIMER
   ========================================================== */

function setupFocusMode(
    focusMode
) {

    const sessionId =
        focusMode.dataset.sessionId;


    const totalMinutes =
        Number(
            focusMode.dataset.duration
        );


    const totalSeconds =
        Math.max(
            1,
            totalMinutes * 60
        );


    const startedAtMs =
        Number(
            focusMode.dataset.startedAtMs
        );


    const timer =
        document.getElementById(
            "focus-timer"
        );

    const progress =
        document.getElementById(
            "focus-progress-fill"
        );

    const grace =
        document.getElementById(
            "cancel-grace"
        );

    const status =
        document.getElementById(
            "focus-status"
        );

    const cancelButton =
        document.getElementById(
            "cancel-focus-session"
        );

    const warning =
        document.getElementById(
            "focus-warning"
        );

    const returnButton =
        document.getElementById(
            "return-focus"
        );


    if (
        !timer ||
        !progress ||
        !grace ||
        !status ||
        !cancelButton
    ) {

        return;
    }


    let finished =
        false;

    let failed =
        false;

    let hiddenSince =
        null;


    function elapsed() {

        if (
            !Number.isFinite(
                startedAtMs
            )
        ) {

            return 0;
        }


        return Math.max(
            0,
            Math.floor(
                (
                    Date.now() -
                    startedAtMs
                ) / 1000
            )
        );
    }


    function formatTime(
        seconds
    ) {

        seconds =
            Math.max(
                0,
                Math.floor(seconds)
            );


        const hours =
            Math.floor(
                seconds / 3600
            );


        const minutes =
            Math.floor(
                (
                    seconds % 3600
                ) / 60
            );


        const remainder =
            seconds % 60;


        return (
            String(hours)
                .padStart(2, "0")
            +
            ":"
            +
            String(minutes)
                .padStart(2, "0")
            +
            ":"
            +
            String(remainder)
                .padStart(2, "0")
        );
    }


    function render() {

        const used =
            elapsed();


        const remaining =
            Math.max(
                totalSeconds -
                used,
                0
            );


        timer.textContent =
            formatTime(
                remaining
            );


        const progressPercent =
            Math.min(
                (
                    used /
                    totalSeconds
                ) * 100,
                100
            );


        progress.style.width =
            `${progressPercent}%`;


        /*
         * FIRST MINUTE = SAFE CANCEL
         */

        if (used < 60) {

            const secondsLeft =
                60 - used;


            grace.classList.remove(
                "expired"
            );


            grace.innerHTML = `
                <strong>
                    SAFE CANCEL: 00:${String(
                        secondsLeft
                    ).padStart(2, "0")}
                </strong>

                <span>
                    Cancel during the first minute
                    and your grove stays untouched.
                </span>
            `;


            cancelButton.classList.remove(
                "danger"
            );


        } else {

            /*
             * GRACE PERIOD EXPIRED
             */

            grace.classList.add(
                "expired"
            );


            grace.innerHTML = `
                <strong>
                    GRACE PERIOD OVER
                </strong>

                <span>
                    Cancelling now may add a distorted tree
                    to your grove.
                </span>
            `;


            cancelButton.classList.add(
                "danger"
            );
        }


        /*
         * STATUS
         */

        if (remaining <= 0) {

            status.textContent =
                "Time's up. Planting your tree... 🌳";


        } else if (remaining <= 300) {

            status.textContent =
                "FINAL FIVE MINUTES. DO NOT FOLD. 🔥";


        } else if (
            used >=
            totalSeconds / 2
        ) {

            status.textContent =
                "Halfway there. Keep going. 🔥";


        } else {

            status.textContent =
                "Stay focused. You've got this. 🔥";
        }
    }


    async function completeSession() {

        if (
            finished ||
            failed
        ) {
            return;
        }


        finished =
            true;


        try {

            const response =
                await fetch(
                    `/lock-in-grove/session/${sessionId}/complete`,
                    {
                        method:
                            "POST"
                    }
                );


            const result =
                await response.json();


            if (
                result.success
            ) {

                status.innerHTML = `
                    <strong>
                        TREE PLANTED! 🌳✨
                    </strong>

                    <br>

                    ${result.tree_name}

                    <br>

                    +${result.antennas_earned} antennas 📡
                `;


                setTimeout(
                    function () {

                        window.location.href =
                            "/lock-in-grove";
                    },
                    2200
                );


            } else {

                finished =
                    false;
            }

        } catch (error) {

            console.error(
                "Complete session error:",
                error
            );


            finished =
                false;
        }
    }


    async function failSession(
        reason
    ) {

        if (
            finished ||
            failed
        ) {
            return;
        }


        failed =
            true;


        try {

            const response =
                await fetch(
                    `/lock-in-grove/session/${sessionId}/fail`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                completed_minutes:
                                    Math.floor(
                                        elapsed() / 60
                                    ),

                                reason:
                                    reason
                            })
                    }
                );


            const result =
                await response.json();


            if (
                result.success
            ) {

                status.innerHTML = `
                    <strong>
                        FOCUS BROKEN. 💀
                    </strong>

                    <br>

                    A distorted tree has been
                    added to your grove.
                `;


                setTimeout(
                    function () {

                        window.location.href =
                            "/lock-in-grove";
                    },
                    1800
                );


            } else {

                failed =
                    false;
            }

        } catch (error) {

            console.error(
                "Fail session error:",
                error
            );


            failed =
                false;
        }
    }


    cancelButton.addEventListener(
        "click",
        async function () {

            if (
                finished ||
                failed
            ) {
                return;
            }


            const used =
                elapsed();


            /*
             * BEFORE 60 SECONDS
             */

            if (used < 60) {

                try {

                    const response =
                        await fetch(
                            `/lock-in-grove/session/${sessionId}/cancel`,
                            {
                                method:
                                    "POST"
                            }
                        );


                    const result =
                        await response.json();


                    if (
                        result.success
                    ) {

                        finished =
                            true;


                        window.location.href =
                            "/lock-in-grove";
                    }

                } catch (error) {

                    console.error(
                        "Cancel session error:",
                        error
                    );
                }


                return;
            }


            /*
             * AFTER 60 SECONDS
             */

            const confirmed =
                window.confirm(
                    "Your one-minute grace period has ended. Cancelling now may add a distorted tree to your forest. Continue?"
                );


            if (!confirmed) {
                return;
            }


            await failSession(
                "User cancelled after the one-minute grace period."
            );
        }
    );


    /*
     * TAB / VISIBILITY
     */

    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                finished ||
                failed
            ) {
                return;
            }


            if (
                document.hidden
            ) {

                hiddenSince =
                    Date.now();


                if (warning) {

                    warning.classList.remove(
                        "hidden"
                    );
                }


            } else {

                hiddenSince =
                    null;


                if (warning) {

                    warning.classList.add(
                        "hidden"
                    );
                }
            }
        }
    );


    const visibilityWatcher =
        setInterval(
            function () {

                if (
                    finished ||
                    failed
                ) {

                    clearInterval(
                        visibilityWatcher
                    );

                    return;
                }


                if (
                    hiddenSince !== null &&
                    (
                        Date.now() -
                        hiddenSince
                    ) >= 5000
                ) {

                    hiddenSince =
                        null;


                    failSession(
                        "User left the StudySync tab during an active focus session."
                    );
                }

            },
            500
        );


    if (returnButton) {

        returnButton.addEventListener(
            "click",
            function () {

                if (warning) {

                    warning.classList.add(
                        "hidden"
                    );
                }
            }
        );
    }


    window.addEventListener(
        "beforeunload",
        function (event) {

            if (
                !finished &&
                !failed
            ) {

                event.preventDefault();

                event.returnValue =
                    "";
            }
        }
    );


    render();


    const timerLoop =
        setInterval(
            function () {

                if (
                    finished ||
                    failed
                ) {

                    clearInterval(
                        timerLoop
                    );

                    clearInterval(
                        visibilityWatcher
                    );

                    return;
                }


                render();


                if (
                    elapsed() >=
                    totalSeconds
                ) {

                    clearInterval(
                        timerLoop
                    );

                    clearInterval(
                        visibilityWatcher
                    );

                    completeSession();
                }

            },
            250
        );
}