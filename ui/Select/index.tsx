import { shadeColor } from "@src/libs/utils/color";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import { StyleSheet, TextStyle, ViewProps, ViewStyle } from "react-native";
import Theme from "../../theme";
import { fuzzyMatch, uuid } from "../../utils";
import Button, { IButtonProps } from "../Button";
import Container, { IContainerProps } from "../Container";
import FlatList, { IFlatListProps } from "../FlatList";
import Icon, { IIconProps } from "../Icon";
import Input, { IInputProps } from "../Input";
import Modal from "../Modal";
import { IScreenProps } from "../Screen";
import Text, { ITextProps } from "../Text";
import TopBar, { ITopBarProps } from "../TopBar";
import View from "../View";

interface IItemProps {
  label: any;
  value: any;
}

interface IStyles {
  label?: TextStyle;
  icon?: ViewStyle;
  search?: ViewStyle;
  item?: {
    sperator?: ViewStyle;
    button?: ViewStyle;
    label?: TextStyle;
    selected?: ViewStyle;
  };
  modal?: {
    screen?: ViewStyle;
    container?: ViewStyle;
    list?: ViewStyle;
  };
}

export interface IProps {
  button?: IButtonProps;
  label?: ITextProps;
  icon?: IIconProps;
  search?: IInputProps;
  item?: {
    sperator?: ViewProps;
    button?: IButtonProps;
    label?: ITextProps;
  };
  modal?: {
    statusbar?: ViewStyle;
    screen?: IScreenProps;
    container?: IContainerProps;
    list?: IFlatListProps;
    topbar?: ITopBarProps;
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
  customProps?: IProps;
  listProps?: IFlatListProps;
  placeholder?: String;
}

export const formatedItems = (props: ISelectProps | any) => {
  const labelPath = _.get(props, "labelPath", "label");
  const valuePath = _.get(props, "valuePath", "value");
  let items = [];
  if (Array.isArray(props.items)) {
    items = _.get(props, "items", []);
  }
  return items.map((item) => {
    if (typeof item === "string") {
      return {
        label: item,
        value: item,
      };
    }
    return {
      label: item[labelPath],
      value: item[valuePath],
    };
  });
};

export default observer((props: ISelectProps) => {
  const { style, editable, value, placeholder } = props;
  const meta = useObservable({
    openSelect: false,
    search: "",
  });
  const baseStyle: ViewStyle = {
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 1,
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
    flexGrow: 1,
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
        {..._.get(props, "customProps.button", {})}
        style={cstyle}
        disabled={editable === false}
        onPress={handleSelect}
      >
        <Text
          ellipsizeMode={"tail"}
          numberOfLines={1}
          {..._.get(props, "customProps.label", {})}
          style={clabelstyle}
        >
          {_.get(selectedItem, "label", placeholder || "")}
        </Text>
        <Icon
          name={"ios-arrow-down"}
          size={18}
          {..._.get(props, "customProps.icon", {})}
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
      {..._.get(selectProps, "customProps.item.sperator", {})}
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
    _.get(selectProps, "customProps.search.style", {}),
    _.get(selectProps, "styles.item.search", {}),
  ]);
  const cstyle = StyleSheet.flatten([
    {
      paddingHorizontal: 0,
    },
    _.get(selectProps, "customProps.modal.style", {}),
    _.get(selectProps, "styles.modal.list", {}),
  ]);
  const handleSearchInput = (value) => {
    meta.search = value;
  };
  const topbarStyle = StyleSheet.flatten([
    {
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      paddingLeft: 8,
      paddingRight: 15,
    },
    _.get(selectProps, "styles.modal.topbar", {}),
  ]);
  const containerStyle = StyleSheet.flatten([
    {
      backgroundColor: "#fff",
    },
    _.get(selectProps, "styles.modal.container", {}),
  ]);
  return (
    <Modal
      visible={meta.openSelect}
      onRequestClose={handleReqClose}
      styles={{
        screen: {
          backgroundColor: "#fff",
          ..._.get(selectProps, "styles.modal.screen", {}),
        },
        statusbar: {
          backgroundColor: Theme.UIColors.primary,
          ..._.get(selectProps, "styles.modal.statusbar", {}),
        },
      }}
      screenProps={_.get(selectProps, "customProps.modal.screen", {})}
    >
      <TopBar
        backButton
        {..._.get(selectProps, "customProps.modal.topbar", {})}
        actionBackButton={handleReqClose}
        style={topbarStyle}
      >
        <Input
          autoFocus={true}
          {..._.get(selectProps, "customProps.search", {})}
          style={csearchstyle}
          value={meta.search}
          onChangeText={handleSearchInput}
        />
      </TopBar>
      <Container
        {..._.get(selectProps, "customProps.modal.container", {})}
        contentContainerStyle={containerStyle}
      >
        <FlatList
          {..._.get(selectProps, "customProps.modal.list", {})}
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
      </Container>
    </Modal>
  );
});

const RenderItem = (props: any) => {
  const { item, meta, selectProps } = props;
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
    paddingHorizontal: 10,
  };
  const selectedStyle =
    item.value === selectProps.value
      ? {
          backgroundColor: shadeColor(Theme.UIColors.primary, 200),
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
    <Button
      mode="clean"
      {..._.get(selectProps, "customProps.item.button", {})}
      onPress={handleSelect}
      style={cstyle}
    >
      <Text
        {..._.get(selectProps, "customProps.item.label", {})}
        style={clabelstyle}
      >
        {item.label}
      </Text>
    </Button>
  );
};
