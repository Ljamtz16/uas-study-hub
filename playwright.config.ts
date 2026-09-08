import { defineConfig,devices } from "@playwright/test";
export default defineConfig({testDir:"./tests/e2e",fullyParallel:false,use:{baseURL:"http://127.0.0.1:3103",trace:"on-first-retry"},webServer:{command:"node node_modules/next/dist/bin/next start -p 3103",url:"http://127.0.0.1:3103",reuseExistingServer:false},projects:[{name:"chromium",use:{...devices["Desktop Chrome"]}}]});
