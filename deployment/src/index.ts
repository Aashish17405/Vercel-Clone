import { createClient } from "redis";
import { copyFinalDist, downloadS3Folder } from "./aws";
import { buildProject } from "./utils";
const subscriber = createClient();
subscriber.connect();

const publisher = createClient();
publisher.connect();

async function main() {
  while (1) {
    const res = await subscriber.brPop("build-queue", 0);
    // console.log(response);
    // @ts-ignore
    const id = res.element;
    await downloadS3Folder(`output\\${id}`);
    // console.log("Downloaded", id);
    await buildProject(id);

    await copyFinalDist(id);

    publisher.hSet("status", id, "deployed");
  }
}

main();