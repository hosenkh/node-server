commonScope.common.l10n = function (text) {
  if (window.localizedTexts && window.localizedTexts[text]) {
    text = localizedTexts[text];
  }
  return text;
};