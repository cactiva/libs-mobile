import { observer } from "mobx-react";
import React, { ReactNode, useRef } from "react";
import MapViewNative, {
  MapViewProps as MapViewPropsOrigin,
  Marker as MarkerOrigin,
  MarkerProps as MarkerPropsOrigin,
} from "react-native-maps";

interface IMapView extends MapViewPropsOrigin {
  children?: ReactNode;
}

export default observer((props: IMapView) => {
  const mapProps = { ...props };
  const mapRef: any = useRef(null);

  return (
    <MapViewNative
      ref={mapRef}
      style={{
        width: 200,
        height: 200,
      }}
      {...mapProps}
    />
  );
});

export const Marker = (props: MarkerPropsOrigin) => {
  return <MarkerOrigin {...props} />;
};
