/* ORION ASSIGNMENTS — interactions */

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("assignmentModal");
    const form = document.getElementById("assignmentForm");
    const modalTitle = document.getElementById("modalTitle");

    const titleInput = document.getElementById("assignmentTitle");
    const subjectInput = document.getElementById("assignmentSubject");
    const descriptionInput = document.getElementById("assignmentDescription");
    const dueDateInput = document.getElementById("assignmentDueDate");
    const priorityInput = document.getElementById("assignmentPriority");
    const difficultyInput = document.getElementById("assignmentDifficulty");
    const minutesInput = document.getElementById("assignmentMinutes");
    const attachmentInput = document.getElementById("assignmentAttachment");

    const createUrl = form ? form.action : "";

    /* ================================
       MODAL
    ================================= */

    function openCreateModal() {
        if (!modal || !form) {
            return;
        }

        modalTitle.textContent = "Create Assignment";

        form.action = createUrl;
        form.reset();

        priorityInput.value = "Medium";
        difficultyInput.value = "Medium";
        minutesInput.value = "60";

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        if (titleInput) {
            titleInput.focus();
        }
    }

    function closeModal() {
        if (!modal) {
            return;
        }

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";
    }

    /* New Assignment button */
    const newAssignmentButton =
        document.getElementById("newAssignmentButton");

    if (newAssignmentButton) {
        newAssignmentButton.addEventListener(
            "click",
            openCreateModal
        );
    }

    /* Empty-state Add Assignment button */
    const emptyNewAssignmentButton =
        document.getElementById("emptyNewAssignmentButton");

    if (emptyNewAssignmentButton) {
        emptyNewAssignmentButton.addEventListener(
            "click",
            openCreateModal
        );
    }

    /* Close buttons */
    document.querySelectorAll("[data-close-modal]").forEach((element) => {
        element.addEventListener("click", closeModal);
    });

    /* Escape key closes modal */
    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            modal &&
            modal.classList.contains("is-open")
        ) {
            closeModal();
        }
    });


    /* ================================
       EDIT ASSIGNMENT
    ================================= */

    document
        .querySelectorAll("[data-edit-assignment]")
        .forEach((button) => {

            button.addEventListener("click", () => {

                if (!modal || !form) {
                    return;
                }

                modalTitle.textContent = "Edit Assignment";

                titleInput.value =
                    button.dataset.title || "";

                subjectInput.value =
                    button.dataset.subject || "";

                descriptionInput.value =
                    button.dataset.description || "";

                dueDateInput.value =
                    button.dataset.due || "";

                priorityInput.value =
                    button.dataset.priority || "Medium";

                difficultyInput.value =
                    button.dataset.difficulty || "Medium";

                minutesInput.value =
                    button.dataset.minutes || "60";

                attachmentInput.value =
                    button.dataset.attachment || "";

                form.action =
                    `/assignments/edit/${button.dataset.id}`;

                modal.classList.add("is-open");
                modal.setAttribute(
                    "aria-hidden",
                    "false"
                );

                document.body.style.overflow = "hidden";

                if (titleInput) {
                    titleInput.focus();
                }
            });
        });


    /* ================================
       DELETE CONFIRMATION
    ================================= */

    document
        .querySelectorAll("[data-delete-form]")
        .forEach((deleteForm) => {

            deleteForm.addEventListener("submit", (event) => {

                const confirmed = window.confirm(
                    "Delete this assignment permanently?"
                );

                if (!confirmed) {
                    event.preventDefault();
                }
            });
        });


    /* ================================
       PROGRESS SLIDER
    ================================= */

    document
        .querySelectorAll("[data-progress-slider]")
        .forEach((slider) => {

            const output =
                slider.parentElement.querySelector("output");

            function updateOutput() {

                if (output) {
                    output.value = `${slider.value}%`;
                    output.textContent = `${slider.value}%`;
                }
            }

            slider.addEventListener(
                "input",
                updateOutput
            );

            updateOutput();
        });


    /* ================================
       SEARCH + FILTERS
    ================================= */

    const searchInput =
        document.getElementById("assignmentSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const priorityFilter =
        document.getElementById("priorityFilter");

    const sortSelect =
        document.getElementById("sortAssignments");

    const clearButton =
        document.getElementById("clearAssignmentFilters");

    const grid =
        document.getElementById("assignmentGrid");

    const resultCount =
        document.getElementById("assignmentResultCount");

    const noResults =
        document.getElementById("noSearchResults");


    function getAssignmentCards() {

        return Array.from(
            document.querySelectorAll(".assignment-card")
        );
    }


    function applyFilters() {

        const search =
            searchInput
                ? searchInput.value.trim().toLowerCase()
                : "";

        const status =
            statusFilter
                ? statusFilter.value
                : "all";

        const priority =
            priorityFilter
                ? priorityFilter.value
                : "all";

        let visibleCount = 0;

        getAssignmentCards().forEach((card) => {

            const title =
                card.dataset.title || "";

            const subject =
                card.dataset.subject || "";

            const cardStatus =
                card.dataset.status || "";

            const cardPriority =
                card.dataset.priority || "";


            const matchesSearch =
                !search ||
                title.includes(search) ||
                subject.includes(search);


            const matchesStatus =
                status === "all" ||
                cardStatus === status;


            const matchesPriority =
                priority === "all" ||
                cardPriority === priority;


            const shouldShow =
                matchesSearch &&
                matchesStatus &&
                matchesPriority;


            card.classList.toggle(
                "hidden",
                !shouldShow
            );


            if (shouldShow) {
                visibleCount++;
            }
        });


        if (resultCount) {

            resultCount.textContent =
                `${visibleCount} assignment${
                    visibleCount === 1 ? "" : "s"
                }`;
        }


        if (noResults) {

            noResults.classList.toggle(
                "hidden",
                visibleCount !== 0
            );
        }
    }


    /* ================================
       SORTING
    ================================= */

    function sortCards() {

        if (!grid || !sortSelect) {
            return;
        }

        const mode =
            sortSelect.value;

        const cards =
            getAssignmentCards();


        const priorityRank = {
            High: 3,
            Medium: 2,
            Low: 1
        };


        const difficultyRank = {
            Hard: 3,
            Medium: 2,
            Easy: 1
        };


        cards.sort((a, b) => {

            if (mode === "recommendation") {

                return (
                    Number(b.dataset.score || 0) -
                    Number(a.dataset.score || 0)
                );
            }


            if (mode === "due") {

                return (
                    (a.dataset.due || "")
                        .localeCompare(
                            b.dataset.due || ""
                        )
                );
            }


            if (mode === "priority") {

                return (
                    (priorityRank[b.dataset.priority] || 0) -
                    (priorityRank[a.dataset.priority] || 0)
                );
            }


            if (mode === "difficulty") {

                return (
                    (difficultyRank[b.dataset.difficulty] || 0) -
                    (difficultyRank[a.dataset.difficulty] || 0)
                );
            }


            if (mode === "progress") {

                return (
                    Number(b.dataset.progress || 0) -
                    Number(a.dataset.progress || 0)
                );
            }


            return 0;
        });


        cards.forEach((card) => {
            grid.appendChild(card);
        });


        applyFilters();
    }


    /* Search */
    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );
    }


    /* Status filter */
    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyFilters
        );
    }


    /* Priority filter */
    if (priorityFilter) {

        priorityFilter.addEventListener(
            "change",
            applyFilters
        );
    }


    /* Sort */
    if (sortSelect) {

        sortSelect.addEventListener(
            "change",
            sortCards
        );
    }


    /* ================================
       CLEAR FILTERS
    ================================= */

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            () => {

                if (searchInput) {
                    searchInput.value = "";
                }

                if (statusFilter) {
                    statusFilter.value = "all";
                }

                if (priorityFilter) {
                    priorityFilter.value = "all";
                }

                if (sortSelect) {
                    sortSelect.value = "recommendation";
                }

                sortCards();
            }
        );
    }


    /* ================================
       INITIAL LOAD
    ================================= */

    sortCards();
    applyFilters();
});