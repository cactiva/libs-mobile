import Constants from "expo-constants";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import { Platform } from "react-native";

export const getLocation = () => {
  if (Platform.OS === "android" && !Constants.isDevice) {
    alert(
      "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
    );
    return null;
  }
  return Permissions.askAsync(Permissions.LOCATION).then((res) => {
    if (res.status == "granted") {
      return Location.getCurrentPositionAsync({}).then((location) => {
        return location.coords;
      });
    } else {
      alert("Permission to access location was denied");
      return null;
    }
  });
};
