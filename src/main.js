// @ts-check

/** @const @private */
const CounterMode = {
    /** @const @constant @readonly @type {0} */ SECONDS: 0,
    /** @const @constant @readonly @type {1} */ MIXED: 1,
}
/** @typedef {typeof CounterMode[keyof typeof CounterMode]} CounterMode */

/** @private @const @constant */
const MIN_DIGITS = 10;

/**
 * @typedef {Object} CounterWrapper A collection of variables for the counters.
 * @property {HTMLParagraphElement} el_counter The counter showing the current count.
 * @property {HTMLSpanElement} el_mode The span showing the current mode.
 * @property {HTMLButtonElement} el_switch The button to switch between modes.
 * @property {CounterMode} mode The current mode the counter is in.
 * @property {number} target The end target to get subtracted from, in Unix milliseconds.
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
].map(id => document.getElementById(id)));

/**
 * @private @const @constant
 * @type {CounterWrapper[]}
 */
const COUNTERS = [{
    el_counter: SIGNED_COUNTER,
    el_mode: SIGNED_MODE,
    el_switch: SIGNED_SWITCH,
    mode: CounterMode.SECONDS,
    target: 2147483647000,
}, {
    el_counter: UNSIGNED_COUNTER,
    el_mode: UNSIGNED_MODE,
    el_switch: UNSIGNED_SWITCH,
    mode: CounterMode.SECONDS,
    target: 4294967295000,
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
    const [int, frac] = numSecs.split('.', 2);

    /** @type {HTMLElement[]} */
    const elements = [];

    for (let exponent = Math.max(int.length, MIN_DIGITS) - 1; exponent >= 0; exponent--)
    {
        const span = document.createElement("span");
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

    const dot = document.createElement("span");
    if (seconds % 1 > 0.5 !== invertGrey)
    {
        dot.classList.add(CLASS_NAMES.COUNTER_GREYED);
    }
    dot.textContent = ".";
    elements.push(dot);

    const fracEl = document.createElement("small");
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
    const remaining = counter.target - now;

    switch (counter.mode)
    {
        case CounterMode.MIXED:
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

    requestAnimationFrame(tick);
}

/**
 * @param {CounterWrapper} counter
 * @returns {function(): void}
 */
const switchCounterModeCb = (counter) =>
{
    return () =>
    {
        switch (counter.mode)
        {
            case CounterMode.SECONDS:
                counter.mode = CounterMode.MIXED;
                counter.el_mode.textContent = "mixed mode";
                break;
            default:
                counter.mode = CounterMode.SECONDS;
                counter.el_mode.textContent = "seconds";
        }
    }
}

for (const counter of COUNTERS)
{
    counter.el_switch.onclick = switchCounterModeCb(counter);
}

requestAnimationFrame(tick);