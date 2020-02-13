import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { DefaultTheme, ThemeProps } from "../../themes";
import { fuzzyMatch, textStyle, uuid } from "../../utils";
import Button from "../Button";
import FlatList from "../FlatList";
import Header from "../Header";
import Icon from "../Icon";
import Input from "../Input";
import Modal from "../Modal";
import Text from "../Text";
import View from "../View";
import Screen from "../Screen";
import TopBar from "../TopBar";
import Theme from "@src/libs/theme";

export interface SelectItemProps {
  label: any;
  value: any;
}

export interface SelectProps {
  value?: any;
  placeholder?: string;
  placeholderColor?: string;
  items: (SelectItemProps | string | any)[];
  onSelect?: (item: any) => void;
  style?: any;
  theme?: ThemeProps;
  onFocus?: (e: any) => void;
  readonly?: boolean;
  labelPath?: ((item: any) => any) | string;
  valuePath?: ((item: any) => any) | string;
  icon?: boolean;
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
  const { value, placeholder, readonly, placeholderColor } = props;
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
          minHeight: 30,
          margin: 0,
          backgroundColor: "transparent",
          paddingLeft: 0,
          paddingRight: 0,
          ...style
        }}
        disabled={readonly}
        onPress={() => {
          meta.isShown = items && items.length > 0 ? true : false;
          if (items.length === 0) alert("No item to display.");
        }}
      >
        <Text
          style={{
            flex: 1,
            minHeight: 22,
            paddingLeft: 5,
            fontSize: Theme.UIFontSize,
            color: placeholderColor
              ? placeholderColor
              : value
              ? "#3a3a3a"
              : "#757575",
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
        {!readonly && (props.icon === undefined || props.icon) && (
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
              color={tStyle.color || "black"}
              size={20}
              style={{
                margin: 0
              }}
            />
          </View>
        )}
      </Button>
      <ModalItems meta={meta} {...props} items={items} />
    </>
  );
});

const ModalItems = observer((props: any) => {
  const { meta, items } = props;
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
        style={{
          flexGrow: 1,
          flexShrink: 1,
          backgroundColor: Theme.UIColors.background
        }}
      >
        <TopBar
          backButton={true}
          actionBackButton={() => (meta.isShown = false)}
          enableShadow
        >
          <Input
            placeholder={props.placeholder || "Search..."}
            value={meta.filter}
            onChangeText={onSearch}
            autoFocus={true}
            style={{
              padding: 10
            }}
          />
        </TopBar>
        <RenderItem {...props} meta={meta} items={items} />
      </View>
    </Modal>
  );
});

const RenderItem = observer((props: any) => {
  const { meta, items, value, onSelect } = props;
  return (
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
            borderColor: "#e4e4e4",
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
          ></RenderItemRow>
        );
      }}
    />
  );
});

const RenderItemRow = observer((props: any) => {
  const { item, value, meta, onSelect } = props;
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
        justifyContent: "flex-start",
        backgroundColor: active ? Theme.UIColors.primary : "transparent"
      }}
    >
      <Text
        style={{
          color: active ? "#fff" : "black"
        }}
      >
        {textLabel}
      </Text>
    </Button>
  );
});
