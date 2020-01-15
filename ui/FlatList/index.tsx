import { observer } from "mobx-react-lite";
import React from "react";
import { FlatList, FlatListProps } from "react-native";

export default observer((props: FlatListProps<any>) => {
  return (
    <FlatList
      initialNumToRender={20}
      maxToRenderPerBatch={20}
      windowSize={5}
      removeClippedSubviews={true}
      updateCellsBatchingPeriod={500}
      {...props}
    />
  );
});
