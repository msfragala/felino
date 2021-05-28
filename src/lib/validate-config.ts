import $ from 'joi';

const schema = $.object({
  rules: $.array()
    .items(
      $.object({
        files: $.array().items($.string()).required(),
        forbid: $.array().items($.string()),
        ignore: $.array().items($.string()),
        format: [$.string(), $.object().instance(RegExp), $.function()],
      })
    )
    .required(),
});

export function validateConfig(config: any): $.ValidationErrorItem[] {
  const { error } = schema.validate(config, {
    abortEarly: false,
  });

  return error?.details ?? [];
}
