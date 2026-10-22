document.querySelectorAll("form[data-enter-next]").forEach((form) => {
  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing) return;

    const target = event.target;
    const isTextarea = target.tagName === "TEXTAREA";
    const isTextInput =
      target.tagName === "INPUT" &&
      ["text", "email", "password", "search"].includes(target.type);

    if (!isTextarea && !isTextInput) return;

    if (isTextarea && event.shiftKey) return;

    event.preventDefault();

    const fields = [...form.querySelectorAll("input, textarea")].filter(
      (el) =>
        !el.disabled &&
        el.offsetParent !== null &&
        (el.tagName === "TEXTAREA" ||
          ["text", "email", "password", "search"].includes(el.type))
    );

    const next = fields[fields.indexOf(target) + 1];
    if (next) {
      next.focus();
    } else {
      form.requestSubmit();
    }
  });
});