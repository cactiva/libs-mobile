import Theme from "../../theme";
import React from "react";
import { StyleSheet, ViewStyle, Animated, StyleProp } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Button from "../Button";
import Icon, { IIconProps } from "../Icon";
import Text from "../Text";
import View from "../View";

export interface IMenuProps {
  label?: string;
  path: string;
  icon?: IIconProps;
  [key: string]: any;
  role?: string[];
}

export interface ITabBarProps {
  tabProps?: any;
  menu: IMenuProps[];
  template?: (props: IMenuProps) => JSX.Element;
  shadow?: boolean;
  style?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
}

export default (props: ITabBarProps) => {
  const { menu, template, shadow, style } = props;
  const shadowStyle = !!shadow ? Theme.UIShadow : {};
  const baseStyle = {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  };
  const cstyle = StyleSheet.flatten([baseStyle, shadowStyle, style]);
  return (
    <View type={"SafeAreaView"}>
      <Animated.View {...props} style={cstyle}>
        {menu.map((item, index) => {
          const Template = template;
          if (Template)
            return <Template key={item.path} index={index} {...item} />;
          return <DefaultTemplate key={item.path} index={index} {...item} />;
        })}
      </Animated.View>
    </View>
  );
};

const DefaultTemplate = (props: IMenuProps) => {
  const { label, path, icon } = props;
  const { navigate } = useNavigation();
  const baseStyle: ViewStyle = {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    borderRadius: 0,
    margin: 0,
    backgroundColor: "transparent",
  };
  return (
    <Button
      mode="clean"
      style={baseStyle}
      onPress={() => {
        navigate(path);
      }}
    >
      {icon && <Icon {...icon} />}
      <Text
        style={{
          color: Theme.UIColors.primary,
        }}
      >
        {label}
      </Text>
    </Button>
  );
};
