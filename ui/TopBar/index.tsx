import { useIsFocused, useNavigation } from "@react-navigation/native";
import get from "lodash.get";
import { runInAction } from "mobx";
import { useLocalObservable } from "mobx-react";
import React, { useEffect } from "react";
import {
  BackHandler,
  Platform,
  StyleSheet,
  TextStyle,
  ViewProps,
  ViewStyle,
} from "react-native";
import Theme from "../../config/theme";
import Button, { IButtonProps } from "../Button";
import Icon, { IIconProps } from "../Icon";
import { statusBarHeight } from "../Screen";
import Text, { ITextProps } from "../Text";
import View from "../View";

export interface ITopBarProps extends ViewProps {
  backButton?: boolean;
  actionBackButton?: () => void;
  loadingIndicator?: boolean;
  loadingType?: string;
  enableShadow?: boolean;
  children?: any;
  leftAction?: any;
  rightAction?: any;
  styles?: {
    backButton?: ViewStyle;
    iconBackButton?: ViewStyle;
    title?: TextStyle;
  };
  customProps?: {
    backButton?: Partial<IButtonProps>;
    iconBackButton?: Partial<IIconProps>;
    title?: Partial<ITextProps>;
  };
}

export default (props: ITopBarProps) => {
  const {
    style,
    enableShadow,
    backButton,
    actionBackButton,
    children,
    leftAction,
    rightAction,
    customProps,
    styles,
  } = props;
  const meta = useLocalObservable(() => ({
    exit: false,
  }));
  const { goBack, canGoBack } = useNavigation();
  const isFocused = useIsFocused();
  const shadowStyle = enableShadow !== false ? Theme.UIShadow : {};
  const baseStyle: ViewStyle = {
    paddingTop: 8 + statusBarHeight,
    flexDirection: "row",
    alignItems: "center",
    height: 56 + statusBarHeight,
    backgroundColor: Theme.UIColors.primary,
    zIndex: 9,
    margin: 0,
    paddingBottom: 8,
    paddingHorizontal: 15,
  };
  const cstyle = StyleSheet.flatten([baseStyle, shadowStyle, style]);
  const backButtonStyle: ViewStyle = {
    minHeight: 40,
    minWidth: 35,
    padding: 0,
    margin: 0,
    paddingHorizontal: 4,
    justifyContent: "flex-start",
    ...get(customProps, "backButton.style", {}),
    ...get(styles, "backButton", {}),
  };
  const titleStyle: TextStyle = {
    lineHeight: 30,
    fontSize: 18,
    color: "white",
    overflow: "hidden",
    flexGrow: 1,
    ...get(customProps, "title.style", {}),
    ...get(styles, "title", {}),
  };
  const onPressBack = !!actionBackButton
    ? actionBackButton
    : () => {
        if (!!canGoBack()) {
          goBack();
          if (!!meta.exit) runInAction(() => (meta.exit = false));
        } else {
          if (!!meta.exit) {
            BackHandler.exitApp();
          } else {
            runInAction(() => (meta.exit = true));
          }
        }
      };

  useEffect(() => {
    let backHandler: any;
    if (!!isFocused) {
      backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        onPressBack();
        return true;
      });
    }

    return () => !!backHandler && backHandler.remove();
  }, [isFocused]);

  return (
    <>
      <View {...props} style={cstyle}>
        {leftAction}
        {backButton && (
          <Button
            mode="clean"
            {...get(customProps, "backButton", {})}
            style={backButtonStyle}
            onPress={onPressBack}
          >
            <Icon
              name={`${Platform.OS === "ios" ? "ios" : "md"}-arrow-back`}
              size={24}
              style={{
                margin: 0,
                ...get(styles, "iconBackButton", {}),
              }}
              color={"white"}
              {...get(customProps, "iconBackButton", {})}
            />
          </Button>
        )}
        {typeof children === "string" ? (
          <Text
            ellipsizeMode={"tail"}
            numberOfLines={1}
            {...get(customProps, "title", {})}
            style={titleStyle}
          >
            {children}
          </Text>
        ) : (
          children
        )}
        {rightAction}
      </View>
    </>
  );
};
