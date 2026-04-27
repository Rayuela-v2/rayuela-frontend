const GOOGLE_SCRIPT_ID = "google-identity-service";

let googleScriptPromise = null;
let loadedGoogleLocale = null;

const GOOGLE_LOCALE_MAP = {
  ES: "es",
  EN: "en",
  PT: "pt-BR",
};

export function getGoogleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID;
}

export function isGoogleAuthConfigured() {
  return Boolean(getGoogleClientId());
}

export function getGoogleLocale(locale) {
  return GOOGLE_LOCALE_MAP[locale] || "en";
}

function removeGoogleIdentityScript() {
  const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
  if (existingScript) {
    existingScript.remove();
  }

  if (window.google?.accounts?.id) {
    delete window.google;
  }
}

export function loadGoogleIdentityScript(locale = "EN") {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("Google login is only available in the browser"));
  }

  const googleLocale = getGoogleLocale(locale);

  if (window.google?.accounts?.id && loadedGoogleLocale === googleLocale) {
    return Promise.resolve(window.google);
  }

  if (loadedGoogleLocale && loadedGoogleLocale !== googleLocale) {
    googleScriptPromise = null;
    removeGoogleIdentityScript();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google), {
        once: true,
      });
      existingScript.addEventListener("error", () => {
        reject(new Error("Failed to load Google login"));
      }, {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = `https://accounts.google.com/gsi/client?hl=${googleLocale}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      loadedGoogleLocale = googleLocale;
      resolve(window.google);
    };
    script.onerror = () => reject(new Error("Failed to load Google login"));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}
