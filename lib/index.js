import {generateUserBlobs} from "./generate.js";

async function main() {
    const count = await generateUserBlobs();
    console.log("Files created:", count);
}

await main();
