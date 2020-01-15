import { generateDeleteString } from '@src/libs/utils/genDeleteString';
import { generateInsertString } from '@src/libs/utils/genInsertString';
import { generateQueryString } from '@src/libs/utils/genQueryString';
import { generateUpdateString } from '@src/libs/utils/genUpdateString';
import { queryAll } from '@src/libs/utils/gql';
import _ from 'lodash';
import { toJS } from 'mobx';
import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import useAsyncEffect from "use-async-effect";
import Table from '../Table';
import TableHead from '../Table/TableHead';
import TableRow from '../Table/TableRow';
import Text from '../Text';
import View from '../View';
import { View as ViewNative } from 'react-native';
import BaseTemplate from './BaseTemplate';


export default observer(({ data, children, template, idKey = "id", itemPerPage = 25, style, onChange }: any) => {
    const structure = _.get(data, 'structure', null);
    const paging = _.get(data, 'paging', {
        total: 1,
        current: 1,
        itemPerPage,
        count: 0
    });
    const auth = _.get(data, 'auth');
    const Template = template ? template : BaseTemplate;
    const props = {
        table: {
            root: null,
            row: null,
            head: null
        },
        form: null,
        title: null,
        actions: null
    };
    const meta = useObservable({
        mode: '',
        form: {},
        loading: {
            list: false,
            form: false
        },
        subCrudQueries: {}
    });

    const castedIdKey = _.startCase(idKey);

    children.map((e) => {
        if (e.type === Table) {
            props.table.root = {
                ...e.props,
                onSort: (r, mode) => {
                    if (r) {
                        if (mode) {
                            structure.orderBy = [{
                                name: r,
                                value: mode,
                                valueType: 'StringValue'
                            }]
                        } else {
                            structure.orderBy = []
                        }
                        reloadList();
                    }
                }
            };
            if (structure && structure.orderBy.length > 0) {
                props.table.root.config = {
                    sortMode: _.get(structure, 'orderBy.0.value'),
                    sortField: _.get(structure, 'orderBy.0.name'),
                }
            }

            _.castArray(e.props.children).map(c => {
                if (c.type === TableRow) {
                    props.table.row = {
                        ...c.props, children: _.castArray(c.props.children)
                            .filter(r => {
                                return r.props.path !== idKey;
                            })
                            .map(r => {
                                return r;
                            })
                    };
                } else if (c.type === TableHead) {
                    props.table.head = {
                        ...c.props, children: _.castArray(c.props.children).filter(r => {
                            return r.props.title !== castedIdKey;
                        })
                    };
                }
            })
        } else if (e.type === Text) {
            props.title = { ...e.props };
        } else if (e.type === View || e.type === ViewNative) {
            props.actions = { ...e.props };
        } else {
            props.form = e;
        }
    })

    const reloadList = async () => {
        if (structure) {
            meta.loading.list = true;
            const currentPage = _.get(paging, 'current', 1)
            const orderBy = structure.orderBy.length > 0 ? structure.orderBy : [{
                name: idKey,
                value: 'desc',
                valueType: 'StringValue'
            }];
            const query = generateQueryString({
                ...structure, orderBy, options: {
                    ...structure.options,
                    limit: itemPerPage,
                    offset: (currentPage - 1) * itemPerPage
                }
            });
            const res = await queryAll(query, { auth: data.auth });
            _.map(res, (e) => {
                if (e.aggregate) {
                    const count = e.aggregate.count
                    data.paging.count = count;
                    if (!data.paging.current)
                        data.paging.current = 1;
                    data.paging.total = Math.ceil(count / itemPerPage);
                } else {
                    data.list = e || [];
                }
            });
            meta.loading.list = false;
        }
    };
    useAsyncEffect(reloadList, [structure]);
    return <Template {...data}
        paging={paging}
        style={style}
        props={props}
        idKey={idKey}
        mode={meta.mode}
        loading={meta.loading}
        subCrudQueries={meta.subCrudQueries}
        actions={{
            edit: (input) => {
                meta.mode = 'edit';
                data.form = input;
            },
            create: () => {
                meta.mode = 'create';
                data.form = {};
            },
            prevPage: () => {
                if (paging.current - 1 > 0) {
                    paging.current--;
                    reloadList();
                }
            },
            nextPage: () => {
                if (paging.current + 1 <= paging.total) {
                    paging.current++;
                    reloadList();
                }
            },
            delete: async () => {
                const q = generateDeleteString(structure, {
                    where: [
                        {
                            name: idKey,
                            operator: '_eq',
                            value: data.form[idKey],
                            valueType: 'Int'
                        }
                    ]
                });

                meta.loading.form = true;
                await queryAll(q.query, { auth });
                meta.mode = '';
                meta.loading.form = false;
                await reloadList();
                if (onChange) {
                    onChange({
                        action: 'delete',
                        form: data.form,
                    })
                }
            },
            save: async () => {
                let q = null;

                switch (meta.mode) {
                    case 'create':
                        q = generateInsertString(structure, toJS(data.form));

                        meta.loading.form = true;
                        const res = await queryAll(q.query, { variables: q.variables, auth });
                        await executeSubCrudActions(meta, res[idKey]);
                        await reloadList();
                        meta.loading.form = false;
                        meta.mode = '';
                        data.form[idKey] = res[idKey];
                        if (onChange) {
                            onChange({
                                action: 'insert',
                                form: data.form,
                            })
                        }

                        break;
                    case 'edit':
                        q = generateUpdateString(structure, toJS(data.form), {
                            where: [
                                {
                                    name: idKey,
                                    operator: '_eq',
                                    value: data.form[idKey],
                                    valueType: 'Int'
                                }
                            ]
                        });

                        meta.loading.form = true;
                        await queryAll(q.query, { variables: q.variables, auth });
                        await executeSubCrudActions(meta, data.form[idKey]);
                        await reloadList();
                        meta.loading.form = false;
                        meta.mode = '';
                        if (onChange) {
                            onChange({
                                action: 'update',
                                form: data.form,
                            })
                        }
                        break;
                    default:
                        meta.mode = '';
                        break;
                }

                data.form = {};
            },
            cancel: async () => {
                meta.mode = '';
                data.form = {};
            }
        }} />;
});

const executeSubCrudActions = async (meta: any, id: any) => {
    await Promise.all(_.values(meta.subCrudQueries).map(async m => {
        const insert = _.values(m.insert).map(s => {
            const q = generateInsertString(s.structure.table, {
                ...s.data,
                [s.foreignKey]: id
            })
            return queryAll(q.query, { variables: q.variables, auth: s.structure.auth });
        });
        const update = _.values(m.update).map(s => {
            const q = generateUpdateString(s.structure.table, s.foreignKey ? {
                ...s.data,
                [s.foreignKey]: id
            } : s.data, {
                where: [{
                    name: s.idKey,
                    operator: '_eq',
                    value: s.data[s.idKey],
                    valueType: 'IntVal'
                }]
            })
            return queryAll(q.query, { variables: q.variables, auth: s.structure.auth });
        });
        const del = _.values(m.delete).map(s => {
            const q = generateDeleteString(s.structure.table, {
                where: [{
                    name: s.idKey,
                    operator: '_eq',
                    value: s.data[s.idKey],
                    valueType: 'IntVal'
                }]
            })
            return queryAll(q.query, { auth: s.structure.auth });
        });
        return Promise.all([...insert, ...update, ...del]);
    }));

    meta.subCrudQueries = {};
}