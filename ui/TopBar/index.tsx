import { useNavigation } from "@react-navigation/native";
import _ from "lodash";
import React, { useEffect } from "react";
import {
  Platform,
  StyleSheet,
  TextStyle,
  ViewProps,
  ViewStyle,
  BackHandler,
} from "react-native";
import Theme from "../../theme";
import Button, { IButtonProps } from "../Button";
import Icon, { IIconProps } from "../Icon";
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
  const { goBack } = useNavigation();
  const shadowStyle = enableShadow !== false ? Theme.UIShadow : {};
  const baseStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    minHeight: 56,
    backgroundColor: Theme.UIColors.primary,
    zIndex: 9,
    margin: 0,
    padding: 8,
    flexShrink: 1,
  };
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
    ..._.get(customProps, "backButton.style", {}),
    ..._.get(styles, "backButton", {}),
  };
  const titleStyle: TextStyle = {
    lineHeight: 30,
    fontSize: 18,
    color: "white",
    overflow: "hidden",
    flexGrow: 1,
    paddingHorizontal: 10,
    ..._.get(customProps, "title.style", {}),
    ..._.get(styles, "title", {}),
  };
  const onPressBack = !!actionBackButton
    ? actionBackButton
    : () => {
        goBack();
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
    <View {...props} style={cstyle}>
      {leftAction}
      {backButton && (
        <Button
          {..._.get(customProps, "backButton", {})}
          style={backButtonStyle}
          onPress={onPressBack}
        >
          <Icon
            name={`${Platform.OS === "ios" ? "ios" : "md"}-arrow-back`}
            size={24}
            style={{
              margin: 0,
              ..._.get(styles, "iconBackButton", {}),
            }}
            color={"white"}
            {..._.get(customProps, "iconBackButton", {})}
          />
        </Button>
      )}
      {typeof children === "string" ? (
        <Text
          ellipsizeMode={"tail"}
          numberOfLines={1}
          {..._.get(customProps, "title", {})}
          style={titleStyle}
        >
          {children}
        </Text>
      ) : (
        children
      )}
      {rightAction}
    </View>
  );
};
