import Theme from "@src/theme.json";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { DefaultTheme, ThemeProps } from "../../theme";
import { fuzzyMatch, textStyle, uuid } from "../../utils";
import Button from "../Button";
import FlatList from "../FlatList";
import Header from "../Header";
import Icon from "../Icon";
import Input from "../Input";
import Modal from "../Modal";
import Text from "../Text";
import View from "../View";

export interface SelectItemProps {
  label: any;
  value: any;
}

export interface SelectProps {
  value?: any;
  placeholder?: string;
  items: (SelectItemProps | string | any)[];
  onSelect?: (item: any) => void;
  style?: any;
  theme?: ThemeProps;
  onFocus?: (e: any) => void;
  readonly?: boolean;
  labelPath?: ((item: any) => any) | string;
  valuePath?: ((item: any) => any) | string;
}

const parsePath = (item, path) => {
  if (typeof item === "object") {
    if (typeof path === "function") {
      return path(item || {});
    } else if (typeof path === "string") {
      return _.get(item, path);
    }
  }
  return item;
};

const processData = (props: SelectProps) => {
  const labelPath = _.get(props, "labelPath", "label");
  const valuePath = _.get(props, "valuePath", "value");

  return (props.items || []).map(item => {
    return {
      label: parsePath(item, labelPath),
      value: parsePath(item, valuePath)
    };
  });
};

export default observer((props: SelectProps) => {
  const { value, placeholder, readonly } = props;
  const meta = useObservable({
    isShown: false,
    value: null,
    items: [],
    filter: ""
  });

  useEffect(() => {
    meta.items = processData(props);
  }, [props.items]);

  const items = meta.items;

  const theme = {
    ...DefaultTheme,
    ...Theme.colors
  };

  const tStyle: any = textStyle(props.style);
  const style = { ...props.style };
  if (!!style)
    Object.keys(style).map(k => {
      if (Object.keys(tStyle).indexOf(k) > -1) delete style[k];
    });

  useEffect(() => {
    if (value && Array.isArray(items))
      meta.value = items.find(x =>
        typeof x === "string" ? x === value : x.value === value
      );
  }, [value, items]);

  return (
    <>
      <Button
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          justifyContent: "flex-start",
          backgroundColor: "transparent",
          padding: 0,
          ...style
        }}
        disabled={readonly}
        onPress={() =>
          (meta.isShown = items && items.length > 0 ? true : false)
        }
      >
        <Text
          style={{
            flex: 1,
            minHeight: 22,
            paddingLeft: 5,
            marginTop: Platform.OS === "ios" ? 5 : 4,
            marginBottom: Platform.OS === "ios" ? 5 : 3,
            fontSize: Theme.fontSize,
            color: value ? "#3a3a3a" : "#757575",
            overflow: "hidden",
            ...tStyle
          }}
          ellipsizeMode={"tail"}
          numberOfLines={1}
        >
          {meta.value
            ? typeof meta.value === "string"
              ? meta.value
              : meta.value.label
            : placeholder}
        </Text>
        {!readonly && (
          <View
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: 5,
              paddingRight: 5
            }}
          >
            <Icon
              source="Entypo"
              name={meta.isShown ? "chevron-up" : "chevron-down"}
              color={tStyle.color || theme.dark}
              size={20}
            />
          </View>
        )}
      </Button>
      <ModalItems meta={meta} {...props} items={items} theme={theme} />
    </>
  );
});

const ModalItems = observer((props: any) => {
  const { meta, theme, items } = props;
  const onSearch = value => {
    meta.filter = value;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={meta.isShown}
      onRequestClose={() => (meta.isShown = false)}
    >
      <View
        type={"SafeAreaView"}
        style={{
          backgroundColor: "#fff",
          flexGrow: 1,
          flexShrink: 1
        }}
      >
        <Header
          safeAreaView={true}
          backBtn={true}
          onPressBackBtn={() => (meta.isShown = false)}
          title={
            <Input
              placeholder={props.placeholder || "Search..."}
              value={meta.filter}
              onChangeText={onSearch}
              autoFocus={true}
              style={{
                padding: 10
              }}
            />
          }
          style={{
            paddingTop: 0
          }}
        ></Header>
        <RenderItem {...props} meta={meta} theme={theme} items={items} />
      </View>
    </Modal>
  );
});

const RenderItem = observer((props: any) => {
  const { meta, items, value, onSelect, theme } = props;
  return (
    <View
      type={"ScrollView"}
      style={{
        flexGrow: 1,
        flexShrink: 1
      }}
    >
      <FlatList
        keyboardShouldPersistTaps={"handled"}
        data={items.filter((item: any) => {
          if (meta.filter.length > 0)
            return fuzzyMatch(
              meta.filter.toLowerCase(),
              item.label.toLowerCase()
            );
          return true;
        })}
        keyExtractor={(item: any) => {
          return `${uuid()}-${typeof item === "string" ? item : item.value}`;
        }}
        ItemSeparatorComponent={() => (
          <View
            style={{
              borderBottomWidth: 1,
              borderStyle: "solid",
              borderColor: theme.light,
              borderWidth: 0
            }}
          />
        )}
        ListEmptyComponent={() => (
          <Text
            style={{
              margin: 10,
              textAlign: "center"
            }}
          >
            No item to display.
          </Text>
        )}
        renderItem={({ item }) => {
          return (
            <RenderItemRow
              item={item}
              value={value}
              meta={meta}
              onSelect={onSelect}
              theme={theme}
            ></RenderItemRow>
          );
        }}
      />
    </View>
  );
});

const RenderItemRow = observer((props: any) => {
  const { item, value, meta, onSelect, theme } = props;
  const textLabel = typeof item === "string" ? item : item.label;
  const textValue = typeof item === "string" ? item : item.value;
  let active = false;
  if (value && value.value) {
    active = value.value === textValue && !!textValue;
  }
  return (
    <Button
      onPress={() => {
        onSelect(item);
        meta.isShown = false;
        meta.value = item;
      }}
      style={{
        paddingRight: 10,
        paddingLeft: 10,
        minHeight: 40,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        backgroundColor: active ? theme.primary : "#fff"
      }}
    >
      <Text
        style={{
          color: active ? "#fff" : theme.dark
        }}
      >
        {textLabel}
      </Text>
    </Button>
  );
});
