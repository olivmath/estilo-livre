import i18n from "i18next"

const SUFFIX = { en: "_en", es: "_es" }

export function locName(obj) {
  if (!obj) return ""
  const s = SUFFIX[i18n.language]
  return (s && obj[`name${s}`]) || obj.name || ""
}

export function locGroup(obj) {
  if (!obj) return ""
  const s = SUFFIX[i18n.language]
  return (s && obj[`group${s}`]) || obj.group || ""
}
