import { db } from "../server/storage";
import { projects } from "../shared/schema";

async function main() {
  const p = await db.select().from(projects).all();
  console.log(JSON.stringify(p, null, 2));
}
main();
