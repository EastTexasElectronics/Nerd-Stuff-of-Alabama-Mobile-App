module.exports = {
  preset: "react-native",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@expo|expo-font|expo-constants|expo-secure-store|expo-linear-gradient|expo-asset|@unimodules|unimodules-permissions-interface|unimodules-sensors-interface|unimodules-task-manager-interface|unimodules-file-system-interface|unimodules-barcode-scanner-interface|expo-font|expo-camera|react-native-reanimated)/)",
  ],
  setupFiles: ["./jestSetup.js"],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
};
