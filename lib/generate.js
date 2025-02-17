import {open} from "node:fs/promises";
import {resolve} from "node:path";
import {subDays, subMonths, formatISO} from "date-fns";
import {uuid} from "./utils.js";

const STATUS = ["INACTIVE", "INCOMPLETE", "COMPLETE", "EXPIRED"];
const JURISDICTION = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

export function randomInt(max, min = 0) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function createUsers(count = 10) {
    const users = [];
    const now = new Date();

    while (count > 0) {
        const status = STATUS[randomInt(4)];
        const jurisdiction = JURISDICTION[randomInt(8)];

        // months
        const expiredWhen = status === "EXPIRED" ? randomInt(12, 6) : 0;

        let updatedAt;
        switch (status) {
            case "INACTIVE":
                // days
                updatedAt = randomInt(180, 90);
                break;
            case "INCOMPLETE":
                updatedAt = randomInt(30, 1);
                break;
            case "COMPLETE":
                updatedAt = randomInt(21, 7);
                break;
            default:
                updatedAt = expiredWhen * 30;
                break;
        }

        users.push({
            id: uuid(),
            jurisdiction,
            status,
            updatedAt: formatISO(subDays(now, updatedAt)),
            lastExpiredAt: expiredWhen > 0 ? formatISO(subMonths(now, expiredWhen)) : null,
        });

        count -= 1;
    }

    return users;
}

export async function generateUserBlobs(count = 10) {
    const users = createUsers(count);
    let successful = 0;

    for (const user of users) {
        let handle;
        try {
            handle = await open(resolve(import.meta.dirname, `../data/user-${user.id}.json`), "w");
            await handle.writeFile(JSON.stringify(user), {encoding: "utf8"});
            successful += 1;
        } catch (error) {
            console.error(error);
        } finally {
            handle?.close();
        }
    }

    return successful;
}
