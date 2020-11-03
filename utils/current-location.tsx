import * as Location from "expo-location";
import { Platform } from "react-native";
import { Constants, Permissions } from "react-native-unimodules";

const getCurrentLocation = () => {
  return new Promise((resolve) => {
    if (Platform.OS === "android" && !Constants.isDevice) {
      alert(
        "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      );
      resolve(null);
    }
    Permissions.askAsync(Permissions.LOCATION).then((res) => {
      if (res.status == "granted") {
        Location.getCurrentPositionAsync({
          accuracy: 4,
        }).then((location) => {
          resolve(location.coords);
        });
      } else {
        alert("Permission to access location was denied");
        resolve(null);
      }
    });
  });
};

export default getCurrentLocation;
