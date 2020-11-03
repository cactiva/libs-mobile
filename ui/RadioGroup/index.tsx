import React from "react";
import { ViewStyle, StyleSheet, TextStyle } from "react-native";
import Radio, { RadioModeType, IRadioProps } from "../Radio";
import View from "../View";
import set from "lodash.set";
import get from "lodash.get";
import Text from "../Text";
import { formatedItems } from "../Select";

interface IItemProps {
  label: any;
  value: any;
}

export interface IRadioGroupProps {
  mode?: RadioModeType;
  value?: any;
  onChange?: (value: any) => void;
  style?: ViewStyle;
  children?: any;
  editable?: boolean;
  labelPath?: any;
  valuePath?: any;
  items?: (IItemProps | String | any)[];
  itenProps?: IRadioProps;
  styles?: {
    label?: TextStyle;
    selected?: {
      button?: ViewStyle;
      label?: TextStyle;
    };
  };
}

export default (props: IRadioGroupProps) => {
  const { style, mode, children, items, editable } = props;
  let customChildren = children;

  if (!children && Array.isArray(items) && items.length > 0) {
    customChildren = [];
    const mitems = formatedItems(props);
    mitems.map((op) => {
      customChildren.push(<Radio {...op} />);
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
              radioGroupProps={props}
              mode={mode}
              child={el}
              key={String(key)}
            />
          );
        })
      ) : (
        <RenderChild {...customChildren.props} editable={editable} />
      )}
    </View>
  );
};

const RenderChild = (props: any) => {
  const { child, mode, radioGroupProps } = props;
  const { onChange, value } = radioGroupProps;
  const editable =
    radioGroupProps.editable === false
      ? radioGroupProps.editable
      : props.editable === false
      ? props.editable
      : true;
  if (child.type === Radio) {
    const handleChange = () => {
      editable !== false &&
        onChange &&
        onChange(child.props.value || child.props.label);
    };
    const checked =
      (child.props.value === value || child.props.label === value) && !!value;
    return (
      <Radio
        {...child.props}
        styles={get(radioGroupProps, "styles", {})}
        checked={checked}
        mode={mode}
        onPress={handleChange}
        editable={editable}
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
              radioGroupProps={radioGroupProps}
              mode={mode}
              child={el}
              key={String(key)}
            />
          ))
        ) : (
          <RenderChild
            radioGroupProps={radioGroupProps}
            mode={mode}
            child={children}
          />
        )}
      </Component>
    );
  }
};
