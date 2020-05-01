import _ from "lodash";
import React, { useEffect, useState } from "react";
import { StyleSheet, TextStyle } from "react-native";
import Theme from "../../theme";
import Camera from "../Camera";
import Select from "../Select";
import Text from "../Text";
import View from "../View";
import Input from "../Input";

interface IFieldProps {
  label?: string;
  path?: string;
  setValue?: any;
  value?: any;
  children?: any;
  style?: any;
  isRequired?: boolean;
  isValid?: boolean;
  readonly?: boolean;
  onChange?: (value) => void;
}

export default (props: IFieldProps) => {
  const { label, isValid, readonly } = props;
  const [meta, setMeta] = useState({
    error: false,
    init: true,
  });
  const defLabelStyle: TextStyle = {
    fontSize: Theme.UIFontSize,
    color: Theme.UIColors.primary,
    marginBottom: 5,
  };
  const labelStyle = StyleSheet.flatten([defLabelStyle, Theme.UILabel]);
  const defErrorLabelStyle: TextStyle = {
    fontSize: 12,
    color: Theme.UIColors.danger,
    marginBottom: 5,
  };
  const errorLabelStyle = StyleSheet.flatten([
    defErrorLabelStyle,
    Theme.UILabel,
  ]);

  const handleOnChange = (value) => {
    props.setValue(value);
    props.onChange && props.onChange(value);
  };
  const Component = props.children.type;
  const childprops = _.clone(_.get(props, "children.props", {}));
  childprops.readonly = readonly;
  childprops.value = _.get(props, "value", "");
  childprops.onChange = handleOnChange;

  switch (Component) {
    case Select:
      childprops.searchProps = {
        placeholder: "Search " + props.label,
      };
      break;
    case Camera:
      delete childprops.onChange;
      childprops.onCapture = handleOnChange;
      break;
    case Input:
      delete childprops.onChange;
      childprops.onChangeText = handleOnChange;
      break;
  }

  useEffect(() => {
    if (!meta.init) {
      meta.error = !isValid;
      setMeta({ ...meta });
    }
  }, [isValid]);
  useEffect(() => {
    meta.init = false;
    setMeta({ ...meta });
  }, []);
  return (
    <View style={Theme.UIField}>
      <Text style={labelStyle}>{label}</Text>
      <Component {...childprops} />
      {!!meta.error && <Text style={errorLabelStyle}>Field is required.</Text>}
    </View>
  );
};
