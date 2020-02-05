import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";
import Icon from "../Icon";
import { DefaultTheme, ThemeProps } from "../../themes";
import { scale, uuid } from "../../utils";
import { IconProps } from "../Icon";

export interface UIBottomNavProps {
  menus: {
    label: string;
    sublabel?: string;
    icon: IconProps | any;
    path: string;
    role?: string[];
  }[];
  renderMenu?: (item, meta) => any;
  activePath?: string;
  theme?: ThemeProps;
  style?: any;
}

export default observer((props: UIBottomNavProps) => {
  const { menus, activePath, style, renderMenu } = props;
  const theme = {
    ...DefaultTheme,
    ...props.theme
  };
  const meta = useObservable({
    activePath: activePath || ""
  });

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "flex-start",
        backgroundColor: "#fff",
        padding: 5,
        borderStyle: "solid",
        borderColor: "#FCFDFD",
        ...style
      }}
    >
      {menus.map(item => {
        return (
          <Menu
            key={uuid(item.path)}
            meta={meta}
            item={item}
            CustomComponent={renderMenu}
            theme={theme}
          />
        );
      })}
    </View>
  );
});

const Menu = observer((props: any) => {
  const { meta, item, theme, CustomComponent } = props;
  const nav = useNavigation();
  const onPress = () => {
    meta.activePath = item.path;
    nav.navigate(item.path);
  };
  const active = meta.activePath === item.path;
  if (!!CustomComponent) {
    return <CustomComponent {...item} meta={meta} />;
  }
  return (
    <TouchableOpacity
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: active ? "flex-start" : "center",
        alignItems: "center",
        paddingLeft: 5,
        paddingRight: 5,
        minHeight: 45,
        flexGrow: 1,
        ...(!active
          ? {
              maxWidth: scale(50)
            }
          : {})
      }}
      onPress={onPress}
    >
      <Icon
        size={scale(24)}
        color={theme.primary}
        style={{
          marginLeft: 5,
          marginRight: active ? 15 : 5
        }}
        {...item.icon}
      />
      {active && (
        <View
          style={{
            display: "flex",
            flexDirection: "column"
          }}
        >
          {item.sublabel && (
            <Text
              style={{
                color: theme.medium,
                fontSize: 11
              }}
            >
              {item.sublabel}
            </Text>
          )}
          <Text
            style={{
              color: theme.dark,
              fontSize: 14,
              fontWeight: "600"
            }}
          >
            {item.label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});
