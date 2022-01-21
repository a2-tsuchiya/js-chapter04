/**
 * ポケモン図鑑を返します。
 * csvファイルを読み込み配列にパースしてます。
 */
export const pokemonPictureBook = () => {
  const fs = require("fs");
  const path = require("path");
  const csv = require("csv-parse/lib/sync");

  const filePath = path.join("src", "data", "pokemon.csv");
  const data = fs.readFileSync(filePath, "utf-8");
  const result = csv.parse(data, { columns: false });
  return result;
};

/**
 * generate random number
 * @param {Number} min minimun number
 * @param {Number} max maximum number
 * @returns {Number} random number
 * @see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */
export const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};
