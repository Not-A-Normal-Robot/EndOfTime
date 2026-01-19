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
 * Converts a seconds amount to a displayed HTML.
 * @param {number} seconds
 * @returns {string} HTML
 * @private @const @constant
 */
const displaySeconds = (seconds) =>
{
    const numSecs = seconds.toFixed(3);
    const [int, frac] = numSecs.split('.', 2);

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
        case CounterMode.MIXED: {
            // TODO
        }
        default: {

        }
    }
}

/** @private @const @constant */
const tick = () =>
{
    let utcNow = Date.now();

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
            case CounterMode.SECONDS: {
                counter.mode = CounterMode.MIXED;
                counter.el_mode.textContent = "mixed mode";
            }
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