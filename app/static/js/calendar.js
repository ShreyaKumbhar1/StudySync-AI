document.addEventListener(
    "DOMContentLoaded",
    function () {

        // ==================================================
        // ELEMENTS
        // ==================================================

        const grid =
            document.getElementById(
                "calendar-grid"
            );

        const monthTitle =
            document.getElementById(
                "calendar-month-title"
            );

        const previousButton =
            document.getElementById(
                "calendar-prev"
            );

        const nextButton =
            document.getElementById(
                "calendar-next"
            );

        const jumpTodayButton =
            document.getElementById(
                "jump-today"
            );

        const selectedDayTitle =
            document.getElementById(
                "selected-day-title"
            );

        const selectedDayContent =
            document.getElementById(
                "selected-day-content"
            );

        const selectedDateLabel =
            document.getElementById(
                "selected-date-label"
            );

        const eventDateInput =
            document.getElementById(
                "calendar-event-date"
            );

        const addEventButton =
            document.getElementById(
                "add-event-for-date"
            );

        const weekPulse =
            document.getElementById(
                "week-pulse"
            );

        // ==================================================
        // DATA
        // ==================================================

        const data =
            window.ORION_CALENDAR_DATA || {};

        const events =
            data.events || [];

        const tasks =
            data.tasks || [];

        const todayString =
            data.today;


        // ==================================================
        // DATE HELPERS
        // ==================================================

        function pad(number) {

            return String(number)
                .padStart(2, "0");

        }


        function parseDateKey(dateKey) {

            if (!dateKey) {
                return new Date();
            }

            const parts =
                dateKey.split("-");

            return new Date(
                Number(parts[0]),
                Number(parts[1]) - 1,
                Number(parts[2])
            );
        }


        function formatDateKey(date) {

            return (
                date.getFullYear()
                + "-"
                + pad(
                    date.getMonth() + 1
                )
                + "-"
                + pad(
                    date.getDate()
                )
            );
        }


        function formatPrettyDate(date) {

            return date.toLocaleDateString(
                "en-IN",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );
        }


        function escapeHtml(value) {

            return String(value || "")
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );
        }


        // ==================================================
        // INITIAL DATES
        // ==================================================

        const today =
            parseDateKey(
                todayString
            );

        let currentDate =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );

        let selectedDate =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );


        // ==================================================
        // GET DAY DATA
        // ==================================================

        function getDayData(dateKey) {

            const dayEvents =
                events.filter(
                    function (event) {
                        return (
                            event.date === dateKey
                        );
                    }
                );

            const dayTasks =
                tasks.filter(
                    function (task) {
                        return (
                            task.date === dateKey
                        );
                    }
                );

            const highPriority =
                dayEvents.filter(
                    event =>
                        event.priority === "High"
                ).length
                +
                dayTasks.filter(
                    task =>
                        !task.completed &&
                        task.priority === "High"
                ).length;

            const completedTasks =
                dayTasks.filter(
                    task =>
                        task.completed
                ).length;

            const total =
                dayEvents.length
                +
                dayTasks.length;

            return {
                events: dayEvents,
                tasks: dayTasks,
                total: total,
                highPriority: highPriority,
                completed: completedTasks
            };
        }


        // ==================================================
        // LOAD CLASS
        // ==================================================

        function getLoadClass(total) {

            if (total === 0) {
                return "load-empty";
            }

            if (total <= 2) {
                return "load-light";
            }

            if (total <= 4) {
                return "load-focus";
            }

            return "load-heavy";
        }


        // ==================================================
        // LOAD LABEL
        // ==================================================

        function getLoadLabel(total) {

            if (total === 0) {
                return "FREE";
            }

            if (total <= 2) {
                return "LIGHT";
            }

            if (total <= 4) {
                return "FOCUS";
            }

            return "HEAVY";
        }


        // ==================================================
        // DAY VISUAL
        // ==================================================

        function createDayVisual(dayData) {

            if (dayData.total === 0) {

                return `
                    <div class="day-load free">
                        <span class="day-load-label">
                            FREE
                        </span>
                    </div>
                `;
            }


            const total =
                Math.min(
                    dayData.total,
                    6
                );


            let blocks = "";


            for (
                let i = 0;
                i < 6;
                i++
            ) {

                blocks += `
                    <span
                        class="
                            load-block
                            ${
                                i < total
                                    ? "active"
                                    : ""
                            }
                        "
                    ></span>
                `;
            }


            return `
                <div
                    class="
                        day-load
                        ${getLoadClass(dayData.total)}
                    "
                >

                    <div class="load-blocks">
                        ${blocks}
                    </div>

                    <div class="day-load-bottom">

                        <span>
                            ${getLoadLabel(
                                dayData.total
                            )}
                        </span>

                        <strong>
                            ${dayData.total}
                        </strong>

                    </div>

                </div>
            `;
        }


        // ==================================================
        // DAY META
        // ==================================================

        function createDayMeta(dayData) {

            if (dayData.total === 0) {
                return "";
            }


            return `
                <div class="day-meta">

                    <span class="day-meta-task">
                        📚 ${dayData.tasks.length}
                    </span>

                    <span class="day-meta-event">
                        📅 ${dayData.events.length}
                    </span>

                    ${
                        dayData.highPriority > 0
                            ? `
                                <span class="day-meta-priority">
                                    🔥
                                    ${dayData.highPriority}
                                </span>
                              `
                            : ""
                    }

                </div>
            `;
        }


        // ==================================================
        // RENDER CALENDAR
        // ==================================================

        function renderCalendar() {

            if (!grid) {
                return;
            }


            grid.innerHTML = "";


            // ==================================================
            // WEEKDAYS
            // ==================================================

            const weekdays = [
                "SUN",
                "MON",
                "TUE",
                "WED",
                "THU",
                "FRI",
                "SAT"
            ];


            weekdays.forEach(
                function (day) {

                    const weekday =
                        document.createElement(
                            "div"
                        );

                    weekday.className =
                        "calendar-weekday";

                    weekday.textContent =
                        day;

                    grid.appendChild(
                        weekday
                    );
                }
            );


            // ==================================================
            // MONTH
            // ==================================================

            const year =
                currentDate.getFullYear();

            const month =
                currentDate.getMonth();


            const monthName =
                currentDate.toLocaleDateString(
                    "en-IN",
                    {
                        month: "long",
                        year: "numeric"
                    }
                );


            monthTitle.textContent =
                monthName;


            // ==================================================
            // FIRST DAY
            // ==================================================

            const firstDay =
                new Date(
                    year,
                    month,
                    1
                ).getDay();


            // ==================================================
            // DAYS IN MONTH
            // ==================================================

            const daysInMonth =
                new Date(
                    year,
                    month + 1,
                    0
                ).getDate();


            // ==================================================
            // EMPTY CELLS
            // ==================================================

            for (
                let i = 0;
                i < firstDay;
                i++
            ) {

                const empty =
                    document.createElement(
                        "div"
                    );

                empty.className =
                    "calendar-day empty";

                grid.appendChild(
                    empty
                );
            }


            // ==================================================
            // DAYS
            // ==================================================

            for (
                let day = 1;
                day <= daysInMonth;
                day++
            ) {

                const cellDate =
                    new Date(
                        year,
                        month,
                        day
                    );

                const dateKey =
                    formatDateKey(
                        cellDate
                    );


                const dayData =
                    getDayData(
                        dateKey
                    );


                const cell =
                    document.createElement(
                        "div"
                    );

                cell.className =
                    "calendar-day";

                cell.dataset.date =
                    dateKey;


                // ==================================================
                // TODAY
                // ==================================================

                if (
                    dateKey ===
                    todayString
                ) {

                    cell.classList.add(
                        "today"
                    );
                }


                // ==================================================
                // SELECTED
                // ==================================================

                if (
                    dateKey ===
                    formatDateKey(
                        selectedDate
                    )
                ) {

                    cell.classList.add(
                        "selected"
                    );
                }


                // ==================================================
                // NUMBER
                // ==================================================

                const number =
                    document.createElement(
                        "div"
                    );

                number.className =
                    "calendar-day-number";

                number.textContent =
                    day;

                cell.appendChild(
                    number
                );


                // ==================================================
                // DAY VISUAL
                // ==================================================

                cell.insertAdjacentHTML(
                    "beforeend",
                    createDayVisual(
                        dayData
                    )
                );


                // ==================================================
                // META
                // ==================================================

                cell.insertAdjacentHTML(
                    "beforeend",
                    createDayMeta(
                        dayData
                    )
                );


                // ==================================================
                // TOOLTIP
                // ==================================================

                if (dayData.total > 0) {

                    cell.title =
                        `${dayData.total} planned item${
                            dayData.total === 1
                                ? ""
                                : "s"
                        } • ${
                            formatPrettyDate(
                                cellDate
                            )
                        }`;

                } else {

                    cell.title =
                        `Free day • ${
                            formatPrettyDate(
                                cellDate
                            )
                        }`;
                }


                // ==================================================
                // CLICK
                // ==================================================

                cell.addEventListener(
                    "click",
                    function () {

                        selectDate(
                            cellDate
                        );
                    }
                );


                grid.appendChild(
                    cell
                );
            }
        }


        // ==================================================
        // SELECT DATE
        // ==================================================

        function selectDate(date) {

            selectedDate =
                new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate()
                );


            currentDate =
                new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    1
                );


            renderCalendar();

            renderSelectedDay();

            updateEventDate();
        }


        // ==================================================
        // UPDATE EVENT DATE
        // ==================================================

        function updateEventDate() {

            if (!eventDateInput) {
                return;
            }

            eventDateInput.value =
                formatDateKey(
                    selectedDate
                );
        }


        // ==================================================
        // CATEGORY ICON
        // ==================================================

        function getCategoryIcon(
            category
        ) {

            switch (category) {

                case "exam":
                    return "🧪";

                case "assignment":
                    return "📝";

                case "study":
                    return "📚";

                case "event":
                    return "🎓";

                case "personal":
                    return "✨";

                default:
                    return "📅";
            }
        }


        // ==================================================
        // PRIORITY ICON
        // ==================================================

        function getPriorityIcon(
            priority
        ) {

            if (
                priority === "High"
            ) {
                return "🔥";
            }

            if (
                priority === "Low"
            ) {
                return "🌱";
            }

            return "•";
        }


        // ==================================================
        // SELECTED DAY
        // ==================================================

        function renderSelectedDay() {

            if (
                !selectedDayTitle
                ||
                !selectedDayContent
            ) {
                return;
            }


            const dateKey =
                formatDateKey(
                    selectedDate
                );


            const prettyDate =
                formatPrettyDate(
                    selectedDate
                );


            selectedDayTitle.textContent =
                prettyDate;


            if (selectedDateLabel) {

                selectedDateLabel.textContent =
                    "📅 " +
                    prettyDate;
            }


            const dayData =
                getDayData(
                    dateKey
                );


            let html = "";


            // ==================================================
            // SUMMARY
            // ==================================================

            html += `
                <div class="selected-day-summary">

                    <div>

                        <strong>
                            ${dayData.total}
                        </strong>

                        <span>
                            planned
                        </span>

                    </div>

                    <div>

                        <strong>
                            ${dayData.completed}
                        </strong>

                        <span>
                            completed
                        </span>

                    </div>

                    <div>

                        <strong>
                            ${dayData.highPriority}
                        </strong>

                        <span>
                            priority
                        </span>

                    </div>

                </div>
            `;


            // ==================================================
            // PLANNER TASKS
            // ==================================================

            if (
                dayData.tasks.length > 0
            ) {

                html += `
                    <div
                        class="selected-day-group"
                    >

                        <div
                            class="selected-day-group-title"
                        >
                            📚 Planner Tasks
                        </div>
                `;


                dayData.tasks.forEach(
                    function (task) {

                        html += `
                            <div
                                class="
                                    selected-day-item
                                    planner-item
                                    ${
                                        task.completed
                                            ? "completed-item"
                                            : ""
                                    }
                                "
                            >

                                <div
                                    class="selected-day-item-icon"
                                >
                                    ${
                                        task.completed
                                            ? "✓"
                                            : "⏳"
                                    }
                                </div>


                                <div
                                    class="selected-day-item-info"
                                >

                                    <strong>
                                        ${escapeHtml(
                                            task.title
                                        )}
                                    </strong>

                                    <small>
                                        ${escapeHtml(
                                            task.subject ||
                                            "Planner"
                                        )}

                                        •

                                        ${getPriorityIcon(
                                            task.priority
                                        )}

                                        ${escapeHtml(
                                            task.priority ||
                                            "Medium"
                                        )}
                                    </small>

                                </div>

                            </div>
                        `;
                    }
                );


                html += `
                    </div>
                `;
            }


            // ==================================================
            // CALENDAR EVENTS
            // ==================================================

            if (
                dayData.events.length > 0
            ) {

                html += `
                    <div
                        class="selected-day-group"
                    >

                        <div
                            class="selected-day-group-title"
                        >
                            📅 Calendar Events
                        </div>
                `;


                dayData.events.forEach(
                    function (event) {

                        let timeText =
                            "All day";


                        if (
                            event.start_time
                        ) {

                            timeText =
                                escapeHtml(
                                    event.start_time
                                );


                            if (
                                event.end_time
                            ) {

                                timeText +=
                                    " – " +
                                    escapeHtml(
                                        event.end_time
                                    );
                            }
                        }


                        html += `
                            <div
                                class="
                                    selected-day-item
                                    event-item
                                "
                            >

                                <div
                                    class="selected-day-item-icon"
                                >
                                    ${getCategoryIcon(
                                        event.category
                                    )}
                                </div>


                                <div
                                    class="selected-day-item-info"
                                >

                                    <strong>
                                        ${escapeHtml(
                                            event.title
                                        )}
                                    </strong>

                                    <small>
                                        ${timeText}

                                        •

                                        ${getPriorityIcon(
                                            event.priority
                                        )}

                                        ${escapeHtml(
                                            event.priority ||
                                            "Medium"
                                        )}
                                    </small>

                                </div>

                            </div>
                        `;
                    }
                );


                html += `
                    </div>
                `;
            }


            // ==================================================
            // EMPTY
            // ==================================================

            if (
                dayData.total === 0
            ) {

                html += `
                    <div
                        class="selected-day-empty"
                    >

                        <div
                            class="selected-day-empty-icon"
                        >
                            🌙
                        </div>

                        <strong>
                            Completely free
                        </strong>

                        <p>
                            No planner tasks or
                            calendar events are scheduled.
                        </p>

                    </div>
                `;
            }


            selectedDayContent.innerHTML =
                html;
        }


        // ==================================================
        // JUMP TO TODAY
        // ==================================================

        function jumpToToday() {

            selectedDate =
                new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate()
                );


            currentDate =
                new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                );


            renderCalendar();

            renderSelectedDay();

            updateEventDate();
        }


        // ==================================================
        // WEEK PULSE
        // ==================================================

        function renderWeekPulse() {

            if (!weekPulse) {
                return;
            }


            const pulse =
                data.week_pulse || [];


            if (
                pulse.length === 0
            ) {

                weekPulse.innerHTML =
                    `
                    <div class="pulse-empty">
                        Nothing planned this week.
                    </div>
                    `;

                return;
            }


            const max =
                Math.max(
                    ...pulse.map(
                        item =>
                            item.total
                    ),
                    1
                );


            let html = "";


            pulse.forEach(
                function (item) {

                    const percentage =
                        item.total === 0
                            ? 5
                            : Math.max(
                                12,
                                (
                                    item.total /
                                    max
                                ) * 100
                            );


                    html += `
                        <div
                            class="
                                pulse-day
                                ${
                                    item.date ===
                                    todayString
                                        ? "pulse-today"
                                        : ""
                                }
                            "
                        >

                            <div class="pulse-label">

                                <strong>
                                    ${item.label}
                                </strong>

                                <span>
                                    ${item.short_date}
                                </span>

                            </div>


                            <div
                                class="pulse-track"
                            >

                                <div
                                    class="pulse-fill"
                                    style="
                                        width:
                                        ${percentage}%;
                                    "
                                ></div>

                            </div>


                            <div
                                class="pulse-meta"
                            >

                                <strong>
                                    ${item.total}
                                </strong>

                                <span>
                                    ${
                                        item.total === 1
                                            ? "item"
                                            : "items"
                                    }
                                </span>

                            </div>

                        </div>
                    `;
                }
            );


            weekPulse.innerHTML =
                html;
        }


        // ==================================================
        // ADD EVENT BUTTON
        // ==================================================

        if (addEventButton) {

            addEventButton.addEventListener(
                "click",
                function () {

                    updateEventDate();

                    const form =
                        document.getElementById(
                            "calendar-add-form"
                        );


                    if (form) {

                        form.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    }


                    setTimeout(
                        function () {

                            if (
                                eventDateInput
                            ) {

                                eventDateInput.focus();
                            }

                        },
                        500
                    );
                }
            );
        }


        // ==================================================
        // PREVIOUS MONTH
        // ==================================================

        if (previousButton) {

            previousButton.addEventListener(
                "click",
                function () {

                    currentDate.setMonth(
                        currentDate.getMonth() - 1
                    );

                    renderCalendar();
                }
            );
        }


        // ==================================================
        // NEXT MONTH
        // ==================================================

        if (nextButton) {

            nextButton.addEventListener(
                "click",
                function () {

                    currentDate.setMonth(
                        currentDate.getMonth() + 1
                    );

                    renderCalendar();
                }
            );
        }


        // ==================================================
        // TODAY
        // ==================================================

        if (jumpTodayButton) {

            jumpTodayButton.addEventListener(
                "click",
                jumpToToday
            );
        }


        // ==================================================
        // INITIALIZE
        // ==================================================

        renderCalendar();

        renderSelectedDay();

        renderWeekPulse();

        updateEventDate();

    }
);