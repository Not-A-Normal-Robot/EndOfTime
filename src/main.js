// @ts-check

/** @const @private */
const DisplayMode = {
    /** @const @constant @readonly @type {0} */ SECONDS: 0,
    /** @const @constant @readonly @type {1} */ MIXED: 1,
}
/** @typedef {typeof DisplayMode[keyof typeof DisplayMode]} DisplayMode */

/** @private @const @constant */
const MIN_DIGITS = 10;

/**
 * @typedef {Object} CounterWrapper A collection of variables for the counters.
 * @property {HTMLParagraphElement} el_counter The counter showing the current count.
 * @property {HTMLSpanElement} el_mode The span showing the current mode.
 * @property {HTMLButtonElement} el_switch The button to switch between modes.
 * @property {DisplayMode} display_mode The current mode the counter is in.
 * @property {number} count_target The end target to get subtracted from, in Unix milliseconds.
 */

/**
 * @const
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
    UNGISNED_MODE: "g",
    UNSIGNED_SWITCH: "h",
};

/** @const @constant @readonly @private */
const CLASS_NAMES = {
    COUNTER_SPACE: "s",
    COUNTER_GREYED: "g",
}

/** @const @constant @readonly @private */
const DECIMAL_SEPARATOR = ".";

/**
 * Wrapper for document that minifies better.
 * @const @constant @readonly @private
 */
const thisDocument = document;

/**
 * Wrapper for document.createElement that minifies better.
 * @const @constant @readonly @private
 * @param {FrameRequestCallback} x
 */
const thisRequestAnimationFrame = requestAnimationFrame.bind(window);

/**
 * Wrapper for document.createElement that minifies better.
 * @private @const @constant
 * @param {string} x
 * @returns {HTMLElement}
 */
const document_createElement = (x) => thisDocument.createElement(x);

/**
 * @private
 * @const
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
    IDS.UNGISNED_MODE,
    IDS.UNSIGNED_SWITCH,
].map(id => thisDocument.getElementById(id)));

/**
 * @private @const @constant
 * @type {CounterWrapper[]}
 */
const COUNTERS = [{
    el_counter: SIGNED_COUNTER,
    el_mode: SIGNED_MODE,
    el_switch: SIGNED_SWITCH,
    display_mode: DisplayMode.SECONDS,
    count_target: 2147483647000,
}, {
    el_counter: UNSIGNED_COUNTER,
    el_mode: UNSIGNED_MODE,
    el_switch: UNSIGNED_SWITCH,
    display_mode: DisplayMode.SECONDS,
    count_target: 4294967295000,
}];

/**
 * Converts a seconds amount to a list of elements.
 * @param {number} seconds
 * @param {boolean} invertGrey
 * @returns {HTMLElement[]}
 * @private @const @constant
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
    elements.push(dot);

    const fracEl = document_createElement("small");
    fracEl.textContent = frac;
    elements.push(fracEl);

    return elements;
}

/**
 * @param {number} now Output of Date.now()
 * @param {CounterWrapper} counter
 * @private @const @constant
 */
const processCounter = (now, counter) =>
{
    const remaining = counter.count_target - now;

    switch (counter.display_mode)
    {
        case DisplayMode.MIXED:
            // TODO
            break;
        default: {
            counter.el_counter.innerHTML = "";
            counter.el_counter.append(...displaySeconds(remaining / 1000, true))
        }
    }
}

/** @private @const @constant */
const tick = () =>
{
    let now = Date.now();

    for (const counter of COUNTERS)
    {
        processCounter(now, counter);
    }

    EPOCH_SECS.innerHTML = "";
    EPOCH_SECS.append(...displaySeconds(now / 1000));

    thisRequestAnimationFrame(tick);
}

/**
 * @param {CounterWrapper} counter
 * @returns {function(): void}
 * @private @const @constant
 */
const switchCounterModeCb = (counter) =>
{
    return () =>
    {
        switch (counter.display_mode)
        {
            case DisplayMode.SECONDS:
                counter.display_mode = DisplayMode.MIXED;
                counter.el_mode.textContent = "mixed mode";
                break;
            default:
                counter.display_mode = DisplayMode.SECONDS;
                counter.el_mode.textContent = "seconds";
        }
    }
}

for (const counter of COUNTERS)
{
    counter.el_switch.onclick = switchCounterModeCb(counter);
}

thisRequestAnimationFrame(tick);