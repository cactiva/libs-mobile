import codePush, { SyncOptions } from "react-native-code-push";
import customSyncOptions from "@src/config/code-push";

export default {
  checkFrequency: codePush.CheckFrequency.MANUAL,
  installMode: codePush.InstallMode.IMMEDIATE,
  ...(customSyncOptions || {}),
} as SyncOptions;
