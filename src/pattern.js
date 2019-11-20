const blackTile = '00000000000000000000000000000000';
const oneTile = '55555555555555555555555555555555';
const twoTile = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const threeTile = 'ffffffffffffffffffffffffffffffff';

const blockTopLeft = '15557eaa755565556555651565656555';
const blockTopRight = '5554a6bd555d55595559555555595559';
const blockBottomLeft = '65556555655565556555555514040000';
const blockBottomRight = '55555551555155545540551040440000';
const blockTopCenter = '5555ab56555555555555555555555555';
const blockBottomCenter = '55555555555555555555555515040000';
const blockRightCenter = '55555555555d55595559555555595559';
const blockInterior = '55555555555555555555555555555555';
const blockLeftCenter = '65556555755565556555655565556555';

const letterL = 'a000a400a400a400a400a400aaa81555';
const letterE = 'aaa8a555a400aaa8a555a400aaa81555';
const letterV = 'a028a429a429a8a92aa50a9402500040';
const letterM = 'a028a8a9aaa9aaa9a669a469a4291415';
const letterO = '2aa0a568a429a429a429a4292aa50554';
const letterS = '2aa0a568a4052aa00568a0292aa50554';
const letterI = '2aa8029502900290029002902aa80555';
const letterT = '2aa80295029002900290029002900050';

const patternInternal = {
  blackTile,
  oneTile,
  twoTile,
  threeTile,
  blockTopLeft,
  blockTopRight,
  blockBottomLeft,
  blockBottomRight,
  blockTopCenter,
  blockBottomCenter,
  blockRightCenter,
  blockInterior,
  blockLeftCenter,
  letterL,
  letterE,
  letterV,
  letterM,
  letterO,
  letterS,
  letterI,
  letterT
};

const patternNames = Object.keys(patternInternal);
const PATTERNTABLE = Object.values(patternInternal);

module.exports = name => patternNames.indexOf(name);
module.exports.PATTERNTABLE = PATTERNTABLE;
