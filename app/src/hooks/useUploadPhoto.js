import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTranslation } from "react-i18next";

// Crops the picked image to a 200x200 square and stores it as a data URL on
// the user's profile doc — used by ProfileTab's photo upload button.
export function useUploadPhoto(user, reload) {
  const { t } = useTranslation();
  return (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext("2d");
        const s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 200, 200);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        try {
          await updateDoc(doc(db, "users", user.uid), { photoURL: dataUrl });
          alert(t("hooks.photoUpdated"));
          await reload();
          window.location.reload();
        } catch (err) {
          console.error(err);
          alert(t("hooks.photoError"));
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
}
