import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"

export function useLanguage() {
  const { i18n } = useTranslation()
  const { user, profile } = useAuth()

  useEffect(() => {
    if (profile?.language && profile.language !== i18n.language) {
      i18n.changeLanguage(profile.language)
    }
  }, [profile?.language, i18n])

  const setLanguage = async (lang) => {
    i18n.changeLanguage(lang)
    if (user?.uid) {
      await updateDoc(doc(db, "users", user.uid), { language: lang })
    }
  }

  return { language: i18n.language, setLanguage }
}
