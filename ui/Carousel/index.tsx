import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import Carousel, {
  Pagination as PaginationOrigin
} from "react-native-snap-carousel";
import View from "../View";
import { ViewStyle, Dimensions } from "react-native";
import Theme from "@src/libs/theme";

export interface CarouselProps {
  data: any[];
  renderItem: any;
  itemWidth: number;
  sliderWidth: number;
  children?: any;
  style?: any;
  loop?: boolean;
  onSnapToItem?: (index) => void;
  enableMomentum?: boolean;
  enableSnap?: boolean;
  firstItem?: number;
  inactiveSlideOpacity?: number;
  inactiveSlideScale?: number;
  slideStyle?: any;
  autoplay?: boolean;
  lockScrollWhileSnapping?: boolean;
  layoutCardOffset?: number;
  lockScrollTimeoutDuration?: number;
}

export default observer((props: CarouselProps) => {
  const { style, data, children } = props;
  const carouselProps: any = { ...props };
  delete carouselProps.style;
  delete carouselProps.data;
  const ref = useRef(null);
  const dim = Dimensions.get("window");
  const meta = useObservable({
    activeSlide: 0,
    dataLength: 0,
    data: []
  });

  useEffect(() => {
    if (data && data.length > 0) {
      meta.data = data;
      meta.dataLength = data.length;
    }
  }, [data]);

  const childrenWithProps = React.Children.map(children, child => {
    return renderChild(child, meta);
  });

  return (
    <View style={style}>
      <Carousel
        data={meta.data}
        ref={ref}
        itemWidth={dim.width - 50}
        sliderWidth={dim.width}
        layout={"default"}
        containerCustomStyle={{
          overflow: "visible"
        }}
        {...carouselProps}
        onSnapToItem={index => {
          meta.activeSlide = index;
          carouselProps.onSnapToItem && carouselProps.onSnapToItem(index);
        }}
      />
      {childrenWithProps}
    </View>
  );
});

export interface PaginationProps {
  activeDotIndex?: number;
  dotsLength?: number;
  activeOpacity?: number;
  carouselRef?: any;
  containerStyle?: ViewStyle;
  dotColor?: string;
  dotContainerStyle?: ViewStyle;
  dotany?: any;
  dotStyle?: ViewStyle;
  inactiveDotColor?: string;
  inactiveDotany?: any;
  inactiveDotOpacity?: number;
  inactiveDotScale?: number;
  inactiveDotStyle?: ViewStyle;
  renderDots?: () => void;
  tappableDots?: boolean;
  vertical?: boolean;
  accessibilityLabel?: string;
}

export const Pagination = observer((props: PaginationProps) => {
  return (
    <PaginationOrigin
      dotsLength={0}
      activeDotIndex={0}
      containerStyle={{
        paddingHorizontal: 0,
        paddingVertical: 0
      }}
      dotStyle={{
        height: 8,
        width: 8,
        borderRadius: 20,
        backgroundColor: Theme.UIColors.primary
      }}
      dotContainerStyle={{
        marginLeft: 3,
        marginRight: 3
      }}
      inactiveDotOpacity={0.3}
      inactiveDotScale={1}
      {...props}
    />
  );
});

const renderChild = (child: any, meta: any) => {
  if (child.type === Pagination) {
    let cprops = {
      dotsLength: meta.dataLength,
      activeDotIndex: meta.activeSlide
    };
    return React.cloneElement(child, {
      ...cprops,
      ...child.props
    });
  } else {
    const childrenRaw = _.get(child, "props.children");
    const hasChildren = !!childrenRaw;
    if (!hasChildren) {
      return child;
    } else {
      const children = Array.isArray(childrenRaw) ? childrenRaw : [childrenRaw];
      return React.cloneElement(child, {
        ...child.props,
        children: React.Children.map(children, el => renderChild(el, meta))
      });
    }
  }
};
