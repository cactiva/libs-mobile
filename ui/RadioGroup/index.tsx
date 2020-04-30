import React from "react";
import { ViewStyle, StyleSheet } from "react-native";
import { uuid } from "../../utils";
import Radio, { RadioModeType, IRadioProps } from "../Radio";
import View from "../View";
import _ from "lodash";
import Text from "../Text";

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
}
export const formatedItems = (props: IRadioGroupProps | any) => {
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

export default (props: IRadioGroupProps) => {
  const { style, mode, children, items } = props;
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
        customChildren.map((el: any) => {
          return (
            <RenderChild
              radioGroupProps={props}
              mode={mode}
              child={el}
              key={uuid()}
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
  const { child, mode, radioGroupProps } = props;
  const { editable, onChange, value } = radioGroupProps;
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
          children.map((el) => (
            <RenderChild
              radioGroupProps={radioGroupProps}
              mode={mode}
              child={el}
              key={uuid()}
            />
          ))
        ) : (
          <RenderChild
            radioGroupProps={radioGroupProps}
            mode={mode}
            child={children}
            key={uuid()}
          />
        )}
      </Component>
    );
  }
};
