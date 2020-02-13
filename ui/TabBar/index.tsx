import React from "react";
import View from "../View";
import Icon, { IIconProps } from "../Icon";
import Button from "../Button";
import { NavigationActions } from "react-navigation";
import Text from "../Text";
import Theme from "@src/libs/theme";
import { ViewStyle, StyleSheet } from "react-native";
import { useNavigation } from "react-navigation-hooks";

export interface IMenuProps {
  label?: string;
  path: string;
  icon?: IIconProps;
}

export interface ITabBarProps {
  tabProps?: any;
  menu: IMenuProps[];
  template?: (props: IMenuProps) => JSX.Element;
  shadow?: boolean;
  style?: ViewStyle;
}

export default (props: ITabBarProps) => {
  const { menu, template, shadow, style } = props;
  const shadowStyle = !!shadow ? Theme.UIShadow : {};
  const baseStyle = {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  };
  const cstyle = StyleSheet.flatten([baseStyle, shadowStyle, style]);
  return (
    <View style={cstyle}>
      {menu.map(item => {
        const Template = template;
        if (Template) return <Template key={item.path} {...item} />;
        return <DefaultTemplate key={item.path} {...item} />;
      })}
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
    backgroundColor: "transparent"
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
          color: Theme.UIColors.primary
        }}
      >
        {label}
      </Text>
    </Button>
  );
};
