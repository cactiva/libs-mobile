import { observer } from "mobx-react-lite";
import React from "react";
import View from "../View";
import { uuid } from "../../utils";
import Radio, { RadioModeType, RadioProps } from "../Radio";
import _ from "lodash";
import { ViewStyle } from "react-native";

export interface RadioGroupProps {
  mode?: RadioModeType;
  value?: any;
  onChange?: (value: any) => void;
  style?: ViewStyle;
  children?: any;
  option?: RadioProps[];
  editable?: boolean;
}

export default observer((props: RadioGroupProps) => {
  const { onChange, value, style, mode, children, option, editable } = props;
  let customChildren = children;

  if (!children && !!option && option.length > 0) {
    option.map((op) => {
      customChildren.push(<Radio {...op} />);
    });
  }

  return (
    <View style={style}>
      {Array.isArray(customChildren) ? (
        customChildren.map((el: any) => {
          return (
            <RenderChild
              onPress={(v) => {
                editable !== false &&
                  onChange &&
                  onChange(el.props.value || el.props.text);
              }}
              checked={
                (el.props.value === value || el.props.text === value) && !!value
              }
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
});

const RenderChild = observer((props: any) => {
  const { child, onPress, checked, mode } = props;
  if (Array.isArray(child)) {
    return child.map((el) => (
      <RenderChild
        onPress={onPress}
        checked={checked}
        mode={mode}
        child={el}
        key={uuid()}
      />
    ));
  } else if (child.type === Radio) {
    return (
      <Radio {...child.props} checked={checked} mode={mode} onPress={onPress} />
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
              onPress={onPress}
              checked={checked}
              mode={mode}
              child={el}
              key={uuid()}
            />
          ))
        ) : (
          <RenderChild
            onPress={onPress}
            checked={checked}
            mode={mode}
            child={children}
            key={uuid()}
          />
        )}
      </Component>
    );
  }
});
