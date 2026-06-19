export function submitFormById(formId: string) {
  const element = document.getElementById(formId);
  if (element instanceof HTMLFormElement) {
    element.requestSubmit();
  }
}
