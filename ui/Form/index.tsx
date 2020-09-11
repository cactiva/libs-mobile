import _ from "lodash";
import { toJS } from "mobx";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { uuid } from "../../utils";
import Button from "../Button";
import Field from "../Field";
import View, { IViewProps } from "../View";
import { ViewStyle } from "react-native";

export interface IFromProps extends IViewProps {
  data?: any;
  style?: ViewStyle;
  children?: any;
  setValue?: (value, path) => void;
  onSubmit?: (data) => void;
  onError?: (fields?: any) => void;
  reinitValidate?: () => boolean;
}

export default observer((props: IFromProps) => {
  const { children, style } = props;
  const meta = useObservable({
    fields: [],
    submit: false,
  });
  meta.fields = [];

  return (
    <View style={style}>
      {Array.isArray(children) ? (
        children.map((el) => (
          <RenderChild key={uuid()} child={el} meta={meta} formProps={props} />
        ))
      ) : (
        <RenderChild
          key={uuid()}
          child={children}
          meta={meta}
          formProps={props}
        />
      )}
    </View>
  );
});

const RenderChild = observer((props: any) => {
  const { child, meta, formProps } = props;
  const { data, setValue, onSubmit, onError } = formProps;
  let custProps: any = child.props;
  const updateFields = (path, status, label) => {
    let field = meta.fields.find((x) => x.path === path);
    if (!!field) {
      field.status = status;
    } else {
      meta.fields.push({
        path,
        label,
        status,
      });
    }
  };
  const defaultSetValue = (value: any, path: any) => {
    if (!!setValue) setValue(value, path);
    else {
      if (!!data && !!path) {
        _.set(data, path, value);
      } else if (!data) {
        alert(`Failed to set value to ${path}: Form data props is undefined`);
      }
    }
    updateFields(
      path,
      !(value === undefined || value === null || value === ""),
      custProps.label
    );
  };
  const onPress = () => {
    meta.submit = true;
    let err = meta.fields.filter((e) => !e.status);
    if (err.length === 0) {
      onSubmit && onSubmit(data);
    } else {
      onError && onError(toJS(err));
    }
  };

  if (child.type === Field) {
    let cstmValidate = custProps.validate;

    const validate = () => {
      let msgs: string[] = [];
      let field = meta.fields.find((x) => x.path === custProps.path);
      if (!!field && !field.status) msgs.push("Field is required.");
      else msgs = [];
      if (!!cstmValidate) {
        let customMsgs: string[] = cstmValidate();
        msgs = [...msgs, ...customMsgs];
        if (msgs.length > 0 && !!field) field.status = false;
      }

      return !!meta.submit ? msgs : [];
    };

    custProps = {
      ...custProps,
      validate,
      value: _.get(custProps, "value", "") || _.get(data, custProps.path, ""),
      setValue: (value: any) => defaultSetValue(value, custProps.path),
    };

    useEffect(() => {
      let val = true;
      if (custProps.isRequired) {
        let v = _.get(data, custProps.path, undefined);
        val = !(v === undefined || v === null || v === "");
      }
      updateFields(custProps.path, val, custProps.label);
    }, [_.get(data, custProps.path)]);
    const Component = child.type;
    return <Component {...custProps} />;
  } else if (
    child.type === Button &&
    !!custProps.type &&
    custProps.type.toLowerCase() == "submit"
  ) {
    custProps = {
      ...custProps,
      onPress: onPress,
    };
    const Component = child.type;
    return <Component {...custProps} />;
  } else if (Array.isArray(child)) {
    return child.map((el) => (
      <RenderChild key={uuid()} child={el} meta={meta} formProps={formProps} />
    ));
  } else if (!child || !child.type || !child.props || !child.props.children) {
    return child;
  } else {
    const custProps = child.props;
    const Component = child.type;
    const children = child.props.children;
    return (
      <Component {...custProps}>
        {Array.isArray(children) ? (
          children.map((el) => (
            <RenderChild
              key={uuid()}
              child={el}
              meta={meta}
              formProps={formProps}
            />
          ))
        ) : (
          <RenderChild child={children} meta={meta} formProps={formProps} />
        )}
      </Component>
    );
  }
});
