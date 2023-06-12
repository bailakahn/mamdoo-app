function compareVersions(version1, version2) {
  const v1 = version1.split(".").map(Number);
  const v2 = version2.split(".").map(Number);

  const maxLength = Math.max(v1.length, v2.length);

  for (let i = 0; i < maxLength; i++) {
    const segment1 = i < v1.length ? v1[i] : 0;
    const segment2 = i < v2.length ? v2[i] : 0;

    if (segment1 > segment2) {
      return 1; // version1 is greater
    } else if (segment1 < segment2) {
      return -1; // version2 is greater
    }
  }

  return 0; // versions are equal
}

module.exports = compareVersions;
