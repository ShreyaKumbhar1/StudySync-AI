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

    function getStoredTreePosition(tree) {

        const key = tree.dataset.treeKey;

        if (!key) {
            return null;
        }

        try {
            const stored =
                localStorage.getItem(
                    `studysync-grove-tree-${key}`
                );

            if (!stored) {
                return null;
            }

            const position = JSON.parse(stored);

            if (
                typeof position.x !== "number" ||
                typeof position.y !== "number"
            ) {
                return null;
            }

            return position;
        } catch (error) {
            console.warn(
                "Unable to read saved tree position:",
                error
            );
            return null;
        }
    }

    function saveTreePosition(tree, x, y) {

        const key = tree.dataset.treeKey;

        if (!key) {
            return;
        }

        try {
            localStorage.setItem(
                `studysync-grove-tree-${key}`,
                JSON.stringify({
                    x: x,
                    y: y
                })
            );
        } catch (error) {
            console.warn(
                "Unable to save tree position:",
                error
            );
        }
    }

    function enableTreeDragging(tree, view, land) {

        if (tree.dataset.dragReady === "true") {
            return;
        }

        tree.dataset.dragReady = "true";

        tree.addEventListener(
            "pointerdown",
            function (event) {

                if (event.button !== 0) {
                    return;
                }

                const landRect = land.getBoundingClientRect();
                const viewRect = view.getBoundingClientRect();

                if (!landRect.width || !landRect.height) {
                    return;
                }

                const treeRect = tree.getBoundingClientRect();

                const pointerX = event.clientX - viewRect.left;
                const pointerY = event.clientY - viewRect.top;
                const treeLeft = treeRect.left - viewRect.left;
                const treeTop = treeRect.top - viewRect.top;
                const offsetX = pointerX - treeLeft;
                const offsetY = pointerY - treeTop;

                const minX = landRect.left - viewRect.left + (treeRect.width / 2);
                const maxX = landRect.right - viewRect.left - (treeRect.width / 2);
                const minY = landRect.top - viewRect.top + treeRect.height;
                const maxY = landRect.bottom - viewRect.top;

                tree.classList.add("dragging");
                tree.setPointerCapture(event.pointerId);
                event.preventDefault();

                function moveTree(moveEvent) {

                    const nextLeft =
                        moveEvent.clientX - viewRect.left - offsetX;

                    const nextTop =
                        moveEvent.clientY - viewRect.top - offsetY;

                    const nextX = Math.max(
                        minX,
                        Math.min(
                            maxX,
                            nextLeft + (treeRect.width / 2)
                        )
                    );

                    const nextY = Math.max(
                        minY,
                        Math.min(
                            maxY,
                            nextTop + treeRect.height
                        )
                    );

                    tree.style.left = `${nextX}px`;
                    tree.style.top = `${nextY}px`;

                    const x =
                        (
                            nextX -
                            (landRect.left - viewRect.left)
                        ) / landRect.width * 100;

                    const y =
                        (
                            nextY -
                            (landRect.top - viewRect.top)
                        ) / landRect.height * 100;

                    tree.dataset.x = String(x);
                    tree.dataset.y = String(y);
                    tree.style.zIndex = String(1000 + Math.round(y * 10));
                }

                function finishDrag() {

                    tree.classList.remove("dragging");

                    const x = Number(tree.dataset.x);
                    const y = Number(tree.dataset.y);

                    if (Number.isFinite(x) && Number.isFinite(y)) {
                        saveTreePosition(tree, x, y);
                    }

                    tree.removeEventListener("pointermove", moveTree);
                    tree.removeEventListener("pointerup", finishDrag);
                    tree.removeEventListener("pointercancel", finishDrag);
                }

                tree.addEventListener("pointermove", moveTree);
                tree.addEventListener("pointerup", finishDrag);
                tree.addEventListener("pointercancel", finishDrag);
            }
        );
    }

    function positionTrees(view) {

        if (!view) {
            return;
        }

        const land = view.querySelector(".forest-land");

        if (!land) {
            return;
        }

        function applyPositions() {

            const landRect = land.getBoundingClientRect();
            const viewRect = view.getBoundingClientRect();

            if (!landRect.width || !landRect.height) {
                return;
            }

            view.querySelectorAll(".planted-tree").forEach(
                function (tree) {

                    const stored = getStoredTreePosition(tree);

                    const x = stored
                        ? stored.x
                        : Number(tree.dataset.x || 50);

                    const y = stored
                        ? stored.y
                        : Number(tree.dataset.y || 50);

                    tree.dataset.x = String(x);
                    tree.dataset.y = String(y);

                    tree.style.left = `${
                        (landRect.left - viewRect.left) +
                        (landRect.width * x / 100)
                    }px`;

                    tree.style.top = `${
                        (landRect.top - viewRect.top) +
                        (landRect.height * y / 100)
                    }px`;

                    tree.style.zIndex = String(1000 + Math.round(y * 10));

                    enableTreeDragging(tree, view, land);
                }
            );
        }

        if (land.complete) {
            requestAnimationFrame(applyPositions);
        } else {
            land.addEventListener("load", applyPositions, { once: true });
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

    const moreButton = document.getElementById("more-music-button");

    if (moreButton) {
        moreButton.addEventListener("click", function () {
            openModal("more-music-modal");
        });
    }

    let previewAudio = null;

    function stopPreview() {
        if (!previewAudio) return;
        previewAudio.pause();
        previewAudio.currentTime = 0;
        previewAudio.removeAttribute("src");
        previewAudio.load();
        previewAudio = null;
    }

    function playPreview(file) {
        stopPreview();

        if (!file) return;

        previewAudio = new Audio(file);
        previewAudio.preload = "auto";
        previewAudio.volume = 0.65;

        const audio = previewAudio;
        audio.addEventListener("error", function () {
            console.error("Music preview failed:", file, audio.error);
        });

        audio.play().catch(function (error) {
            console.warn("Music preview was blocked:", error);
            // The visible HTML audio player below will still be usable.
        });
    }

    document.querySelectorAll(".music-item").forEach(function (card) {
        card.addEventListener("click", function () {
            const unlocked = card.dataset.unlocked === "true";
            if (!unlocked) {
                stopPreview();
                openMusicInfo(card.dataset);
                return;
            }

            playPreview(card.dataset.file || "");
            openMusicInfo(card.dataset);
        });
    });

    document.querySelectorAll(".all-music-option").forEach(function (card) {
        card.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            openMusicInfo(card.dataset);
        });
    });

    const unlockButton = document.getElementById("music-modal-unlock");
    let pendingMusicId = null;

    function getCurrentAntennas() {
        const element = document.querySelector(".antenna-counter strong");
        if (!element) return 0;
        const value = Number(element.textContent.replace(/[^0-9]/g, ""));
        return Number.isFinite(value) ? value : 0;
    }

    function openMusicInfo(data) {
        const modal = document.getElementById("music-info-modal");
        if (!modal) return;

        const name = document.getElementById("music-modal-name");
        const description = document.getElementById("music-modal-description");
        const player = document.getElementById("music-preview-player");
        const costArea = document.getElementById("music-modal-cost-area");
        const cost = document.getElementById("music-modal-cost");

        if (costArea) costArea.classList.add("hidden");
        if (unlockButton) unlockButton.classList.add("hidden");
        pendingMusicId = null;

        if (name) name.textContent = data.name || "Music";
        if (description) {
            description.textContent = data.description ||
                "A focus atmosphere for your study session.";
        }

        if (player) {
            player.pause();
            player.currentTime = 0;
            player.src = data.file || "";
            player.load();

            // The click that opened this popup is a user gesture, so attempt
            // playback immediately. Controls remain available if autoplay is blocked.
            if (data.unlocked === "true" && data.file) {
                player.volume = 0.65;
                player.play().catch(function (error) {
                    console.warn("Preview player was blocked:", error);
                });
            }
        }

        const unlocked = String(data.unlocked) === "true";

        if (!unlocked) {
            pendingMusicId = data.music || "";
            const required = Number(data.cost || 0);
            const current = getCurrentAntennas();
            const remaining = Math.max(required - current, 0);

            if (cost) {
                cost.textContent = remaining > 0
                    ? `${remaining} more antennas needed`
                    : `${required} antennas required`;
            }

            if (costArea) costArea.classList.remove("hidden");
            if (unlockButton) unlockButton.classList.remove("hidden");
        }

        modal.classList.remove("hidden");
    }

    if (unlockButton) {
        unlockButton.addEventListener("click", async function () {
            if (!pendingMusicId) return;

            try {
                const response = await fetch(
                    `/lock-in-grove/unlock-music/${encodeURIComponent(pendingMusicId)}`,
                    { method: "POST" }
                );
                const result = await response.json();
                if (result.success) window.location.reload();
            } catch (error) {
                console.error("Music unlock error:", error);
            }
        });
    }

    // Stop the background preview whenever either music modal is closed.
    document.addEventListener("click", function (event) {
        const closeButton = event.target.closest("[data-close-modal]");
        if (!closeButton) return;

        const modalId = closeButton.dataset.closeModal;
        if (modalId === "music-info-modal" || modalId === "more-music-modal") {
            stopPreview();
            const player = document.getElementById("music-preview-player");
            if (player) {
                player.pause();
                player.currentTime = 0;
            }
        }
    });
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

    const focusAudio = document.getElementById("focus-session-audio");
    const focusMusicFile = focusMode.dataset.musicFile || "";

    if (focusAudio && focusMusicFile) {
        focusAudio.src = focusMusicFile;
        focusAudio.loop = true;
        focusAudio.volume = 0.65;
        focusAudio.load();

        const startFocusAudio = function () {
            focusAudio.play().catch(function (error) {
                console.warn("Focus music autoplay was blocked:", error);
            });
        };

        startFocusAudio();

        // Browsers may block autoplay after navigation. Start it on the
        // first user interaction with the focus page.
        ["click", "pointerdown", "keydown", "touchstart"].forEach(function (eventName) {
            document.addEventListener(eventName, startFocusAudio, { once: true });
        });
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

        /* FIRST MINUTE */

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

            /* GRACE PERIOD EXPIRED */

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

        /* STATUS */

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

    let leavingFocusPage = false;
    let visibilityWatcher = null;

    /*
     * Focus-lock warning.
     *
     * The existing Orion warning component is reused so its
     * existing styling/animation stays untouched. We only add
     * the focus-lock message when the user attempts to leave.
     */
    function showFocusExitWarning() {

        if (!warning) {
            return;
        }

        let message =
            warning.querySelector(
                ".orion-focus-exit-message"
            );

        if (!message) {

            message =
                document.createElement(
                    "div"
                );

            message.className =
                "orion-focus-exit-message";

            message.style.marginBottom =
                "14px";

            message.style.lineHeight =
                "1.5";

            message.style.textAlign =
                "center";

            if (returnButton) {
                warning.insertBefore(
                    message,
                    returnButton
                );
            } else {
                warning.appendChild(
                    message
                );
            }
        }

        message.innerHTML = `
            <strong style="display:block; margin-bottom:6px;">
                🌳 FOCUS LOCK ACTIVE
            </strong>
            <span>
                If you close this tab or leave ORION,
                a destroyed tree will be planted in your forest.
            </span>
        `;

        warning.classList.remove(
            "hidden"
        );
    }

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

                /*
                 * Opening a new browser tab, switching away,
                 * minimizing the browser, etc. makes the page
                 * hidden. Show the Orion focus warning immediately.
                 */
                showFocusExitWarning();

            } else {

                if (warning) {
                    warning.classList.add(
                        "hidden"
                    );
                }

            }
        }
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
                finished ||
                failed ||
                leavingFocusPage
            ) {
                return;
            }

            /*
             * Browsers do not allow a website to replace the
             * native close/reload confirmation with a custom
             * popup. The existing Orion warning is shown first,
             * while returnValue triggers the browser's native
             * "Leave site?" confirmation when the tab is closed.
             */
            showFocusExitWarning();

            event.preventDefault();

            event.returnValue =
                "Your focus session is still active. Leaving ORION will plant a destroyed tree in your forest.";
        }
    );

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

            if (
                !link.href
            ) {
                return;
            }

            /*
             * Opening a new tab/window:
             * block it and show the existing
             * Orion focus warning.
             */
            const opensNewContext =
                link.target === "_blank" ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.button === 1;

            if (
                opensNewContext
            ) {

                event.preventDefault();

                event.stopPropagation();

                showFocusExitWarning();

                return;
            }

            /*
             * Normal navigation inside
             * StudySync is allowed.
             */

        },
        true
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

                    if (visibilityWatcher) {
                        clearInterval(
                            visibilityWatcher
                        );
                    }

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

                    if (visibilityWatcher) {
                        clearInterval(
                            visibilityWatcher
                        );
                    }

                    completeSession();
                }

            },
            250
        );
}