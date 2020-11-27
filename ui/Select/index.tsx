import set from "lodash.set";
import get from "lodash.get";
import { action, toJS } from "mobx";
import { observer, useLocalObservable } from "mobx-react-lite";
import React, { useRef } from "react";
import { StyleSheet, TextStyle, ViewProps, ViewStyle } from "react-native";
import Theme from "../../config/theme";
import { shadeColor } from "../../utils/color";
import fuzzyMatch from "../../utils/fuzzy-match";
import Button, { IButtonProps } from "../Button";
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
  button?: IButtonProps | any;
  label?: ITextProps | any;
  icon?: IIconProps | any;
  search?: IInputProps | any;
  item?: {
    sperator?: ViewProps | any;
    button?: IButtonProps | any;
    label?: ITextProps | any;
  };
  modal?: {
    statusbar?: ViewStyle | any;
    screen?: IScreenProps | any;
    list?: IFlatListProps | any;
    topbar?: ITopBarProps | any;
  };
}

export interface ISelectProps {
  items: IItemProps[] | String[] | any;
  itemsPath?: string;
  value?: any;
  onSelect?: (item: any) => void;
  onChange?: (value: any) => void;
  renderItem?: (item: any) => void;
  labelPath?: any;
  valuePath?: any;
  editable?: boolean;
  style?: ViewStyle;
  styles?: IStyles;
  customProps?: IProps;
  listProps?: IFlatListProps;
  placeholder?: String;
  emptyListMessage?: string;
}

