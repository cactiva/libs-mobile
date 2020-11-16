import debounce from "lodash.debounce";
import {
  action,
  computed,
  IReactionDisposer,
  makeObservable,
  observable,
  reaction,
  runInAction,
  toJS,
} from "mobx";
import { AsyncStorage } from "react-native";
import { HasManyClass, HasManyOptions } from "./hasmany";

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
  // private static _primaryKey = "id";
  // private static _tableName = "";
  // private static _modelName = "";
  private _init: boolean = false;

  constructor(options?: ModelOptions) {}

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

  public _hasMany<T extends Model<M>>(
    modelCTor: typeof Model,
    opt?: HasManyOptions<T, M>,
    ext?: any
  ): HasManyClass<T, M> {
    const ctor = modelCTor;

    let autoload = false;
    const parentOpt = (this as any)._opt;
    if (parentOpt.autoload !== undefined) {
      if (!opt || (opt && opt.autoload === undefined)) {
        autoload = parentOpt.autoload;
      }
    }

    const current: any = new HasManyClass<T, M>(this as any, ctor as any, {
      ...opt,
      autoload,
    });
    for (let i in ext) {
      if (current[i] === undefined) {
        if (typeof ext[i] === "function") {
          current[i] = (ext[i] as any).bind(current);
        } else {
          current[i] = ext[i];
        }
      }
    }

    return current;
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
          if ((this as any)[i] instanceof HasManyClass) {
            result[i] = (this as any)[i].list.map((e: any, idx: number) => {
              if (!(e instanceof Model)) {
                throw new Error(
                  `${i}.list[${idx}] is not a Model (current type: ${typeof e}). Please check your code where you change ${i}.list`
                );
              } else {
                if (e.constructor === this.constructor) {
                  return JSON.stringify(e);
                }
              }
              return e._json;
            });
          } else {
            if (Array.isArray(self[i])) {
              let res = self[i].map((x: any) => {
                if (x instanceof Model) {
                  return x._json;
                }
                return x;
              });
              result[i] = toJS(res);
            } else {
              result[i] = toJS(self[i]);
            }
          }
        } else {
          result[i] = self[i];
        }
      }
    }
    return result;
  }

  protected _beforeLoad?: (obj: any) => Promise<any>;
  protected _afterLoad?: (obj: Model) => Promise<void>;

  private async _load() {
    //TODO: fetch actual data from server...
    let value = {};

    if (this._beforeLoad) {
      value = await this._beforeLoad(value);
    }

    this._loadJSON(value);

    if (this._afterLoad) {
      await this._afterLoad(this);
    }
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
          } else if (this[key] instanceof HasManyClass) {
            const c: HasManyClass<Model<M>, M> = this[key];
            const result = value[i].map((e: any) => {
              return c.create(e, valueMeta);
            });

            this[key].list = result;
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

  static __type = "model";
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

const saveStorage = debounce((storeName, obj) => {
  let str = JSON.stringify(obj);
  AsyncStorage.setItem(storeName, str);
}, 3000);
