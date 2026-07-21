// SWF display-list removal tags are deliberately kept small and separate from
// PlaceObject parsing. Both extractors use this so a removed layer cannot
// silently survive into later frames.
export function applyRemoveTag(placed, tag, bytes) {
  let depth;
  if (tag.code === 28) {
    // RemoveObject2: UI16 depth
    depth = bytes.readUInt16LE(tag.body);
  } else if (tag.code === 5) {
    // RemoveObject: UI16 character id, then UI16 depth
    depth = bytes.readUInt16LE(tag.body + 2);
  } else {
    return false;
  }

  placed.delete(depth);
  return true;
}
