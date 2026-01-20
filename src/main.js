// @ts-check

/** @constant @private @enum {typeof DisplayMode[keyof typeof DisplayMode]} */
const DisplayMode = {
    /** @constant @readonly @type {0} */ SECONDS: 0,
    /** @constant @readonly @type {1} */ MIXED: 1,
}

/** @private @constant */
const MIN_DIGITS = 10;

/**
 * @typedef {Object} CounterWrapper A collection of variables for the counters.
 * @property {HTMLParagraphElement} elCounter The counter showing the current count.
 * @property {HTMLSpanElement} elMode The span showing the current mode.
 * @property {HTMLButtonElement} elSwitch The button to switch between modes.
 * @property {DisplayMode} displayMode The current mode the counter is in.
 * @property {number} countTarget The end target to get subtracted from, in Unix milliseconds.
 */

/**
 * @typedef {Object} MixedUnit A unit used in the mixed display.
 * @property {string} unitName What to display this unit as.
 * @property {number} seconds How many seconds this unit is.
 * @property {number} digits How many digits of this number should be displayed at minimum.
 */

/**
 * @constant
 * @readonly
 * @private
 */
const IDS = {
    EPOCH_SECS: "a",
    CUR_DATE: "b",
    SIGNED_COUNTER: "c",
    SIGNED_MODE: "d",
    SIGNED_SWITCH: "e",
    UNSIGNED_COUNTER: "f",
    UNSIGNED_MODE: "g",
    UNSIGNED_SWITCH: "h",
};

/** @constant @readonly @private */
const CLASS_NAMES = {
    COUNTER_HALF_SPACE: "h",
    COUNTER_SPACE: "s",
    COUNTER_GREYED: "g",
    COUNTER_TINY: "t",
}

/** @constant @readonly @private */
const DECIMAL_SEPARATOR = ".";

/**
 * @constant @readonly @private
 * @type {MixedUnit[]}
 */
const MIXED_UNITS = [
    // Years is a special case and handled separately
    { unitName: "d", seconds: 86400, digits: 3 },
    { unitName: "h", seconds: 3600, digits: 2 },
    { unitName: "m", seconds: 60, digits: 2 },
    { unitName: "s", seconds: 1, digits: 2 },
    { unitName: "ms", seconds: 0.001, digits: 3 },
];

/**
 * Wrapper for document that minifies better.
 * @constant @readonly @private
 */
const thisDocument = document;

/**
 * Wrapper for document.createElement that minifies better.
 * @constant @readonly @private
 * @param {FrameRequestCallback} x
 */
const thisRequestAnimationFrame = requestAnimationFrame.bind(window);

/**
 * Wrapper for document.createElement that minifies better.
 * @private @constant
 * @param {string} x
 * @returns {HTMLElement}
 */
const document_createElement = (x) => thisDocument.createElement(x);

/**
 * @private
 * @constant
 * @type {[
 * HTMLParagraphElement,
 * HTMLTimeElement,
 * HTMLParagraphElement,
 * HTMLSpanElement,
 * HTMLButtonElement,
 * HTMLParagraphElement,
 * HTMLSpanElement,
 * HTMLButtonElement,
 * ]}
 */
const [
    EPOCH_SECS,
    CUR_DATE,
    SIGNED_COUNTER,
    SIGNED_MODE,
    SIGNED_SWITCH,
    UNSIGNED_COUNTER,
    UNSIGNED_MODE,
    UNSIGNED_SWITCH,
] = /** @type {*} */ ([
    IDS.EPOCH_SECS,
    IDS.CUR_DATE,
    IDS.SIGNED_COUNTER,
    IDS.SIGNED_MODE,
    IDS.SIGNED_SWITCH,
    IDS.UNSIGNED_COUNTER,
    IDS.UNSIGNED_MODE,
    IDS.UNSIGNED_SWITCH,
].map(id => thisDocument.getElementById(id)));

/**
 * @private @constant
 * @type {CounterWrapper[]}
 */
const COUNTERS = [{
    elCounter: SIGNED_COUNTER,
    elMode: SIGNED_MODE,
    elSwitch: SIGNED_SWITCH,
    displayMode: DisplayMode.SECONDS,
    countTarget: 2147483647000,
}, {
    elCounter: UNSIGNED_COUNTER,
    elMode: UNSIGNED_MODE,
    elSwitch: UNSIGNED_SWITCH,
    displayMode: DisplayMode.SECONDS,
    countTarget: 4294967295000,
}];

/**
 * Gets the number of years, between two dates,
 * rounded down.
 * 
 * @param {Date} earlier Earlier date.
 * @param {Date} later Later date.
 */
const yearsBetween = (earlier, later) =>
{
    let years = later.getUTCFullYear() - earlier.getUTCFullYear();

    if (
        later.getUTCMonth() < earlier.getUTCMonth() ||
        (later.getUTCMonth() === earlier.getUTCMonth() && later.getUTCDate() < earlier.getUTCDate())
    )
    {
        years--;
    }

    return years;
}