export const formatedItems = (props: ISelectProps | any) => {
  const labelPath = get(props, "labelPath", "label");
  const valuePath = get(props, "valuePath", "value");
  let items = [];
  if (!!props.itemsPath) {
    items = get(props.items, props.itemsPath, []);
  } else {
    items = get(props, "items", []);
  }
  if (Array.isArray(items)) {
    items = toJS(items);
  } else {
    items = [];
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
  const meta = useLocalObservable(() => ({
    openSelect: false,
    search: "",
  }));
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
    paddingRight: 10,
  };
  const clabelstyle = StyleSheet.flatten([
    baseLabelStyle,
    get(props, "styles.label", {}),
  ]);
  const ciconstyle = StyleSheet.flatten([
    {
      margin: 0,
      alignSelf: "center",
    },
    get(props, "styles.icon", {}),
  ]);
  const handleSelect = action(() => {
    if (props.items.length === 0)
      alert(get(props, "emptyListMessage", "No item to display."));
    else meta.openSelect = !meta.openSelect;
  });
  const items = formatedItems(props);
  const selectedItem = items.find((x) => x.value === value) || {};

  return (
    <>
      <Button
        mode={"clean"}
        {...get(props, "customProps.button", {})}
        style={cstyle}
        disabled={editable === false}
        onPress={handleSelect}
      >
        <Text
          ellipsizeMode={"tail"}
          numberOfLines={1}
          {...get(props, "customProps.label", {})}
          style={clabelstyle}
        >
          {get(selectedItem, "label", placeholder || "")}
        </Text>
        <Icon
          name={"ios-arrow-down"}
          size={18}
          {...get(props, "customProps.icon", {})}
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
  const handleReqClose = action(() => {
    meta.openSelect = false;
  });
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
        get(selectProps, "styles.item.sperator", {}),
      ])}
      {...get(selectProps, "customProps.item.sperator", {})}
    />
  );
  const basesearchStyle: TextStyle = {
    margin: 0,
    borderWidth: 0,
    flexGrow: 1,
    height: 40,
    minHeight: 40,
    flexDirection: "row",
    padding: 0,
    alignItems: "center",
    marginBottom: 0,
  };
  const csearchstyle = StyleSheet.flatten([
    Theme.UIInput,
    basesearchStyle,
    get(selectProps, "customProps.search.style", {}),
    get(selectProps, "styles.item.search", {}),
  ]);
  const cstyle = StyleSheet.flatten([
    {
      paddingHorizontal: 0,
    },
    get(selectProps, "customProps.modal.style", {}),
    get(selectProps, "styles.modal.list", {}),
  ]);
  const handleSearchInput = action((value: any) => {
    meta.search = value;
  });
  const topbarStyle = StyleSheet.flatten([
    get(selectProps, "styles.modal.topbar", {}),
  ]);
  const containerStyle = StyleSheet.flatten([
    {
      backgroundColor: "#fff",
    },
    get(selectProps, "styles.modal.container", {}),
  ]);
  const refList = useRef(null);
  const data = () => {
    return items.filter((item: any) => {
      if (!!meta.search)
        return fuzzyMatch(meta.search.toLowerCase(), item.label.toLowerCase());
      return true;
    });
  };
  const findIndex = () => {
    return data().findIndex((x: any) => x.value === selectProps.value);
  };
  const getItemLayout = (x: any, index: number) => {
    let st = get(selectProps, "styles.item.button", {});
    let height = !!st.height ? st.height : 44;
    let offset = height * index;
    return {
      length: height,
      offset: offset,
      index: index,
    };
  };
  return (
    <Modal
      visible={meta.openSelect}
      onRequestClose={handleReqClose}
      screenProps={{
        scrollEnabled: false,
        ...get(selectProps, "customProps.modal.screen", {}),
      }}
      style={{
        backgroundColor: "#fff",
      }}
    >
      <TopBar
        backButton
        {...get(selectProps, "customProps.modal.topbar", {})}
        actionBackButton={handleReqClose}
        style={topbarStyle}
      >
        <View style={csearchstyle}>
          <Input
            autoFocus={true}
            placeholder={get(selectProps, "placeholder", "Search")}
            {...get(selectProps, "customProps.search", {})}
            value={meta.search}
            onChangeText={handleSearchInput}
            style={{
              flex: 1,
            }}
          />
          <Button
            mode="clean"
            style={{
              margin: 0,
              paddingHorizontal: 0,
              minHeight: 35,
              height: 35,
            }}
            onPress={action(() => handleSearchInput(""))}
          >
            <Icon name="ios-close-circle" />
          </Button>
        </View>
      </TopBar>
      <FlatList
        {...get(selectProps, "customProps.modal.list", {})}
        flatListRef={refList}
        data={data()}
        renderItem={get(selectProps, "renderItem", renderItem)}
        keyExtractor={(_: any, index: number) => String(index)}
        ItemSeparatorComponent={itemSperator}
        keyboardShouldPersistTaps={"handled"}
        style={cstyle}
        windowSize={12}
        initialNumToRender={20}
        maxToRenderPerBatch={24}
        initialScrollIndex={findIndex()}
        getItemLayout={getItemLayout}
      />
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
    get(selectProps, "styles.item.label", {}),
  ]);
  const itemStyle: ViewStyle = {
    justifyContent: "flex-start",
    borderRadius: 0,
    margin: 0,
    paddingHorizontal: 10,
    height: 44,
    ...get(selectProps, "styles.item.button", {}),
  };
  const selectedStyle =
    item.value === selectProps.value
      ? {
          backgroundColor: shadeColor(Theme.UIColors.primary, 200),
          borderStyle: "solid",
          borderBottomWidth: 1,
          borderColor: Theme.UIColors.primary,
          ...get(selectProps, "styles.item.selected", {}),
        }
      : {};
  const cstyle = StyleSheet.flatten([itemStyle, selectedStyle]);
  const handleSelect = action(() => {
    selectProps.onChange && selectProps.onChange(item.value);
    selectProps.onSelect && selectProps.onSelect(item);
    meta.openSelect = false;
  });
  return (
    <Button
      mode="clean"
      {...get(selectProps, "customProps.item.button", {})}
      onPress={handleSelect}
      style={cstyle}
    >
      <Text
        {...get(selectProps, "customProps.item.label", {})}
        style={clabelstyle}
      >
        {item.label}
      </Text>
    </Button>
  );
};
