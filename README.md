# End of (32-bit) Time
A countdown to the end of 32-bit signed Unix time (2038-01-19 03:14:08 UTC), among others

Link to website: https://not-a-normal-robot.github.io/EndOfTime/

## Optimization
This project is aggressively optimized beyond reason. It was very much inspired by [this article about how one's website should ideally be below 14 kilobytes](<https://endtimes.dev/why-your-website-should-be-under-14kb-in-size/>).

> [!NOTE]
> All statistics here are based on commit `608d3ed6dcae5afdfb2218986cc8f3fad5996e4b`, and unless specified otherwise, all testing is based on Waterfox 6.6.9 for Linux x86_64.

### Size Optimization
These are the optimization strategies used to make the resultant web app tiny.

Visiting the deployed website in a somewhat modern version of Firefox results in **a single HTTP/2 request** with a transferred size of **3.52 kB**. This is equivalent to just shy of **3 TCP/IP packets**, assuming a max TCP packet size of 1400 bytes—well within the 10 TCP packets of the TCP slow-start algorithm.

> [!NOTE]
> By contrast, plainly adding the size of the source code (`main.js`, `index.html`, `favicon.source.svg`) results in **19.86 kB**. This equates to a reduction of roughly **16.34 kB (≈82.3%)**.

A lot of this optimization work is done in the [custom build script used for this project](<./scripts/build.js>) along with the libraries used there.

![Network Firefox devtools screenshot](<./doc-img/network-tab.png>)

#### Manually-Written SVG Favicon
This project uses a manually-written, manually-minified SVG favicon. This is [compatible with most browsers in 2025](<https://caniuse.com/?search=svg+favicon>), but there's also a rasterized version of the dark mode and light mode favicons as a fallback, whose filenames are minified to just `d.png` and `l.png` each.

#### Inlining
This project inlines almost EVERYTHING into one `index.html` file:
- The manually-written, manually-minified SVG favicon is inlined; without base64 (since base64 incurs some overhead)
- The CSS styles are inlined as `<style>` tags even before the build script is run.
- The `main.js` file is inlined directly into the resultant `index.html`

Not only does this **save some bandwidth in the form of HTTP headers**, but this also **reduces the amount of networking roundtrips** the browser needs to make with the server to complete loading the app.

> [!NOTE]
> External factors such as DNS and TLS complicate RTT counts, so there's not quite a single RTT I'm able to pin—this depends a lot on what YOU do! The general idea of fewer requests meaning lower RTT remains true, though.

#### CSS and Noncompliant HTML Minification
The build script uses the `minify-html` library to minify the resulting HTML and CSS. Some "standards-noncompliant" flags are enabled in order to minify even harder while preserving correctness in most browsers.

#### Aggressive Closure Compiler
This project uses [Google Closure Compiler](<https://developers.google.com/closure/compiler>) to preprocess the `main.js` file before it ever gets inlined into the final `index.html`. This allows for much more aggressive size optimization that properly utilizes types, unlike some less advanced preprocessors such as `terser`.

#### Hand-Optimized JSDoc
The source JSDoc (`main.js`) is specifically crafted to result in the smallest resultant Closure Compiler outputs, while attempting to still be decently readable. There are a lot of constants that resolve to single-character strings, for instance.

#### Minified Class Names and IDs
Even the class names and IDs in HTML aren't exempt from minification.

This may seem like a micro-optimization at its surface, but Closure Compiler is smart enough to use this to its advantage, by using something like `"abcde".split("").map(...)` instead of `["ab", "cd", "ef"].map(...)` when you want to perform an operation on multiple IDs. I haven't measured its impact, but this likely accounts for at least 100 bytes in savings compared to full english word IDs.

#### Network-Level Compression
The deployed site uses GitHub Pages, which defaults to gzip compression. This brings the transferred size down from around 7 kB down to only 3.52 kB.

> [!NOTE]
> During my tests I have not observed GitHub Pages serving Brotli-compressed files, even though this would be more optimal in terms of transmitted size. Perchance they haven't implemented it.

### Performance Optimization
Although most of the focus is on improving site load times, some thought is also given to optimizing the runtime performance of the app.

Commits `82065f01ce8d6d296aba3031f85354c9d10c5a26` and `608d3ed6dcae5afdfb2218986cc8f3fad5996e4b` focus on this by reducing layout recalculations.

Using the **20× slowdown** mode in Ungoogled Chromium 146.0.7680.80, I was able to see a measurable performance improvement from **~40 ms per frame** down to **~30 ms** on average.

| Before | After |
|---|---|
| ![Chromium DevTools screenshot before optimization](<./doc-img/pre-runtime-opt.png>) | ![Chromium DevTools screenshot after optimization](<./doc-img/post-runtime-opt.png>) |
| ~40 ms per frame at 20× slowdown | **~30 ms per frame** at 20× slowdown |
| ~25 FPS at 20× slowdown | **~33 FPS** at 20× slowdown |
| Baseline | **+~33% speedup** |