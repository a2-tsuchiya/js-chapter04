import { pokemonPictureBook } from "./util";
import { getRandomInt } from "./util";
// import * as sample_data from "./data/data.json";

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
 * ポケモン図鑑
 */
const pictureBook = pokemonPictureBook();

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

const sort = {
  /**
   * 取得したポケモン情報をソートするヘルパー関数
   * @param {Response} resp_pokemon pokemon response data
   * @returns {Pokemon} pokemon object (copied)
   */
  pokemon: (resp_pokemon) => {
    const pokemon = { ...template_pokemon };
    // 3つぐらいなら代入の方が早い。。
    pokemon.id = resp_pokemon.id;
    pokemon.name = resp_pokemon.name;
    pokemon.types = resp_pokemon.types;
    return pokemon;
  },
  /**
   * 取得したポケモンのタイプ情報をソートするヘルパー関数
   * @param {Response} resp_type pokemon types response data
   * @param {Pokemon} pokemon pokemon object
   */
  type: (resp_type, pokemon) => {
    const relations = resp_type.damage_relations;
    // sort
    const sorted = Object.keys(relations).reduce((obj, key) => {
      obj[key] = relations[key].map((type) => type.name);
      return obj;
    }, {});
    // merge
    const newPokemon = Object.keys(pokemon).reduce((obj, key) => {
      if (key === "week_types" || key === "advance_types") {
        return Object.keys(pokemon[key]).reduce((obj, nested_key) => {
          const combined = [...obj[key][nested_key], ...sorted[nested_key]];
          // remove duplicate
          obj[key][nested_key] = Array.from(new Set(combined));
          return obj;
        }, obj);
      } else {
        return obj;
      }
    }, pokemon);

    return newPokemon;
  }
};

/**
 * 任意のIDを持つポケモン情報を取得する
 * @param {number} id pokemon id
 * @return {Promise<Pokemon>} pokemon object
 */
const getPokemon = (id) => {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;

  return new Promise((resolve, reject) => {
    fetch(url)
      .then((resp) => {
        if (resp.ok) return resp.json();
        throw new Error(`bad request: ${resp.status}`);
      })
      .then((resp) => resolve(sort.pokemon(resp)))
      // .then((resp) => resolve(resp))
      .catch((err) => reject(err));
  });
};

/**
 * ポケモンの英語名を日本語名に翻訳する
 * @param {Pokemon} target pokemon object
 * @param {Array} data pokemon picturebook
 * @return {Promise<Pokemon>} pokemon object (replaced)
 */
const translateName = (target) => {
  const found = pictureBook.find(
    (pokemon) => target.id === Number(pokemon[IDX.ID])
  );
  if (!found) {
    throw new Error("Name not found.");
  }
  return Promise.resolve({
    ...target,
    name: found[IDX.NAME_JA]
  });
};

/**
 * ポケモンの有利/不利タイプ、攻撃/防御の倍率情報を取得する
 * @param {Pokemon} pokemon pokemon object
 * @returns {Promise<Pokemon>} pokemon object (result)
 */
const getTypes = (pokemon) => {
  return new Promise((resolve, reject) => {
    /**
     * ポケモンのタイプ情報を取得する内部関数（ポケモンは複数のタイプを持ち得るので）
     * @param {String} url endpoint types API
     * @param {Pokemon} pokemon pokemon object
     * @returns {Promise<Pokemon>} pokemon object (replaced)
     */
    const _getType = (url, pokemon) => {
      return new Promise((resolve, reject) => {
        fetch(url)
          .then((resp) => {
            if (resp.ok) return resp.json();
            throw new Error(`bad request: ${resp.status}`);
          })
          .then((resp) => resolve(sort.type(resp, pokemon)))
          .catch((err) => reject(err));
      });
    };

    let promises = Promise.resolve(pokemon);
    const types = pokemon.types;
    types.forEach((type) => {
      promises = promises.then((pokemon) => _getType(type.type.url, pokemon));
    });
    promises
      .then((resp) => {
        // remove type meta
        return resolve({
          ...resp,
          types: resp.types.map((type) => type.type.name)
        });
      })
      .catch((err) => reject(err));
  });
};

// ここから実行プログラム

const task = (pokemonId) => {
  // ここに任意のポケモンをGETする処理を記述します
  // ...

  return new Promise((resolve, reject) => {
    getPokemon(pokemonId) // stepA
      .then(translateName) // stepB
      .then(getTypes) //stepC
      .then((resp) => {
        console.log("ポケモンGET!!", resp);
        return resolve();
      })
      .catch((err) => reject(err));
  });
};

const loop = () => {
  // 計測用
  const start = performance.now();

  // ここにtaskの反復処理を記述します
  // ...

  const lenPictureBook = pictureBook.length;
  const pokemonIds = [...Array(10)].map(() => getRandomInt(1, lenPictureBook));
  const tasks = pokemonIds.map((id) => task(id));

  Promise.all(tasks)
    .then(() => console.log("All tasks finished"))
    .catch(console.error)
    .finally(() => {
      const end = performance.now();
      console.info(`delta: ${end - start} (msec)`);
    });

  // 処理時間計測のため、最後にこの処理を必ず記述してください。
  // const end = performance.now();
  // console.info(`${end - start} (msec)`);
};

/**
 * 検証時以外はコメントアウトしとく（ホットリロードで勝手にAPI叩いちゃうので）
 * こういう気軽に使える、おもしろ便利なWebAPIは年々減っています。。
 * 大きな理由は無計画にAPIを叩く「バカ」が大勢いて、
 * サーバ側に過剰な負荷がかかり、運用コストが上がっていってしまうからです。。
 * ご留意の上お使いください。
 */
// loop();

/** Promiseの同期/非同期ループ */
// const _task = (id) => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       console.log(`task ${id} done.`);
//       return resolve();
//     }, getRandomInt(1, 1000));
//   });
// };

// const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// 同期パターン
// let promises = Promise.resolve();
// for (const id of ids) {
//   promises = promises.then(() => _task(id));
// }
// promises.then(() => console.log("end"));

// 非同期パターン
// const tasks = ids.map(id => _task(id))
// Promise.all(tasks)
//   .then(() => console.log("end"))
