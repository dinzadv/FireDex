(function () {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) {
    location.replace("/");
    return;
  }
  window.FD_PAGE_MODE = true;
  window.FD_PAGE_BACK = () => {
    location.href = "/edit/?id=" + encodeURIComponent(id);
  };
  let tries = 0;
  const t = setInterval(() => {
    tries++;
    const ready = typeof state !== "undefined" && state && state.id && typeof TOOLBOX_TOOLS !== "undefined" && TOOLBOX_TOOLS.some((x) => x.id === "structures");
    if (ready) {
      clearInterval(t);
      TOOLBOX_TOOLS.find((x) => x.id === "structures").onOpen();
    } else if (tries > 200) {
      clearInterval(t);
      location.replace("/");
    }
  }, 50);
})();
