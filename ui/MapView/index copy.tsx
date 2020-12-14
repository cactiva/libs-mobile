import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import { ViewStyle } from "react-native";
import MapViewNative, {
  MapViewProps as MapViewPropsOrigin,
  Marker as MarkerOrigin,
  MarkerProps as MarkerPropsOrigin,
} from "react-native-maps";
import View from "../View";

export interface MarkerProps extends MarkerPropsOrigin {
  children?: any;
}

export interface MapViewProps extends MapViewPropsOrigin {
  style?: ViewStyle;
  location?: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  };
  zoom?: number;
  markers?: MarkerProps[];
  markerIds?: string[];
  children?: any;
  fitToSuppliedMarkers?: boolean;
  fitToSuppliedMarkersOption?: {
    edgePadding?: {
      top: Number;
      right: Number;
      bottom: Number;
      left: Number;
    };
    animated?: boolean;
  };
  onMapViewReady?: (status: boolean) => void;
}
export default observer((props: MapViewProps) => {
  const {
    style,
    location,
    fitToSuppliedMarkers,
    fitToSuppliedMarkersOption,
    markerIds,
    onMapViewReady,
  } = props;
  const mapProps = { ...props };
  const children = mapProps.children;
  delete mapProps.markers;
  delete mapProps.location;
  delete mapProps.children;
  const defaultDelta = {
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };
  const [mapReady, setMapReady] = useState(false);
  const mapRef: any = useRef(null);

  let region = {
    latitude: -0.7056041715972583,
    longitude: 118.81669320395446,
    latitudeDelta: 61.50892138363919,
    longitudeDelta: 44.72305383294736,
  };

  if (!!location) {
    let newregion: any = location;
    if (!newregion.latitudeDelta || !newregion.longitudeDelta) {
      newregion = {
        ...newregion,
        ...defaultDelta,
      };
    }
    if (!!newregion.latitude && typeof newregion.latitude !== "number")
      newregion.latitude = parseInt(newregion.latitude);
    if (!!newregion.longitude && typeof newregion.longitude !== "number")
      newregion.longitude = parseInt(newregion.longitude);
    region = newregion;
  }

  useEffect(() => {
    setTimeout(() => {
      if (
        fitToSuppliedMarkers !== false &&
        !!mapRef &&
        !!mapRef.current &&
        !!mapReady &&
        Array.isArray(markerIds) &&
        markerIds.length > 0
      ) {
        mapRef.current.fitToSuppliedMarkers(
          markerIds,
          fitToSuppliedMarkersOption
        );
      }
    }, 0);
    onMapViewReady && onMapViewReady(mapReady);
  }, [mapReady, markerIds]);

  return (
    <View
      style={style}
      onLayout={() => {
        setMapReady(true);
      }}
    >
      <MapViewNative
        ref={mapRef}
        style={{
          flexGrow: 1,
          minWidth: 200,
          minHeight: 200,
        }}
        region={region}
        {...mapProps}
      ></MapViewNative>
      {children}
    </View>
  );
});

export const Marker = (props: MarkerProps) => {
  return <MarkerOrigin {...props} />;
};

export function getRegionForCoordinate(point: any) {
  // points should be an array of { latitude: X, longitude: Y }
  let minX, maxX, minY, maxY;

  // init first point
  minX = point.latitude;
  maxX = point.latitude;
  minY = point.longitude;
  maxY = point.longitude;

  // calculate rect
  minX = Math.min(minX, point.latitude);
  maxX = Math.max(maxX, point.latitude);
  minY = Math.min(minY, point.longitude);
  maxY = Math.max(maxY, point.longitude);

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const deltaX = maxX - minX + 0.02;
  const deltaY = maxY - minY + 0.02;

  return {
    latitude: midX,
    longitude: midY,
    latitudeDelta: deltaX,
    longitudeDelta: deltaY,
  };
}
