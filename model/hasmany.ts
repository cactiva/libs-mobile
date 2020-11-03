import { makeObservable, observable, runInAction } from "mobx";
import { Model } from "./model";

export interface HasManyObject<T extends Model> {
  list: T[];
  load: (where?: IWhere<T>) => Promise<void>;
}
interface ILoadOptions<T extends Model> {
  fetch: (where?: IWhere<T>) => Promise<T[]>;
  create: (props: any) => T;
  where?: IWhere<T>;
}

interface IWhere<T> {}

export interface HasManyOptions<T extends Model<Model<K>>, K extends Model> {
  init?: (hasmany: HasManyClass<T, K>) => void;
  autoload?: boolean;
  constructor?: Function;
  list?: T[];
  load?: (opt?: ILoadOptions<T>) => Promise<T[]>;
}

export class HasManyClass<T extends Model<Model<K>>, K extends Model>
  implements HasManyObject<T> {
  static __type = "hasmany";

  opt: HasManyOptions<T, K>;
  list: T[] = [];
  parent: K;
  private creator: new () => T;

  constructor(parent: K, creator: new () => T, opt: HasManyOptions<T, K> = {}) {
    this.parent = parent;
    this.creator = creator;
    this.opt = opt;
  }

  protected init(opt: HasManyOptions<T, K> = {}) {
    Object.keys(opt).forEach((i) => {
      (this.opt as any)[i] = (opt as any)[i];
    });

    if (this.opt.list) {
      this.list = this.opt.list;
    }

    makeObservable(this, {
      list: observable,
    });

    if (!this.opt.init) {
      if (this.opt.autoload !== false) {
        this.load();
      }
    } else {
      this.opt.init(this);
    }
  }

  create = (props: any = {}, mapping?: any) => {
    const result = new this.creator();
    result._parent = this.parent;
    (result as any)._opt = {
      ...(result as any)._opt,
      autoload: this.opt.autoload,
    };

    if (result && (result as Model)._loadJSON) {
      (result as any)._initMobx(result); //TODO: this should not privately access _initMobx >.<

      if (typeof mapping === "function") {
        (result as Model)._loadJSON(props, mapping(props));
      } else {
        (result as Model)._loadJSON(props, mapping);
      }
    }
    return result;
  };

  async load(where?: IWhere<T>) {
    const fetch = async (where?: IWhere<T>): Promise<T[]> => {
      //TODO: Execute Actual data loading to server
      return [];
    };

    let result: any;
    if (this.opt.load) {
      result = await this.opt.load({
        fetch,
        create: this.create,
        where,
      });
    } else {
      result = (await fetch(where)).map((e) => this.create(e));
    }

    runInAction(() => (this.list = result));
  }
}
