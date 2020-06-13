import React from "react";
import View from "../View";
import {
  ViewProps,
  StyleSheet,
  ViewStyle,
  Platform,
  TextStyle,
} from "react-native";
import Text from "../Text";
import Button from "../Button";
import Icon from "../Icon";
import Theme from "../../theme";
import { useNavigation } from "react-navigation-hooks";

export interface ITopBarProps extends ViewProps {
  backButton?: boolean;
  actionBackButton?: () => void;
  loadingIndicator?: boolean;
  loadingType?: string;
  enableShadow?: boolean;
  children?: any;
  leftAction?: any;
  rightAction?: any;
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
  } = props;
  const { goBack } = useNavigation();
  const shadowStyle = enableShadow !== false ? Theme.UIShadow : {};
  const baseStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    // height: 80,
    // minHeight: 80,
    backgroundColor: Theme.UIColors.primary,
    zIndex: 9,
    margin: 0,
    // padding: 8,
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
  };
  const titleStyle: TextStyle = {
    lineHeight: 30,
    fontSize: 18,
    color: "white",
    overflow: "hidden",
    flexGrow: 1,
  };
  const onPressBack = actionBackButton
    ? actionBackButton
    : () => {
        goBack();
      };

  return (
    <View {...props} style={cstyle}>
      {leftAction}
      {backButton && (
        <Button style={backButtonStyle} onPress={onPressBack}>
          <Icon
            name={`${Platform.OS === "ios" ? "ios" : "md"}-arrow-back`}
            size={24}
            style={{
              margin: 0,
            }}
            color={"white"}
          />
        </Button>
      )}
      {typeof children === "string" ? (
        <Text style={titleStyle} ellipsizeMode={"tail"} numberOfLines={1}>
          {children}
        </Text>
      ) : (
        children
      )}
      {rightAction}
    </View>
  );
};
