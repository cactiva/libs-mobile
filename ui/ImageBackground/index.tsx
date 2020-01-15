import { observer } from "mobx-react-lite";
import React from "react";
import { ImageBackground, ImageBackgroundProps } from "react-native";

export default observer((props: ImageBackgroundProps) => {
  return <ImageBackground {...props} />;
});
