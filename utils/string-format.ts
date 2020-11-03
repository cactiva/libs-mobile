export const moneyFormat = (
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

export const capitalizeFLetter = (text: string = "") => {
  if (text.length < 1) return text;
  return text[0].toUpperCase() + text.slice(1);
};

export const formatMoney = (
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
