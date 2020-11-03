import React from "react";
import { ViewStyle, StyleSheet } from "react-native";
import View from "../View";
import set from "lodash.set";
import get from "lodash.get";
import Text from "../Text";
import Checkbox, { ICheckboxProps, CheckboxType } from "../Checkbox";
import { formatedItems } from "../Select";

interface IItemProps {
  label: any;
  value: any;
}

export interface ICheckboxGroupProps {
  mode?: CheckboxType;
  value?: any;
  onChange?: (value: any) => void;
  style?: ViewStyle;
  children?: any;
  editable?: boolean;
  labelPath?: any;
  valuePath?: any;
  items?: (IItemProps | String | any)[];
  itenProps?: ICheckboxProps;
}

export default (props: ICheckboxGroupProps) => {
  const { style, mode, children, items } = props;
  let customChildren = children;

  if (!children && Array.isArray(items) && items.length > 0) {
    customChildren = [];
    const mitems = formatedItems(props);
    mitems.map((op) => {
      customChildren.push(<Checkbox {...op} />);
    });
  }

  if (!customChildren) return <Text>No items to display.</Text>;

  const baseStyle: ViewStyle = StyleSheet.flatten([
    {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    style,
  ]);

  return (
    <View style={baseStyle}>
      {Array.isArray(customChildren) ? (
        customChildren.map((el: any, key: number) => {
          return (
            <RenderChild
              checkboxGroupProps={props}
              mode={mode}
              child={el}
              key={String(key)}
            />
          );
        })
      ) : (
        <RenderChild {...customChildren.props} />
      )}
    </View>
  );
};

const RenderChild = (props: any) => {
  const { child, mode, checkboxGroupProps } = props;
  const { editable, onChange, value } = checkboxGroupProps;
  if (child.type === Checkbox) {
    let checked = false;
    let selected: any;
    if (Array.isArray(value)) {
      selected = value.findIndex((x) => {
        if (child.props.value == x || child.props.label == x) {
          return x;
        }
      });
      if (selected > -1) checked = true;
    }
    const handleChange = (v: boolean) => {
      let values = value;
      if (!Array.isArray(values)) values = [];
      if (editable !== false) {
        if (!!v) {
          values.push(child.props.value || child.props.label);
        } else if (selected > -1) {
          values.splice(selected, 1);
        }
        onChange && onChange(values);
      }
    };
    return (
      <Checkbox
        {...child.props}
        checked={checked}
        mode={mode}
        onPress={handleChange}
      />
    );
  } else if (!child || !child.type || !child.props) {
    return child;
  } else {
    const Component = child.type;
    const children = child.props.children;
    return (
      <Component {...child.props}>
        {Array.isArray(children) ? (
          children.map((el: any, key: number) => (
            <RenderChild
              radioGroupProps={checkboxGroupProps}
              mode={mode}
              child={el}
              key={String(key)}
            />
          ))
        ) : (
          <RenderChild
            radioGroupProps={checkboxGroupProps}
            mode={mode}
            child={children}
          />
        )}
      </Component>
    );
  }
};
