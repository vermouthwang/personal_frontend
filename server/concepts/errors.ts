import { FormattableError } from "../framework/router";
// contains the base error classes you can either directly use or extend from. You are free to add more base errors in that file if you need to (e.g., if your route needs to return I am a teapot error).

/**
 * Corresponds to an action attempted by a user that contains bad values for parameters.
 * If this action was a HTTP request, status code for this error would be 400 Bad Request.
 */
export class BadValuesError extends FormattableError {
  public readonly HTTP_CODE = 400;
}

/**
 * Corresponds to an action attempted by a user that is not authenticated.
 * If this action was a HTTP request, status code for this error would be 401 Unauthorized.
 */
export class UnauthenticatedError extends FormattableError {
  public readonly HTTP_CODE = 401;
}

/**
 * Corresponds to a forbidden action attempted by a user.
 * If this action was a HTTP request, status code for this error would be 403 Forbidden.
 */
export class NotAllowedError extends FormattableError {
  public readonly HTTP_CODE = 403;
}

/**
 * Corresponds to an action that attempts to access a resource that doesn't exist.
 * If this action was a HTTP request, status code for this error would be 404 Not Found.
 */
export class NotFoundError extends FormattableError {
  public readonly HTTP_CODE = 404;
}

/**
 * teapot error
 */
export class TeapotError extends FormattableError {
  public readonly HTTP_CODE = 418;
}

/**
 * multiple response error
 */
export class MultipleResponseError extends FormattableError {
  public readonly HTTP_CODE = 300;
}
