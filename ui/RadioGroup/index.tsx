import { observer } from "mobx-react-lite";
import React from "react";
import View from "../View";
import { uuid } from "../../utils";
import Radio, { RadioModeType, RadioProps } from "../Radio";

export interface RadioGroupProps {
  mode?: RadioModeType;
  value?: any;
  onChange?: (value: any) => void;
  style?: any;
  children?: any;
  option?: RadioProps[];
}

export default observer((props: RadioGroupProps) => {
  const { onChange, value, style, mode, children, option } = props;
  let cusstomChildren = [];
  if (!!children) cusstomChildren = [...children];

  if (!children && !!option && option.length > 0) {
    option.map(op => {
      cusstomChildren.push(<Radio {...op} />);
    });
  }

  return (
    <View style={style}>
      {cusstomChildren.map((el: any) => {
        return (
          <RenderChild
            onPress={v => {
              onChange && onChange(el.props.value || el.props.text);
            }}
            checked={
              (el.props.value === value || el.props.text === value) && !!value
            }
            mode={mode}
            child={el}
            key={uuid()}
          />
        );
      })}
    </View>
  );
});

const RenderChild = observer((props: any) => {
  const { child, onPress, checked, mode } = props;

  return React.cloneElement(child, {
    checked,
    mode,
    onPress,
    ...child.props
  });
});
