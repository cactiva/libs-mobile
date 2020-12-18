import Theme from "@libs/config/theme";
import _ from "lodash";
import { runInAction } from "mobx";
import { observer, useLocalObservable } from "mobx-react-lite";
import React, { ReactElement, useRef } from "react";
import { Dimensions, StyleSheet, ViewStyle } from "react-native";
import Carousel, {
  CarouselProps as OriginCarouselProps,
  Pagination as PaginationOrigin,
  PaginationProps as OriginPaginationProps,
} from "react-native-snap-carousel";

export interface ICarouselProps extends OriginCarouselProps<any> {
  children?: (data: any, activeSlide: number) => ReactElement;
  carouselRef?: any;
  style?: ViewStyle;
  data: any[];
  enablePagination?: boolean;
  paginationProps?: OriginPaginationProps;
}

export default observer((props: ICarouselProps) => {
  const { children, data, carouselRef, paginationProps } = props;
  const carouselProps: any = { ...props };
  delete carouselProps.children;
  delete carouselProps.enablePagination;
  delete carouselProps.paginationProps;
  delete carouselProps.carouselRef;
  const dim = Dimensions.get("window");
  const meta = useLocalObservable(() => ({
    activeSlide: 0,
  }));
  const onSnapItem = (index: number) => {
    runInAction(() => (meta.activeSlide = index));
  };

  return (
    <>
      <Carousel
        ref={carouselRef}
        itemWidth={dim.width - 50}
        sliderWidth={dim.width}
        layout={"default"}
        containerCustomStyle={{
          flexGrow: 0,
        }}
        {...carouselProps}
        onSnapToItem={onSnapItem}
      />

      <RenderPagination
        data={data}
        child={children}
        meta={meta}
        paginationProps={paginationProps}
      />
    </>
  );
});

const RenderPagination = observer((props: any) => {
  const { child, meta, data, paginationProps } = props;

  if (!!child) {
    return child(data, meta.activeSlide);
  }

  return (
    <PaginationOrigin
      dotsLength={data.length}
      activeDotIndex={meta.activeSlide}
      dotStyle={{
        height: 8,
        width: 8,
        borderRadius: 20,
        backgroundColor: Theme.UIColors.primary,
      }}
      dotContainerStyle={{
        marginLeft: 3,
        marginRight: 3,
      }}
      inactiveDotOpacity={0.3}
      inactiveDotScale={1}
      {...paginationProps}
    />
  );
});

export const CarouselPagination = observer(
  (props: Partial<OriginPaginationProps>) => {
    const baseContainerStyle = StyleSheet.flatten([
      {
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
      _.get(props, "containerStyle", {}),
    ]);
    return (
      <PaginationOrigin
        dotsLength={0}
        activeDotIndex={0}
        dotStyle={{
          height: 8,
          width: 8,
          borderRadius: 20,
          backgroundColor: Theme.UIColors.primary,
        }}
        dotContainerStyle={{
          marginLeft: 3,
          marginRight: 3,
        }}
        inactiveDotOpacity={0.3}
        inactiveDotScale={1}
        {...props}
        containerStyle={baseContainerStyle}
      />
    );
  }
);
