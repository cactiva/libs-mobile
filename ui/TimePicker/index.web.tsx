import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import _ from 'lodash';
import { Select } from "..";

const hours = [];
for (let i = 0; i < 24; i++) {
  const t = i.toString();
  hours.push(i < 10 ? "0" + t : t);
}

const mins = [];
for (let i = 0; i < 60; i++) {
  const t = i.toString();
  mins.push(i < 10 ? "0" + t : t);
}

export default observer((props: any) => {
  const meta = useObservable({
    h: null,
    m: null
  })
  return <div style={{ display: 'flex', height: 25, flexDirection: 'row' }}>
    <Select value={meta.h}
      placeholder="hh"
      items={hours}
      style={{ width: 70, minWidth: 0 }}
      onSelect={(e) => {
        meta.h = e;
      }} />
    <Select value={meta.m}
      placeholder="mm"
      items={mins}
      style={{ width: 70, minWidth: 0 }}
      onSelect={(e) => {
        meta.m = e;
      }} />
  </div>;
});

const styleInput = {
  borderWidth: 0,
  margin: 0,
  color: "#3a3a3a",
  minHeight: 30
};
