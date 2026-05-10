import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * @IsUploadUrl()
 *
 * Custom class-validator decorator that ensures a URL points to a file
 * previously uploaded through our own Upload module.
 *
 * Valid example:  http://localhost:3000/uploads/a3f8c2d1-uuid.jpg
 * Rejected:       https://external-site.com/photo.jpg
 *
 * Pattern enforced:
 *   - Must contain /uploads/ path segment
 *   - Filename must follow UUID format (uploaded by our service)
 *   - Must have an allowed image extension
 *
 * Usage:
 *   @IsUploadUrl()
 *   pictureUrl?: string;
 */

const UPLOAD_URL_PATTERN =
  /\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|gif|webp)$/i;

export function IsUploadUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUploadUrl',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} must be a valid URL from our upload service (e.g. /uploads/uuid.jpg)`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, _args: ValidationArguments): boolean {
          if (typeof value !== 'string') return false;
          return UPLOAD_URL_PATTERN.test(value);
        },
      },
    });
  };
}
