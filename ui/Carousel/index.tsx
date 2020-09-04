import Theme from "../../theme";
import { observer, useObservable } from "mobx-react-lite";
import { observable } from "mobx";
import React, { useEffect, useRef } from "react";
import { Dimensions, ViewStyle, StyleSheet } from "react-native";
import Carousel, {
  CarouselProps as OriginCarouselProps,
  Pagination as PaginationOrigin,
  PaginationProps as PaginationPropsOrigin,
} from "react-native-snap-carousel";
import { uuid } from "../../utils";
import _ from "lodash";

export interface ICarouselProps extends OriginCarouselProps<any> {
  children?: any;
  style?: ViewStyle;
  data?: any[];
}

export default observer((props: ICarouselProps) => {
  const { children, data } = props;
  const carouselProps: any = { ...props };
  const ref = useRef(null);
  const dim = Dimensions.get("window");
  const meta = useObservable({
    activeSlide: 0,
    // dataLength: ,
  });
  const onSnapItem = (index) => {
    meta.activeSlide = index;
    carouselProps.onSnapToItem && carouselProps.onSnapToItem(index);
  };

  // useEffect(() => {
  //   meta.dataLength = data.length;
  // }, [data]);

  return (
    <>
      <Carousel
        ref={ref}
        itemWidth={dim.width - 50}
        sliderWidth={dim.width}
        layout={"default"}
        containerCustomStyle={{
          flexGrow: 0,
        }}
        {...carouselProps}
        onSnapToItem={onSnapItem}
      />
      {!!children &&
        (Array.isArray(children) ? (
          children.map((child) => {
            return <RenderChild key={uuid()} child={child} meta={meta} />;
          })
        ) : (
          <RenderChild child={children} meta={meta} length={data.length} />
        ))}
    </>
  );
});

export const Pagination = observer((props: Partial<PaginationPropsOrigin>) => {
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
});

const RenderChild = observer(({ child, meta, length }: any) => {
  if (child.type === Pagination) {
    let cprops = {
      dotsLength: length || 0,
      activeDotIndex: meta.activeSlide,
    };
    const Component = child.type;
    return <Component {...child.props} {...cprops} />;
  } else if (!child || !child.type || !child.props) {
    return child;
  } else {
    const Component = child.type;
    const children = child.props.children;
    return (
      <Component {...child.props}>
        {!!children &&
          (Array.isArray(children) ? (
            children.map((child) => {
              return <RenderChild key={uuid()} child={child} meta={meta} />;
            })
          ) : (
            <RenderChild child={children} meta={meta} />
          ))}
      </Component>
    );
  }
});
