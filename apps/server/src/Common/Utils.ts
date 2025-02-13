// Utils.ts (前后端共享)
import Decimal from 'decimal.js';

// 定义放大倍数 (可以根据需要修改)
export const SCALE_FACTOR = new Decimal(1000); // 使用 Decimal 类型, 避免精度问题

// 定义定点数类型 (可选,但强烈建议)
export type FixedPoint = Decimal;

/**
 * 将数字转换为定点数 (整数法)
 * @param num 要转换的数字 (可以是 number, string, 或 Decimal)
 * @param digit 可选:小数位数, 默认为 3
 * @returns 定点数 (Decimal 对象)
 */
// export const toFixed = (num: number | string | Decimal, digit = 3): FixedPoint => {
//     const scale = new Decimal(10).pow(digit);
//     return new Decimal(num).mul(scale);
// };

// export const toFixed = (num: number | string | Decimal, digit = 3): number => {
//   const scale = new Decimal(10).pow(digit);
//   return new Decimal(num).mul(scale).toNumber();
// };

export const toFixed = (num: number | string | Decimal, digit = 3): number => {
  const scale = new Decimal(10).pow(digit);
  // 先乘以10^digit，取整，再除以10^digit
  return new Decimal(num).mul(scale).trunc().div(scale).toNumber();
};

/**
 * 将定点数转换为浮点数
 * @param fixed 定点数 (Decimal 对象)
 * @param digit 可选: 小数位数, 默认为 3
 * @returns 浮点数 (number 类型)
 */
export const toFloat = (fixed: FixedPoint, digit = 3): number => {
    const scale = new Decimal(10).pow(digit);
    return fixed.div(scale).toNumber();
};


// 兼容number的加减乘除
declare module 'decimal.js' {
    interface Decimal {
        add(value: Decimal.Value): Decimal;
        sub(value: Decimal.Value): Decimal;
        mul(value: Decimal.Value): Decimal;
        div(value: Decimal.Value): Decimal;
    }
}




// export const toFixed = (num:number,digit =3)=>{
//   const scale = 10**digit;
//   return Math.trunc(num*scale)/scale;
// }

export const strencode = (str: string) => {
  let byteArray: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    if (charCode <= 0x7f) {
      byteArray.push(charCode);
    } else if (charCode <= 0x7ff) {
      byteArray.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
    } else if (charCode <= 0xffff) {
      byteArray.push(0xe0 | (charCode >> 12), 0x80 | ((charCode & 0xfc0) >> 6), 0x80 | (charCode & 0x3f));
    } else {
      byteArray.push(
        0xf0 | (charCode >> 18),
        0x80 | ((charCode & 0x3f000) >> 12),
        0x80 | ((charCode & 0xfc0) >> 6),
        0x80 | (charCode & 0x3f)
      );
    }
  }
  return new Uint8Array(byteArray);
};

export const strdecode = (bytes: Uint8Array) => {
  let array: number[] = [];
  let offset = 0;
  let charCode = 0;
  let end = bytes.length;
  while (offset < end) {
    if (bytes[offset] < 128) {
      charCode = bytes[offset];
      offset += 1;
    } else if (bytes[offset] < 224) {
      charCode = ((bytes[offset] & 0x3f) << 6) + (bytes[offset + 1] & 0x3f);
      offset += 2;
    } else if (bytes[offset] < 240) {
      charCode = ((bytes[offset] & 0x0f) << 12) + ((bytes[offset + 1] & 0x3f) << 6) + (bytes[offset + 2] & 0x3f);
      offset += 3;
    } else {
      charCode =
        ((bytes[offset] & 0x07) << 18) +
        ((bytes[offset + 1] & 0x3f) << 12) +
        ((bytes[offset + 1] & 0x3f) << 6) +
        (bytes[offset + 2] & 0x3f);
      offset += 4;
    }
    array.push(charCode);
  }
  return String.fromCharCode.apply(null, array);
};
