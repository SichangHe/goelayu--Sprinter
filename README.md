# Sprinter: A dynamic + static web crawler

> [!NOTE]\
> This research project is under-documented, so I add my notes here.

## Top-level logic

Start at `./system/bash/hybrid-run.sh`.

1. Dynamic crawler `DYNRUN` = `./system/bash/run.sh`.
    - Analyzer server (`az`) `./system/go/wpr/src/analyzer/main.go`.
        gRPC server.
        - `./system/go/wpr/src/analyzer/genjs.go` **alters the JavaScript for
            tracking**.
    - Headless browser `CHROMESCRIPT` =
        `./system/node/chrome-distributed.js`. gRPC client.
1. Static crawler `src/static/crawler*`.

Below is the original README.

---

## Problem with current web crawlers

State-of-the-art web crawlers fall under two categories: static and dynamic.
A static crawler crawls a web page by statically parsing the code on
the page and extracting all links to embedded resources.
A static crawler is incapable of executing any code, i.e., execute JavaScript,
HTML or CSS.
A dynamic crawler on the other hand, leverages web browsers (such as Chrome,
Firefox) to crawl pages.
These browsers enable the crawler to execute code on any web page.

These two categories of crawlers fall on the opposite ends of
the performance-fidelity trade-off.
A static crawler is highly performant by fails to fetch all the resources,
specially the ones fetched by JavaScript execution
(resulting in poor fidelity),
whereas a dynamic crawler can accurately identify all resources on
any web page, achieving perfect fidelity,
however results in a very low crawling throughput.

## Our solution: Sprinter

To address this trade-off, we have designed Sprinter, a hybrid web crawler,
that combines the best of dynamic and static crawling.
The key to Sprinter's design is its ability to memoize computation results from
loads of pages performed using a browser,
which allows Sprinter to crawl majority of pages statically while
ensuring perfect fidelity.
Our results show that Sprinter performs 5x faster than browser-based crawling,
while ensuring perfect fidelity while crawling a corpus of 50k pages.
