import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { ScrollViewProps } from "react-native";
import { ThemeProps } from "../../themes";
import { uuid } from "../../utils";
import Field from "../Field";
import View from "../View";
import { toJS } from "mobx";

export interface FormProps extends ScrollViewProps {
  data?: any;
  setValue?: (value: any, path: any) => void;
  children?: any;
  theme?: ThemeProps;
  onSubmit?: (data?: any) => void;
  onError?: (error?: any) => void;
  onFieldFunction?: (data?: any) => void;
  reinitValidate?: () => boolean;
}

export default observer((props: FormProps) => {
  const {
    children,
    data,
    setValue,
    onSubmit,
    onFieldFunction,
    onError
  } = props;
  const meta = useObservable({
    validate: [],
    initError: 0
  });
  const style = {
    ...(_.get(props, "style", {}) as any)
  };

  useEffect(() => {
    meta.validate = [];
    validateCheck(children);
  }, [data]);

  const validateCheck = child => {
    if (child) {
      if (Array.isArray(child)) {
        child.map(el => {
          if (Array.isArray(el)) {
            validateCheck(el);
          } else if (el && el.props && Array.isArray(el.props.children)) {
            validateCheck(el.props.children);
          } else {
            if (el && el.props && el.props.isRequired && el.props.path) {
              let idx = meta.validate.findIndex(x => x.key === el.props.path);
              if (idx === -1) {
                meta.validate.push({
                  key: el.props.path,
                  label: el.props.label || el.props.path,
                  status: !!_.get(data, el.props.path)
                });
              } else {
                meta.validate[idx] = {
                  key: el.props.path,
                  label: el.props.label || el.props.path,
                  status: !!_.get(data, el.props.path)
                };
              }
            }
          }
        });
      } else {
        if (child.props && child.props.isRequired && child.props.path)
          meta.validate[child.props.path] = {
            label: child.props.label || child.props.path,
            status: !!_.get(data, child.props.path)
          };
        let idx = meta.validate.findIndex(x => x.key === child.props.path);
        if (idx === -1) {
          meta.validate.push({
            key: child.props.path,
            label: child.props.label || child.props.path,
            status: !!_.get(data, child.props.path)
          });
        } else {
          meta.validate[idx] = {
            key: child.props.path,
            label: child.props.label || child.props.path,
            status: !!_.get(data, child.props.path)
          };
        }
      }
    }
  };
  return (
    <View style={style}>
      {children && Array.isArray(children) ? (
        children.map((el: any) => {
          return (
            <RenderChild
              data={data}
              setValue={setValue}
              child={el}
              key={uuid()}
              meta={meta}
              onFieldFunction={onFieldFunction}
              onSubmit={onSubmit}
              onError={onError}
            />
          );
        })
      ) : (
        <RenderChild
          data={data}
          setValue={setValue}
          child={children}
          key={uuid()}
          meta={meta}
          onFieldFunction={onFieldFunction}
          onSubmit={onSubmit}
          onError={onError}
        />
      )}
    </View>
  );
});

const RenderChild = observer((props: any) => {
  const {
    data,
    child,
    setValue,
    meta,
    onSubmit,
    onFieldFunction,
    onError
  } = props;
  if (Array.isArray(child)) {
    return child.map(el => (
      <RenderChild
        data={data}
        setValue={setValue}
        child={el}
        key={uuid()}
        meta={meta}
        onSubmit={onSubmit}
        onError={onError}
      />
    ));
  }
  if (!child || !child.type || !child.props) {
    return child;
  }
  const onPress = e => {
    let i = 0;
    meta.validate.map(item => {
      if (!item.status) {
        ++i;
      }
    });
    meta.initError = i;
    if (i === 0 && onSubmit) {
      onSubmit(data);
    } else if (i > 0) {
      onError(meta.validate);
    }
  };

  const defaultSetValue = (value: any, path: any) => {
    if (!!setValue) setValue(value, path);
    else {
      if (data) {
        _.set(data, path, value);
      } else {
        alert("Failed to set value: Form data props is undefined");
      }
    }
  };

  if (typeof child.props.children === "function") {
    let fc = null;

    if (onFieldFunction) {
      fc = onFieldFunction(
        child.props.children,
        _.get(data, child.props.path, []),
        defaultSetValue,
        child.props.path
      );
    } else {
      fc = child.props.children(_.get(data, child.props.path, []));
    }

    return React.cloneElement(child, {
      ...child.props,
      children: fc
    });
  } else if (child.type === Field) {
    let custProps: any;
    const isValid = value => {
      let idx = meta.validate.findIndex(x => x.key === child.props.path);
      if (idx > -1) {
        meta.validate[idx].status = value;
      }
    };
    if (child.props.type === "submit") {
      custProps = {
        ...custProps,
        onPress: onPress
      };
    } else {
      custProps = {
        ...custProps,
        isValid: isValid,
        value: _.get(data, child.props.path),
        setValue: (value: any) => defaultSetValue(value, child.props.path)
      };
    }
    if (child.props.isRequired) {
      custProps = {
        ...custProps,
        isValidate: meta.initError
      };
    }
    return React.cloneElement(child, {
      ...custProps,
      ...child.props
    });
  } else {
    const childrenRaw = _.get(child, "props.children");
    const hasChildren = !!childrenRaw;
    if (!hasChildren) {
      return child;
    } else if (child.props) {
      const children = Array.isArray(childrenRaw) ? childrenRaw : [childrenRaw];
      const props = { ...child.props };
      if (child.props.type === "submit") {
        props.onPress = onPress;
      }
      return React.cloneElement(child, {
        ...props,
        children: children.map(el => (
          <RenderChild
            data={data}
            setValue={setValue}
            child={el}
            key={uuid()}
            meta={meta}
            onSubmit={onSubmit}
            onError={onError}
          />
        ))
      });
    }
  }
});
