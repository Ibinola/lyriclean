const corrections = new Map([
  // Hallelujah variations
  ["halelujah", "Hallelujah"],
  ["haleluia", "Hallelujah"],
  ["haleluya", "Hallelujah"],
  ["hallellujah", "Hallelujah"],
  ["halleluia", "Hallelujah"],
  ["halleluyah", "Hallelujah"],
  ["halleluiah", "Hallelujah"],
  ["halaluejah", "Hallelujah"],
  ["halleluja", "Hallelujah"],
  ["haleluyah", "Hallelujah"],
  ["alelelluia", "Hallelujah"],

  // Hosanna
  ["hosana", "Hosanna"],
  ["hosannah", "Hosanna"],
  ["hossana", "Hosanna"],

  // Yahweh
  ["yhwh", "Yahweh"],
  ["yahwe", "Yahweh"],
  ["yahway", "Yahweh"],
  ["yaweh", "Yahweh"],
  ["yehweh", "Yahweh"],

  // Messiah
  ["messaih", "Messiah"],
  ["messias", "Messiah"],
  ["messaiah", "Messiah"],

  // Emmanuel / Immanuel
  ["emanuel", "Emmanuel"],
  ["emmanual", "Emmanuel"],
  ["emmannuel", "Emmanuel"],
  ["immanual", "Immanuel"],
  ["immanuell", "Immanuel"],

  // Resurrection
  ["resurection", "Resurrection"],
  ["resurrection", "Resurrection"],
  ["resurection", "Resurrection"],

  // Crucifixion
  ["crucifiction", "Crucifixion"],
  ["crucifiction", "Crucifixion"],

  // Worship
  ["worshp", "Worship"],
  ["worshhip", "Worship"],
  ["worhsip", "Worship"],
  ["woship", "Worship"],

  // Praise
  ["praize", "Praise"],
  ["praise", "Praise"],
  ["praiise", "Praise"],

  // Glory
  ["glorify", "Glorify"],
  ["glorifie", "Glorify"],
  ["glorifiy", "Glorify"],

  // Heaven
  ["heven", "Heaven"],
  ["heavan", "Heaven"],
  ["heavean", "Heaven"],
  ["heavn", "Heaven"],

  // Blessed
  ["blesssed", "Blessed"],
  ["bessed", "Blessed"],
  ["blesed", "Blessed"],

  // Precious
  ["precius", "Precious"],
  ["preciouvs", "Precious"],
  ["preshus", "Precious"],

  // Mercy
  ["mercry", "Mercy"],
  ["mercie", "Mercy"],
  ["mercyful", "Merciful"],

  // Holy
  ["holliest", "Holiness"],
  ["hollly", "Holy"],
  ["holi", "Holy"],

  // Righteousness
  ["rightousness", "Righteousness"],
  ["rightousness", "Righteousness"],
  ["righteusness", "Righteousness"],
  ["rightness", "Righteousness"],

  // Miscellaneous
  ["everthing", "Everything"],
  ["evertything", "Everything"],
  ["spirit", "Spirit"],
  ["spirtual", "Spiritual"],
  ["spirtual", "Spiritual"],
  ["anointed", "Anointed"],
  ["anointing", "Anointing"],
  ["annointed", "Anointed"],
  ["annointing", "Anointing"],
  ["glorius", "Glorious"],
  ["victry", "Victory"],
  ["victorius", "Victorious"],
  ["victorios", "Victorious"],
  ["majesty", "Majesty"],
  ["majestie", "Majesty"],
  ["throne", "Throne"],
  ["throneroom", "Throne Room"],
  ["foreva", "Forever"],
  ["4ever", "Forever"],
  ["foreva", "Forever"],
  ["savior", "Savior"],
  ["saviour", "Savior"],
  ["saviour", "Savior"],
  ["sactified", "Sanctified"],
  ["sanctified", "Sanctified"],
  ["sanctifiy", "Sanctify"],
  ["testomony", "Testimony"],
  ["testamony", "Testimony"],
  ["testaminy", "Testimony"],
]);

/**
 * Applies the correction map to each word in the text.
 * Preserves existing capitalization.
 */
export function spellcheck(text: string): string {
  if (!text) return text;

  return text
    .split(/(\s+|[^\w'-]+)/)
    .map((token) => {
      // Only check word tokens
      if (!/^[a-zA-Z]/.test(token)) return token;

      const lower = token.toLowerCase();
      const correct = corrections.get(lower);
      if (!correct) return token;

      // Preserve original casing
      if (token === token.toUpperCase()) return correct.toUpperCase();
      if (token[0] === token[0].toUpperCase())
        return correct[0].toUpperCase() + correct.slice(1);
      return correct.toLowerCase();
    })
    .join("");
}
