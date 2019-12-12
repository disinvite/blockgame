// here's one way of doing it

const blockMetaSprite = {
  "": [
    "blockInterior",
    "blockInterior",
    "blockInterior",
    "blockInterior"
  ],
  "R": [
    "blockInterior",
    "blockRightCenter",
    "blockInterior",
    "blockRightCenter"
  ],
  "L": [
    "blockLeftCenter",
    "blockInterior",
    "blockLeftCenter",
    "blockInterior"
  ],
  "LR": [
    "blockLeftCenter",
    "blockRightCenter",
    "blockLeftCenter",
    "blockRightCenter"
  ],
  "D": [
    "blockInterior",
    "blockInterior",
    "blockBottomCenter",
    "blockBottomCenter"
  ],
  "DR": [
    "blockInterior",
    "blockRightCenter",
    "blockBottomCenter",
    "blockBottomRight"
  ],
  "DL": [
    "blockLeftCenter",
    "blockInterior",
    "blockBottomLeft",
    "blockBottomCenter"
  ],
  "DLR": [
    "blockLeftCenter",
    "blockRightCenter",
    "blockBottomLeft",
    "blockBottomRight"
  ],
  "U": [
    "blockTopCenter",
    "blockTopCenter",
    "blockInterior",
    "blockInterior"
  ],
  "UR": [
    "blockTopCenter",
    "blockTopRight",
    "blockInterior",
    "blockRightCenter"
  ],
  "UL": [
    "blockTopLeft",
    "blockTopCenter",
    "blockLeftCenter",
    "blockInterior"
  ],
  "ULR": [
    "blockTopLeft",
    "blockTopRight",
    "blockLeftCenter",
    "blockRightCenter"
  ],
  "UD": [
    "blockTopCenter",
    "blockTopCenter",
    "blockBottomCenter",
    "blockBottomCenter"
  ],
  "UDR": [
    "blockTopCenter",
    "blockTopRight",
    "blockBottomCenter",
    "blockBottomRight"
  ],
  "UDL": [
    "blockTopLeft",
    "blockTopCenter",
    "blockBottomLeft",
    "blockBottomCenter"
  ],
  "UDLR": [
    "blockTopLeft",
    "blockTopRight",
    "blockBottomLeft",
    "blockBottomRight"
  ]
};

module.exports = blockMetaSprite;