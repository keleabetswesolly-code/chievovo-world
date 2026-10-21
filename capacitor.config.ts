import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.chievovo.world",
  appName: "CHIEVOVO WORLD",
  webDir: "dist",
  android: {
    allowMixedContent: true,
    backgroundColor: "#0A0A0A",
  },
};

export default config;