/**
 * Converts a seconds amount to a list of elements.
 * @param {Date} start Current date.
 * @param {Date} end Target date.
 * @returns {HTMLElement[]}
 * @private @constant
 */
const displayMixed = (start, end) =>
{
    /** @type {HTMLElement[]} */
    const elements = [];

    const startYear = start.getUTCFullYear();
    const years = yearsBetween(start, end);
    const afterYears = start.setUTCFullYear(startYear + years);

    const yearEl = document_createElement("span");
    yearEl.classList.add(CLASS_NAMES.COUNTER_HALF_SPACE);
    if (years < 1)
    {
        yearEl.classList.add(CLASS_NAMES.COUNTER_GREYED);
    }
    yearEl.textContent = years.toFixed(0).padStart(1, "0");

    let yearUnitEl = document_createElement("small");
    yearUnitEl.textContent = "y ";

    elements.push(yearEl, yearUnitEl);

    const totalSecs = end.getTime() / 1000;
    let remainderSecs = (end.getTime() - afterYears) / 1000;
    for (const unit of MIXED_UNITS)
    {
        const isSmallestUnit = unit === MIXED_UNITS[MIXED_UNITS.length - 1];

        let quotient = Math.floor(remainderSecs / unit.seconds);
        remainderSecs -= quotient * unit.seconds;

        /** @type {HTMLElement} */
        let numEl;
        if (isSmallestUnit)
        {
            numEl = document_createElement("small");
        } else
        {
            numEl = document_createElement("span");
        }

        numEl.classList.add(CLASS_NAMES.COUNTER_HALF_SPACE);

        if (totalSecs < unit.seconds)
        {
            numEl.classList.add(CLASS_NAMES.COUNTER_GREYED);
        }

        numEl.textContent = quotient.toFixed(0).padStart(unit.digits, "0");

        let unitEl = document_createElement("small");
        if (isSmallestUnit)
        {
            unitEl.classList.add(CLASS_NAMES.COUNTER_TINY);
        }
        unitEl.textContent = unit.unitName + " ";

        elements.push(numEl, unitEl);
    }

    return elements;
}

/**
 * Converts a seconds amount to a list of elements.
 * @param {number} seconds
 * @param {boolean} invertGrey
 * @returns {HTMLElement[]}
 * @private @constant
 */
const displaySeconds = (seconds, invertGrey = false) =>
{
    const numSecs = seconds.toFixed(3);
    const [int, frac] = numSecs.split(".", 2);

    /** @type {HTMLElement[]} */
    const elements = [];

    for (let exponent = Math.max(int.length, MIN_DIGITS) - 1; exponent >= 0; exponent--)
    {
        const span = document_createElement("span");
        if (exponent % 3 === 0 && exponent !== 0)
        {
            span.classList.add(CLASS_NAMES.COUNTER_SPACE);
        }
        if (exponent >= int.length)
        {
            span.classList.add(CLASS_NAMES.COUNTER_GREYED);
            span.textContent = "0";
        } else
        {
            const index = int.length - exponent - 1;
            span.innerText = int[index];
        }

        elements.push(span);
    }

    const dot = document_createElement("span");
    if (seconds % 1 > 0.5 !== invertGrey)
    {
        dot.classList.add(CLASS_NAMES.COUNTER_GREYED);
    }
    dot.textContent = DECIMAL_SEPARATOR;

    const fracEl = document_createElement("small");
    fracEl.textContent = frac;

    elements.push(dot, fracEl);

    return elements;
}

/**
 * @param {number} now Output of Date.now()
 * @param {CounterWrapper} counter
 * @private @constant
 */
const processCounter = (now, counter) =>
{
    switch (counter.displayMode)
    {
        case DisplayMode.MIXED:
            counter.elCounter.innerHTML = "";
            counter.elCounter.append(...displayMixed(new Date(now), new Date(counter.countTarget)))
            break;
        default: {
            counter.elCounter.innerHTML = "";
            counter.elCounter.append(...displaySeconds((counter.countTarget - now) / 1000, true))
        }
    }
}

/** @private @constant */
const tick = () =>
{
    let now = Date.now();

    for (const counter of COUNTERS)
    {
        processCounter(now, counter);
    }

    EPOCH_SECS.innerHTML = "";
    EPOCH_SECS.append(...displaySeconds(now / 1000));

    const isoDate = new Date(now).toISOString();
    CUR_DATE.textContent = `@ ${isoDate}`;
    CUR_DATE.dateTime = isoDate;

    thisRequestAnimationFrame(tick);
}

/**
 * @param {CounterWrapper} counter
 * @returns {function(): void}
 * @private @constant
 */
const switchCounterModeCb = (counter) =>
{
    return () =>
    {
        switch (counter.displayMode)
        {
            case DisplayMode.SECONDS:
                counter.displayMode = DisplayMode.MIXED;
                counter.elMode.textContent = "mixed mode";
                break;
            default:
                counter.displayMode = DisplayMode.SECONDS;
                counter.elMode.textContent = "seconds";
        }
    }
}

for (const counter of COUNTERS)
{
    counter.elSwitch.onclick = switchCounterModeCb(counter);
}

thisRequestAnimationFrame(tick);