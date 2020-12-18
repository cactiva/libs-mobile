import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  action,
  computed,
  IReactionDisposer,
  isObservable,
  makeObservable,
  observable,
  reaction,
  runInAction,
  toJS,
} from "mobx";

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export interface ModelOptions {
  autoload?: boolean;
  localStorage?: boolean;
  storageName?: string;
}

export interface IQuery<T> {
  take?: number;
  skip?: number;
}

export abstract class Model<M extends Model = any> {
  public _parent?: M;
  private _opt: ModelOptions = {};
  static __type = "model";

  constructor() {}

  public _afterLoadStorage(data: Model) {}

  public static create<T extends Model>(
    this: { new (options: ModelOptions): T },
    options?: ModelOptions
  ) {
    const obj = new this(options ?? {}) as T;

    if (options) {
      obj._opt = options;
    }

    obj._initMobx(obj);

    return obj;
  }

  public static childOf<T extends Model>(
    this: { new (options: ModelOptions): T },
    parent: Model,
    options?: ModelOptions
  ) {
    const obj = new this(options ?? {}) as T;

    if (options) {
      obj._opt = options;
    }

    obj._parent = parent;

    return obj;
  }

  private async _initMobx(self: any) {
    if (self._init) return;
    const obj = {} as any;

    const props: string[] = [];

    for (let i of Object.getOwnPropertyNames(self)) {
      if (i.indexOf("_") === 0) continue;

      const val = self[i];
      let isObservable = true;
      const type = getType(val);
      switch (type) {
        case "model":
          props.push(i);
          if (val._parent === self) {
            if (!!this._opt.localStorage) {
              val._opt.localStorage = true;
            }
            val._initMobx(val);
            isObservable = false;
          }
          break;
      }

      if (isObservable) {
        if (typeof val !== "function") {
          obj[i] = observable;
          props.push(i);
        }
      }
      self._init = true;
    }

    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(self));
    for (let i of methods) {
      if (i !== "constructor" && i.indexOf("_") !== 0) {
        if (typeof self[i] === "function") {
          obj[i] = action;
        } else {
          obj[i] = computed;
        }
      }
    }

    makeObservable(this, obj);

    if (!!this._opt.localStorage) {
      this._opt.localStorage = true;

      if (!this._parent) {
        // children model will be loaded from it's parent
        // so, we load only the parent
        // and it will extract it's value to it's children.
        await this.loadFromLocalStorage(props);

        // Edit loaded data from local storage
        if (!!this._afterLoadStorage) {
          this._afterLoadStorage(this._json);
        }
      }

      props.forEach((e) => {
        this.observeProperty(e);
      });
    }
  }

  private _observedProperties: IReactionDisposer[] = [];
  private observeProperty(key: string) {
    if (!!key && key[0] === "_") return;
    if (!this._observedProperties) this._observedProperties = [];
    const prop = (this as any)[key];

    if (prop instanceof Model) {
      prop._addReaction(() => {
        this.saveToLocalStorage(this._json);
      });
    } else {
      this._observedProperties.push(
        reaction(
          () => (this as any)[key],
          () => {
            if (!this._parent) {
              this.saveToLocalStorage(this._json);
            } else {
              this._reactions.forEach((e) => {
                e();
              });
            }
          }
        )
      );
    }
  }

  private _reactions: (() => void)[] = [];
  protected _addReaction(fun: () => void) {
    if (!this._reactions) this._reactions = [];
    this._reactions.push(fun);
  }

  public _destroy() {
    this._observedProperties.forEach((e) => {
      e();
    });

    for (let i in this) {
      if (this[i] instanceof Model) {
        (this[i] as any)._destroy();
      }
    }
  }

  private async loadFromLocalStorage(props: string[]) {
    let storeName = this._opt.storageName || this.constructor.name;

    let data = await AsyncStorage.getItem(storeName);
    let dataStr: any = !!data ? data : "{}";

    try {
      const content = JSON.parse(dataStr);
      this._loadJSON(content);
    } catch (e) {}
  }

  private saveToLocalStorage(obj: any) {
    let storeName = this._opt.storageName || this.constructor.name;
    let str = JSON.stringify(obj);
    AsyncStorage.setItem(storeName, str);
  }

  get _json() {
    const result: any = {};
    const self: any = this;
    const except = Object.getOwnPropertyNames(Object.getPrototypeOf(self));

    for (let i of Object.getOwnPropertyNames(self)) {
      if (except.indexOf(i) > -1) {
        continue;
      }
      if (
        i !== "constructor" &&
        i.indexOf("_") !== 0 &&
        typeof self[i] !== "function"
      ) {
        if (self[i] instanceof Model) {
          if (self[i].constructor === this.constructor) {
            return JSON.stringify(self[i]);
          }
          result[i] = self[i]._json;
        } else if (typeof self[i] === "object") {
          if (Array.isArray(self[i])) {
            let res = self[i].map((x: any) => {
              if (x instanceof Model) {
                x = x._json;
              }
              if (isObservable(x)) {
                x = toJS(x);
              }
              return x;
            });
            result[i] = toJS(res);
          } else {
            result[i] = toJS(self[i]);
          }
        } else {
          result[i] = self[i];
        }
      }
    }
    return result;
  }

  _loadJSON(obj: any, mapping?: any) {
    let value: Model<M> = obj;
    const except = Object.getOwnPropertyNames(Object.getPrototypeOf(this));

    const applyValue = (
      key: string,
      value: any,
      processValue?: (value: any, a: any) => any
    ) => {
      if (typeof processValue === "function") {
        return processValue(value, (this as any)[key]);
      }
      return value;
    };

    let i: keyof Model<M>;
    try {
      for (i in value) {
        let key: keyof Model<M> = i;
        let valueMeta: any = undefined;
        if (except.indexOf(key) > -1) {
          continue;
        }

        if (mapping) {
          if (mapping[i]) {
            if (Array.isArray(mapping[i])) {
              if (mapping[i].length === 2) {
                key = mapping[i][0];
                valueMeta = mapping[i][1];
              }
            } else {
              key = mapping[i];
            }
          } else if (this[i] === undefined) {
            continue;
          }
        }
        if (typeof this[key] !== "object") {
          runInAction(() => {
            (this as any)[key] = applyValue(key, value[i], valueMeta);
          });
        } else {
          if (this[key] instanceof Model) {
            this[key]._loadJSON(applyValue(key, value[i], valueMeta));
          } else if (typeof value[i] !== "function") {
            runInAction(() => {
              (this as any)[key] = applyValue(key, value[i], valueMeta);
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
    return this;
  }
}

const getType = (obj: any) => {
  if (!!obj && typeof obj === "object") {
    const c: any = obj.constructor;
    if (c && c.__type) {
      return c.__type;
    }
  }
  return undefined;
};
