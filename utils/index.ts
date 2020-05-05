import { Dimensions } from "react-native";
import _ from "lodash";
import session from "@src/stores/session";
const { width, height } = Dimensions.get("window");
//Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor: number = 0.5) =>
  size + (scale(size) - size) * factor;
const uuid = (prefix: string = randString()) =>
  `${prefix ? prefix + "-" : ""}${new Date().getTime()}${Math.floor(
    10000000 + Math.random() * 90000000
  )}`;

const randString = (length: number = 5) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  let result = "";
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
const deepFind = (object: object, path: string, defaultValue?: any) =>
  _.get(object, path, defaultValue);

const findLargestSmallest = (a: string, b: string) =>
  a.length > b.length
    ? {
        largest: a,
        smallest: b,
      }
    : {
        largest: b,
        smallest: a,
      };
const fuzzyMatch = (strA: string, strB: string, fuzziness = 0) => {
  if (strA === "" || strB === "") {
    return false;
  }

  if (strA === strB) return true;

  const { largest, smallest } = findLargestSmallest(strA, strB);
  const maxIters = largest.length - smallest.length;
  const minMatches = smallest.length - fuzziness;

  for (let i = 0; i < maxIters; i++) {
    let matches = 0;
    for (let smIdx = 0; smIdx < smallest.length; smIdx++) {
      if (smallest[smIdx] === largest[smIdx + i]) {
        matches++;
      }
    }
    if (matches > 0 && matches >= minMatches) {
      return true;
    }
  }

  return false;
};
const dateToString = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};
const textStyle = (style) => {
  const textStyleProps = [
    "fontSize",
    "color",
    "fontWeight",
    "lineHeight",
    "fontFamily",
    "textAlign",
    "fontStyle",
  ];
  const newTextStyle = {};
  if (!!style)
    Object.keys(style).map((k) => {
      if (textStyleProps.indexOf(k) > -1) newTextStyle[k] = style[k];
    });
  return newTextStyle;
};

const capitalizeFLetter = (text: string) => {
  return text[0].toUpperCase() + text.slice(1);
};

const truncateStr = (text: string, length: number) => {
  let string = text.replace(/(\r\n|\n|\r)/gm, "");
  return string.length > length ? string.substr(0, length - 1) + "..." : string;
};

const formatMoney = (
  number: string | number,
  prefix: string = "",
  decimal = false
) => {
  let val = !number
    ? parseFloat("0")
    : typeof number == "string"
    ? parseFloat(number)
    : number;
  let res = val.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  if (!decimal) res = String(res).substr(0, res.length - 3);
  return `${prefix}${res}`;
};
const getAsset = (uri) => {
  return new Promise(async (resolve) => {
    await fetch(uri, {
      headers: {
        Authorization: `Bearer ${session.jwt}`,
      },
    })
      .then((response) => response.blob())
      .then((images) => {
        resolve(URL.createObjectURL(images));
      });
  });
};

export {
  formatMoney,
  getAsset,
  scale,
  verticalScale,
  moderateScale,
  uuid,
  randString,
  deepFind,
  fuzzyMatch,
  dateToString,
  textStyle,
  capitalizeFLetter,
  truncateStr,
};
