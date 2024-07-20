/**
 * @fileoverview For a given page, compares the set of URLs fetched
 * by dynamic crawler and static crawler
 */

const fs = require("fs");
const program = require("commander");
const netParser = require("../lib/network.js");
const URL = require("url");

program
    .option(
        "-d, --dynamic <dynamic>",
        "dir containing dynamic network.json files"
    )
    .option("-s, --static <static>", " file containing list of pages")
    .option("-r, --reverse", "reverse comparison of static and dynamic")
    .parse(process.argv);

const DYNDOMAINS = [
    "fundingchoicesmessages.google.com",
    "tr.hit.gemius.pl",
    "gemhu.adocean.pl",
];

var getNet = function(path) {
    var data = fs.readFileSync(path, "utf-8");
    var net = netParser.parseNetworkLogs(JSON.parse(data));
    net = net.filter(filternet);
    return net;
};

var filternet = function(n) {
    return (
        n.request &&
        n.request.method == "GET" &&
        n.url.indexOf("data") != 0 &&
        !DYNDOMAINS.some((d) => n.url.includes(d)) &&
        n.type &&
        n.size &&
        n.size > 100 &&
        n.response.status == 200
    );
};

var parseStaticNet = function(path) {
    var fetches = fs
        .readFileSync(path, "utf-8")
        .split("\n")
        .filter((f) => f.length > 0);
    var net = [];
    for (var f of fetches) {
        var [surl, st, sz] = f.split(" ");
        net.push([surl, st, sz]);
    }
    return net;
};

var comparePages = function() {
    console.log(program.dynamic, program.static);
    var dynamicNet = getNet(program.dynamic);
    dynamicNet = dynamicNet.filter(filternet);
    var staticNet = parseStaticNet(program.static);

    for (var d of dynamicNet) {
        var pu = URL.parse(d.url);
        var durl = pu.host + pu.pathname;
        for (var s of staticNet) {
            var found = false;
            var [surl, st, sz] = s;
            if (surl.includes(durl)) {
                console.log(`match: ${durl} ${d.size} ${surl} ${sz}`);
                found = true;
                break;
            }
        }
        if (!found) {
            console.log(`no match: ${durl}`);
        }
    }
    if (program.reverse) {
        console.log("-------reverse-------");
        for (var s of staticNet) {
            var [surl, st, sz] = s;
            var found = false;
            for (var d of dynamicNet) {
                var pu = URL.parse(d.url);
                var durl = pu.host + pu.pathname;
                if (surl.includes(durl)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                console.log(`no match: ${surl}`);
            }
        }
    }
};

comparePages();
