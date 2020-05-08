import _ from "lodash";
import { toJS } from "mobx";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { uuid } from "../../utils";
import Button from "../Button";
import Field from "../Field";
import View, { IViewProps } from "../View";

export interface IFromProps extends IViewProps {
  data?: any;
  style?: any;
  children?: any;
  setValue?: (value, path) => void;
  onSubmit?: (data) => void;
  onError?: (fields?: any) => void;
  reinitValidate?: () => boolean;
}

export default observer((props: IFromProps) => {
  const {
    children,
    data,
    setValue,
    style,
    onSubmit,
    onError,
    reinitValidate,
  } = props;
  const meta = useObservable({
    fields: [],
    submit: false,
  });

  return (
    <View style={style}>
      {Array.isArray(children) ? (
        children.map((el) => (
          <RenderChild
            data={data}
            setValue={setValue}
            child={el}
            key={uuid()}
            onSubmit={onSubmit}
            meta={meta}
            onError={onError}
          />
        ))
      ) : (
        <RenderChild
          data={data}
          setValue={setValue}
          child={children}
          key={uuid()}
          onSubmit={onSubmit}
          meta={meta}
          onError={onError}
        />
      )}
    </View>
  );
});

const RenderChild = observer((props: any) => {
  const { data, child, setValue, onSubmit, meta, onError } = props;
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
    updateFields(path, !!value, custProps.label);
    if (!!setValue) setValue(value, path);
    else {
      if (data) {
        _.set(data, path, value);
      } else {
        alert(`Failed to set value to ${path}: Form data props is undefined`);
      }
    }
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
    let val = true;
    let cstmValidate = custProps.validate;
    if (custProps.isRequired) {
      val = !!_.get(data, custProps.path, null);
    }

    const validate = () => {
      let msgs: string[] = [];
      let field = meta.fields.find((x) => x.path === custProps.path);
      if (!!field && !field.status) msgs.push("Field is required.");
      if (!!cstmValidate) {
        let customMsgs: string[] = cstmValidate();
        msgs = [...msgs, ...customMsgs];
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
      updateFields(custProps.path, val, custProps.label);
    }, []);
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
      <RenderChild
        data={data}
        setValue={setValue}
        child={el}
        key={uuid()}
        onSubmit={onSubmit}
        meta={meta}
        onError={onError}
      />
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
              data={data}
              setValue={setValue}
              child={el}
              key={uuid()}
              onSubmit={onSubmit}
              meta={meta}
              onError={onError}
            />
          ))
        ) : (
          <RenderChild
            data={data}
            setValue={setValue}
            child={children}
            onSubmit={onSubmit}
            meta={meta}
            onError={onError}
          />
        )}
      </Component>
    );
  }
});
