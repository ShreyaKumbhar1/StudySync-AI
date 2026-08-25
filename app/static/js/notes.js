/* ==========================================================
   ORION NOTES
   Notebook Library
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const searchInput =
            document.getElementById(
                "notebookSearch"
            );

        const cards =
            document.querySelectorAll(
                ".notebook-card"
            );

        const filterButtons =
            document.querySelectorAll(
                ".filter-btn"
            );

        const emptySearch =
            document.getElementById(
                "emptySearch"
            );


        let activeFilter = "all";


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
                        || type === activeFilter;


                    const matchesSearch =
                        !searchTerm
                        || searchableText.includes(
                            searchTerm
                        );


                    const visible =
                        matchesFilter
                        && matchesSearch;


                    card.style.display =
                        visible
                            ? ""
                            : "none";


                    if (visible) {
                        visibleCount++;
                    }

                }
            );


            if (emptySearch) {

                emptySearch.hidden =
                    visibleCount !== 0;

            }

        }


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                filterNotebooks
            );

        }


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
                            || "all";


                        filterNotebooks();

                    }
                );

            }
        );


        filterNotebooks();

    }
);