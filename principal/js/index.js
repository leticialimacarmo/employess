let lateralMenu = document.getElementById("lateral-menu");
const menu = document.getElementById("menu");

$(document).on("click", '#menu', () => {
  const lateralMenuClassList = Array.from(lateralMenu.classList);
  const isActive = lateralMenuClassList.find((el) => el === "active");

  if (isActive) {
    lateralMenu.classList.remove("active");
    return;
  }

  lateralMenu.classList.add("active");
});
