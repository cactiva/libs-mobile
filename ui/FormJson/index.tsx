import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import { ViewStyle } from "react-native";
import Button from "../Button";
import Camera from "../Camera";
import Checkbox from "../Checkbox";
import CheckboxGroup from "../CheckboxGroup";
import DatePicker from "../DatePicker";
import Field, { FieldProps } from "../Field";
import Form from "../Form";
import Input from "../Input";
import Location from "../Location";
import Radio from "../Radio";
import RadioGroup from "../RadioGroup";
import Select from "../Select";
import Text from "../Text";

const Element = {
  Input: Input,
  Select: Select,
  DatePicker: DatePicker,
  RadioGroup: RadioGroup,
  Radio: Radio,
  Checkbox: Checkbox,
  CheckboxGroup: CheckboxGroup,
  Camera: Camera,
  Location: Location
};

export type FieldType =
  | "Input"
  | "Select"
  | "RadioGroup"
  | "DatePicker"
  | "CheckboxGroup"
  | "Camera"
  | "Location";

export interface FormFieldProps extends FieldProps {
  fieldType: FieldType;
}

export interface FormWizardProps {
  data: any;
  field: FormFieldProps[];
  style?: ViewStyle;
  setValue?: (value: any, path: any) => void;
  onSubmit?: (data?: any) => void;
  children?: any;
}

export default observer((props: FormWizardProps) => {
  const { field, style, setValue, data, onSubmit, children } = props;
  const meta = useObservable({
    initError: false,
    validate: {}
  });
  return (
    <Form data={data} style={style} onSubmit={onSubmit}>
      {field.map(f => {
        return (
          <RenderChild
            key={f.path}
            fieldProps={f}
            meta={meta}
            data={data}
            setValue={setValue}
          />
        );
      })}
      {children ? (
        children
      ) : (
        <Button type={"submit"}>
          <Text>Submit</Text>
        </Button>
      )}
    </Form>
  );
});

const RenderChild = observer((props: any) => {
  const { setValue, data, meta, fieldProps } = props;
  const defaultSetValue = (value: any, path: any) => {
    if (setValue) setValue(value, path);
    else {
      if (data) {
        _.set(data, path, value);
      } else {
        console.error("Failed to set value: Form data props is undefined");
      }
    }
    if (meta.initError) meta.initError = false;
  };
  const Children = Element[fieldProps.fieldType];
  const cfieldProps: any = { ...fieldProps.field };
  return (
    <Field
      {...fieldProps}
      value={data[fieldProps.path]}
      setValue={value => defaultSetValue(value, fieldProps.path)}
    >
      <Children {...cfieldProps}></Children>
    </Field>
  );
});
