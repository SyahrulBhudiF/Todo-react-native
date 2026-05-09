import "dotenv/config";
import type { ExpoConfig } from "expo/config";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function requireNumberEnv(name: string) {
  const value = Number(requireEnv(name));

  if (!Number.isFinite(value)) {
    throw new Error(`Invalid number environment variable: ${name}`);
  }

  return value;
}

export default (): ExpoConfig => ({
  name: "testing-project",
  slug: "testing-project",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "testingproject",
  userInterfaceStyle: "light",
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
    package: "com.ryuko4w.testingproject",
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-sqlite",
    "@react-native-community/datetimepicker",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "bcf2f570-549f-4db6-add5-3b4c3bdd9027",
    },
    databaseName: requireEnv("EXPO_PUBLIC_DATABASE_NAME"),
    databaseVersion: requireNumberEnv("EXPO_PUBLIC_DATABASE_VERSION"),
    defaultUsername: requireEnv("EXPO_PUBLIC_DEFAULT_USERNAME"),
    defaultPassword: requireEnv("EXPO_PUBLIC_DEFAULT_PASSWORD"),
    sessionKey: requireEnv("EXPO_PUBLIC_SESSION_KEY"),
    sessionTtlDays: requireNumberEnv("EXPO_PUBLIC_SESSION_TTL_DAYS"),
  },
  owner: "ryuko4w",
});
