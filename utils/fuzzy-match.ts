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

  for (let i = 0; i <= maxIters; i++) {
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

export default fuzzyMatch;
