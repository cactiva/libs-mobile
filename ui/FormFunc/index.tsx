import _ from "lodash";
import { toJS } from "mobx";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect, useState, Component } from "react";
import { uuid } from "../../utils";
import Button, { IButtonProps } from "../Button";
import Field from "../Field";
import View, { IViewProps } from "../View";
import { ViewStyle } from "react-native";
import Text from "../Text";

interface IField {
  path: string;
  label: string;
  required: boolean;
  status: boolean;
  messages: string[];
}

export interface IInitializeForm {
  field?: (path: string, label: string, isRequired: boolean) => void;
  getValue?: (path: string) => string | number | undefined | null;
  setValue?: (path: string, value: any) => void;
  validate?: (path: string) => string[];
  remove?: (path: string) => void;
  submit?: () => void;
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
  onSubmit?: (data?: any) => void;
  onError?: (fields?: any) => void;
  validate?: (data) => string[];
  requiredMessage?: string;
  renderSubmitComponent?: (submit: () => void) => void;
  submitProps?: IButtonProps;
}

export default observer((props: IFromProps) => {
  const {
    children,
    style,
    data,
    onSubmit,
    onError,
    renderSubmitComponent,
    submitProps,
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
    return _.get(data, path, undefined);
  };
  const checkValid = (path, value) => {
    let fieldIndex = meta.field.findIndex((x) => x.path === path);
    if (fieldIndex > -1) {
      let required = meta.field[fieldIndex].required;
      if (!!required && (value == null || value == undefined || value == "")) {
        meta.field[fieldIndex].messages = [requiredMessage];
        meta.field[fieldIndex].status = false;
      } else {
        meta.field[fieldIndex].status = true;
        meta.field[fieldIndex].messages = [];
      }
      if (typeof props.validate == "function") {
        let err = props.validate(data);
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
    checkValid(path, value);
    if (typeof props.setValue == "function") {
      props.setValue(path, value);
    } else {
      _.set(data, path, value);
    }
  };
  const validate = (path) => {
    let field = meta.field.find((x) => x.path === path);
    if (!!field) {
      return field.messages;
    }
    return [];
  };
  const submit = () => {
    let field = meta.field;
    field.map((x) => {
      let path = x.path,
        value = _.get(data, path, undefined);
      checkValid(path, value);
    });
    const error = meta.field.filter((x) => x.status == false);
    if (error.length > 0) {
      onError(error);
    } else {
      onSubmit(data);
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
      {typeof renderSubmitComponent === "function" ? (
        renderSubmitComponent(submit)
      ) : (
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
