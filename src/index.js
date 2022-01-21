import { pokemonPictureBook } from "./util";
import { getRandomInt } from "./util";
import * as sample_data from "./data/data.json";

/**
 * APIの詳細はこちらをご覧ください（英語ですが）
 * @see https://pokeapi.co/
 */

/**
 * 不用意にAPIを叩かないようにサンプルデータをご用意してます。
 * 一度取得したAPIレスポンスをJSONなどにシリアライズ化して、
 * 作業時はファイルから読み込みパースして使う、
 * というのは実務でも使える手法です（というかそうすべき）。
 *
 * だからすぐkintoneAPIの上限に達するんだよ、、この会社。
 */

// console.log(sample_data);

/**
 * ポケモン図鑑のインデックス
 */
const IDX = {
  ID: 0,
  NAME_JA: 1,
  NAME_EN: 2
};

/**
 * ポケモンオブジェクト（このプロパティの値を埋めていく）
 * @type Pokemon
 */
const template_pokemon = {
  id: 0,
  name: "",
  types: [],
  week_types: {
    double_damage_from: [], // 受けるダメージが２倍になってしまうタイプ
    half_damage_to: [], // 与えるダメージが半分になってしまうタイプ
    no_damage_to: [] // 与えるダメージが無効になってしまうタイプ
  },
  advance_types: {
    half_damage_from: [], // 受けるダメージが半分になるタイプ
    double_damage_to: [], // 与えるダメージが２倍になるタイプ
    no_damage_from: [] // 受けるダメージが無効になるタイプ
  }
};

// ここから処理を記述します
// ...

// ここから実行プログラムを記述します

const task = (pokemonId) => {
  // ここに任意のポケモンをGETする処理を記述します
  // ...
};

const loop = () => {
  // 計測開始
  const start = performance.now();

  // ここにtaskの反復処理を記述します
  // ...

  // 計測終了
  const end = performance.now();
  console.info(`${end - start} (msec)`);
};

/**
 * 検証時以外はコメントアウトしとく（ホットリロードで勝手にAPI叩いちゃうので）
 * こういう気軽に使える、おもしろ便利なWebAPIは年々減っています。。
 * 大きな理由は無計画にAPIを叩く「バカ」が大勢いて、
 * サーバ側に過剰な負荷がかかり、運用コストが上がっていってしまうからです。。
 * ご留意の上お使いください。
 */
// loop()
