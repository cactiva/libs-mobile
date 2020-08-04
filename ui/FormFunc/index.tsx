import _ from "lodash";
import { toJS } from "mobx";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { uuid } from "../../utils";
import Button from "../Button";
import Field from "../Field";
import View, { IViewProps } from "../View";
import { ViewStyle } from "react-native";

interface ErrorField {
  [key: string]: string[];
}

export interface IFromProps extends IViewProps {
  data?: any;
  style?: ViewStyle;
  children?: ({ getValue, setValue, validate, submit, isRequired }) => void;
  setValue?: (path, value) => void;
  onSubmit?: (data?: any) => void;
  onError?: (fields?: any) => void;
  validate?: (data) => ErrorField;
  required?: string[];
  requiredMessage?: string;
}

export default observer((props: IFromProps) => {
  const { children, style, data, onSubmit, onError } = props;
  const requiredMessage = props.requiredMessage || "Field is required.";
  const required = props.required || [];
  const meta = useObservable({
    error: {},
  });
  const getValue = (path) => {
    return _.get(data, path, undefined);
  };
  const setValue = (path, value) => {
    if (!value) {
      meta.error[path] = [requiredMessage].concat(meta.error[path]);
    } else {
      if (!!props.validate) {
        let err = props.validate(data);
        meta.error[path] = err[path];
      } else {
        meta.error[path] = [];
      }
    }
    if (!!props.setValue) {
      props.setValue(path, value);
    } else {
      _.set(data, path, value);
    }
  };
  const validate = (path) => {
    return _.get(meta.error, path, []);
  };

  const submit = () => {
    required.map((k) => {
      let v = _.get(data, k, undefined);
      if (v != undefined && v != null && v != "") {
        meta.error[k] = [];
      } else {
        meta.error[k] = [requiredMessage];
      }
    });
    if (!!props.validate) {
      let err = props.validate(data);
      Object.keys(err).map((k) => {
        meta.error[k] = meta.error[k].concat(err[k]);
      });
    }
    if (Object.keys(meta.error).length > 0) {
      onError(Object.keys(meta.error));
    } else {
      onSubmit(data);
    }
  };

  const isRequired = (path) => {
    return required.indexOf(path) > -1;
  };

  return (
    <View style={style}>
      {children({ getValue, setValue, validate, submit, isRequired })}
    </View>
  );
});
