import { DefaultTheme } from "@src/libs/themes";
import Theme from "@src/theme.json";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Form from "../Form";
import Modal from "../Modal";
import Table from "../Table";
import TableHead from "../Table/TableHead";
import TableRow from "../Table/TableRow";
import Icon from "../Icon";
import { toJS } from "mobx";
import { uuid } from "@src/libs/utils";
export default observer(
  ({
    idKey = "id",
    foreignKey,
    itemPerPage,
    data,
    children,
    onChange,
    structure,
    style
  }: any) => {
    let { list, setValue, queries, path } = data;
    const table = generateTable(children, idKey, data);
    const formRaw = generateForm(children, idKey, data);
    const meta = useObservable({
      action: "",
      currentIndex: -1,
      currentRow: null,
      modalOpened: false,
      bg: "transparent"
    });
    if (!list) {
      list = [];
    }

    useEffect(() => {
      if (!queries[path]) {
        queries[path] = {
          insert: {},
          update: {},
          delete: {}
        };
      }
    }, []);

    const FormEl = formRaw("edit", meta.currentRow);
    return (
      <View style={{ flex: 1, ...style }}>
        <ActionButton
          onPress={() => {
            meta.modalOpened = true;
            meta.action = "insert";
            meta.currentRow = {};
            meta.currentIndex = list.length;

            setTimeout(() => {
              meta.bg = "rgba(0,0,0,.2)";
            }, 100);
          }}
          text="Add"
          style={{
            position: "absolute",
            right: 0,
            marginTop: -36
          }}
        />
        <Table {...table.props} data={list} style={{ flex: 1 }}>
          <TableHead {...table.headProps} />
          <TableRow
            {...table.rowProps}
            onPress={(e, idx) => {
              meta.currentRow = e;
              meta.currentIndex = idx;
              meta.modalOpened = true;
              meta.action = "update";
              setTimeout(() => {
                meta.bg = "rgba(0,0,0,.2)";
              }, 100);
            }}
          />
        </Table>
        {meta.modalOpened && (
          <Modal>
            <View style={{ backgroundColor: meta.bg, flex: 1 }}>
              <View style={[styles.modal]}>
                <View style={styles.modalTitle}>
                  <View style={styles.modalAction}>
                    <TouchableOpacity
                      onPress={() => {
                        meta.modalOpened = false;
                        meta.bg = "transparent";
                      }}
                    >
                      <Icon
                        source={"AntDesign"}
                        name={"arrowleft"}
                        color={theme.primary}
                        size={18}
                      />
                    </TouchableOpacity>
                    <Text style={styles.modalTitleText}>
                      {_.startCase(meta.action)}
                    </Text>
                  </View>
                  <View style={styles.modalAction}>
                    {meta.action === "update" && (
                      <ActionButton
                        onPress={() => {
                          if (confirm("Are you sure ?")) {
                            meta.modalOpened = false;
                            meta.bg = "transparent";
                            if (onChange) {
                              const res = onChange({
                                action: "delete",
                                data: meta.currentRow,
                                index: meta.currentIndex
                              });
                              if (typeof res !== "object" || !res) {
                                return false;
                              } else {
                                meta.currentRow = res;
                              }
                            }
                            list.splice(meta.currentIndex, 1);
                            setValue(list, path);

                            if (meta.currentRow.__insertid) {
                              delete queries[path].insert[
                                meta.currentRow.__insertid
                              ];
                            } else {
                              delete queries[path].update[
                                meta.currentRow[idKey]
                              ];
                              queries[path].delete[meta.currentRow[idKey]] = {
                                structure,
                                idKey,
                                foreignKey,
                                data: toJS(meta.currentRow)
                              };
                            }
                          }
                        }}
                        text="Delete"
                        style={{ backgroundColor: theme.secondary }}
                      />
                    )}
                    <ActionButton
                      onPress={() => {
                        meta.modalOpened = false;
                        meta.bg = "transparent";
                        if (onChange) {
                          const res = onChange({
                            action: meta.action,
                            data: meta.currentRow,
                            index: meta.currentIndex
                          });
                          if (typeof res !== "object" || !res) {
                            return false;
                          } else {
                            meta.currentRow = res;
                          }
                        }

                        if (meta.action === "insert") {
                          meta.currentRow.__insertid = uuid();
                        }

                        const action = {
                          structure,
                          idKey,
                          foreignKey,
                          data: toJS(meta.currentRow)
                        };
                        if (meta.action === "update") {
                          list[meta.currentIndex] = meta.currentRow;
                          if (meta.currentRow[idKey]) {
                            queries[path].update[
                              meta.currentRow[idKey]
                            ] = action;
                          } else {
                            queries[path].insert[
                              meta.currentRow.__insertid
                            ] = action;
                          }
                        } else {
                          list.push(meta.currentRow);
                          queries[path].insert[
                            meta.currentRow.__insertid
                          ] = action;
                        }
                        setValue(list, path);
                      }}
                      text="OK"
                    />
                  </View>
                </View>
                <Form {...FormEl.props} style={{ flex: 1 }} />
              </View>
            </View>
          </Modal>
        )}
      </View>
    );
  }
);

const generateForm = (children, idKey, row) => {
  let form = _.find(children, e => typeof e === "function");
  return form;
};

const generateTable = (children, idKey, list) => {
  let rawTable = _.find(children, e => e.type === Table);

  const table = {
    props: { ...rawTable.props },
    headProps: null,
    rowProps: null,
    data: list.list
  };

  const castedIdKey = _.startCase(idKey);
  _.castArray(rawTable.props.children).map(c => {
    if (c.type === TableRow) {
      table.rowProps = {
        ...c.props,
        children: _.castArray(c.props.children)
          .filter(r => {
            return r.props.path !== idKey;
          })
          .map(r => {
            return r;
          })
      };
    } else if (c.type === TableHead) {
      table.headProps = {
        ...c.props,
        children: _.castArray(c.props.children).filter(r => {
          return r.props.title !== castedIdKey;
        })
      };
    }
  });

  return table;
};

const theme = {
  ...DefaultTheme,
  ...Theme.colors
};

const ActionButton = ({ onPress, text, style }: any) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
};
const getTextColor = function(
  bgColor: string,
  lightColor: string,
  darkColor: string
) {
  var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? darkColor : lightColor;
};
const textColor = getTextColor(Theme.colors.primary, "#fff", "#000");

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1
  },
  overlay: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.05)",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  },
  modalTitle: {
    marginHorizontal: -10,
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginTop: -8,
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: theme.light,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  modalTitleText: {
    fontSize: 18,
    marginLeft: 3,
    color: theme.dark,
    fontFamily: _.get(Theme, "fontFamily", undefined)
  },
  modalAction: {
    flexDirection: "row",
    alignItems: "center"
  },
  button: {
    backgroundColor: Theme.colors.primary,
    padding: 5,
    paddingHorizontal: 10,
    marginLeft: 5,
    borderRadius: 3
  },
  buttonText: {
    color: textColor,
    fontFamily: _.get(Theme, "fontFamily", undefined)
  },
  modal: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: theme.light,
    padding: 10,
    flex: 1,
    flexDirection: "column",
    width: 700,
    alignSelf: "center",
    margin: 50,
    borderRadius: 8
  }
});
