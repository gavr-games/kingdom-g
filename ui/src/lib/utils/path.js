export default class Path {
  static includesPosition(path, pos) {
    return path.some(p => {
      return p[0] === pos[0] && p[1] === pos[1];
    });
  }
}
