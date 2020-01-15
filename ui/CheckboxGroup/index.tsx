import { observer } from "mobx-react-lite";
import React from "react";
import { uuid } from "../../utils";
import View from "../View";

export interface CheckboxGroupProps {
  value?: string[];
  onChange?: (value: any) => void;
  style?: any;
  children?: any;
}

export default observer((props: CheckboxGroupProps) => {
  const { onChange, value, style, children } = props;

  return (
    <View style={style}>
      {children.map((el: any) => {
        return (
          <RenderChild
            onPress={v => {
              if (v) {
                value.push(el.props.value || el.props.text);
              } else {
                let i = value.findIndex(
                  v => v == el.props.value || v == el.props.text
                );
                value.splice(i, 1);
              }
              onChange && onChange(getUnique(value));
            }}
            checked={
              value.findIndex(v => v == (el.props.value || el.props.text)) > -1
            }
            children={el}
            key={uuid()}
          />
        );
      })}
    </View>
  );
});

const RenderChild = observer((props: any) => {
  const { children, onPress, checked, mode } = props;

  return React.cloneElement(children, {
    checked,
    mode,
    onPress,
    ...children.props
  });
});

function getUnique(array) {
  var uniqueArray = [];
  for (let i = 0; i < array.length; i++) {
    if (uniqueArray.indexOf(array[i]) === -1) {
      uniqueArray.push(array[i]);
    }
  }
  return uniqueArray;
}
