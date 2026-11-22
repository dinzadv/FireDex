export const lang = () => window.FD_I18N ? window.FD_I18N.get() : "en";
export const setLang = (l) => {
  if (window.FD_I18N) window.FD_I18N.set(l);
};
export const tr = (s) => window.FD_I18N ? window.FD_I18N.t(s) : s;
