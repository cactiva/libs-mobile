import service from "@src/service";
import * as Font from "expo-font";
import React, { ReactElement, ReactNode, useState } from "react";
import { sourceFonts } from "../../config/fonts";
import permissions from "../../config/permissions";
import useAsyncEffect from "../../utils/use-async-effect";
import View from "../View";
import Loading from "./Loading";

interface IAppProvider {
  children: ReactNode;
  service?: () => void;
  loadingComponent?: ReactElement;
}

export default (props: IAppProvider) => {
  const [loading, setLoading] = useState(true);

  useAsyncEffect(async () => {
    await permissions();
    await Font.loadAsync(sourceFonts).catch((e) => console.log(e));
    if (!!service) await service();
    setLoading(false);
  }, []);

  if (!!loading && !!props.loadingComponent) {
    return props.loadingComponent;
  } else if (!!loading) {
    return <Loading />;
  }

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {props.children}
    </View>
  );
};
