import Theme from "../../theme";
import { uuid } from "../../utils";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import { StyleSheet, TextStyle, ViewStyle, Platform } from "react-native";
import { fuzzyMatch } from "../../utils";
import Button from "../Button";
import FlatList, { IFlatListProps } from "../FlatList";
import Icon, { IIconProps } from "../Icon";
import Input, { IInputProps } from "../Input";
import Modal from "../Modal";
import Text, { ITextProps } from "../Text";
import TopBar from "../TopBar";
import View from "../View";
import Container from "../Container";

interface IItemProps {
  label: any;
  value: any;
}

interface IStyles {
  label?: TextStyle;
  icon?: ViewStyle;
  search?: ViewStyle;
  list?: ViewStyle;
  item?: {
    sperator?: ViewStyle;
    button?: ViewStyle;
    label?: TextStyle;
    selected?: ViewStyle;
  };
}

export interface ISelectProps {
  items: (IItemProps | String | any)[];
  value?: any;
  onSelect?: (item) => void;
  onChange?: (value) => void;
  renderItem?: (item) => void;
  labelPath?: any;
  valuePath?: any;
  editable?: boolean;
  style?: ViewStyle;
  styles?: IStyles;
  iconProps?: IIconProps;
  labelProps?: ITextProps;
  searchProps?: IInputProps;
  listProps?: IFlatListProps;
}

export const formatedItems = (props: ISelectProps | any) => {
  const labelPath = _.get(props, "labelPath", "label");
  const valuePath = _.get(props, "valuePath", "value");
  let items = [];
  if (Array.isArray(props.items)) {
    items = _.get(props, "items", []);
  }
  return items.map((item) => {
    return {
      label: item[labelPath],
      value: item[valuePath],
    };
  });
};

export default observer((props: ISelectProps) => {
  const { style, editable, value, iconProps, labelProps } = props;
  const meta = useObservable({
    openSelect: false,
    search: "",
  });
  const baseStyle: ViewStyle = {
    justifyContent: "space-between",
    alignItems: "center",
    margin: 0,
  };
  const cstyle: any = StyleSheet.flatten([
    baseStyle,
    // Theme.UIInput,
    style,
    {
      opacity: editable !== false ? 1 : 0.7,
    },
  ]);
  const baseLabelStyle: TextStyle = {
    flexWrap: "nowrap",
    flexShrink: 1,
  };
  const clabelstyle = StyleSheet.flatten([
    baseLabelStyle,
    _.get(props, "styles.label", {}),
  ]);
  const ciconstyle = StyleSheet.flatten([
    {
      margin: 0,
      alignSelf: "center",
    },
    _.get(props, "styles.icon", {}),
  ]);
  const handleSelect = () => {
    if (props.items.length === 0) alert("No item to display.");
    else meta.openSelect = !meta.openSelect;
  };
  const items = formatedItems(props);
  const selectedItem = items.find((x) => x.value === value) || {};

  return (
    <>
      <Button
        mode={"clean"}
        style={cstyle}
        disabled={editable === false}
        onPress={handleSelect}
      >
        <Text
          ellipsizeMode={"tail"}
          numberOfLines={1}
          {...labelProps}
          style={clabelstyle}
        >
          {_.get(selectedItem, "label", "")}
        </Text>
        <Icon
          name={"ios-arrow-down"}
          size={18}
          {...iconProps}
          style={ciconstyle}
        />
      </Button>
      <SelectComponent
        meta={meta}
        selectedItem={selectedItem}
        selectProps={props}
        items={items}
      />
    </>
  );
});

const SelectComponent = observer((props: any) => {
  const { meta, selectProps, items } = props;
  const { listProps, searchProps } = selectProps;
  const handleReqClose = () => {
    meta.openSelect = false;
  };
  const renderItem = ({ item }: any) => {
    return <RenderItem item={item} meta={meta} selectProps={selectProps} />;
  };
  const itemSperator = () => (
    <View
      style={StyleSheet.flatten([
        {
          borderBottomWidth: 1,
          borderStyle: "solid",
          borderColor: "#e4e4e4",
          borderWidth: 0,
        },
        _.get(selectProps, "styles.item.sperator", {}),
      ])}
    />
  );
  const basesearchStyle: TextStyle = {
    margin: 0,
    borderWidth: 0,
    flexGrow: 1,
    height: 44,
  };
  const csearchstyle = StyleSheet.flatten([
    basesearchStyle,
    Theme.UIInput,
    _.get(searchProps, "style", {}),
    _.get(selectProps, "styles.item.search", {}),
  ]);
  const cstyle = StyleSheet.flatten([
    {
      paddingHorizontal: 0,
    },
    _.get(listProps, "style", {}),
    _.get(selectProps, "styles.list", {}),
  ]);
  const handleSearchInput = (value) => {
    meta.search = value;
  };
  return (
    <Modal
      transparent={false}
      visible={meta.openSelect}
      onRequestClose={handleReqClose}
    >
      <TopBar
        backButton
        actionBackButton={handleReqClose}
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          paddingLeft: 8,
          paddingRight: 15,
        }}
      >
        <Input
          autoFocus={true}
          {...searchProps}
          style={csearchstyle}
          value={meta.search}
          onChangeText={handleSearchInput}
        />
      </TopBar>
      <View
        type={Platform.OS === "ios" ? "KeyboardAvoidingView" : "View"}
        style={{
          flexGrow: 1,
          flexShrink: 1,
          marginBottom: 10,
        }}
      >
        <FlatList
          {...listProps}
          data={items.filter((item) => {
            if (!!meta.search)
              return fuzzyMatch(
                meta.search.toLowerCase(),
                item.label.toLowerCase()
              );
            return true;
          })}
          renderItem={renderItem}
          keyExtractor={() => uuid()}
          ItemSeparatorComponent={itemSperator}
          keyboardShouldPersistTaps={"handled"}
          style={cstyle}
        />
      </View>
    </Modal>
  );
});

const RenderItem = (props: any) => {
  const { item, meta, selectProps } = props;
  const { labelProps } = selectProps;
  const labelStyle = {
    color: "#000",
  };
  const clabelstyle = StyleSheet.flatten([
    labelStyle,
    _.get(selectProps, "styles.item.label", {}),
  ]);
  const itemStyle: ViewStyle = {
    justifyContent: "flex-start",
    borderRadius: 0,
    margin: 0,
  };
  const selectedStyle =
    item.value === selectProps.value
      ? {
          backgroundColor: Theme.UIColors.primary + "24",
          borderStyle: "solid",
          borderBottomWidth: 1,
          borderColor: Theme.UIColors.primary,
          ..._.get(selectProps, "styles.item.selected", {}),
        }
      : {};
  const cstyle = StyleSheet.flatten([itemStyle, selectedStyle]);
  const handleSelect = () => {
    selectProps.onChange && selectProps.onChange(item.value);
    selectProps.onSelect && selectProps.onSelect(item);
    meta.openSelect = false;
  };
  return (
    <Button mode="clean" onPress={handleSelect} style={cstyle}>
      <Text {...labelProps} style={clabelstyle}>
        {item.label}
      </Text>
    </Button>
  );
};
