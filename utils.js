export function deepClone(array) {
  return array.map(innerArray => [...innerArray]);
}

export function delay(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}