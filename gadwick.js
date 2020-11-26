#!/usr/bin/env node
const metaData = require("./package.json");
const update = require("./update");

const method = process.argv[2];

const supportedMethods = [ "update", "configure", "version" ];
const methodList = supportedMethods.map((m) => `gadwick ${m}`).join("\n");

if (!method)
{
    console.log(`${metaData.name} v${metaData.version}`);
    console.log(metaData.description);
    console.log(`Try running one of the following commands:\n${methodList}`)
    return;
}

if (!supportedMethods.includes(method))
{
    console.log(`"${method}" is not a supported Gadwick command. Try:\n${methodList}`);
    return;
}

if (method === "version")
{
    console.log(metaData.version);
    return;
}

if (method === "update")
{
    update();
}