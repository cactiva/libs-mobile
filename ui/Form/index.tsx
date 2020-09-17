import _ from "lodash";
import { toJS } from "mobx";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import { ViewStyle } from "react-native";
import Button, { IButtonProps } from "../Button";
import Text from "../Text";
import View, { IViewProps } from "../View";

interface IField {
  path: string;
  label: string;
  required: boolean;
  status: boolean;
  messages: string[];
}

interface IError {
  path: string;
  message: string;
}

export interface IInitializeForm {
  field?: (path: string, label: string, isRequired: boolean) => void;
  getValue?: (path: string) => string | number | undefined | null;
  setValue?: (path: string, value: any) => void;
  validate?: (path: string) => string[];
  remove?: (path: string) => void;
  submit?: (params?: any) => void;
}

export interface IFromProps extends IViewProps {
  data?: any;
  style?: ViewStyle;
  // children?: ({ getValue, setValue, validate, submit, isRequired }) => void;
  children?: ({
    field,
    getValue,
    setValue,
    validate,
    remove,
    submit,
  }: IInitializeForm) => void;
  setValue?: (path: string, value: any) => void;
  onSubmit?: (data?: any, params?: any) => void;
  onError?: (fields?: any) => void;
  validate?: (data) => IError[];
  requiredMessage?: string;
  renderSubmitComponent?: (submit: () => void) => void;
  submitProps?: IButtonProps;
  disableSubmitComponent?: boolean;
}

export default observer((props: IFromProps) => {
  const {
    children,
    style,
    onSubmit,
    onError,
    renderSubmitComponent,
    submitProps,
    disableSubmitComponent,
  } = props;
  const requiredMessage = props.requiredMessage || "Field is required.";
  const meta = useObservable({
    field: [] as IField[],
  });
  const field = (path, label, required) => {
    meta.field.push({
      path,
      label,
      required,
      status: true,
      messages: [],
    });
  };
  const getValue = (path) => {
    return _.get(props.data, path);
  };
  const checkValid = (path, value) => {
    let fieldIndex = meta.field.findIndex((x) => x.path === path);
    if (fieldIndex > -1) {
      let required = meta.field[fieldIndex].required;
      if (
        !!required &&
        (value === null || value === undefined || value === "")
      ) {
        meta.field[fieldIndex].messages = [requiredMessage];
        meta.field[fieldIndex].status = false;
      } else {
        meta.field[fieldIndex].status = true;
        meta.field[fieldIndex].messages = [];
      }
      if (typeof props.validate == "function") {
        let err = props
          .validate(props.data)
          .filter((x) => (typeof x === "object" ? x.path === path : true))
          .map((x) => {
            if (typeof x == "object") return x.message;
            else return x;
          });
        meta.field[fieldIndex].messages = meta.field[
          fieldIndex
        ].messages.concat(err);
        if (meta.field[fieldIndex].messages.length > 0) {
          meta.field[fieldIndex].status = false;
        } else {
          meta.field[fieldIndex].status = true;
        }
      }
    }
  };
  const setValue = (path, value) => {
    if (typeof props.setValue == "function") {
      props.setValue(path, value);
    } else {
      let d = toJS(props.data);
      _.set(d, path, value);
      props.data = d;
    }
    checkValid(path, value);
  };
  const validate = (path) => {
    let field = meta.field.find((x) => x.path === path);
    if (!!field) {
      return field.messages;
    }
    return [];
  };
  const submit = (params?: any) => {
    let field = meta.field;
    field.map((x) => {
      let path = x.path,
        value = _.get(props.data, path);
      checkValid(path, value);
    });
    const error = meta.field.filter((x) => x.status == false);
    if (error.length > 0) {
      onError(error);
    } else {
      onSubmit(toJS(props.data), params);
    }
  };
  const remove = (path) => {
    let fieldIndex = meta.field.findIndex((x) => x.path === path);
    if (fieldIndex > -1) {
      meta.field.splice(fieldIndex, 1);
    }
  };
  const canSubmit = () => {
    const error = meta.field.filter((x) => x.status == false);
    return error.length === 0;
  };
  return (
    <View style={style}>
      {children({ field, getValue, setValue, validate, remove, submit })}
      {typeof renderSubmitComponent === "function"
        ? renderSubmitComponent(submit)
        : !disableSubmitComponent && (
            <Button
              style={{
                marginTop: 15,
              }}
              onPress={submit}
              disabled={canSubmit()}
              {...submitProps}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: "500",
                }}
              >
                Save
              </Text>
            </Button>
          )}
    </View>
  );
});
