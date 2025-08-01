const form = document.querySelector("#updateInventory")
form.addEventListener("change", function () {
  const updateBtn = document.querySelector("button[type='submit']")
  updateBtn.removeAttribute("disabled")
})
