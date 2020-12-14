import * as Location from "expo-location";
import { Platform } from "react-native";
import { Constants, Permissions } from "react-native-unimodules";

export interface ILocation {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

const getCurrentLocation = (): Promise<ILocation | null> => {
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
