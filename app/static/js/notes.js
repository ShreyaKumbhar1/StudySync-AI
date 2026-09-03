/* ==========================================================
   ORION NOTES
   Notebook Library Dashboard
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const searchInput =
            document.getElementById(
                "notebookSearch"
            );

        const clearSearchButton =
            document.getElementById(
                "clearNotebookSearch"
            );

        const sortSelect =
            document.getElementById(
                "notebookSort"
            );

        const cardsContainer =
            document.getElementById(
                "notebooksGrid"
            );

        const cards = cardsContainer
            ? Array.from(
                cardsContainer.querySelectorAll(
                    ".notebook-card"
                )
            )
            : [];

        const filterButtons =
            document.querySelectorAll(
                ".filter-btn"
            );

        const viewButtons =
            document.querySelectorAll(
                ".view-toggle-btn"
            );

        const emptySearch =
            document.getElementById(
                "emptySearch"
            );

        const resultCount =
            document.getElementById(
                "notesResultCount"
            );

        const resetButton =
            document.getElementById(
                "resetNotebookView"
            );

        const sparkElement =
            document.getElementById(
                "studySpark"
            );

        const sparkButton =
            document.getElementById(
                "sparkButton"
            );


        /* ==================================================
           STATE
           ================================================== */

        let activeFilter = "all";

        let currentView = "grid";


        /* ==================================================
           ORIGINAL ORDER
           ================================================== */

        const originalOrder =
            new Map(
                cards.map(
                    function (card, index) {
                        return [
                            card,
                            index
                        ];
                    }
                )
            );


        /* ==================================================
           STUDY SPARK
           ================================================== */

        const studySparks = [

            "Small progress is still progress.",

            "One page today can save you hours later.",

            "Make your notes easy for future-you to understand.",

            "A focused 20 minutes can be surprisingly powerful.",

            "Learn it. Write it. Remember it.",

            "Turn complicated ideas into simple ones.",

            "Your future revision session will thank you.",

            "Keep going — your knowledge library is growing.",

            "Clarity beats cramming.",

            "Every notebook is a little investment in future-you."

        ];


        let sparkIndex = 0;


        function showNextSpark() {

            if (!sparkElement) {
                return;
            }

            sparkIndex =
                (sparkIndex + 1)
                % studySparks.length;

            sparkElement.classList.remove(
                "spark-changing"
            );

            void sparkElement.offsetWidth;

            sparkElement.classList.add(
                "spark-changing"
            );

            sparkElement.textContent =
                studySparks[sparkIndex];
        }


        if (sparkButton) {

            sparkButton.addEventListener(
                "click",
                showNextSpark
            );

        }


        /* ==================================================
           SORT
           ================================================== */

        function sortCards() {

            if (!cardsContainer) {
                return;
            }

            const sortValue =
                sortSelect
                    ? sortSelect.value
                    : "recent";


            const sortedCards =
                [...cards];


            if (sortValue === "name-asc") {

                sortedCards.sort(
                    function (a, b) {

                        return (
                            a.dataset.title || ""
                        ).localeCompare(
                            b.dataset.title || ""
                        );

                    }
                );

            }


            else if (sortValue === "name-desc") {

                sortedCards.sort(
                    function (a, b) {

                        return (
                            b.dataset.title || ""
                        ).localeCompare(
                            a.dataset.title || ""
                        );

                    }
                );

            }


            else if (sortValue === "pages-desc") {

                sortedCards.sort(
                    function (a, b) {

                        return (
                            Number(
                                b.dataset.pages || 0
                            )
                            -
                            Number(
                                a.dataset.pages || 0
                            )
                        );

                    }
                );

            }


            else if (sortValue === "type") {

                sortedCards.sort(
                    function (a, b) {

                        const typeA =
                            a.dataset.typeName || "";

                        const typeB =
                            b.dataset.typeName || "";

                        const typeCompare =
                            typeA.localeCompare(
                                typeB
                            );

                        if (typeCompare !== 0) {
                            return typeCompare;
                        }

                        return (
                            a.dataset.title || ""
                        ).localeCompare(
                            b.dataset.title || ""
                        );

                    }
                );

            }


            else {

                sortedCards.sort(
                    function (a, b) {

                        return (
                            originalOrder.get(a)
                            -
                            originalOrder.get(b)
                        );

                    }
                );

            }


            sortedCards.forEach(
                function (card) {

                    cardsContainer.appendChild(
                        card
                    );

                }
            );

        }


        /* ==================================================
           SEARCH + FILTER
           ================================================== */

        function filterNotebooks() {

            const searchTerm =
                searchInput
                    ? searchInput.value
                        .trim()
                        .toLowerCase()
                    : "";

            let visibleCount = 0;


            cards.forEach(
                function (card) {

                    const type =
                        card.dataset.type || "";

                    const searchableText =
                        card.dataset.search || "";


                    const matchesFilter =
                        activeFilter === "all"
                        ||
                        type === activeFilter;


                    const matchesSearch =
                        !searchTerm
                        ||
                        searchableText.includes(
                            searchTerm
                        );


                    const visible =
                        matchesFilter
                        &&
                        matchesSearch;


                    card.classList.toggle(
                        "notebook-card-hidden",
                        !visible
                    );


                    if (visible) {
                        visibleCount++;
                    }

                }
            );


            updateResultCount(
                visibleCount
            );


            if (emptySearch) {

                emptySearch.hidden =
                    visibleCount !== 0;

            }


            if (clearSearchButton) {

                clearSearchButton.hidden =
                    !searchTerm;

            }

        }


        /* ==================================================
           RESULT COUNT
           ================================================== */

        function updateResultCount(
            count
        ) {

            if (!resultCount) {
                return;
            }

            resultCount.textContent =
                "Showing "
                +
                count
                +
                (
                    count === 1
                        ? " notebook"
                        : " notebooks"
                );

        }


        /* ==================================================
           SEARCH EVENTS
           ================================================== */

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                filterNotebooks
            );

        }


        if (clearSearchButton) {

            clearSearchButton.addEventListener(
                "click",
                function () {

                    if (!searchInput) {
                        return;
                    }

                    searchInput.value = "";

                    searchInput.focus();

                    filterNotebooks();

                }
            );

        }


        /* ==================================================
           FILTER EVENTS
           ================================================== */

        filterButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        filterButtons.forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        button.classList.add(
                            "active"
                        );


                        activeFilter =
                            button.dataset.filter
                            ||
                            "all";


                        filterNotebooks();

                    }
                );

            }
        );


        /* ==================================================
           SORT EVENTS
           ================================================== */

        if (sortSelect) {

            sortSelect.addEventListener(
                "change",
                function () {

                    sortCards();

                    filterNotebooks();

                }
            );

        }


        /* ==================================================
           VIEW MODE
           ================================================== */

        viewButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const requestedView =
                            button.dataset.view
                            ||
                            "grid";


                        currentView =
                            requestedView;


                        viewButtons.forEach(
                            function (item) {

                                item.classList.toggle(
                                    "active",
                                    item === button
                                );

                            }
                        );


                        if (cardsContainer) {

                            cardsContainer.classList.toggle(
                                "compact-view",
                                currentView === "compact"
                            );

                        }

                    }
                );

            }
        );


        /* ==================================================
           RESET VIEW
           ================================================== */

        function resetView() {

            if (searchInput) {
                searchInput.value = "";
            }


            activeFilter = "all";


            filterButtons.forEach(
                function (button) {

                    button.classList.toggle(
                        "active",
                        button.dataset.filter === "all"
                    );

                }
            );


            if (sortSelect) {
                sortSelect.value = "recent";
            }


            sortCards();

            filterNotebooks();

        }


        if (resetButton) {

            resetButton.addEventListener(
                "click",
                resetView
            );

        }


        /* ==================================================
           KEYBOARD SHORTCUT
           ================================================== */

        document.addEventListener(
            "keydown",
            function (event) {

                const activeElement =
                    document.activeElement;

                const isTyping =
                    activeElement
                    &&
                    (
                        activeElement.tagName === "INPUT"
                        ||
                        activeElement.tagName === "TEXTAREA"
                        ||
                        activeElement.tagName === "SELECT"
                        ||
                        activeElement.isContentEditable
                    );


                if (
                    event.key === "/"
                    &&
                    !isTyping
                ) {

                    event.preventDefault();


                    if (searchInput) {

                        searchInput.focus();

                        searchInput.select();

                    }

                }


                if (
                    event.key === "Escape"
                    &&
                    document.activeElement === searchInput
                ) {

                    if (searchInput) {
                        searchInput.blur();
                    }

                }

            }
        );


        /* ==================================================
           INITIALIZE
           ================================================== */

        sortCards();

        filterNotebooks();

    }
);