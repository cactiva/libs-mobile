import { useNavigation } from "@react-navigation/native";
import set from "lodash.set";
import get from "lodash.get";
import React, { useEffect } from "react";
import {
  Platform,
  StyleSheet,
  TextStyle,
  ViewProps,
  ViewStyle,
  BackHandler,
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
  const { goBack, canGoBack } = useNavigation();
  const shadowStyle = enableShadow !== false ? Theme.UIShadow : {};
  const baseStyle: ViewStyle = {
    paddingTop: statusBarHeight,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56 + statusBarHeight,
    backgroundColor: Theme.UIColors.primary,
    zIndex: 9,
    margin: 0,
    padding: 8,
    flexShrink: 1,
  };
  console.log(baseStyle);
  const cstyle = StyleSheet.flatten([baseStyle, shadowStyle, style]);
  const backButtonStyle: ViewStyle = {
    minHeight: 30,
    minWidth: 30,
    height: 30,
    width: 30,
    padding: 0,
    backgroundColor: undefined,
    paddingLeft: 4,
    paddingRight: 4,
    marginRight: 12,
    ...get(customProps, "backButton.style", {}),
    ...get(styles, "backButton", {}),
  };
  const titleStyle: TextStyle = {
    lineHeight: 30,
    fontSize: 18,
    color: "white",
    overflow: "hidden",
    flexGrow: 1,
    paddingHorizontal: 10,
    ...get(customProps, "title.style", {}),
    ...get(styles, "title", {}),
  };
  const onPressBack = !!actionBackButton
    ? actionBackButton
    : () => {
        if (!!canGoBack()) {
          goBack();
        } else {
          BackHandler.exitApp();
        }
      };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onPressBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  return (
    <>
      <View {...props} style={cstyle}>
        {leftAction}
        {backButton && (
          <Button
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
