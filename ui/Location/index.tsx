import { DefaultTheme, ThemeProps } from "@src/libs/theme";
import Constants from "expo-constants";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import Icon from "../Icon";
import Spinner from "../Spinner";

export interface LocationProps {
  value?: any;
  onCapture?: (value: { latitude: number; longitude: number }) => void;
  theme?: ThemeProps;
  style?: any;
}

export default observer((props: LocationProps) => {
  const { style, onCapture, value } = props;
  const meta = useObservable({
    location: value || null,
    error: false,
    loading: false
  });
  const theme = {
    ...DefaultTheme,
    ...props.theme
  };
  const getLocationAsync = () => {
    meta.loading = true;
    Location.getCurrentPositionAsync({}).then(location => {
      meta.location = {
        longitude: location.coords.longitude,
        latitude: location.coords.latitude
      };
      onCapture && onCapture(meta.location);
      meta.loading = false;
    });
  };

  useEffect(() => {
    if (Platform.OS === "android" && !Constants.isDevice) {
      alert(
        "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      );
      meta.error = true;
    }
    Permissions.askAsync(Permissions.LOCATION).then(res => {
      if (res.status !== "granted") {
        alert("Permission to access location was denied");
        meta.loading = false;
        meta.error = true;
      }
    });
    meta.location = value;
  }, []);
  return (
    <View
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 27,
        ...style
      }}
    >
      {meta.location ? (
        <Text
          style={{
            color: theme.dark
          }}
        >
          {meta.location.latitude}, {meta.location.longitude}
        </Text>
      ) : (
        <Text
          style={{
            color: theme.medium
          }}
        >
          latitude, longitude
        </Text>
      )}
      <TouchableOpacity
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 10
        }}
        onPress={getLocationAsync}
        disabled={meta.error || meta.loading}
      >
        {meta.loading ? (
          <Spinner size="small" color={theme.dark} />
        ) : (
          <Icon source="Ionicons" name="ios-pin" size={24} color={theme.dark} />
        )}
      </TouchableOpacity>
    </View>
  );
});

export const getLocation = () => {
  if (Platform.OS === "android" && !Constants.isDevice) {
    alert(
      "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
    );
    return null;
  }
  return Permissions.askAsync(Permissions.LOCATION).then(res => {
    if (res.status == "granted") {
      return Location.getCurrentPositionAsync({}).then(location => {
        return {
          longitude: location.coords.longitude,
          latitude: location.coords.latitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0922
        };
      });
    } else {
      alert("Permission to access location was denied");
      return null;
    }
  });
};
