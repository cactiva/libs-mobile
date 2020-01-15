import Theme from "@src/theme.json";
import { observer } from "mobx-react-lite";
import React from "react";
import {
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Platform
} from "react-native";
import { useNavigation } from "react-navigation-hooks";
import { DefaultTheme } from "../../theme";
import Icon from "../Icon";
import _ from "lodash";

export interface UIHeaderProps {
  backBtn?: boolean;
  onPressBackBtn?: () => void;
  safeAreaView?: boolean;
  title?: string | object;
  style?: any;
  styles?: {
    root?: any;
    title?: any;
  };
  children?: any;
  shadow?: Boolean;
}

export default observer((props: UIHeaderProps) => {
  const {
    backBtn,
    onPressBackBtn,
    title,
    children,
    style,
    styles,
    safeAreaView,
    shadow
  } = props;
  const statusbar = Platform.OS === "android" ? StatusBar.currentHeight : 0;
  const theme = {
    ...DefaultTheme,
    ...Theme.colors
  };
  const nav = useNavigation();

  const onGoBack = () => {
    if (!!onPressBackBtn) {
      onPressBackBtn();
    } else nav.goBack();
  };

  const styleShadow = {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6
  };

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "flex-start",
        // padding: 5,
        marginTop: safeAreaView ? -statusbar : 0,
        paddingTop: safeAreaView ? statusbar : 5,
        // borderBottomWidth: 1,
        // backgroundColor: "#fff",
        // borderColor: "#f0eff4",
        // borderStyle: "solid",
        ...style,
        ...(styles ? styles.root : {}),
        ...(shadow ? styleShadow : {})
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center"
        }}
      >
        {backBtn && (
          <TouchableOpacity onPress={onGoBack}>
            <Icon
              source={"AntDesign"}
              name={"arrowleft"}
              color={theme.primary}
              size={24}
              style={{
                margin: 5
              }}
            ></Icon>
          </TouchableOpacity>
        )}
      </View>

      <View
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          minHeight: 45
        }}
      >
        {title && (
          <View
            style={{
              flex: 1
            }}
          >
            {typeof title === "string" ? (
              <Text
                style={{
                  // color: theme.primary,
                  margin: 0,
                  fontSize: 16,
                  fontWeight: "bold",
                  fontFamily: _.get(Theme, "fontFamily", undefined),
                  overflow: "hidden",
                  flexWrap: "nowrap",
                  ...(styles ? styles.title : {})
                }}
                ellipsizeMode={"tail"}
                numberOfLines={1}
              >
                {title}
              </Text>
            ) : (
                typeof title === "object" && React.isValidElement(title) && title
              )}
          </View>
        )}
        {children}
      </View>
    </View>
  );
});
