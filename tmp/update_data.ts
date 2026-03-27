import { db } from "../server/storage";
import { projects } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
  await db.update(projects).set({ 
    annualSavings: 45000, 
    roiProjectedYears: 4, 
    totalLifetimeSavings: 1125000 
  }).where(eq(projects.id, 1));
  console.log("Updated project 1");
}
main();
