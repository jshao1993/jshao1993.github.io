const patterns = {
  // 手机号码
  mobile: /^(1[3|4|5|6|7|8|9])[0-9]{9}$/,
  // 正整数 不包括0
  positiveNumber: /^[0-9]*[1-9][0-9]*$/,
  // 非负整数
  positiveNumberWithZero: /^\d+$/,
  // 1 - 99 正整数
  positiveNumberByDiscount: /^[1-9][0-9]?$/,
  // 邮箱
  email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
}

export default patterns
