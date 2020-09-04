import * as Location from "expo-location";
import { Platform } from "react-native";
import { Constants, Permissions } from "react-native-unimodules";

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
